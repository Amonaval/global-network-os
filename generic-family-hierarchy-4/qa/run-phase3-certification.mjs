import fs from 'node:fs';import {spawn} from 'node:child_process';
import {loadQaEnv,isStaging,mutationAllowed,writeJson} from './runtime/env.mjs';
loadQaEnv();fs.mkdirSync('qa-results',{recursive:true});
const steps=[];
async function run(name,cmd,args,required=true){const started=Date.now();const result=await new Promise(resolve=>{const c=spawn(cmd,args,{stdio:'inherit',env:process.env,shell:process.platform==='win32'});c.on('close',code=>resolve({code:code??1}));c.on('error',e=>resolve({code:127,error:e.message}))});const row={name,status:result.code===0?'passed':'failed',exitCode:result.code,durationMs:Date.now()-started,required,error:result.error||null};steps.push(row);return row.status==='passed'}
console.log('QA profile: PHASE-3 EXPANDED PLATFORM PARITY & ROLE/SECURITY (one worker; headed Chromium; session reuse; no stress/load/full browser matrix)');
await run('phase3-local-contracts','npm',['run','qa:phase3:local']);
if(isStaging()&&mutationAllowed()){
 if(fs.existsSync('qa-results/fixtures/seed-state.json'))steps.push({name:'deterministic-seed',status:'reused',required:true,reason:'Phase-2 certified seed reused to minimize Supabase writes.'});
 else await run('deterministic-seed','node',['qa/setup/seed.mjs']);
 await run('database-integrity','node',['qa/db/database-integrity.mjs']);
 await run('rpc-permission-audit','node',['qa/db/rpc-permission-audit.mjs','--advisory'],false);
 await run('rpc-permission-nonregression','node',['qa/db/rpc-permission-nonregression.mjs']);
 await run('rpc-smoke-poc','node',['qa/db/rpc-smoke-poc.mjs']);
 await run('rls-adversarial-full','node',['qa/db/rls-adversarial.mjs']);
 await run('phase2-regression-browser','npx',['playwright','test','qa/e2e/16-phase2-representative-capabilities.spec.ts','--project=chromium-desktop','--workers=1','--headed']);
 await run('phase3-expanded-browser','npx',['playwright','test','qa/e2e/17-phase3-expanded-parity-roles.spec.ts','--project=chromium-desktop','--workers=1','--headed']);
}else steps.push({name:'staging-runtime-foundation',status:'blocked',required:true,reason:'Phase-3 runtime requires QA_MODE=staging and QA_ALLOW_MUTATION=true.'});
const requiredFailed=steps.some(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const status=requiredFailed?'FAILED':'PHASE3_CERTIFIED';
writeJson('qa-results/PHASE3-CERTIFICATION-SUMMARY.json',{generatedAt:new Date().toISOString(),profile:'phase3-expanded-platform-parity-role-security',status,policy:{rpcPrivilegeFindings:'advisory debt preserved + non-regression ceiling enforced; strict remediation remains future blocker',freshMigrationReplay:'skipped-by-policy',headlessCI:'skipped-by-policy',stressLoad:'skipped-by-policy',allBrowserMatrix:'skipped-by-policy'},scope:{verticalParity:'all 9 released verticals',browserRoles:['owner','admin','member','invitee'],selectedDeepVerticals:['housing-society','family-association'],tenantIsolation:'read + mutation denial',workers:1},steps});
await run('phase3-evidence-report','node',['qa/report-phase3-summary.mjs'],false);
console.log(`\nTrustWeave Phase-3 expanded certification: ${status}`);if(requiredFailed)process.exit(1);
