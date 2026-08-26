import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const remote=read('lib/remote.ts');
const app=read('components/NetworkApp.tsx');
const demo=read('lib/demo-data.ts');
const store=read('lib/store.ts');
const excel=read('components/ImportModal.tsx');
const quick=read('components/QuickFamilyStart.tsx');
const migration=read('supabase/migrations/035_s1c_profile_submission_review.sql');
const checks=[
 ['profile review uses governed RPC',remote.includes('rpc("review_profile_submission"') && migration.includes('public.is_network_admin(nid)')],
 ['direct submission update stays closed',!remote.includes('.from("profile_submissions")\n    .update')],
 ['family owner accepted by UI review guard',app.includes('network?.membership_role === "owner"')],
 ['first self profile has secure RPC',remote.includes('add_myself_to_family') && migration.includes('family_creator_profile_added')],
 ['close-family starter is visible',app.includes('<QuickFamilyStart') && quick.includes('Father') && quick.includes('Daughter')],
 ['friendly import IDs still normalize to UUID',excel.includes('isUuid(source) ? source : uuid()')],
 ['guided workbook exposed',excel.includes('family-excel-guided-template.xlsx')],
 ['showcase workbook exposed',excel.includes('family-demo-showcase-60.xlsx')],
 ['simple CSV exposed',excel.includes('family-people-simple.csv')],
 ['showcase workbook packaged',fs.existsSync(new URL('../public/family-demo-showcase-60.xlsx',import.meta.url))],
 ['small workbook packaged',fs.existsSync(new URL('../public/family-demo-small-10.xlsx',import.meta.url))],
 ['simple CSV packaged',fs.existsSync(new URL('../public/family-people-simple.csv',import.meta.url))],
 ['demo includes rich life events',demo.includes('demoLifeEvents') && demo.split('"event_type"').length>25],
 ['demo includes rich memories',demo.includes('demoMemories') && demo.split('"story"').length>10],
 ['demo state persists memories',store.includes('memories:demoMemories')],
 ['playground hydrates memories and timeline',app.includes('setMemories(d.memories)') && app.includes('setAllLifeEvents(d.lifeEvents)')],
 ['shared demo remaps friendly IDs to UUIDs',app.includes('const idMap = new Map<string,string>()') && app.includes('persistedDemoEvents')],
 ['success experience exists',app.includes('Your family is ready')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);console.log(`${checks.length}/${checks.length} S1-C source checks passed.`);
