import fs from 'node:fs';
import {createClient} from '@supabase/supabase-js';
import {VERTICALS} from '../runtime/catalog.mjs';
import {loadQaEnv,writeJson} from '../runtime/env.mjs';
import {publicConfig,roleClient,setActiveNetwork} from '../runtime/supabase.mjs';

loadQaEnv();
const state=JSON.parse(fs.readFileSync('qa-results/fixtures/seed-state.json','utf8'));
const checks=[];
const roles=['owner','admin','member'];
async function run(role,kind,rpc,args={},expect='success',validate=()=>true){
  const {client}=await roleClient(role);await setActiveNetwork(client,state.networks[kind].id);
  const {data,error}=await client.rpc(rpc,args);
  const ok=expect==='error'?!!error:!error&&validate(data);
  checks.push({role,vertical:kind,rpc,status:ok?'passed':'failed',expected:expect,error:error?.message||null,returned:Array.isArray(data)?data.length:data==null?0:1});
  return ok;
}
// Every released vertical + all three core roles: membership discovery and quick-start contract.
for(const v of VERTICALS){
  for(const role of roles){
    await run(role,v.kind,'get_my_networks',{},'success',data=>Array.isArray(data)&&data.some(x=>String(x.network_id)===state.networks[v.kind].id));
    await run(role,v.kind,'get_network_quick_start_state',{p_network_id:state.networks[v.kind].id});
  }
  // Backup is an admin surface on every vertical and must be denied to members.
  await run('owner',v.kind,'get_network_logical_backup',{p_network_id:state.networks[v.kind].id});
  await run('admin',v.kind,'get_network_logical_backup',{p_network_id:state.networks[v.kind].id});
  await run('member',v.kind,'get_network_logical_backup',{p_network_id:state.networks[v.kind].id},'error');
}
// Vertical-specific safe runtime reads.
for(const role of roles)await run(role,'alumni','get_alumni_directory',{p_query:null,p_year:null,p_program:null});
for(const kind of VERTICALS.map(v=>v.kind).filter(k=>!['family','alumni'].includes(k))){
  for(const role of roles){
    await run(role,kind,'get_productized_network_settings');
    await run(role,kind,'get_productized_network_relationships');
  }
  await run('owner',kind,'get_productized_network_memberships');
  await run('admin',kind,'get_productized_network_memberships');
  await run('member',kind,'get_productized_network_memberships',{},'success',data=>Array.isArray(data)&&data.length===0);
}
await run('owner','family','get_family_admin_summary');await run('admin','family','get_family_admin_summary');await run('member','family','get_family_admin_summary',{},'error');
await run('owner','family-association','get_fca_admin_snapshot');await run('admin','family-association','get_fca_admin_snapshot');await run('member','family-association','get_fca_admin_snapshot',{},'error');
for(const rpc of ['hs1_get_property_snapshot','hs1_get_my_flat','hs1_get_import_template','hs2_get_operations_snapshot','hs3_get_finance_snapshot','hs4_get_governance_snapshot','hs5_get_snapshot','hs6_get_pilot_snapshot'])await run('owner','housing-society',rpc);
await run('member','housing-society','hs1_get_my_flat');
// Anonymous RPC probes must not disclose private memberships/backups.
const cfg=publicConfig(),anon=createClient(cfg.url,cfg.anon,{auth:{persistSession:false,autoRefreshToken:false}});
for(const [name,rpc,args] of [
 ['anonymous network list is empty','get_my_networks',{}],
 ['anonymous quick-start is empty','get_network_quick_start_state',{p_network_id:state.networks.family.id}],
]){const {data,error}=await anon.rpc(rpc,args);const ok=!error&&Array.isArray(data)&&data.length===0;checks.push({role:'anonymous',vertical:'family',rpc,status:ok?'passed':'failed',name,error:error?.message||null,returned:Array.isArray(data)?data.length:null})}
const anonBackup=await anon.rpc('get_network_logical_backup',{p_network_id:state.networks.family.id});checks.push({role:'anonymous',vertical:'family',rpc:'get_network_logical_backup',status:anonBackup.error?'passed':'failed',expected:'error',error:anonBackup.error?.message||null});

const failed=checks.filter(x=>x.status==='failed');writeJson('qa-results/db/rpc-smoke.json',{generatedAt:new Date().toISOString(),status:failed.length?'failed':'passed',summary:{checks:checks.length,failed:failed.length},checks});console.log(`RPC smoke ${failed.length?'FAIL':'PASS'} (${checks.length} checks, ${failed.length} failed)`);if(failed.length)process.exit(1);
