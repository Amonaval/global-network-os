import fs from 'node:fs';
import {loadQaEnv,writeJson} from '../runtime/env.mjs';
loadQaEnv();
const auditFile='qa-results/db/rpc-permission-audit.json';
if(!fs.existsSync(auditFile)){
 console.error('RPC non-regression gate BLOCKED: run rpc-permission-audit first');process.exit(2);
}
const audit=JSON.parse(fs.readFileSync(auditFile,'utf8'));
const phase2CertifiedFindingCeiling=331;
const phase2CertifiedFunctionFloor=386;
const findings=(audit.checks||[]).filter(x=>x.finding===true);
const p0=findings.filter(x=>x.severity==='P0').length,p1=findings.filter(x=>x.severity==='P1').length;
const checks=[
 {name:'RPC finding count does not exceed Phase-2 certified ceiling',status:audit.findingCount<=phase2CertifiedFindingCeiling?'passed':'failed',actual:audit.findingCount,ceiling:phase2CertifiedFindingCeiling},
 {name:'RPC inventory has not unexpectedly shrunk below certified inventory',status:audit.functionCount>=phase2CertifiedFunctionFloor?'passed':'failed',actual:audit.functionCount,floor:phase2CertifiedFunctionFloor},
 {name:'RPC debt remains explicitly inventoried',status:findings.length===audit.findingCount?'passed':'failed',actual:findings.length,reported:audit.findingCount},
];
const status=checks.some(x=>x.status==='failed')?'failed':'passed';
writeJson('qa-results/db/rpc-permission-nonregression.json',{generatedAt:new Date().toISOString(),status,phase2CertifiedBaseline:{functionCount:386,findingCount:331},current:{functionCount:audit.functionCount,findingCount:audit.findingCount,p0,p1},policy:'Phase 3 blocks privilege-debt growth but does not waive or suppress existing findings. Strict/full certification still requires remediation to zero unexpected findings.',checks});
console.log(`RPC permission non-regression ${status.toUpperCase()} (functions ${audit.functionCount}; findings ${audit.findingCount}; P0 ${p0}; P1 ${p1}; Phase-2 ceiling 331)`);
if(status==='failed')process.exit(1);
