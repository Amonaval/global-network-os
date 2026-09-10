import fs from 'node:fs';
import path from 'node:path';
import {loadQaEnv,writeJson} from '../runtime/env.mjs';
import {queryScalar} from './postgres-client.mjs';
import {buildMigrationRpcIntent,intentMap} from '../security/rpc-contract.mjs';

loadQaEnv();
const reportOnly=process.argv.includes('--report-only');
const url=process.env.QA_DATABASE_URL;
const outDir='qa-results/security';fs.mkdirSync(outDir,{recursive:true});
const contract=buildMigrationRpcIntent();
writeJson(`${outDir}/PHASE5A-RPC-MIGRATION-INTENT.json`,contract);

if(!url){
  writeJson(`${outDir}/PHASE5A-RPC-SECURITY-AUDIT.json`,{generatedAt:new Date().toISOString(),status:'blocked',reason:'QA_DATABASE_URL not set',readOnly:true,findings:[]});
  console.error('Phase-5A RPC security audit BLOCKED: QA_DATABASE_URL not set');process.exit(2);
}

const sql=`select coalesce(json_agg(x order by x.proname)::text,'[]') from (
 select p.proname,
        p.oid::regprocedure::text signature,
        pg_get_function_identity_arguments(p.oid) identity_args,
        p.prosecdef security_definer,
        r.rolname owner,
        coalesce(to_json(p.proconfig),'[]'::json) config,
        has_function_privilege('anon',p.oid,'EXECUTE') anon_execute,
        has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated_execute,
        exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') public_execute
 from pg_proc p
 join pg_namespace n on n.oid=p.pronamespace
 join pg_roles r on r.oid=p.proowner
 where n.nspname='public'
) x`;
const schemaSql=`select json_build_object(
 'anon_create',has_schema_privilege('anon','public','CREATE'),
 'authenticated_create',has_schema_privilege('authenticated','public','CREATE')
)::text`;
const rows=JSON.parse((await queryScalar(url,sql))||'[]');
const schemaPrivileges=JSON.parse((await queryScalar(url,schemaSql))||'{}');
const byName=new Map();for(const row of rows){if(!byName.has(row.proname))byName.set(row.proname,[]);byName.get(row.proname).push(row)}
const intents=intentMap(contract);const findings=[];const inventory=[];
const add=(severity,code,row,message,extra={})=>findings.push({severity,code,function:row?.proname||null,signature:row?.signature||null,message,...extra});
for(const [name,list] of byName){
  const intent=intents.get(name)||{classification:'unclassified',expectedRoles:[],explicitPublicRevoke:false,definitionFiles:[]};
  if(list.length>1)add('P1','RPC_OVERLOAD_REQUIRES_SIGNATURE_CONTRACT',list[0],`Function ${name} has ${list.length} live overloads; name-level migration intent is ambiguous.`,{signatures:list.map(x=>x.signature)});
  for(const row of list){
    const config=Array.isArray(row.config)?row.config:[];
    const fixedSearchPath=config.some(x=>String(x).startsWith('search_path='));
    const expectedAnon=intent.expectedRoles.includes('anon');
    const expectedAuth=intent.expectedRoles.includes('authenticated');
    const unexpectedPublic=row.public_execute;
    const unexpectedAnon=row.anon_execute&&!expectedAnon;
    if(unexpectedPublic)add(row.security_definer?'P0':'P1','UNEXPECTED_PUBLIC_EXECUTE',row,'PUBLIC can execute this RPC; application RPCs must use explicit role grants.',{classification:intent.classification});
    if(unexpectedAnon)add(row.security_definer?'P0':'P1','UNEXPECTED_ANON_EXECUTE',row,'anon can execute an RPC not classified as anonymous.',{classification:intent.classification});
    if(expectedAnon&&!row.anon_execute)add('P1','EXPECTED_ANON_MISSING',row,'Migration intent classifies this RPC as anonymous but live anon EXECUTE is missing.');
    if(expectedAuth&&!row.authenticated_execute)add('P1','EXPECTED_AUTHENTICATED_MISSING',row,'Migration intent classifies this RPC as authenticated but live authenticated EXECUTE is missing.');
    if(intent.classification==='internal'&&row.authenticated_execute&&!row.public_execute)add('P1','INTERNAL_RPC_AUTHENTICATED_EXECUTE',row,'Internal/helper RPC is executable by authenticated role despite no authenticated migration intent.');
    if(intent.classification==='unclassified')add(row.public_execute||row.anon_execute?'P0':'P1','UNCLASSIFIED_RPC',row,'Live RPC has no explicit migration access classification.',{definitionFiles:intent.definitionFiles||[]});
    if(row.security_definer&&!fixedSearchPath)add('P0','SECURITY_DEFINER_SEARCH_PATH_UNFIXED',row,'SECURITY DEFINER function has no fixed search_path in pg_proc.proconfig.');
    if(row.security_definer&&['anon','authenticated'].includes(row.owner))add('P0','SECURITY_DEFINER_UNTRUSTED_OWNER',row,`SECURITY DEFINER function is owned by ${row.owner}.`);
    inventory.push({...row,config,searchPathFixed:fixedSearchPath,intent:{classification:intent.classification,expectedRoles:intent.expectedRoles,explicitPublicRevoke:intent.explicitPublicRevoke,definitionFiles:intent.definitionFiles}});
  }
}
for(const item of contract.functions){if(!byName.has(item.name))add('P1','MIGRATION_RPC_MISSING_LIVE',{proname:item.name,signature:null},'RPC exists in migration intent but is absent from the live public schema.',{classification:item.classification,definitionFiles:item.definitionFiles})}
if(schemaPrivileges.anon_create)add('P0','ANON_PUBLIC_SCHEMA_CREATE',{proname:null,signature:null},'anon has CREATE on public schema; unsafe for SECURITY DEFINER search-path resolution.');
if(schemaPrivileges.authenticated_create)add('P0','AUTHENTICATED_PUBLIC_SCHEMA_CREATE',{proname:null,signature:null},'authenticated has CREATE on public schema; unsafe for SECURITY DEFINER search-path resolution.');

const counts={P0:findings.filter(x=>x.severity==='P0').length,P1:findings.filter(x=>x.severity==='P1').length};
const status=counts.P0||counts.P1?'remediation_required':'passed';
const result={generatedAt:new Date().toISOString(),status,readOnly:true,policy:'Phase 5A is strict: zero unexpected PUBLIC/anon exposure, zero unclassified live RPCs, and fixed search_path on every SECURITY DEFINER RPC.',schemaPrivileges,functionCount:rows.length,uniqueFunctionNames:byName.size,migrationIntent:{functionNameCount:contract.functionNameCount,anonymousCount:contract.anonymousFunctions.length,authenticatedCount:contract.authenticatedFunctions.length,internalCount:contract.internalFunctions.length,unclassifiedCount:contract.unclassifiedFunctions.length},findingCounts:counts,findingCount:findings.length,findings,inventory};
writeJson(`${outDir}/PHASE5A-RPC-SECURITY-AUDIT.json`,result);

const md=['# TrustWeave Phase-5A RPC Security Audit','',`Status: **${status.toUpperCase()}**`,'',`Live public functions: **${rows.length}**`,'',`P0 findings: **${counts.P0}**  `,`P1 findings: **${counts.P1}**`,'','This audit is read-only. It performs catalog SELECTs only and does not alter grants, functions, tables, Storage, RLS policies or data.','','## Migration intent','',`- Anonymous RPC names: ${contract.anonymousFunctions.length}`,`- Authenticated RPC names: ${contract.authenticatedFunctions.length}`,`- Internal/helper RPC names: ${contract.internalFunctions.length}`,`- Unclassified migration RPC names: ${contract.unclassifiedFunctions.length}`,'','## Findings','',...(findings.length?findings.map(f=>`- **${f.severity} ${f.code}** — ${f.signature||f.function||'schema'} — ${f.message}`):['- None.']),'','## Closure rule','','Phase 5A can certify only when P0 = 0 and P1 = 0. Findings are not waived or converted to advisory.'];
fs.writeFileSync(`${outDir}/PHASE5A-RPC-SECURITY-AUDIT.md`,md.join('\n')+'\n');

const q=s=>String(s).replaceAll('"','""');
const preview=['-- TRUSTWEAVE PHASE-5A RPC REMEDIATION PREVIEW','-- REVIEW ONLY. THIS FILE ENDS WITH ROLLBACK AND MUST NOT BE USED AS A MIGRATION.','-- Generated from live catalog + migration intent. Regenerate after every reviewed remediation batch.','','begin;'];
const remediated=new Set();
for(const f of findings){
  if(!f.signature||remediated.has(f.signature))continue;
  if(!['UNEXPECTED_PUBLIC_EXECUTE','UNEXPECTED_ANON_EXECUTE','INTERNAL_RPC_AUTHENTICATED_EXECUTE'].includes(f.code))continue;
  remediated.add(f.signature);
  const row=inventory.find(x=>x.signature===f.signature);if(!row)continue;
  const sig=`public.\"${q(row.proname)}\"(${row.identity_args||''})`;
  preview.push('',`-- ${row.intent.classification}: ${row.signature}`);
  preview.push(`revoke all on function ${sig} from public, anon, authenticated;`);
  if(row.intent.expectedRoles.includes('anon'))preview.push(`grant execute on function ${sig} to anon;`);
  if(row.intent.expectedRoles.includes('authenticated'))preview.push(`grant execute on function ${sig} to authenticated;`);
}
preview.push('','rollback;','-- END REVIEW-ONLY PREVIEW');
fs.writeFileSync(`${outDir}/PHASE5A-RPC-REMEDIATION-PREVIEW.sql`,preview.join('\n')+'\n');
console.log(`Phase-5A RPC security audit ${status.toUpperCase()} (${rows.length} functions; P0 ${counts.P0}; P1 ${counts.P1}; read-only)`);
console.log(`Evidence: ${outDir}/PHASE5A-RPC-SECURITY-AUDIT.md`);
console.log(`Review-only SQL preview: ${outDir}/PHASE5A-RPC-REMEDIATION-PREVIEW.sql (ROLLBACK-protected)`);
if(!reportOnly&&status!=='passed')process.exit(1);
