import fs from 'node:fs';
const mig94=fs.readFileSync('supabase/migrations/094_xp6_participation_parity.sql','utf8');
const mig95=fs.readFileSync('supabase/migrations/095_xp7_admin_status_ambiguity_hotfix.sql','utf8');
const admin=fs.readFileSync('components/TemplateNetworkApp.tsx','utf8');
const part=fs.readFileSync('components/shared/NetworkParticipationAdmin.tsx','utf8');
const adminContracts=fs.readFileSync('core/admin/contracts.ts','utf8');
const checks=[
 ['095 hotfix exists',mig95.includes('list_network_participation_invitations')],
 ['095 qualifies membership status',mig95.includes("nm.status='active'")],
 ['095 qualifies membership role',mig95.includes("nm.role in ('owner','admin')")],
 ['095 qualifies invitation status',mig95.includes("i.status='pending'")],
 ['094 rerun-safe qualification',mig94.includes("nm.status='active'")&&mig94.includes("nm.role in ('owner','admin')")],
 ['shared Admin renders participation',admin.includes('<NetworkParticipationAdmin')],
 ['participation loads invitation RPC through remote',part.includes('listNetworkInvitations(networkId)')],
 ['all released verticals registered in shared Admin Center', ['family','alumni','association','family-association','housing-society','organization','business-trust','franchise','professional'].every(k=>adminContracts.includes(k))]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
// Guard the exact PL/pgSQL anti-pattern in functions with a RETURNS TABLE status output.
for(const [file,text] of [['094',mig94],['095',mig95]]){
 const fn=text.match(/list_network_participation_invitations[\s\S]*?\$\$([\s\S]*?)\$\$/i)?.[1]||'';
 if(/from\s+public\.network_memberships\s+where[\s\S]{0,180}\bstatus\s*=\s*'active'/i.test(fn)){console.log(`FAIL ${file} has unqualified membership status in status-returning PL/pgSQL`);failed++;} else console.log(`PASS ${file} avoids status output-column ambiguity`);
}
if(failed)process.exit(1);console.log(`XP-7 Admin runtime closure: ${checks.length+2}/${checks.length+2}`);
