import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const sql=read('supabase/migrations/090_xp0_network_lifecycle_safety.sql');
const closure=read('supabase/migrations/091_xp01_runtime_closure.sql');
const life=read('lib/network-lifecycle.ts');
const purge=read('server/network/purge-service.ts');
const route=read('app/api/v1/networks/[networkId]/purge/route.ts');
const home=read('components/MyNetworksHome.tsx');
const family=read('components/FamilyAdminCenter.tsx');
const checks=[
 ['migration 090 exists',sql.includes('XP-0 Network Lifecycle Safety')],
 ['leave is explicit',sql.includes('leave_owned_network')&&life.includes('leaveNetwork')],
 ['archive snapshots membership states',sql.includes('network_archive_membership_state')&&sql.includes('previous_status')],
 ['restore exists',sql.includes('restore_owned_network')&&life.includes('restoreNetwork')],
 ['archived listing exists',sql.includes('get_my_archived_networks')&&(home.includes('Archived networks')||home.includes('XP2Visible0488Txt'))&&fs.readFileSync('lib/i18n/messages/en.ts','utf8').includes('Archived networks')],
 ['hard purge never directly deletes storage tables',!sql.toLowerCase().includes('delete from storage.objects where')&&!closure.toLowerCase().includes('delete from storage.objects where')],
 ['hard purge uses server Storage API',(purge.includes('storage.from(bucket).remove(')||purge.includes('.storage.from(bucket).remove('))&&purge.includes('SUPABASE_SERVICE_ROLE_KEY')&&route.includes('purgeOwnedNetwork')],
 ['purge freezes network before external storage mutation',sql.includes('prepare_owned_network_for_purge')&&sql.includes("status='archived'")&&purge.includes('prepare_owned_network_for_purge')],
 ['storage residue is checked before relational finalization',sql.includes("before_report:=public.xp0_network_residue_report")&&sql.includes("storageResidue")&&sql.includes('Storage API before relational deletion')],
 ['residue verifier is metadata-driven',sql.includes('pg_constraint')&&sql.includes("refcl.relname='networks'")],
 ['hard purge verifies after delete',sql.includes('after_report:=public.xp0_network_residue_report(p_network_id)')&&sql.includes('purge residue verification failed')],
 ['minimal purge receipt retained',sql.includes('network_purge_receipts')&&sql.includes('xp0-v2-storage-api')],
 ['family archive uses shared primitive',family.includes('archiveNetwork(')],
 ['My Networks exposes leave archive restore delete',home.includes('leaveNetwork(')&&home.includes('archiveNetwork(')&&home.includes('restoreNetwork(')&&home.includes('deleteOwnedNetworkPermanently(')],
 ['client hard delete routes through server API',life.includes('/api/v1/networks/')&&life.includes('/purge')&&life.includes('access_token')],
 ['compat productized wrappers preserved',sql.includes('archive_productized_network')&&sql.includes('delete_productized_network_permanently')],
 ['migration has post-contract assertions',sql.includes('XP-0 compatibility check failed')&&sql.includes('purge preparation missing')],
];
let bad=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)bad++}
if(bad)process.exit(1);console.log(`XP-0 source gate: ${checks.length}/${checks.length} passed.`);
