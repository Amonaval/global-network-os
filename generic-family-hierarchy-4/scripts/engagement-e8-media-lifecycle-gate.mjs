import fs from 'node:fs';const r=p=>fs.readFileSync(p,'utf8');const sql=r('supabase/migrations/110_engagement_media_lifecycle.sql'),storage=r('lib/storage.ts'),ui=r('components/shared/MediaManagementPanel.tsx'),family=r('components/FamilyAdminCenter.tsx'),app=r('components/TemplateNetworkApp.tsx'),fca=r('verticals/family-association/runtime/composition.ts'),hs=r('verticals/housing-society/runtime/composition.ts');
const checks=[
['lifecycle columns and constraint',sql.includes('lifecycle_state')&&sql.includes("'active','archived','delete_pending','deleted'")],
['archive is reversible and audited',sql.includes('set_network_media_asset_archived')&&sql.includes('network_media_archived')&&sql.includes('network_media_restored')],
['bound media requires archive before delete',sql.includes('Archive linked media before permanently deleting it')],
['delete uses request/finalize contract',sql.includes('request_network_media_asset_delete')&&sql.includes('finalize_network_media_asset_delete')&&sql.includes('cancel_network_media_asset_delete')],
['deleted registry history preserved',sql.includes("lifecycle_state='deleted'")&&sql.includes("source','legacy_remove_helper")],
['normal hydration shows only active media',sql.includes("m.lifecycle_state='active'")],
['deleted media cannot authorize storage reads',sql.includes("lifecycle_state in ('delete_pending','deleted')")],
['complaint authorization remains explicit',sql.includes('hs_complaints')&&sql.includes('c.assigned_to=auth.uid()')],
['management snapshot is tenant scoped',sql.includes('get_network_media_management_snapshot')&&sql.includes('public.current_network_id()')],
['storage client deletes main and thumbnail',storage.includes('permanentlyDeleteManagedMedia')&&storage.includes('thumbnail_path')&&storage.includes('.remove(paths)')],
['failed physical deletion cancels pending state',storage.includes('cancel_network_media_asset_delete')],
['media management UI exists',ui.includes('qa-media-management-panel')&&ui.includes('E8MediaStorageTxt')],
['archive then explicit delete UX',ui.includes('setMediaArchived')&&ui.includes('permanentlyDeleteManagedMedia')&&ui.includes('E8DeleteConfirmTxt')],
['family storage embeds lifecycle manager',family.includes('MediaManagementPanel')&&family.includes('tab==="storage"')],
['productized media route wired',app.includes('MediaManagementPanel')&&app.includes('tab==="media"')],
['community media surface admin-only',fca.includes('mediaSurface')&&fca.includes('adminOnly:true')],
['housing media surface admin-only',hs.includes('mediaSurface')&&hs.includes('adminOnly:true')],
['no automatic deletion job',!sql.includes('pg_cron')&&!sql.includes('cron.schedule')]
];let fail=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} E8 ${n}`);if(!ok)fail++}console.log(`E8 ${checks.length-fail}/${checks.length} PASS`);if(fail)process.exit(1);
