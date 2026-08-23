import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const app=read('components/NetworkApp.tsx');
const tree=read('components/TreeView.tsx');
const profile=read('components/ProfileDrawer.tsx');
const rel=read('lib/relationship-intelligence.ts');
const css=read('app/globals.css');
const checks=[
 ['anonymous playground stays no-login',app.includes('Try Playground · no login')&&app.includes('setDemoViewerId')],
 ['playground has temporary viewer and saves nothing',app.includes('nothing is saved')&&app.includes('demoViewerId')],
 ['personal family line defaults for viewer',app.includes('setLineageOnly(true)')&&app.includes('My Family Line')],
 ['personal/full switch remains reversible',app.includes('View Full Tree')&&app.includes('View My Lineage')],
 ['human relationship labels exist',rel.includes("'Father'")&&rel.includes("'Mother'")&&rel.includes("'Brother'")&&rel.includes("'Sister'")&&rel.includes("'Uncle'")&&rel.includes("'Aunt'")&&rel.includes("'Cousin'")],
 ['profiles show relationship-to-me badge',profile.includes('profile-relationship-badge')&&profile.includes('relationshipLabelToViewer')],
 ['tree cards show relationship-to-me',tree.includes('tree-relation-label')&&tree.includes('relationshipLabelToViewer')],
 ['child vocabulary normalizes edge direction',tree.includes('r.relationship_type === "child" ? r.related_person_id : r.person_id')],
 ['immediate family shortcuts exist',app.includes('Your closest family')&&rel.includes('immediateFamilyForViewer')],
 ['member correction entry persists request',profile.includes('Report correction')&&app.includes('kind:"family_correction"')&&app.includes('createChangeRequest')],
 ['mobile 430 containment rules exist',css.includes('@media(max-width:430px)')&&css.includes('.tree-mobile-view-switch .btn{width:100%')],
 ['required legacy css fixes retained',(/\.card\s*\{[^}]*padding:\s*10px;?/s.test(css)||css.includes('.card.home-coming{padding:10px}'))&&/\.profile-overlay\s*\{[^}]*z-index:\s*50;?/s.test(css)],
 ['60-person showcase workbook is public',fs.existsSync(new URL('../public/sample-data-60.xlsx',import.meta.url))]
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);
console.log(`${checks.length}/${checks.length} S1-A/B source checks passed.`);
