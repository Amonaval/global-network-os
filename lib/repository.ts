import { isSupabaseConfigured } from './supabase';
import { loadState, saveState } from './store';
import { NetworkSettings } from './network';
import { AuditEntry, ChangeRequest, LifeEvent, Member, Relationship, Submission, Memory, Notification, NetworkAnalytics } from './types';
import * as remote from './remote';

export type NetworkState = { members: Member[]; relationships: Relationship[]; submissions: Submission[] };


export interface NetworkRepository {
  readonly mode: 'shared' | 'local';
  fetchNetworkSettings(): Promise<NetworkSettings | null>;
  saveNetworkSettings(settings: NetworkSettings): Promise<void>;
  fetchState(role?: 'member' | 'admin'): Promise<NetworkState | null>;
  fetchGovernance(): Promise<{ changeRequests: ChangeRequest[]; auditLog: AuditEntry[] }>;
  upsertMembers(members: Member[]): Promise<void>;
  mergeRelationships(relationships: Relationship[]): Promise<void>;
  createSubmission(submission: Submission): Promise<void>;
  updateSubmission(id: string, status: 'approved' | 'rejected'): Promise<void>;
  updateMember(id: string, patch: Partial<Member>): Promise<void>;
  addRelationship(relationship: Relationship): Promise<void>;
  deleteRelationship(id: string): Promise<void>;
  createChangeRequest(input: { action: ChangeRequest['action']; target_member_id?: string; payload: Record<string, unknown> }): Promise<string | null>;
  updateChangeRequest(id: string, status: ChangeRequest['status'], note?: string): Promise<void>;
  logAudit(action: string, details?: Record<string, unknown>): Promise<void>;
  fetchLifeEvents(memberId: string): Promise<LifeEvent[]>;
  createLifeEvent(input: Omit<LifeEvent, 'id'|'created_at'|'updated_at'|'created_by'>): Promise<string | null>;
  updateLifeEvent(id: string, input: Omit<LifeEvent, 'id'|'member_id'|'created_at'|'updated_at'|'created_by'>): Promise<void>;
  deleteLifeEvent(id: string): Promise<void>;
  fetchMemories(memberId?: string): Promise<Memory[]>;
  createMemory(input: Omit<Memory,'id'|'created_at'|'created_by'>): Promise<string|null>;
  deleteMemory(id: string): Promise<void>;
  fetchNotifications(): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  searchMembers(input: {query?:string;profession?:string;city?:string;generation?:number;lifeStatus?:'all'|'living'|'deceased';limit?:number;offset?:number}): Promise<Member[]>;
  fetchNetworkAnalytics(): Promise<NetworkAnalytics|null>;
  fetchGeographySummary(): Promise<any[]>;
}

class SupabaseNetworkRepository implements NetworkRepository {
  readonly mode = 'shared' as const;
  fetchNetworkSettings() { return remote.fetchNetworkSettings(); }
  saveNetworkSettings(settings: NetworkSettings) { return remote.saveNetworkSettings(settings); }
  fetchState(role: 'member' | 'admin' = 'member') { return remote.fetchRemoteState(role); }
  fetchGovernance() { return remote.fetchGovernance(); }
  upsertMembers(members: Member[]) { return remote.upsertMembers(members); }
  mergeRelationships(relationships: Relationship[]) { return remote.replaceRelationships(relationships); }
  createSubmission(submission: Submission) { return remote.createSubmission(submission); }
  updateSubmission(id: string, status: 'approved' | 'rejected') { return remote.updateSubmission(id, status); }
  updateMember(id: string, patch: Partial<Member>) { return remote.updateMember(id, patch); }
  addRelationship(relationship: Relationship) { return remote.addRelationship(relationship); }
  deleteRelationship(id: string) { return remote.deleteRelationship(id); }
  createChangeRequest(input: { action: ChangeRequest['action']; target_member_id?: string; payload: Record<string, unknown> }) { return remote.createChangeRequest(input); }
  updateChangeRequest(id: string, status: ChangeRequest['status'], note = '') { return remote.updateChangeRequest(id, status, note); }
  logAudit(action: string, details: Record<string, unknown> = {}) { return remote.logAudit(action, details); }
  fetchLifeEvents(memberId: string) { return remote.fetchLifeEvents(memberId); }
  createLifeEvent(input: Omit<LifeEvent, 'id'|'created_at'|'updated_at'|'created_by'>) { return remote.createLifeEvent(input); }
  updateLifeEvent(id: string, input: Omit<LifeEvent, 'id'|'member_id'|'created_at'|'updated_at'|'created_by'>) { return remote.updateLifeEvent(id, input); }
  deleteLifeEvent(id: string) { return remote.deleteLifeEvent(id); }
  fetchMemories(memberId?: string) { return remote.fetchMemories(memberId); }
  createMemory(input: Omit<Memory,'id'|'created_at'|'created_by'>) { return remote.createMemory(input); }
  deleteMemory(id: string) { return remote.deleteMemory(id); }
  fetchNotifications() { return remote.fetchNotifications(); }
  markNotificationRead(id: string) { return remote.markNotificationRead(id); }
  searchMembers(input:any) { return remote.searchRemoteMembers(input); }
  fetchNetworkAnalytics() { return remote.fetchNetworkAnalytics(); }
  fetchGeographySummary() { return remote.fetchGeographySummary(); }
}

class LocalNetworkRepository implements NetworkRepository {
  readonly mode = 'local' as const;
  fetchNetworkSettings() { return Promise.resolve<NetworkSettings | null>(null); }
  saveNetworkSettings(_settings: NetworkSettings) { return Promise.resolve(); }
  fetchState() { return Promise.resolve<NetworkState>({ ...loadState() }); }
  fetchGovernance() { return Promise.resolve({ changeRequests: [], auditLog: [] }); }
  upsertMembers(members: Member[]) {
    const state = loadState(); const byId = new Map(state.members.map(m => [m.id, m]));
    members.forEach(m => byId.set(m.id, m)); saveState({ ...state, members: [...byId.values()] }); return Promise.resolve();
  }
  mergeRelationships(relationships: Relationship[]) {
    const state = loadState(); const byKey = new Map(state.relationships.map(r => [`${r.relationship_type}|${r.person_id}|${r.related_person_id}`, r]));
    relationships.forEach(r => byKey.set(`${r.relationship_type}|${r.person_id}|${r.related_person_id}`, r)); saveState({ ...state, relationships: [...byKey.values()] }); return Promise.resolve();
  }
  createSubmission(submission: Submission) { const state = loadState(); saveState({ ...state, submissions: [submission, ...state.submissions] }); return Promise.resolve(); }
  updateSubmission(id: string, status: 'approved' | 'rejected') { const state = loadState(); saveState({ ...state, submissions: state.submissions.map(s => s.id === id ? { ...s, status } : s) }); return Promise.resolve(); }
  updateMember(id: string, patch: Partial<Member>) { const state = loadState(); saveState({ ...state, members: state.members.map(m => m.id === id ? { ...m, ...patch } : m) }); return Promise.resolve(); }
  addRelationship(r: Relationship) { return this.mergeRelationships([r]); }
  deleteRelationship(id: string) { const state = loadState(); saveState({ ...state, relationships: state.relationships.filter(r => r.id !== id) }); return Promise.resolve(); }
  createChangeRequest(_input: { action: ChangeRequest['action']; target_member_id?: string; payload: Record<string, unknown> }) { return Promise.resolve<string | null>(null); }
  updateChangeRequest(_id: string, _status: ChangeRequest['status'], _note = '') { return Promise.resolve(); }
  logAudit(_action: string, _details: Record<string, unknown> = {}) { return Promise.resolve(); }
  fetchLifeEvents(memberId: string) { return Promise.resolve<LifeEvent[]>(loadState().lifeEvents?.filter((e:LifeEvent)=>e.member_id===memberId) || []); }
  createLifeEvent(input: Omit<LifeEvent, 'id'|'created_at'|'updated_at'|'created_by'>) { const state:any=loadState(); const e:LifeEvent={...input,id:globalThis.crypto?.randomUUID?.() || `event-${Date.now()}-${Math.random().toString(36).slice(2)}`,created_at:new Date().toISOString()}; saveState({...state,lifeEvents:[...(state.lifeEvents||[]),e]}); return Promise.resolve(e.id); }
  updateLifeEvent(id: string, input: Omit<LifeEvent, 'id'|'member_id'|'created_at'|'updated_at'|'created_by'>) { const state:any=loadState(); saveState({...state,lifeEvents:(state.lifeEvents||[]).map((e:LifeEvent)=>e.id===id?{...e,...input,updated_at:new Date().toISOString()}:e)}); return Promise.resolve(); }
  deleteLifeEvent(id: string) { const state:any=loadState(); saveState({...state,lifeEvents:(state.lifeEvents||[]).filter((e:LifeEvent)=>e.id!==id)}); return Promise.resolve(); }
  fetchMemories(memberId?: string) { return Promise.resolve<Memory[]>((loadState() as any).memories?.filter((m:Memory)=>!memberId||m.member_id===memberId)||[]); }
  createMemory(input: Omit<Memory,'id'|'created_at'|'created_by'>) { const state:any=loadState(); const id=globalThis.crypto?.randomUUID?.()||`memory-${Date.now()}`; const m={...input,id,created_at:new Date().toISOString()}; saveState({...state,memories:[...(state.memories||[]),m]}); return Promise.resolve(id); }
  deleteMemory(id: string) { const state:any=loadState(); saveState({...state,memories:(state.memories||[]).filter((m:Memory)=>m.id!==id)}); return Promise.resolve(); }
  fetchNotifications() { return Promise.resolve<Notification[]>([]); }
  markNotificationRead(_id: string) { return Promise.resolve(); }
  searchMembers(input:any) { const st=loadState(); const q=(input.query||'').toLowerCase(); return Promise.resolve(st.members.filter((m:Member)=>{ const text=`${m.full_name} ${m.profession||''} ${m.city||''} ${m.country||''}`.toLowerCase(); return (!q||text.includes(q)) && (!input.profession||m.profession===input.profession) && (!input.city||m.city===input.city) && (!input.generation||m.generation_level===Number(input.generation)) && (input.lifeStatus==='living'?!m.date_of_death:input.lifeStatus==='deceased'?!!m.date_of_death:true); }).slice(input.offset||0,(input.offset||0)+(input.limit||100))); }
  fetchNetworkAnalytics() { const st=loadState(); const living=st.members.filter(m=>!m.date_of_death).length; const deceased=st.members.length-living; const gen=new Map<number,number>(); const city=new Map<string,number>(); const prof=new Map<string,number>(); st.members.forEach(m=>{gen.set(m.generation_level,(gen.get(m.generation_level)||0)+1);const c=m.city||'Unknown';city.set(c,(city.get(c)||0)+1);const pr=m.profession||'Not specified';prof.set(pr,(prof.get(pr)||0)+1)}); return Promise.resolve({members:st.members.length,living,deceased,relationships:st.relationships.length,mapped:st.members.filter(m=>m.latitude!=null&&m.longitude!=null).length,memories:(st as any).memories?.length||0,life_events:st.lifeEvents?.length||0,generations:[...gen].map(([generation,count])=>({generation,count})),cities:[...city].map(([city,count])=>({city,country:'',count})),professions:[...prof].map(([profession,count])=>({profession,count}))}); }
  fetchGeographySummary() { const st=loadState(); const map=new Map<string,any>(); st.members.filter(m=>m.latitude!=null&&m.longitude!=null).forEach(m=>{const key=`${m.city||'Unknown'}|${m.country||''}`; const x=map.get(key)||{city:m.city||'Unknown',country:m.country||'',count:0,latitude:m.latitude,longitude:m.longitude};x.count++;map.set(key,x)});return Promise.resolve([...map.values()]); }
}

export function getNetworkRepository(): NetworkRepository {
  return isSupabaseConfigured ? new SupabaseNetworkRepository() : new LocalNetworkRepository();
}
