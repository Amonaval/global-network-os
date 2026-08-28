import {useLanguage} from "../lib/i18n";
'use client';
import {useMemo,useState} from 'react';
import {Member,Relationship,RelationshipType} from '../lib/types';
import {getNetworkConfig,NetworkSettings} from '../lib/network';
import FeatureGuide from './FeatureGuide';
import {GUIDE_ENTRIES} from '../lib/user-guide-content';
export default function RelationshipModal({member,members,relationships,network,onClose,onSave,onDelete,canRemoveFoundational=false,onOpenGuide}:{member:Member;members:Member[];relationships:Relationship[];network?:NetworkSettings|null;onClose:()=>void;onSave:(r:Relationship)=>void;onDelete:(r:Relationship)=>void;canRemoveFoundational?:boolean;onOpenGuide?:(key:string)=>void}){
 const {t:tr}=useLanguage();
 const cfg=getNetworkConfig(network??null);
 const [type,setType]=useState<RelationshipType>('spouse'),[other,setOther]=useState('');
 const existing=useMemo(()=>relationships.filter(r=>r.person_id===member.id||r.related_person_id===member.id),[relationships,member.id]);
 const available=members.filter(m=>m.id!==member.id);
 const add=()=>{if(!other)return;const rel:Relationship={id:globalThis.crypto?.randomUUID?.() || '00000000-0000-4000-8000-'+Math.random().toString(16).slice(2).padEnd(12,'0').slice(0,12),person_id:type==='parent'?other:member.id,related_person_id:type==='parent'?member.id:other,relationship_type:type};onSave(rel);setOther('')};
 return <div className="modal-overlay" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}><div className="modal"><div className="drawer-head"><h2 style={{margin:0}}>{tr("ManageRelationshipsTxt")}</h2><button className="btn small" onClick={onClose}>{tr("CloseTxt")}</button></div><p className="page-subtitle">{tr("RelationshipsAreSharedDataAddingOneUpdatesTxt")}</p><FeatureGuide entry={GUIDE_ENTRIES.find(e=>e.key==="relationship-explorer")} onOpenGuide={onOpenGuide} rememberKey="modal-relationships"/>
 <div className="form-grid"><div className="field"><label>{tr("RelationshipTxt")}</label><select className="select" value={type} onChange={e=>setType(e.target.value as RelationshipType)}><option value="parent">{cfg.parent_label} {tr("OfSelectedTxt")}</option><option value="spouse">{cfg.peer_label} {tr("OfTxt")}</option></select></div><div className="field"><label>{tr("PersonTxt")}</label><select className="select" value={other} onChange={e=>setOther(e.target.value)}><option value="">{tr("SelectTxt")}{" "}{cfg.entity_label.toLowerCase()}…</option>{available.map(m=><option key={m.id} value={m.id}>{m.full_name} · {cfg.level_label} {m.generation_level}</option>)}</select></div></div><button className="btn primary" onClick={add} disabled={!other}>{tr("AddRelationshipTxt")}</button>
 <h3>{tr("ExistingConnectionsTxt")}</h3><div className="rel-list">{existing.map(r=>{const id=r.person_id===member.id?r.related_person_id:r.person_id;const m=members.find(x=>x.id===id);return m?<div className="rel-row" key={r.id}><div><b>{m.full_name}</b><div className="person-meta">{r.relationship_type}</div></div>{r.relationship_type==='parent'&&!canRemoveFoundational?<span className="protected-relationship">{tr("ProtectedFamilyOwnerOnlyTxt")}</span>:<button className="btn small danger" onClick={()=>onDelete(r)}>{tr("RemoveTxt")}</button>}</div>:null})}</div></div></div>
}
