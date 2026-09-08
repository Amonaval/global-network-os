import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {loadQaEnv,isStaging,mutationAllowed,writeJson} from './runtime/env.mjs';
loadQaEnv();
fs.mkdirSync('qa-results',{recursive:true});
const steps=[];
async function run(name,cmd,args,required=true){const started=Date.now();const result=await new Promise(resolve=>{const c=spawn(cmd,args,{stdio:'inherit',env:process.env,shell:process.platform==='win32'});c.on('close',code=>resolve({code:code??1}));c.on('error',e=>resolve({code:127,error:e.message}))});const row={name,status:result.code===0?'passed':'failed',exitCode:result.code,durationMs:Date.now()-started,required,error:result.error||null};steps.push(row);return row.status==='passed'}
console.log('QA profile: FREE-TIER POC (Family + Housing Society; owner/member/tenantB; one worker; no volume/stress/destructive loops)');
await run('preflight','node',['qa/run-preflight.mjs']);
if(isStaging()&&mutationAllowed()){
 if(fs.existsSync('qa-results/fixtures/seed-state.json')) steps.push({name:'deterministic-seed',status:'reused',required:true,reason:'Existing deterministic seed reused to avoid unnecessary Auth/API writes.'});
 else await run('deterministic-seed','node',['qa/setup/seed.mjs']);
 await run('database-integrity','node',['qa/db/database-integrity.mjs']);
 await run('rpc-permission-audit','node',['qa/db/rpc-permission-audit.mjs'],false);
 await run('rpc-smoke-poc','node',['qa/db/rpc-smoke-poc.mjs']);
 await run('rls-adversarial-poc','node',['qa/db/rls-adversarial-poc.mjs']);
 await run('playwright-poc','npx',['playwright','test','qa/e2e/15-free-tier-poc.spec.ts','--workers=1']);
}else steps.push({name:'staging-runtime-foundation',status:'blocked',required:true,reason:'POC runtime requires QA_MODE=staging and QA_ALLOW_MUTATION=true.'});
await run('evidence-report','node',['qa/report-summary.mjs'],false);
const requiredFailed=steps.some(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const finalStatus=requiredFailed?'FAILED':'POC_CERTIFIED';
writeJson('qa-results/poc-certification-run.json',{generatedAt:new Date().toISOString(),profile:'free-tier-poc',status:finalStatus,scope:{verticals:['family','housing-society'],roles:['owner','member','tenantB'],workers:1,volume:false,stress:false,destructiveLoops:false},steps});
console.log(`\nTrustWeave free-tier POC certification: ${finalStatus}`);if(requiredFailed)process.exit(1);
