import {spawn} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import {loadQaEnv,writeJson} from './runtime/env.mjs';
loadQaEnv();const out='qa-results/preflight';fs.mkdirSync(out,{recursive:true});
const steps=[
 ['qa-unit-contracts','npm',['run','qa:unit']],
 ['qa-suite-structure','node',['qa/static-suite-audit.mjs']],
 ['types','npm',['run','check:types']],
 ['build','npm',['run','build']],
 ['migration-static','node',['qa/db/migration-static-audit.mjs']],
 ['source-regression','npm',['run','validate:xp7-admin-runtime']]
];
function run([name,cmd,args]){return new Promise(resolve=>{const started=Date.now();let stdout='',stderr='';const child=spawn(cmd,args,{env:process.env,shell:process.platform==='win32'});child.stdout.on('data',d=>{stdout+=d;process.stdout.write(d)});child.stderr.on('data',d=>{stderr+=d;process.stderr.write(d)});child.on('close',code=>{fs.writeFileSync(path.join(out,`${name}.log`),stdout+'\n--- STDERR ---\n'+stderr);resolve({name,command:[cmd,...args].join(' '),status:code===0?'passed':'failed',exitCode:code,durationMs:Date.now()-started})});child.on('error',e=>resolve({name,command:[cmd,...args].join(' '),status:'failed',exitCode:127,durationMs:Date.now()-started,error:e.message}))})}
const results=[];for(const step of steps)results.push(await run(step));const passed=results.every(x=>x.status==='passed');const report={generatedAt:new Date().toISOString(),status:passed?'passed':'failed',results};writeJson('qa-results/preflight.json',report);fs.writeFileSync('qa-results/PREFLIGHT.md',['# QA Preflight','',`Status: **${report.status.toUpperCase()}**`,'',...results.map(x=>`- ${x.status==='passed'?'✅':'❌'} **${x.name}** — ${x.durationMs} ms — \`${x.command}\``),'','These are prerequisite/regression checks. They do not certify runtime behavior; DB/RLS/API/browser layers run afterward.'].join('\n'));process.exit(passed?0:1);
