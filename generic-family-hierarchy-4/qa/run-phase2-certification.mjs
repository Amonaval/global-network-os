import fs from 'node:fs';import {spawn} from 'node:child_process';
import {loadQaEnv,isStaging,mutationAllowed,writeJson} from './runtime/env.mjs';
loadQaEnv();fs.mkdirSync('qa-results',{recursive:true});
const steps=[];
async function run(name,cmd,args,required=true){const started=Date.now();const result=await new Promise(resolve=>{const c=spawn(cmd,args,{stdio:'inherit',env:process.env,shell:process.platform==='win32'});c.on('close',code=>resolve({code:code??1}));c.on('error',e=>resolve({code:127,error:e.message}))});const row={name,status:result.code===0?'passed':'failed',exitCode:result.code,durationMs:Date.now()-started,required,error:result.error||null};steps.push(row);return row.status==='passed'}
console.log('QA profile: PHASE-2 REPRESENTATIVE CAPABILITY (one worker; headed Chromium; tiny deterministic data; no stress/load/full Cartesian browser matrix)');
await run('phase2-local-contracts','npm',['run','qa:phase2:local']);
if(isStaging()&&mutationAllowed()){
 if(fs.existsSync('qa-results/fixtures/seed-state.json'))steps.push({name:'deterministic-seed',status:'reused',required:true,reason:'Existing certified seed reused to minimize Supabase Auth/API writes.'});
 else await run('deterministic-seed','node',['qa/setup/seed.mjs']);
 await run('database-integrity','node',['qa/db/database-integrity.mjs']);
 await run('rpc-permission-audit','node',['qa/db/rpc-permission-audit.mjs','--advisory'],false);
 await run('rpc-smoke-poc','node',['qa/db/rpc-smoke-poc.mjs']);
 await run('rls-adversarial-poc','node',['qa/db/rls-adversarial-poc.mjs']);
 await run('phase2-representative-browser','npx',['playwright','test','qa/e2e/16-phase2-representative-capabilities.spec.ts','--project=chromium-desktop','--workers=1','--headed']);
}else steps.push({name:'staging-runtime-foundation',status:'blocked',required:true,reason:'Phase-2 runtime requires QA_MODE=staging and QA_ALLOW_MUTATION=true.'});
const requiredFailed=steps.some(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const status=requiredFailed?'FAILED':'PHASE2_CERTIFIED';
writeJson('qa-results/PHASE2-CERTIFICATION-SUMMARY.json',{generatedAt:new Date().toISOString(),profile:'phase2-representative-capability',status,policy:{rpcPrivilegeFindings:'advisory-preserved; strict/full certification remains blocking',headless:'not evaluated by Phase-2 local policy',stressLoad:'skipped-by-policy',allBrowserMatrix:'skipped-by-policy',fullCartesianRoleVertical:'skipped-by-policy'},scope:{deepRepresentativeVertical:'organization',retainedOwnerRegression:'family',browserRoles:['owner','member'],workers:1,mobileViewport:'390x844'},steps});
await run('phase2-evidence-report','node',['qa/report-phase2-summary.mjs'],false);
console.log(`\nTrustWeave Phase-2 representative certification: ${status}`);if(requiredFailed)process.exit(1);
