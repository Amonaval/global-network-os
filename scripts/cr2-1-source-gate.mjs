import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const remote=read('lib/remote.ts');
const app=read('components/NetworkApp.tsx');
const excel=read('components/ImportModal.tsx');
const migration=read('supabase/migrations/032_cr2_1_shared_setup_and_demo_uuid_hotfix.sql');
const checks=[
  ['settings use secure RPC',remote.includes('rpc("save_network_settings"') && !remote.includes('.from("network_settings").upsert')],
  ['non UUID life event guard',remote.includes('!isUuidValue(memberId)')],
  ['demo profile skips shared member timeline',app.includes('if (!selected || demoPreview)')],
  ['Excel IDs normalized to UUID',excel.includes('isUuid(source) ? source : uuid()')],
  ['small demo exposed',excel.includes('family-demo-small-naval.xlsx')],
  ['full demo exposed',excel.includes('sample-data-150.xlsx')],
  ['settings RPC tenant scoped',migration.includes('public.current_network_id()') && migration.includes('public.is_network_admin(nid)')],
  ['small workbook packaged',fs.existsSync(new URL('../public/family-demo-small-naval.xlsx',import.meta.url))],
  ['full workbook packaged',fs.existsSync(new URL('../public/sample-data-150.xlsx',import.meta.url))],
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed) process.exit(1);
console.log(`${checks.length}/${checks.length} CR2.1 source checks passed.`);
