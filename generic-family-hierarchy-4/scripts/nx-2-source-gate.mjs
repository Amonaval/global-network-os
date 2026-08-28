import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const loop=read('components/LivingFamilyLoop.tsx');
const home=read('components/FamilyHome.tsx');
const hub=read('components/FamilyExperienceHub.tsx');
const app=read('components/NetworkApp.tsx');
const css=read('app/globals.css');
const guide=read('lib/user-guide-content.ts');
const checks=[
 ['living component',loop.includes('One meaningful family minute')],
 ['relationship graph reused',loop.includes('findRelationshipPath')&&loop.includes('relationshipLabelToViewer')],
 ['no gamification',loop.includes('No endless feed')&&!loop.includes('streak')],
 ['family home integration',home.includes('<FamilyExperienceHub')&&hub.includes('<LivingFamilyLoop')&&home.includes('relationships?:Relationship[]')],
 ['relationships passed from runtime',app.includes('<FamilyHome members={members} relationships={relationships}')],
 ['responsive styles',css.includes('NX-2 — Living Network')&&css.includes('.living-family-loop')&&css.includes('@media(max-width:620px)')],
 ['guide coverage',guide.includes('Living Family & Generational Connection')],
];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(failed.length)process.exit(1);
console.log('NX-2 source gate PASS');
