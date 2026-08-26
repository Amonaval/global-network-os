import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const exists=p=>fs.existsSync(path.join(root,p));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[]; const fail=m=>failures.push(m);

const required=[
 'ARCHIVE-INDEX.md','GENERIC-CAPABILITY-UTILIZATION-RULE.md','archive/docs/g8.5/G8.5-A-CAPABILITY-APPLICABILITY-MATRIX.md','archive/docs/g8.5/G8.5-A-BASELINE-CLEANUP-AUDIT.md','archive/docs/g8.5/G8.5-A-RUNTIME-VERIFICATION-CHECKLIST.md','archive/docs/g8.5/G8.5-A-RELEASE-MANIFEST.md',
 'archive/docs/archive-map.json','archive/docs/g0-g6/G5-CERTIFICATION-HOTFIX-AFFECTED-FILES.txt','archive/docs/g0-g6/G5-CERTIFICATION-HOTFIX-VERTICAL-FEATURE-DISPATCH.md'
];
for(const f of required) if(!exists(f)) fail(`missing G8.5-A artifact: ${f}`);

const rootMd=fs.readdirSync(root).filter(f=>f.endsWith('.md'));
if(rootMd.length>24) fail(`root documentation still too noisy: ${rootMd.length} Markdown files (expected <=24)`);
for(const dir of ['archive/docs/family-foundation','archive/docs/g0-g6','archive/docs/g7','archive/docs/g8','archive/docs/g8.5']){
 if(!exists(dir)||fs.readdirSync(path.join(root,dir)).length===0) fail(`historical archive group missing/empty: ${dir}`);
}

const rule=read('GENERIC-CAPABILITY-UTILIZATION-RULE.md');
for(const marker of ['reuse it by default','Productized Vertical Gate','Showcase rule','explicit','Genericize once']) if(!rule.includes(marker)) fail(`capability utilization rule missing: ${marker}`);
const matrix=read('archive/docs/g8.5/G8.5-A-CAPABILITY-APPLICABILITY-MATRIX.md');
for(const marker of ['Maps / geography','Connection paths','Stories / memories / history','Contributions','Launch Control','Notifications / digest','Organization','Business Trust','Franchise','G8.5-B']) if(!matrix.includes(marker)) fail(`capability matrix missing: ${marker}`);

// Accepted baseline manifests must continue to resolve every file after archival.
for(const manifest of fs.readdirSync(path.join(root,'scripts')).filter(f=>f.includes('accepted')&&f.endsWith('baseline.txt'))){
 const missing=read(`scripts/${manifest}`).split(/\r?\n/).filter(Boolean).filter(f=>!exists(f));
 if(missing.length) fail(`${manifest} has missing accepted artifacts: ${missing.join(', ')}`);
}

const roadmap=read('ROADMAP.md'),status=read('MISSION-STATUS.md'),codebase=read('CODEBASE.md'),validation=read('VALIDATION.md'),handoff=read('NEXT-SESSION-PROMPT.md');
for(const [name,text] of [['ROADMAP',roadmap],['MISSION-STATUS',status],['CODEBASE',codebase],['VALIDATION',validation],['NEXT-SESSION-PROMPT',handoff]]){
 if(!text.includes('G8.5-A')) fail(`${name} not updated for G8.5-A`);
}
if(!roadmap.includes('G8.5-B')) fail('ROADMAP lost G8.5-B history');
if(!/(G8\.5-B|G8\.5-C|G9)/.test(handoff)) fail('NEXT-SESSION-PROMPT lost valid G8.5/G9 continuation');

if(failures.length){console.error(`G8.5-A clean/audit gate: FAIL — ${failures.join(' | ')}`);process.exit(1);}
console.log(`G8.5-A clean/audit gate: PASS — ${rootMd.length} root Markdown docs, historical archive preserved, accepted baselines resolve, reuse/product-depth rules locked.`);
