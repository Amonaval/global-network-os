import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const checks=[
 ['explicit new network settings context', read('lib/remote.ts').includes('p_network_id: settings.network_id || null')],
 ['activate created network', read('components/NetworkApp.tsx').includes('await setActiveNetwork(networkId)')],
 ['public no-login playground', read('components/NetworkApp.tsx').includes('Try Playground · no login')],
 ['auth gate permits playground', read('components/NetworkApp.tsx').includes('!auth && !demoPreview')],
 ['minimum-data family creation', read('components/SetupScreen.tsx').includes('Create now · add people later')],
 ['human relationship parser', read('components/ImportModal.tsx').includes('["parent", "father", "mother"]') && read('components/ImportModal.tsx').includes('["child", "son", "daughter"]')],
 ['guided static Excel', read('components/ImportModal.tsx').includes('/family-excel-guided-template.xlsx')],
 ['tree relationship labels', read('components/TreeView.tsx').includes('Father') && read('components/TreeView.tsx').includes('Husband') && read('components/TreeView.tsx').includes('labelBgStyle')],
 ['detailed help preview', read('components/NetworkApp.tsx').includes('Preview detailed family guide')],
 ['migration explicit network id', read('supabase/migrations/033_cr2_2_explicit_family_context_and_progressive_onboarding.sql').includes('p_network_id uuid')],
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`${checks.length-failed}/${checks.length} CR2.2 source checks passed.`);
if(failed)process.exit(1);
