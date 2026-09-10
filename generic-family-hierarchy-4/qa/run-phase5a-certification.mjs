import fs from 'node:fs';import {spawn} from 'node:child_process';import {loadQaEnv,writeJson} from './runtime/env.mjs';
loadQaEnv();fs.mkdirSync('qa-results',{recursive:true});const steps=[];
async function run(name,cmd,args,required=true){const started=Date.now();const result=await new Promise(resolve=>{const c=spawn(cmd,args,{stdio:'inherit',env:process.env,shell:process.platform==='win32'});c.on('close',code=>resolve({code:code??1}));c.on('error',e=>resolve({code:127,error:e.message}))});const row={name,status:result.code===0?'passed':'failed',exitCode:result.code,durationMs:Date.now()-started,required,error:result.error||null};steps.push(row);return row.status==='passed'}
console.log('QA profile: PHASE-5A STRICT SECURITY CONTRACT / RPC CLOSURE (read-only live DB catalog audit; no migrations; no ACL writes; no Storage; no destructive lifecycle)');
await run('phase5a-local-security-contracts','npm',['run','qa:phase5a:local']);
await run('phase5a-strict-rpc-security-closure','node',['qa/db/rpc-security-closure.mjs']);
const requiredFailed=steps.some(x=>x.required&&x.status==='failed');const status=requiredFailed?'REMEDIATION_REQUIRED':'PHASE5A_CERTIFIED';
writeJson('qa-results/PHASE5A-CERTIFICATION-SUMMARY.json',{generatedAt:new Date().toISOString(),profile:'phase5a-strict-security-contract-rpc-closure',status,safety:{databaseWrites:'none',migrationExecution:'none',grantRevokeExecution:'none',storage:'none',destructiveLifecycle:'none',auditQueries:'PostgreSQL catalog SELECTs only'},closure:{unexpectedPublicExecute:'must be zero',unexpectedAnonExecute:'must be zero',unclassifiedLiveRpc:'must be zero',securityDefinerWithoutFixedSearchPath:'must be zero',securityDefinerUnsafeOwner:'must be zero'},steps});
await run('phase5a-evidence-report','node',['qa/report-phase5a-summary.mjs'],false);
console.log(`\nTrustWeave Phase-5A security contract/RPC closure: ${status}`);if(requiredFailed)process.exit(1);
