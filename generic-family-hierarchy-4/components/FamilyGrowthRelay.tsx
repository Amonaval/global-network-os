"use client";
// [NX-4] Family Growth Relay / distributed contribution capability. Reviewable via window.nxFeatures.

import {useMemo} from "react";
import {ArrowRight,CheckCircle2,HeartHandshake,MessageCircle,Network,ShieldCheck,Sparkles,Users} from "lucide-react";
import {Member,Relationship} from "../lib/types";
import {findRelationshipPath,relationshipLabelToViewer} from "../lib/relationship-intelligence";

type Gap={member:Member;missing:string[];score:number;distance:number;relation:string};

const missingFor=(m:Member)=>[
 !m.bio?"a short family story":"",
 !m.photo_url?"a photo":"",
 !m.city?"their city / hometown":"",
 !m.date_of_birth?"their birthday":"",
].filter(Boolean);

export default function FamilyGrowthRelay({members,relationships=[],viewerMemberId,networkName,readOnly=false,onSelect,onOpenInvites,onNotify}:{members:Member[];relationships?:Relationship[];viewerMemberId?:string;networkName?:string;readOnly?:boolean;onSelect:(m:Member)=>void;onOpenInvites?:()=>void;onNotify:(x:string)=>void}){
 const gaps=useMemo<Gap[]>(()=>members.filter(m=>m.profile_status==="approved").map(member=>{
  const missing=missingFor(member); const path=viewerMemberId?findRelationshipPath(members,relationships,viewerMemberId,member.id):null;
  const distance=path?.distance??99; const relation=viewerMemberId?(relationshipLabelToViewer(members,relationships,viewerMemberId,member.id)||"Family relative"):"Family relative";
  const older=Math.max(0,6-member.generation_level)*5; const closeness=distance<99?Math.max(0,24-distance*4):0;
  return {member,missing,score:missing.length*18+older+closeness,distance,relation};
 }).filter(x=>x.missing.length).sort((a,b)=>b.score-a.score||a.distance-b.distance).slice(0,8),[members,relationships,viewerMemberId]);
 const primary=gaps[0];
 const completion=members.length?Math.round(members.filter(m=>missingFor(m).length===0).length/members.length*100):0;
 const generations=new Set(members.map(m=>m.generation_level)).size;
 const ask=async(g:Gap)=>{const item=g.missing[0];const text=`Can you help us preserve one small detail for ${g.member.full_name} in ${networkName||"our family network"}? We are missing ${item}. Please share only what you know — no guessing. ❤️`;try{if(navigator.share)await navigator.share({title:`Help preserve ${g.member.full_name}'s family story`,text});else{await navigator.clipboard?.writeText(text);onNotify("Family question copied — send it to someone who knows.")}}catch(e:any){if(e?.name!=="AbortError")onNotify("Could not share the family question.")}};
 return <section className="family-growth-relay">
  <div className="growth-relay-head"><div><span className="warm-kicker"><HeartHandshake size={12}/> NX-4 · Family Growth Relay</span><h2>Everyone can help the family grow</h2><p>One small fact from the right relative is more useful than asking one organizer to complete the whole family.</p></div><div className="growth-relay-trust"><ShieldCheck size={17}/><span><b>Facts stay governed</b><small>Ask · verify · preserve</small></span></div></div>
  {primary?<div className="growth-relay-grid">
   <article className="growth-relay-main card"><span className="growth-relay-badge"><Sparkles size={13}/> Easiest useful contribution</span><div className="growth-relay-person"><span className="growth-relay-avatar">{primary.member.photo_url?<img src={primary.member.photo_url} alt=""/>:primary.member.full_name.split(/\s+/).map(x=>x[0]).slice(0,2).join("")}</span><div><h3>{primary.member.full_name}</h3><p>{primary.relation}{primary.distance<99&&primary.distance>0?` · ${primary.distance} relationship step${primary.distance===1?"":"s"} away`:""}</p></div></div><div className="growth-relay-question"><small>Can your family fill this in?</small><b>{primary.missing[0]}</b>{primary.missing.length>1&&<span>+ {primary.missing.length-1} other missing detail{primary.missing.length===2?"":"s"}</span>}</div><div className="card-actions"><button className="btn primary" onClick={()=>onSelect(primary.member)}>I know this <ArrowRight size={14}/></button><button className="btn" onClick={()=>ask(primary)} disabled={readOnly}><MessageCircle size={14}/> Ask someone</button></div>{readOnly&&<small className="growth-readonly">Playground shows the flow without sending or changing family data.</small>}</article>
   <article className="growth-relay-queue card"><div className="section-title"><div><span className="warm-kicker"><Users size={12}/> Pass the baton</span><h3>Three more tiny ways to help</h3></div></div>{gaps.slice(1,4).map(g=><div className="growth-queue-row" key={g.member.id}><button onClick={()=>onSelect(g.member)}><span>{g.member.full_name}</span><small>{g.relation} · needs {g.missing[0]}</small></button><button className="icon-button" title="Ask someone who knows" disabled={readOnly} onClick={()=>ask(g)}><MessageCircle size={14}/></button></div>)}{gaps.length<=1&&<div className="growth-all-good"><CheckCircle2/><span><b>Almost there</b><small>No additional high-value gaps are visible right now.</small></span></div>}</article>
   <article className="growth-relay-progress card"><Network size={23}/><span className="warm-kicker">Growing together</span><h3>{completion}%</h3><p>of profiles have the four basic continuity anchors: story, photo, place and birthday.</p><div className="growth-progress-track"><span style={{width:`${completion}%`}}/></div><div className="growth-mini-stats"><span><b>{members.length}</b><small>people</small></span><span><b>{generations}</b><small>generations</small></span><span><b>{gaps.length}</b><small>useful prompts</small></span></div>{onOpenInvites&&<button className="btn small" onClick={onOpenInvites}>Bring in another relative <ArrowRight size={13}/></button>}</article>
  </div>:<div className="card growth-relay-complete"><CheckCircle2/><div><h3>The basics are beautifully covered</h3><p>There are no obvious story/photo/place/birthday gaps right now. Keep the network alive through memories, gatherings and new relatives.</p></div></div>}
 </section>
}
