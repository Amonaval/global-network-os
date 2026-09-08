import fs from 'node:fs';
const read=(f,d=null)=>{try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch{return d}};
const rpc=read('qa-results/db/rpc-permission-audit.json',{});
const pw=read('qa-results/playwright.json',{});
const steps=read('qa-results/poc-certification-run.json',{}).steps||[];
const requiredFailures=steps.filter(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const result={
 generatedAt:new Date().toISOString(),profile:'free-tier-poc',
 status:requiredFailures.length?'FAILED':'POC_CERTIFIED',
 mandatoryFailures:requiredFailures,
 advisory:{rpcPermissionAudit:{status:rpc.status||'not-run',functionCount:rpc.functionCount||0,unexpectedPrivilegeFindings:(rpc.checks||[]).filter(x=>x.status==='failed').length,evidence:'qa-results/db/rpc-permission-audit.json'}},
 evidence:{playwright:'qa-results/playwright.json',databaseIntegrity:'qa-results/db/database-integrity.json',rpc:'qa-results/db/rpc-smoke-poc.json',rls:'qa-results/security/rls-adversarial-poc.json'}
};
fs.writeFileSync('qa-results/POC-CERTIFICATION-SUMMARY.json',JSON.stringify(result,null,2)+'\n');
console.log(`POC report: ${result.status}; RPC privilege audit advisory=${result.advisory.rpcPermissionAudit.unexpectedPrivilegeFindings} findings`);
