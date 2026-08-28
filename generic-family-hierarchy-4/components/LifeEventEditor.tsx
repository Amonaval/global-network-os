'use client';
import {useLanguage} from "../lib/i18n";
import { useEffect, useState } from 'react';
import { LifeEvent, Member, ProfileVisibility } from '../lib/types';
import { X } from 'lucide-react';

const empty=(memberId:string):LifeEvent=>({id:'',member_id:memberId,event_type:'milestone',title:'',event_date:'',location:'',description:'',visibility:'member',created_at:''});
export default function LifeEventEditor({member,event,onSave,onDelete,onClose}:{member:Member;event?:LifeEvent;onSave:(event:LifeEvent)=>Promise<void>;onDelete?:(id:string)=>Promise<void>;onClose:()=>void}){
 const {t:tr}=useLanguage();
 const eventTypes=[["birth",tr("BirthTxt")],["marriage",tr("MarriageTxt")],["move",tr("MoveTxt")],["education",tr("EducationTxt")],["career",tr("CareerTxt")],["family",tr("FamilyTxt")],["milestone",tr("MilestoneTxt")],["other",tr("OtherTxt")]] as const;
 const [form,setForm]=useState<LifeEvent>(event||empty(member.id)); const [busy,setBusy]=useState(false); const set=(k:keyof LifeEvent,v:any)=>setForm(x=>({...x,[k]:v}));
 const save=async(e:any)=>{e.preventDefault();if(!form.title.trim())return;setBusy(true);try{await onSave({...form,title:form.title.trim()});onClose()}finally{setBusy(false)}};
 return <div className="modal-overlay" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}><form className="modal" onSubmit={save}><div className="drawer-head"><div><h2 style={{margin:0}}>{event?tr("EditLifeEventTxt"):tr("AddLifeEventTxt")}</h2><p className="page-subtitle">{tr("KeepTheTimelinePersonalAndSimpleMilestonesTxt")}</p></div><button type="button" className="btn small" onClick={onClose}><X size={16}/></button></div>
  <div className="form-grid" style={{marginTop:16}}>
   <div className="field"><label>{tr("TypeTxt")}</label><select className="select" value={form.event_type} onChange={e=>set('event_type',e.target.value)}>{eventTypes.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
   <div className="field"><label>{tr("DateTxt")}</label><input className="text-input" type="date" value={form.event_date||''} onChange={e=>set('event_date',e.target.value)}/></div>
   <div className="field full"><label>{tr("TitleTxt")}</label><input className="text-input" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder={tr("MovedToPuneTxt")}/></div>
   <div className="field full"><label>{tr("LocationTxt")}</label><input className="text-input" value={form.location||''} onChange={e=>set('location',e.target.value)} placeholder={tr("PuneIndiaTxt")}/></div>
   <div className="field full"><label>{tr("WhatHappenedTxt")}</label><textarea className="textarea" rows={4} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder={tr("AShortNoteAboutThisMomentTxt")}/></div>
   <div className="field"><label>{tr("WhoCanSeeItTxt")}</label><select className="select" value={form.visibility} onChange={e=>set('visibility',e.target.value as ProfileVisibility)}><option value="public">{tr("AllMembersTxt")}</option><option value="member">{tr("MembersTxt")}</option><option value="admin">{tr("AdminsOnlyTxt")}</option></select></div>
  </div>
  <div className="form-actions"><button type="button" className="btn" onClick={onClose}>{tr("CancelTxt")}</button>{event&&onDelete&&<button type="button" className="btn danger" onClick={async()=>{setBusy(true);try{await onDelete(event.id);onClose()}finally{setBusy(false)}}}>{tr("DeleteTxt")}</button>}<button className="btn primary" disabled={busy}>{busy?tr("SavingTxt"):tr("SaveEventTxt")}</button></div>
 </form></div>
}
