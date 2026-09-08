import fs from 'node:fs';
import {createClient} from '@supabase/supabase-js';
import {loadQaEnv,writeJson} from '../runtime/env.mjs';
import {publicConfig,roleClient,serviceClient,setActiveNetwork} from '../runtime/supabase.mjs';
import {recordFinding} from '../runtime/evidence.mjs';
loadQaEnv();
const state=JSON.parse(fs.readFileSync('qa-results/fixtures/seed-state.json','utf8'));
const checks=[];
const fail=(name,details={})=>{checks.push({name,status:'failed',...details});recordFinding({severity:'P0',code:'RLS_TENANT_ISOLATION',title:name,details})};
const pass=(name,details={})=>checks.push({name,status:'passed',...details});
const assert=(ok,name,details={})=>ok?pass(name,details):fail(name,details);
const A=await roleClient('owner'),B=await roleClient('tenantB'),member=await roleClient('member'),invitee=await roleClient('invitee'),service=serviceClient();
await setActiveNetwork(A.client,state.networks.family.id);await setActiveNetwork(B.client,state.tenantB.id);await setActiveNetwork(member.client,state.networks.family.id);
const cfg=publicConfig(),anon=createClient(cfg.url,cfg.anon,{auth:{persistSession:false,autoRefreshToken:false}});
async function invisible(name,client,table,column,value){const {data,error}=await client.from(table).select('*').eq(column,value);assert(!!error||(data||[]).length===0,name,{error:error?.message||null,leakedRows:(data||[]).length})}
await invisible('Tenant A cannot select tenant B network by known UUID',A.client,'networks','id',state.tenantB.id);
await invisible('Tenant B cannot select tenant A network by known UUID',B.client,'networks','id',state.networks.family.id);
await invisible('Tenant A cannot select tenant B memberships by known tenant UUID',A.client,'network_memberships','network_id',state.tenantB.id);
await invisible('Tenant B cannot select tenant A memberships by known tenant UUID',B.client,'network_memberships','network_id',state.networks.family.id);
await invisible('Anonymous cannot select private QA network by known UUID',anon,'networks','id',state.networks.family.id);
// Cross-tenant RPC substitution.
for(const [name,client,target] of [['Tenant A cannot backup tenant B',A.client,state.tenantB.id],['Tenant B cannot backup tenant A',B.client,state.networks.family.id]]){const {error}=await client.rpc('get_network_logical_backup',{p_network_id:target});assert(!!error,name,{error:error?.message||null})}
const qs=await A.client.rpc('get_network_quick_start_state',{p_network_id:state.tenantB.id});assert(!qs.error&&Array.isArray(qs.data)&&qs.data.length===0,'Known foreign UUID does not leak quick-start state',{error:qs.error?.message||null,rows:qs.data?.length||0});
// Cross-tenant direct mutations.
const upd=await A.client.from('networks').update({name:state.tenantB.name}).eq('id',state.tenantB.id).select('id');assert(!!upd.error||!upd.data?.length,'Tenant A cannot update tenant B network',{error:upd.error?.message||null,rows:upd.data?.length||0});
const del=await A.client.from('network_memberships').delete().eq('network_id',state.tenantB.id).eq('user_id',state.users.tenantB.id).select('network_id');assert(!!del.error||!del.data?.length,'Tenant A cannot delete tenant B membership',{error:del.error?.message||null,rows:del.data?.length||0});
const ins=await A.client.from('network_memberships').insert({network_id:state.tenantB.id,user_id:state.users.member.id,role:'member',status:'active'}).select('network_id');assert(!!ins.error||!ins.data?.length,'Tenant A cannot inject a member into tenant B',{error:ins.error?.message||null,rows:ins.data?.length||0});
// Repair fixture even if the attack unexpectedly succeeded so later tests remain deterministic.
await service.from('network_memberships').delete().eq('network_id',state.tenantB.id).eq('user_id',state.users.member.id);await service.from('network_memberships').upsert({network_id:state.tenantB.id,user_id:state.users.tenantB.id,role:'owner',status:'active'},{onConflict:'network_id,user_id'});
// Storage tenant prefix isolation: owner B may upload own object; A cannot read/list/write B path.
const png=Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,8,215,99,248,207,192,240,31,0,5,0,1,255,137,153,61,29,0,0,0,0,73,69,78,68,174,66,96,130]);
const storagePath=`${state.tenantB.id}/profiles/${state.users.tenantB.id}/qa-rls-${Date.now()}.png`;
let storageCreated=false;
try{
 const upB=await B.client.storage.from('profile-photos').upload(storagePath,png,{contentType:'image/png',upsert:false});storageCreated=!upB.error;assert(storageCreated,'Tenant B can upload to its own tenant-prefixed storage path',{error:upB.error?.message||null});
 if(storageCreated){
  const readB=await B.client.storage.from('profile-photos').download(storagePath);assert(!readB.error,'Tenant B can read its own storage object',{error:readB.error?.message||null});
  const readA=await A.client.storage.from('profile-photos').download(storagePath);assert(!!readA.error,'Tenant A cannot download tenant B storage object',{error:readA.error?.message||null});
  const listA=await A.client.storage.from('profile-photos').list(`${state.tenantB.id}/profiles/${state.users.tenantB.id}`,{limit:100,search:'qa-rls-'});assert(!!listA.error||!(listA.data||[]).some(x=>storagePath.endsWith(x.name)),'Tenant A cannot discover tenant B storage object through list',{error:listA.error?.message||null,count:listA.data?.length||0});
 }
 const badPath=`${state.tenantB.id}/profiles/${state.users.owner.id}/qa-cross-${Date.now()}.png`;const upA=await A.client.storage.from('profile-photos').upload(badPath,png,{contentType:'image/png'});assert(!!upA.error,'Tenant A cannot upload into tenant B storage prefix',{error:upA.error?.message||null});if(!upA.error)await service.storage.from('profile-photos').remove([badPath]);
}finally{if(storageCreated)await B.client.storage.from('profile-photos').remove([storagePath])}
// Invitation governance: member cannot list/create; revoke invalidates token; resend invalidates old token; accepted token cannot replay.
const family=state.networks.family.id,email=state.users.invitee.email;
await service.from('network_memberships').delete().eq('network_id',family).eq('user_id',state.users.invitee.id);
await service.from('network_participation_invitations').delete().eq('network_id',family).eq('email',email);
const memberList=await member.client.rpc('list_network_participation_invitations',{p_network_id:family});assert(!!memberList.error,'Member cannot list participation invitations',{error:memberList.error?.message||null});
const memberCreate=await member.client.rpc('create_network_participation_invitation',{p_network_id:family,p_email:email,p_target_ref:null,p_target_kind:null,p_invited_role:'member',p_expires_days:14});assert(!!memberCreate.error,'Member cannot create participation invitation',{error:memberCreate.error?.message||null});
const first=await A.client.rpc('create_network_participation_invitation',{p_network_id:family,p_email:email,p_target_ref:null,p_target_kind:null,p_invited_role:'member',p_expires_days:14});assert(!first.error&&first.data?.id&&first.data?.token,'Owner creates participation invitation',{error:first.error?.message||null});
if(first.data?.id){const rev=await A.client.rpc('revoke_network_participation_invitation',{p_network_id:family,p_invitation_id:first.data.id});assert(!rev.error,'Owner revokes invitation',{error:rev.error?.message||null});const accepted=await invitee.client.rpc('accept_network_participation_invitation',{p_token:first.data.token});assert(!!accepted.error,'Revoked invitation token cannot be accepted',{error:accepted.error?.message||null})}
const second=await A.client.rpc('create_network_participation_invitation',{p_network_id:family,p_email:email,p_target_ref:null,p_target_kind:null,p_invited_role:'member',p_expires_days:14});assert(!second.error&&second.data?.id&&second.data?.token,'Owner recreates invitation after revoke',{error:second.error?.message||null});
if(second.data?.id){const oldToken=second.data.token;const resend=await A.client.rpc('resend_network_participation_invitation',{p_network_id:family,p_invitation_id:second.data.id});assert(!resend.error&&resend.data?.token&&resend.data.token!==oldToken,'Resend rotates invitation token',{error:resend.error?.message||null});const oldTry=await invitee.client.rpc('accept_network_participation_invitation',{p_token:oldToken});assert(!!oldTry.error,'Pre-resend token cannot be replayed',{error:oldTry.error?.message||null});if(resend.data?.token){const accept=await invitee.client.rpc('accept_network_participation_invitation',{p_token:resend.data.token});assert(!accept.error&&String(accept.data)===family,'Fresh invitation token accepts exactly target tenant',{error:accept.error?.message||null,networkId:accept.data});const replay=await invitee.client.rpc('accept_network_participation_invitation',{p_token:resend.data.token});assert(!!replay.error,'Accepted invitation token cannot be replayed',{error:replay.error?.message||null})}}
// Restore invitee to isolated non-member state for repeatability.
await service.from('network_memberships').delete().eq('network_id',family).eq('user_id',state.users.invitee.id);await service.from('network_participation_invitations').delete().eq('network_id',family).eq('email',email);await service.from('profiles').update({active_network_id:null}).eq('id',state.users.invitee.id);
const failed=checks.filter(x=>x.status==='failed');writeJson('qa-results/security/rls-adversarial.json',{generatedAt:new Date().toISOString(),status:failed.length?'failed':'passed',summary:{checks:checks.length,failed:failed.length},checks});console.log(`RLS adversarial ${failed.length?'FAIL':'PASS'} (${checks.length} checks, ${failed.length} failed)`);if(failed.length)process.exit(1);
