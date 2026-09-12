import fs from 'node:fs';
const checks=[
 ['components/FamilyTimeMachine.tsx',['Family Time Machine','What could be forgotten?','preservationNeeds','No']],
 ['components/FamilyExperienceHub.tsx',['FamilyTimeMachine','<FamilyTimeMachine']],
 ['lib/user-guide-content.ts',['family-time-machine','Family Time Machine & Generational Legacy']],
 ['app/globals.css',['family-time-machine','time-machine-shell','legacy-risk-grid']],
 ['archive/docs/missions/network-experience/NX-3-FAMILY-TIME-MACHINE.md',['No AI-generated family narrative','No cross-network data']],
 ['archive/docs/missions/network-experience/NX-3-RUNTIME-VERIFICATION-CHECKLIST.md',['Time Machine shows eras','Sparse data shows the honest empty-state']]
];
let failed=false;
for(const [file,needles] of checks){
 if(!fs.existsSync(file)){console.error(`MISS ${file}`);failed=true;continue;}
 const text=fs.readFileSync(file,'utf8');
 for(const n of needles)if(!text.includes(n)){console.error(`MISS ${file}: ${n}`);failed=true;}
}
if(failed)process.exit(1);
console.log('NX-3 source gate PASS');
