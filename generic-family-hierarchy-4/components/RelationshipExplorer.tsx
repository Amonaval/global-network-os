import {useLanguage} from "../lib/i18n";
'use client';
import { useMemo, useState } from 'react';
import { ArrowRight, GitBranch, X } from 'lucide-react';
import { Member, Relationship } from '../lib/types';
import { explainKinship, findRelationshipPath, getCommonAncestors, getCommonDescendants } from '../lib/relationship-intelligence';

export default function RelationshipExplorer({members,relationships,from,onClose,onSelect}:{members:Member[];relationships:Relationship[];from:Member;onClose:()=>void;onSelect:(m:Member)=>void}){
 const {t:tr}=useLanguage();
 const [targetId,setTargetId]=useState('');
 const target=members.find(m=>m.id===targetId);
 const path=useMemo(()=>target?findRelationshipPath(members,relationships,from.id,target.id):null,[members,relationships,from,target]);
 const kinship=useMemo(()=>target?explainKinship(members,relationships,from.id,target.id):null,[members,relationships,from,target]);
 const commonAncestors=useMemo(()=>target?getCommonAncestors(members,relationships,from.id,target.id):[],[members,relationships,from,target]);
 const commonDescendants=useMemo(()=>target?getCommonDescendants(members,relationships,from.id,target.id):[],[members,relationships,from,target]);
 return <div className="modal-overlay" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}><div className="modal relationship-explorer">
  <div className="drawer-head"><div><h2 style={{margin:0}}>{tr("HowAreWeRelatedTxt")}</h2><p className="page-subtitle">{tr("FindTheShortestConnectionThroughParentsChildrenTxt")}</p></div><button className="btn small" onClick={onClose}><X size={16}/></button></div>
  <div className="field" style={{marginTop:14}}><label>{tr("FindAPersonTxt")}</label><select className="select" value={targetId} onChange={e=>setTargetId(e.target.value)}><option value="">{tr("SelectAMemberTxt")}</option>{members.filter(m=>m.id!==from.id).sort((a,b)=>a.full_name.localeCompare(b.full_name)).map(m=><option key={m.id} value={m.id}>{m.full_name}{m.city?` · ${m.city}`:''}</option>)}</select></div>
  {!target&&<div className="relationship-empty"><GitBranch size={28}/><b>{tr("ChooseSomeoneToDiscoverTheConnectionTxt")}</b><span>{tr("WeLlShowThePathAndATxt")}</span></div>}
  {target&&path&&<div className="relationship-result">
    <div className="relationship-summary"><div className="relationship-person"><strong>{from.full_name}</strong><span>{tr("YouTxt")}</span></div><ArrowRight size={20}/><div className="relationship-person"><strong>{target.full_name}</strong><span>{kinship||tr("ConnectedMemberTxt")}</span></div></div>
    {kinship&&<div className="relationship-answer"><GitBranch size={18}/><div><b>{kinship}</b><div className="person-meta">{tr("ShortestPathTxt")}{" "}{path.distance} {tr("ConnectionTxt")}{path.distance===1?'':'s'}.</div></div></div>}
    {(commonAncestors.length>0||commonDescendants.length>0)&&<div className="relationship-shared">{commonAncestors.length>0&&<div><b>{tr("CommonAncestorsTxt")}</b><div className="chip-list">{commonAncestors.slice(0,8).map(m=><button className="chip" key={m.id} onClick={()=>onSelect(m)}>{m.full_name}</button>)}</div></div>}{commonDescendants.length>0&&<div style={{marginTop:10}}><b>{tr("CommonDescendantsTxt")}</b><div className="chip-list">{commonDescendants.slice(0,8).map(m=><button className="chip" key={m.id} onClick={()=>onSelect(m)}>{m.full_name}</button>)}</div></div>}</div>}
    <div className="path-list">{path.memberIds.map((id,i)=>{const m=members.find(x=>x.id===id)!;return <div className="path-step" key={id}><div className="path-dot">{i+1}</div><button className="path-person" onClick={()=>onSelect(m)}><strong>{m.full_name}</strong><span>{i===0?tr("StartingPersonTxt"):i===path.memberIds.length-1?tr("TargetTxt"):path.steps[i-1]?.relationship}</span></button></div>})}</div>
  </div>}
  {target&&!path&&<div className="notice">{tr("NoRelationshipPathIsCurrentlyRecordedBetweenTxt")}</div>}
  <div className="form-actions"><button className="btn" onClick={onClose}>{tr("CloseTxt")}</button>{target&&<button className="btn primary" onClick={()=>onSelect(target)}>{tr("OpenProfileTxt")}</button>}</div>
 </div></div>
}
