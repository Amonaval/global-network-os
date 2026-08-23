'use client';
import { useEffect, useState } from 'react';
import { LifeEvent, Member, ProfileVisibility } from '../lib/types';
import { X } from 'lucide-react';

const empty=(memberId:string):LifeEvent=>({id:'',member_id:memberId,event_type:'milestone',title:'',event_date:'',location:'',description:'',visibility:'member',created_at:''});
export default function LifeEventEditor({member,event,onSave,onDelete,onClose}:{member:Member;event?:LifeEvent;onSave:(event:LifeEvent)=>Promise<void>;onDelete?:(id:string)=>Promise<void>;onClose:()=>void}){
 const [form,setForm]=useState<LifeEvent>(event||empty(member.id)); const [busy,setBusy]=useState(false); const set=(k:keyof LifeEvent,v:any)=>setForm(x=>({...x,[k]:v}));
 const save=async(e:any)=>{e.preventDefault();if(!form.title.trim())return;setBusy(true);try{await onSave({...form,title:form.title.trim()});onClose()}finally{setBusy(false)}};
 return <div className="modal-overlay" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}><form className="modal" onSubmit={save}><div className="drawer-head"><div><h2 style={{margin:0}}>{event?'Edit life event':'Add life event'}</h2><p className="page-subtitle">Keep the timeline personal and simple — milestones, moves, marriages and memories.</p></div><button type="button" className="btn small" onClick={onClose}><X size={16}/></button></div>
  <div className="form-grid" style={{marginTop:16}}>
   <div className="field"><label>Type</label><select className="select" value={form.event_type} onChange={e=>set('event_type',e.target.value)}>{['birth','marriage','move','education','career','family','milestone','other'].map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select></div>
   <div className="field"><label>Date</label><input className="text-input" type="date" value={form.event_date||''} onChange={e=>set('event_date',e.target.value)}/></div>
   <div className="field full"><label>Title</label><input className="text-input" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Moved to Pune"/></div>
   <div className="field full"><label>Location</label><input className="text-input" value={form.location||''} onChange={e=>set('location',e.target.value)} placeholder="Pune, India"/></div>
   <div className="field full"><label>What happened?</label><textarea className="textarea" rows={4} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="A short note about this moment…"/></div>
   <div className="field"><label>Who can see it?</label><select className="select" value={form.visibility} onChange={e=>set('visibility',e.target.value as ProfileVisibility)}><option value="public">All members</option><option value="member">Members</option><option value="admin">Admins only</option></select></div>
  </div>
  <div className="form-actions"><button type="button" className="btn" onClick={onClose}>Cancel</button>{event&&onDelete&&<button type="button" className="btn danger" onClick={async()=>{setBusy(true);try{await onDelete(event.id);onClose()}finally{setBusy(false)}}}>Delete</button>}<button className="btn primary" disabled={busy}>{busy?'Saving…':'Save event'}</button></div>
 </form></div>
}
