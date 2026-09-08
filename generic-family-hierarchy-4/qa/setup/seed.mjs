import fs from 'node:fs';import path from 'node:path';
import {VERTICALS} from '../runtime/catalog.mjs';
import {assertMutationAllowed,loadQaEnv,requiredEnv,writeJson} from '../runtime/env.mjs';
import {roleClient,serviceClient,setActiveNetwork} from '../runtime/supabase.mjs';
loadQaEnv();assertMutationAllowed();requiredEnv(['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY']);
const service=serviceClient();
const domain=process.env.QA_EMAIL_DOMAIN||'example.test';
const password=process.env.QA_TEST_PASSWORD||'TrustWeave-QA-Only-ChangeMe-123!';
const namespace=(process.env.QA_RUN_NAMESPACE||'cert').replace(/[^a-z0-9-]/gi,'-').toLowerCase();
const roles=['owner','admin','member','invitee','tenantB'];
const envMap={owner:'QA_OWNER',admin:'QA_ADMIN',member:'QA_MEMBER',invitee:'QA_INVITEE',tenantB:'QA_TENANT_B_OWNER'};
const defaults={owner:`qa-owner-${namespace}@${domain}`,admin:`qa-admin-${namespace}@${domain}`,member:`qa-member-${namespace}@${domain}`,invitee:`qa-invitee-${namespace}@${domain}`,tenantB:`qa-tenant-b-owner-${namespace}@${domain}`};
async function listAllUsers(){let page=1,all=[];for(;;){const {data,error}=await service.auth.admin.listUsers({page,perPage:1000});if(error)throw error;all.push(...data.users);if(data.users.length<1000)break;page++}return all}
async function ensureUser(role,existing){const prefix=envMap[role],email=process.env[`${prefix}_EMAIL`]||defaults[role],pass=process.env[`${prefix}_PASSWORD`]||password;let user=existing.find(u=>u.email?.toLowerCase()===email.toLowerCase());if(!user){const {data,error}=await service.auth.admin.createUser({email,password:pass,email_confirm:true,user_metadata:{full_name:`QA ${role}`}});if(error)throw new Error(`Create ${role} failed: ${error.message}`);user=data.user}else{const {data,error}=await service.auth.admin.updateUserById(user.id,{password:pass,email_confirm:true,user_metadata:{...(user.user_metadata||{}),full_name:`QA ${role}`}});if(error)throw new Error(`Update ${role} failed: ${error.message}`);user=data.user}
 const profileRole=['owner','admin','tenantB'].includes(role)?'admin':'member';const {error:pe}=await service.from('profiles').upsert({id:user.id,full_name:`QA ${role}`,role:profileRole,updated_at:new Date().toISOString()},{onConflict:'id'});if(pe)throw new Error(`Profile seed ${role} failed: ${pe.message}`);return {role,email,password:pass,id:user.id}}
const existing=await listAllUsers();const users={};for(const role of roles)users[role]=await ensureUser(role,existing);
// make generated identities available to Playwright/DB scripts even when .env.qa left blank
const generatedLines=[];for(const role of roles){const prefix=envMap[role];generatedLines.push(`${prefix}_EMAIL=${users[role].email}`,`${prefix}_PASSWORD=${users[role].password}`)}
fs.mkdirSync(path.join('qa-results','fixtures'),{recursive:true});fs.writeFileSync(path.join('qa-results','fixtures','generated.env'),generatedLines.join('\n')+'\n');for(const line of generatedLines){const i=line.indexOf('=');process.env[line.slice(0,i)]=line.slice(i+1)}
const owner=(await roleClient('owner')).client;const tenantB=(await roleClient('tenantB')).client;
async function findNetwork(ownerId,kind,name){const {data,error}=await service.from('networks').select('id,name,vertical_kind,status').eq('created_by',ownerId).eq('vertical_kind',kind).eq('name',name).limit(1);if(error)throw error;return data?.[0]}
async function createNetwork(client,kind,name,context){if(kind==='family'){const {data,error}=await client.rpc('create_family',{p_name:name,p_slug:null,p_description:'Deterministic QA runtime fixture'});if(error)throw error;return String(data)}if(kind==='alumni'){const {data,error}=await client.rpc('create_alumni_network',{p_name:name,p_institution:context,p_description:'Deterministic QA runtime fixture'});if(error)throw error;return String(data)}const {data,error}=await client.rpc('create_productized_network',{p_vertical_kind:kind,p_name:name,p_context_value:context,p_description:'Deterministic QA runtime fixture'});if(error)throw error;return String(data)}
const networks={};
for(const v of VERTICALS){const name=`QA ${v.label} [${namespace}]`;let row=await findNetwork(users.owner.id,v.kind,name);if(!row){const id=await createNetwork(owner,v.kind,name,v.context);row={id,name,vertical_kind:v.kind,status:'active'}}else if(row.status==='archived'){await service.from('networks').update({status:'active',updated_at:new Date().toISOString()}).eq('id',row.id)}
 networks[v.kind]={id:row.id,name,kind:v.kind,marker:`QA-${v.marker}-${namespace}`};
 for(const [role,r] of [['admin','admin'],['member','member']]){const {error}=await service.from('network_memberships').upsert({network_id:row.id,user_id:users[role].id,role:r,status:'active',joined_at:new Date().toISOString()},{onConflict:'network_id,user_id'});if(error)throw new Error(`membership seed ${v.kind}/${role}: ${error.message}`)}
 await setActiveNetwork(owner,row.id);
 if(v.kind==='alumni'){const {error}=await owner.rpc('admin_upsert_alumni_profile',{p_full_name:networks[v.kind].marker,p_email:null,p_graduation_year:2020,p_program:'QA Certification',p_department:'Runtime',p_city:'Pune',p_company:'TrustWeave QA',p_job_title:'Fixture'});if(error)throw new Error(`alumni marker: ${error.message}`)}
 else if(v.kind!=='family'){const {error}=await owner.rpc('upsert_productized_network_entity',{p_entity_id:null,p_kind:v.entityKind,p_label:networks[v.kind].marker,p_metadata:{qa:true,namespace,qaPurpose:'certification'},p_affiliations:{},p_visibility:'members'});if(error&&!/duplicate|already exists/i.test(error.message))throw new Error(`${v.kind} marker: ${error.message}`)}
}
// dedicated isolation tenant B: owner A/admin/member are intentionally NOT members
const bName=`QA Isolation Tenant B [${namespace}]`;let b=await findNetwork(users.tenantB.id,'family',bName);if(!b){const id=await createNetwork(tenantB,'family',bName,'Tenant B');b={id,name:bName,vertical_kind:'family',status:'active'}}
await setActiveNetwork(tenantB,b.id);
// Default all tenant-A actors to family for deterministic login landing.
for(const role of ['owner','admin','member']){const c=(await roleClient(role)).client;await setActiveNetwork(c,networks.family.id)}
const state={version:1,namespace,generatedAt:new Date().toISOString(),users:Object.fromEntries(Object.entries(users).map(([k,v])=>[k,{id:v.id,email:v.email}])),networks,tenantB:{id:b.id,name:bName,kind:'family'}};
writeJson(path.join('qa-results','fixtures','seed-state.json'),state);
console.log(`QA seed PASS: ${Object.keys(networks).length} released verticals + isolated tenant B`);
console.log('Seed state: qa-results/fixtures/seed-state.json');
