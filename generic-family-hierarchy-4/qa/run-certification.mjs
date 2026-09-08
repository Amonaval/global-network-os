import fs from 'node:fs';import {spawn} from 'node:child_process';import {loadQaEnv,isStaging,mutationAllowed,writeJson} from './runtime/env.mjs';
loadQaEnv();
if(process.env.QA_PRESERVE_RESULTS!=='true')fs.rmSync('qa-results',{recursive:true,force:true});
fs.mkdirSync('qa-results',{recursive:true});
const steps=[];
async function run(name,cmd,args,required=true){const started=Date.now();const result=await new Promise(resolve=>{const c=spawn(cmd,args,{stdio:'inherit',env:process.env,shell:process.platform==='win32'});c.on('close',code=>resolve({code:code??1}));c.on('error',e=>resolve({code:127,error:e.message}))});const row={name,status:result.code===0?'passed':'failed',exitCode:result.code,durationMs:Date.now()-started,required,error:result.error||null};steps.push(row);return row.status==='passed'}
await run('preflight','node',['qa/run-preflight.mjs']);
if(isStaging()&&mutationAllowed()){
 await run('deterministic-seed','node',['qa/setup/seed.mjs']);
 await run('migration-replay','node',['qa/db/migration-replay.mjs']);
 await run('database-integrity','node',['qa/db/database-integrity.mjs']);
 await run('rpc-permission-audit','node',['qa/db/rpc-permission-audit.mjs']);
 await run('rpc-smoke','node',['qa/db/rpc-smoke.mjs']);
 await run('rls-adversarial','node',['qa/db/rls-adversarial.mjs']);
 await run('playwright-runtime','npx',['playwright','test']);
}else{
 steps.push({name:'staging-runtime-foundation',status:'blocked',required:true,reason:'Full certification requires QA_MODE=staging and QA_ALLOW_MUTATION=true. No mutating suite was executed.'});
 await run('readonly-anonymous-browser-smoke','npx',['playwright','test','qa/e2e/00-anonymous-smoke.spec.ts','qa/e2e/05-authentication.spec.ts','--grep-invert','dedicated QA member'],false);
}
await run('evidence-report','node',['qa/report-summary.mjs']);
let report={status:'FAILED'};try{report=JSON.parse(fs.readFileSync('qa-results/CERTIFICATION-SUMMARY.json','utf8'))}catch{}
const requiredFailed=steps.some(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const finalStatus=requiredFailed||report.status==='FAILED'?'FAILED':report.status==='BLOCKED'?'BLOCKED':'CERTIFIED';
writeJson('qa-results/certification-run.json',{generatedAt:new Date().toISOString(),status:finalStatus,steps,reportStatus:report.status,oneCommand:'npm run qa:certify',requiredRuntimeFields:['QA_MODE=staging','QA_ALLOW_MUTATION=true','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','QA_STAGING_PROJECT_REF','QA_DATABASE_URL','QA_FRESH_DATABASE_URL','QA_DB_ALLOW_FRESH_REPLAY=true']});
console.log(`\nTrustWeave QA certification: ${finalStatus}`);console.log('Evidence: qa-results/BUG-REPORT.md, REMEDIATION-PLAN.md, COVERAGE-MATRIX.md, CERTIFICATION-SUMMARY.json');
if(finalStatus!=='CERTIFIED')process.exit(1);
