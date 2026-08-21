import { supabase } from './supabase';
import { AuditEntry, ChangeRequest, LifeEvent, Member, Relationship, Submission, Memory, Notification, NetworkAnalytics } from './types';
import { NetworkSettings } from './network';
import { resolveSignedUrls } from './storage';

const mapMember = (m:any):Member => ({...m, generation_level:Number(m.generation_level)});
const mapRelationship = (r:any):Relationship => ({id:r.id,person_id:r.person_id,related_person_id:r.related_person_id,relationship_type:r.relationship_type});
const mapChangeRequest = (r:any):ChangeRequest => ({...r, payload:r.payload || {}});
const mapAudit = (r:any):AuditEntry => ({...r, details:r.details || {}});
const mapLifeEvent = (r:any):LifeEvent => ({...r, visibility:r.visibility || 'member'});

export async function fetchNetworkSettings():Promise<NetworkSettings|null>{
 if(!supabase)return null;
 const {data,error}=await supabase.from('network_settings').select('*').eq('id','network').maybeSingle();
 if(error)throw error; return data;
}
export async function saveNetworkSettings(settings:NetworkSettings){
 if(!supabase) return;
 const {error}=await supabase.from('network_settings').upsert({
   id:'network',
   name:settings.name,
   description:settings.description||'',
   entity_label:settings.entity_label??'Member',
   entity_label_plural:settings.entity_label_plural??'Members',
   level_label:settings.level_label??'Generation',
   level_label_plural:settings.level_label_plural??'Generations',
   parent_label:settings.parent_label??'Parent',
   child_label:settings.child_label??'Child',
   peer_label:settings.peer_label??'Spouse',
   network_template:settings.network_template??'family',
 },{onConflict:'id'});
 if(error)throw error;
}

export async function fetchRemoteState(role:'member'|'admin'='member'){
 if(!supabase)return null;
 const [m,r,s]=await Promise.all([
  supabase.rpc('get_visible_family_members'),
  supabase.from('family_relationships').select('*'),
  supabase.from('profile_submissions').select('*').order('created_at',{ascending:false})
 ]);
 if(m.error)throw m.error;if(r.error)throw r.error;if(s.error)throw s.error;
 const members = await resolveSignedUrls((m.data||[]).map(mapMember), 'profile-photos');
 return {members,relationships:(r.data||[]).map(mapRelationship),submissions:(s.data||[]) as Submission[]};
}
export async function fetchGovernance(){
 if(!supabase)return {changeRequests:[],auditLog:[]};
 const [requests,audit] = await Promise.all([
   supabase.from('change_requests').select('*').order('created_at',{ascending:false}).limit(100),
   supabase.from('audit_log').select('*').order('created_at',{ascending:false}).limit(100)
 ]);
 if(requests.error)throw requests.error;if(audit.error)throw audit.error;
 return {changeRequests:(requests.data||[]).map(mapChangeRequest),auditLog:(audit.data||[]).map(mapAudit)};
}
export async function upsertMembers(members:Member[]){
 if(!supabase)return;
 const payload=members.map(m=>({id:m.id,full_name:m.full_name,date_of_birth:m.date_of_birth||null,date_of_death:m.date_of_death||null,generation_level:m.generation_level,profession:m.profession||null,city:m.city||null,country:m.country||'India',photo_url:m.photo_url||'',bio:m.bio||'',phone:m.phone||null,email:m.email||null,latitude:m.latitude??null,longitude:m.longitude??null,profile_status:m.profile_status,profile_visibility:m.profile_visibility||'member',contact_visibility:m.contact_visibility||'admin'}));
 const {error}=await supabase.from('family_members').upsert(payload,{onConflict:'id'});if(error)throw error;
}
export async function replaceRelationships(rs:Relationship[]){
 if(!supabase)return;
 if(rs.length){const normalized=rs.map(r=>r.relationship_type==='spouse'&&r.person_id>r.related_person_id?{...r,person_id:r.related_person_id,related_person_id:r.person_id}:r);const {error}=await supabase.from('family_relationships').upsert(normalized.map(r=>({id:r.id,person_id:r.person_id,related_person_id:r.related_person_id,relationship_type:r.relationship_type})),{onConflict:'person_id,related_person_id,relationship_type'});if(error)throw error;}
}
export async function createSubmission(s:Submission){
 if(!supabase)return;
 const {error}=await supabase.rpc('submit_profile_change',{
   p_submission_id:s.id,p_member_id:s.member_id||null,p_full_name:s.full_name,p_profession:s.profession||null,
   p_city:s.city||null,p_country:s.country||null,p_bio:s.bio||null,p_phone:s.phone||null,p_email:s.email||null,p_photo_url:s.photo_url||null,p_profile_visibility:s.profile_visibility||'member',p_contact_visibility:s.contact_visibility||'admin'
 });
 if(error)throw error;
}
export async function createChangeRequest(input:{action:ChangeRequest['action'];target_member_id?:string;payload:Record<string,unknown>}){
 if(!supabase)return null;
 const {data,error}=await supabase.rpc('create_change_request',{p_action:input.action,p_target_member_id:input.target_member_id||null,p_payload:input.payload});
 if(error)throw error; return data;
}
export async function updateChangeRequest(id:string,status:ChangeRequest['status'],reviewNote=''){
 if(!supabase)return;
 const {data,error}=await supabase.rpc('review_change_request',{p_request_id:id,p_status:status,p_review_note:reviewNote||null});
 if(error)throw error; return data;
}
export async function logAudit(action:string,details:Record<string,unknown>={}){
 if(!supabase)return;
 const {error}=await supabase.rpc('log_audit_event',{p_action:action,p_details:details});if(error)throw error;
}
export async function updateSubmission(id:string,status:'approved'|'rejected'){
 if(!supabase)return;
 const {error}=await supabase.from('profile_submissions').update({status}).eq('id',id);if(error)throw error;
 await logAudit(status==='approved'?'profile_submission_approved':'profile_submission_rejected',{submission_id:id});
}
export async function updateMember(id:string,patch:Partial<Member>){
 if(!supabase)return;
 const {error}=await supabase.from('family_members').update(patch).eq('id',id);if(error)throw error;
 await logAudit('member_updated',{member_id:id,fields:Object.keys(patch)});
}
export async function addRelationship(r:Relationship){
 if(!supabase)return;
 const x=r.relationship_type==='spouse'&&r.person_id>r.related_person_id?{...r,person_id:r.related_person_id,related_person_id:r.person_id}:r;
 const {error}=await supabase.from('family_relationships').upsert({id:x.id,person_id:x.person_id,related_person_id:x.related_person_id,relationship_type:x.relationship_type},{onConflict:'person_id,related_person_id,relationship_type'});if(error)throw error;
 await logAudit('relationship_added',{relationship_id:x.id,person_id:x.person_id,related_person_id:x.related_person_id,relationship_type:x.relationship_type});
}
export async function deleteRelationship(id:string){
 if(!supabase)return;
 const {data,error:readError}=await supabase.from('family_relationships').select('person_id,related_person_id,relationship_type').eq('id',id).maybeSingle();if(readError)throw readError;
 const {error}=await supabase.from('family_relationships').delete().eq('id',id);if(error)throw error;
 await logAudit('relationship_removed',{relationship_id:id,relationship:data||null});
}

export async function createInvitation(memberId:string, expiresDays:number):Promise<string>{
 if(!supabase) throw new Error('Shared mode is required.');
 const token = globalThis.crypto?.randomUUID?.().replaceAll('-','') + Math.random().toString(36).slice(2,18);
 const {error}=await supabase.rpc('create_member_invitation',{p_member_id:memberId,p_token:token,p_expires_days:expiresDays});
 if(error)throw error; return token;
}

export async function acceptInvitation(token:string){
 if(!supabase) throw new Error('Shared mode is required.');
 const {error}=await supabase.rpc('accept_member_invitation',{p_token:token});
 if(error)throw error;
}

export async function fetchLifeEvents(memberId:string):Promise<LifeEvent[]> {
 if(!supabase)return [];
 const {data,error}=await supabase.rpc('get_member_life_events',{p_member_id:memberId});
 if(error)throw error; return (data||[]).map(mapLifeEvent);
}
export async function createLifeEvent(input:Omit<LifeEvent,'id'|'created_at'|'updated_at'|'created_by'>):Promise<string|null>{
 if(!supabase)return null;
 const {data,error}=await supabase.rpc('create_member_life_event',{p_member_id:input.member_id,p_event_type:input.event_type,p_title:input.title,p_event_date:input.event_date||null,p_location:input.location||null,p_description:input.description||null,p_visibility:input.visibility});
 if(error)throw error; return data;
}
export async function updateLifeEvent(id:string,input:Omit<LifeEvent,'id'|'member_id'|'created_at'|'updated_at'|'created_by'>){
 if(!supabase)return;
 const {error}=await supabase.rpc('update_member_life_event',{p_event_id:id,p_event_type:input.event_type,p_title:input.title,p_event_date:input.event_date||null,p_location:input.location||null,p_description:input.description||null,p_visibility:input.visibility});
 if(error)throw error;
}
export async function deleteLifeEvent(id:string){
 if(!supabase)return;
 const {error}=await supabase.rpc('delete_member_life_event',{p_event_id:id});
 if(error)throw error;
}

export async function fetchMemories(memberId?: string): Promise<Memory[]> {
 if(!supabase)return [];
 const q=supabase.rpc('get_memories',{p_member_id:memberId||null}); const {data,error}=await q; if(error)throw error;
 return resolveSignedUrls((data||[]) as Memory[], 'community-media');
}
export async function createMemory(input: Omit<Memory,'id'|'created_at'|'created_by'>): Promise<string|null> {
 if(!supabase)return null;
 const {data,error}=await supabase.rpc('create_memory',{p_member_id:input.member_id||null,p_title:input.title,p_story:input.story||null,p_photo_url:input.photo_url||null,p_visibility:input.visibility}); if(error)throw error; return data;
}
export async function deleteMemory(id:string){ if(!supabase)return; const {error}=await supabase.rpc('delete_memory',{p_memory_id:id}); if(error)throw error; }
export async function fetchNotifications():Promise<Notification[]> { if(!supabase)return []; const {data,error}=await supabase.rpc('get_my_notifications'); if(error)throw error; return (data||[]) as Notification[]; }
export async function markNotificationRead(id:string){ if(!supabase)return; const {error}=await supabase.rpc('mark_notification_read',{p_notification_id:id}); if(error)throw error; }


export async function searchRemoteMembers(input:{query?:string;profession?:string;city?:string;generation?:number;lifeStatus?:'all'|'living'|'deceased';limit?:number;offset?:number}):Promise<Member[]> {
 if(!supabase)return [];
 const {data,error}=await supabase.rpc('search_family_members',{p_query:input.query||null,p_profession:input.profession||null,p_city:input.city||null,p_generation:input.generation??null,p_life_status:input.lifeStatus||'all',p_limit:input.limit||100,p_offset:input.offset||0});
 if(error)throw error; return (data||[]).map(mapMember);
}
export async function fetchNetworkAnalytics():Promise<NetworkAnalytics|null>{
 if(!supabase)return null;
 const {data,error}=await supabase.rpc('get_network_analytics'); if(error)throw error; return data as NetworkAnalytics;
}
export async function fetchGeographySummary():Promise<any[]>{
 if(!supabase)return []; const {data,error}=await supabase.rpc('get_geography_summary'); if(error)throw error; return (data||[]) as any[];
}
