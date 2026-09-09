import fs from 'node:fs';
import {loadQaEnv,writeJson} from '../runtime/env.mjs';
import {queryScalar} from './postgres-client.mjs';

loadQaEnv();

const cliPolicy=process.argv.includes('--advisory')?'advisory':process.argv.includes('--strict')?'strict':null;
const configuredPolicy=(process.env.QA_RPC_PERMISSION_POLICY||'strict').trim().toLowerCase();
const policy=cliPolicy||(configuredPolicy==='advisory'?'advisory':'strict');
const url=process.env.QA_DATABASE_URL;

if(!url){
 writeJson('qa-results/db/rpc-permission-audit.json',{
  generatedAt:new Date().toISOString(),driver:'node-pg',policy,status:'blocked',reason:'QA_DATABASE_URL not set',checks:[]
 });
 console.log('RPC permission audit BLOCKED: QA_DATABASE_URL not set');
 process.exit(2);
}

// Derive the explicitly anonymous surface from migration grants. Anything else
// executable through PUBLIC/anon is suspicious. This intentionally records the
// complete finding set even when compact POC certification treats it as advisory.
const expectedAnon=new Set();
for(const name of fs.readdirSync('supabase/migrations').filter(x=>x.endsWith('.sql'))){
 const text=fs.readFileSync(`supabase/migrations/${name}`,'utf8');
 for(const m of text.matchAll(/grant\s+execute\s+on\s+function\s+([\s\S]*?)\s+to\s+anon(?:\s*,\s*authenticated)?\s*;/ig)){
  for(const f of m[1].matchAll(/public\.([a-zA-Z0-9_]+)\s*\(/g))expectedAnon.add(f[1]);
 }
}

const sql=`select coalesce(json_agg(x order by x.proname,x.signature)::text,'[]') from (
 select p.proname,
        p.oid::regprocedure::text signature,
        p.prosecdef security_definer,
        has_function_privilege('anon',p.oid,'EXECUTE') anon_execute,
        has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated_execute,
        exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') public_execute
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public'
) x`;
const raw=await queryScalar(url,sql);
const rows=JSON.parse(raw||'[]');
const checks=[];

for(const row of rows){
 const anonExpected=expectedAnon.has(row.proname);
 if((row.anon_execute||row.public_execute)&&!anonExpected){
  checks.push({
   name:`Unexpected anonymous/public RPC execute: ${row.signature}`,
   status:'failed',
   finding:true,
   severity:row.security_definer?'P0':'P1',
   ...row
  });
 }
 if(anonExpected&&!row.anon_execute){
  checks.push({
   name:`Expected anonymous RPC is not executable: ${row.signature}`,
   status:'failed',
   finding:true,
   severity:'P1',
   ...row
  });
 }
}

checks.unshift({
 name:'RPC inventory captured',status:'passed',functionCount:rows.length,
 explicitAnonymousFunctionNames:[...expectedAnon].sort()
});

const findings=checks.filter(x=>x.finding===true);
const strictStatus=findings.length?'failed':'passed';
const status=findings.length?(policy==='advisory'?'advisory':'failed'):'passed';
const result={
 generatedAt:new Date().toISOString(),driver:'node-pg',policy,status,strictStatus,
 functionCount:rows.length,findingCount:findings.length,
 expectedAnon:[...expectedAnon].sort(),checks
};
writeJson('qa-results/db/rpc-permission-audit.json',result);

if(findings.length&&policy==='advisory'){
 console.log(`RPC permission audit ADVISORY (${rows.length} public functions, ${findings.length} unexpected privilege findings retained; Node pg)`);
 console.log('RPC permission policy: advisory for compact Free-Tier POC only; strict/full certification remains blocking.');
}else{
 console.log(`RPC permission audit ${findings.length?'FAIL':'PASS'} (${rows.length} public functions, ${findings.length} unexpected privilege findings; Node pg)`);
}

if(findings.length&&policy==='strict')process.exit(1);
