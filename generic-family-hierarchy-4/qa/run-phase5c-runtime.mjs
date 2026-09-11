import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {writeJson} from './runtime/env.mjs';
import {loadAndAssertPhase5cReleaseCandidate} from './runtime/phase5c-release-guard.mjs';
import {verifyPhase5cDependencies} from './phase5c-dependency-verify.mjs';

const deps=verifyPhase5cDependencies();
if(!deps.ok){console.error('Phase-5C runtime BLOCKED: prerequisite certifications are not complete. Release environment was not loaded and no database action was attempted.');process.exit(1)}
let rc;try{rc=loadAndAssertPhase5cReleaseCandidate()}catch(error){console.error(String(error?.message||error));process.exit(1)}
const b='qa-results/db/PHASE5B-FRESH-MIGRATION-REPLAY.json';if(!fs.existsSync(b)){console.error('Phase-5C runtime BLOCKED: missing Phase-5B replay evidence.');process.exit(1)}const be=JSON.parse(fs.readFileSync(b,'utf8'));if(be.status!=='passed'||be.projectRef!==rc.projectRef){console.error(`Phase-5C runtime BLOCKED: Phase-5B replay evidence must PASS on release project ${rc.projectRef}.`);process.exit(1)}
fs.mkdirSync('qa-results',{recursive:true});fs.mkdirSync('qa-results/fixtures',{recursive:true});for(const f of ['qa-results/fixtures/generated.env','qa-results/fixtures/seed-state.json'])fs.rmSync(f,{force:true});const steps=[];
async function run(name,cmd,args,required=true){const started=Date.now();const result=await new Promise(resolve=>{const c=spawn(cmd,args,{stdio:'inherit',env:{...process.env,QA_ENV_FILE:rc.envFile},shell:process.platform==='win32'});c.on('close',code=>resolve({code:code??1}));c.on('error',e=>resolve({code:127,error:e.message}))});const row={name,status:result.code===0?'passed':'failed',exitCode:result.code,durationMs:Date.now()-started,required,error:result.error||null};steps.push(row);return row.status==='passed'}
console.log(`QA profile: PHASE-5C PRODUCTION RELEASE CANDIDATE — disposable project ${rc.projectRef}; local app ${rc.baseURL}`);
let seeded=false;try{
 await run('release-preflight','node',['qa/run-preflight.mjs']);
 seeded=await run('release-deterministic-seed','node',['qa/setup/seed.mjs']);
 if(seeded){await run('release-database-integrity','node',['qa/db/database-integrity.mjs']);await run('release-strict-rpc-security','node',['qa/db/rpc-security-closure.mjs']);await run('release-rls-adversarial','node',['qa/db/rls-adversarial.mjs']);await run('release-critical-browser-and-destructive-lifecycle','npx',['playwright','test','qa/e2e/23-phase5c-production-release.spec.ts','qa/e2e/70-destructive-lifecycle-import.spec.ts','--project=chromium-desktop','--workers=1','--headed']);}
 else steps.push({name:'release-runtime-dependent-gates',status:'blocked',required:true,reason:'Seed failed; dependent mutation tests were not attempted.'});
}finally{if(seeded)await run('release-fixture-cleanup','node',['qa/setup/cleanup.mjs']);}
const requiredFailed=steps.some(x=>x.required&&(x.status==='failed'||x.status==='blocked'));const status=requiredFailed?'failed':'passed';const phase5bFingerprint=be.sourceFingerprint||null;writeJson('qa-results/PHASE5C-RUNTIME-EVIDENCE.json',{generatedAt:new Date().toISOString(),profile:'phase5c-production-release-candidate-runtime',status,projectRef:rc.projectRef,phase5bSourceFingerprint:phase5bFingerprint,safety:{confirmedDisposable:true,normalStagingProtected:true,productionHostRejected:true,cleanupAttempted:seeded},steps});console.log(`\nPhase-5C runtime evidence: ${status.toUpperCase()}`);if(requiredFailed)process.exit(1);
