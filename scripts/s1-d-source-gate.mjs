import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const app=read('components/NetworkApp.tsx');
const profile=read('components/ProfileDrawer.tsx');
const css=read('app/globals.css');
const modalFiles=['components/ProfileForm.tsx','components/LifeEventEditor.tsx','components/RelationshipExplorer.tsx','components/ImportModal.tsx','components/InvitationModal.tsx','components/RelationshipModal.tsx','components/CommunityHub.tsx'];
const checks=[
 ['UsersRound import/use closure',app.includes('UsersRound')],
 ['privacy preview label',app.includes('Preview profile privacy as')],
 ['public visitor preview option',app.includes('Public visitor preview')],
 ['profile detail privacy filtering',profile.includes('showProfileDetails')],
 ['contact privacy filtering',profile.includes('showContactDetails')],
 ['life event preview filtering',profile.includes('visibleEvents')],
 ['memory preview filtering',profile.includes('visibleMemories')],
 ['global card padding retained',/\.card\s*\{\s*padding:\s*10px;/s.test(css)],
 ['home memory spacing retained',/button\.home-memory-tile\s*\{\s*margin-bottom:\s*10px;/s.test(css)],
 ['help backdrop dismiss',app.includes('event.target===event.currentTarget&&setShowGuide(false)')],
 ...modalFiles.map(f=>[`backdrop dismiss ${f}`,read(f).includes('event.target===event.currentTarget')])
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`S1-D source gate: ${checks.length-failed}/${checks.length}`);
if(failed)process.exit(1);
