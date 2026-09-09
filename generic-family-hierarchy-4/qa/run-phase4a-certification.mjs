import fs from 'node:fs';import {spawn} from 'node:child_process';
import {loadQaEnv,writeJson} from './runtime/env.mjs';
loadQaEnv();fs.mkdirSync('qa-results',{recursive:true});
const steps=[];
async function run(name,cmd,args,required=true){const started=Date.now();const result=await new Promise(resolve=>{const c=spawn(cmd,args,{stdio:'inherit',env:process.env,shell:process.platform==='win32'});c.on('close',code=>resolve({code:code??1}));c.on('error',e=>resolve({code:127,error:e.message}))});const row={name,status:result.code===0?'passed':'failed',exitCode:result.code,durationMs:Date.now()-started,required,error:result.error||null};steps.push(row);return row.status==='passed'}
console.log('QA profile: PHASE-4A RUNTIME ROBUSTNESS & RECOVERY (no migrations/RLS/RPC audit/storage/destructive DB; one worker; headed Chromium)');
await run('phase4a-local-contracts','npm',['run','qa:phase4a:local']);
if(fs.existsSync('qa-results/fixtures/seed-state.json')){
 steps.push({name:'existing-seed-fixture',status:'reused',required:true,reason:'Phase-4A reuses the existing deterministic fixture and does not create/clean QA data.'});
 await run('phase4a-runtime-recovery-browser','npx',['playwright','test','qa/e2e/18-phase4a-runtime-recovery.spec.ts','--project=chromium-desktop','--workers=1','--headed']);
}else steps.push({name:'existing-seed-fixture',status:'blocked',required:true,reason:'Phase-4A is intentionally non-seeding. Restore/reuse the existing certified qa-results/fixtures/seed-state.json.'});
const requiredFailed=steps.some(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const status=requiredFailed?'FAILED':'PHASE4A_CERTIFIED';
writeJson('qa-results/PHASE4A-CERTIFICATION-SUMMARY.json',{generatedAt:new Date().toISOString(),profile:'phase4a-runtime-robustness-recovery-failure-handling',status,independence:{phase3StorageBlocker:'open and explicitly not evaluated by Phase 4A',supabaseMigrations:'none',rlsRpcAudits:'none',destructiveDatabaseLifecycle:'none',storageMutation:'none'},scope:{representativeRoles:['owner','member'],representativeVerticals:['family','organization','professional'],recovery:['full reload','query-string entry','browser back/forward','post-outage reload'],failureHandling:['slow REST','simulated REST 503'],mobile:'390x844 Organization member reload/navigation/overflow',accessibility:'post-recovery mobile Organization directory serious/critical axe gate',workers:1},steps});
await run('phase4a-evidence-report','node',['qa/report-phase4a-summary.mjs'],false);
console.log(`\nTrustWeave Phase-4A runtime robustness certification: ${status}`);if(requiredFailed)process.exit(1);
