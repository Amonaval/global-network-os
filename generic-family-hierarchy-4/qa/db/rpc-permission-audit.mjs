import fs from 'node:fs';
import {loadQaEnv,writeJson} from '../runtime/env.mjs';
import {queryScalar} from './postgres-client.mjs';
loadQaEnv();
const url=process.env.QA_DATABASE_URL;
if(!url){writeJson('qa-results/db/rpc-permission-audit.json',{generatedAt:new Date().toISOString(),status:'blocked',reason:'QA_DATABASE_URL not set',checks:[]});console.log('RPC permission audit BLOCKED: QA_DATABASE_URL not set');process.exit(2)}
// Derive the explicit anonymous surface from migration grants. Anything else executable by anon/public is suspicious.
const expectedAnon=new Set();
for(const name of fs.readdirSync('supabase/migrations').filter(x=>x.endsWith('.sql'))){const text=fs.readFileSync(`supabase/migrations/${name}`,'utf8');for(const m of text.matchAll(/grant\s+execute\s+on\s+function\s+([\s\S]*?)\s+to\s+anon(?:\s*,\s*authenticated)?\s*;/ig)){for(const f of m[1].matchAll(/public\.([a-zA-Z0-9_]+)\s*\(/g))expectedAnon.add(f[1])}}
const sql=`select coalesce(json_agg(x order by x.proname)::text,'[]') from (select p.proname,p.oid::regprocedure::text signature,p.prosecdef security_definer,has_function_privilege('anon',p.oid,'EXECUTE') anon_execute,has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated_execute,exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') public_execute from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public') x`;
const raw=await queryScalar(url,sql);
const rows=JSON.parse(raw||'[]');
const checks=[];
for(const row of rows){
 const anonExpected=expectedAnon.has(row.proname);
 if((row.anon_execute||row.public_execute)&&!anonExpected)checks.push({name:`Unexpected anonymous/public RPC execute: ${row.signature}`,status:'failed',severity:row.security_definer?'P0':'P1',...row});
 if(anonExpected&&!row.anon_execute)checks.push({name:`Expected anonymous RPC is not executable: ${row.signature}`,status:'failed',severity:'P1',...row});
}
checks.unshift({name:'RPC inventory captured',status:'passed',functionCount:rows.length,explicitAnonymousFunctionNames:[...expectedAnon].sort()});
const failed=checks.filter(x=>x.status==='failed');
writeJson('qa-results/db/rpc-permission-audit.json',{generatedAt:new Date().toISOString(),driver:'node-pg',status:failed.length?'failed':'passed',functionCount:rows.length,expectedAnon:[...expectedAnon].sort(),checks});
console.log(`RPC permission audit ${failed.length?'FAIL':'PASS'} (${rows.length} public functions, ${failed.length} unexpected privilege findings; Node pg)`);
if(failed.length)process.exit(1);
