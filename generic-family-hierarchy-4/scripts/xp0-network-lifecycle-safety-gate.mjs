import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const sql=read('supabase/migrations/090_xp0_network_lifecycle_safety.sql');
const life=read('lib/network-lifecycle.ts');
const home=read('components/MyNetworksHome.tsx');
const family=read('components/FamilyAdminCenter.tsx');
const checks=[
 ['migration 090 exists',sql.includes('XP-0 Network Lifecycle Safety')],
 ['leave is explicit',sql.includes('leave_owned_network')&&life.includes('leaveNetwork')],
 ['archive snapshots membership states',sql.includes('network_archive_membership_state')&&sql.includes('previous_status')],
 ['restore exists',sql.includes('restore_owned_network')&&life.includes('restoreNetwork')],
 ['archived listing exists',sql.includes('get_my_archived_networks')&&home.includes('Archived networks')],
 ['hard purge deletes storage explicitly',sql.includes("delete from storage.objects where split_part(name,'/',1)=p_network_id::text")],
 ['residue verifier is metadata-driven',sql.includes('pg_constraint')&&sql.includes("refcl.relname='networks'")],
 ['hard purge verifies after delete',sql.includes('report:=public.xp0_network_residue_report(p_network_id)')&&sql.includes('purge residue verification failed')],
 ['minimal purge receipt retained',sql.includes('network_purge_receipts')&&sql.includes('verifier_version')],
 ['family archive uses shared primitive',family.includes('archiveNetwork(')],
 ['My Networks exposes leave archive restore delete',home.includes('leaveNetwork(')&&home.includes('archiveNetwork(')&&home.includes('restoreNetwork(')&&home.includes('deleteOwnedNetworkPermanently(')],
 ['compat productized wrappers preserved',sql.includes('archive_productized_network')&&sql.includes('delete_productized_network_permanently')],
 ['migration has post-contract assertions',sql.includes('XP-0 compatibility check failed')],
];
let bad=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)bad++}
if(bad)process.exit(1);console.log(`XP-0 source gate: ${checks.length}/${checks.length} passed.`);
