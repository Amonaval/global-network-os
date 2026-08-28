"use client";
import {useLanguage} from "../lib/i18n";
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
 const {t:tr}=useLanguage();
 const gaps=useMemo<Gap[]>(()=>members.filter(m=>m.profile_status==="approved").map(member=>{
  const missing=missingFor(member); const path=viewerMemberId?findRelationshipPath(members,relationships,viewerMemberId,member.id):null;
  const distance=path?.distance??99; const relation=viewerMemberId?(relationshipLabelToViewer(members,relationships,viewerMemberId,member.id)||"Family relative"):"Family relative";
  const older=Math.max(0,6-member.generation_level)*5; const closeness=distance<99?Math.max(0,24-distance*4):0;
  return {member,missing,score:missing.length*18+older+closeness,distance,relation};
 }).filter(x=>x.missing.length).sort((a,b)=>b.score-a.score||a.distance-b.distance).slice(0,8),[members,relationships,viewerMemberId]);
 const primary=gaps[0];
 const completion=members.length?Math.round(members.filter(m=>missingFor(m).length===0).length/members.length*100):0;
 const generations=new Set(members.map(m=>m.generation_level)).size;
 const ask=async(g:Gap)=>{const item=g.missing[0];const text=`Can you help us preserve one small detail for ${g.member.full_name} in ${networkName||"our family network"}? We are missing ${item}. Please share only what you know — no guessing. ❤️`;try{if(navigator.share)await navigator.share({title:`Help preserve ${g.member.full_name}'s family story`,text});else{await navigator.clipboard?.writeText(text);onNotify(tr("FamilyQuestionCopiedSendItToSomeoneTxt"))}}catch(e:any){if(e?.name!=="AbortError")onNotify(tr("CouldNotShareTheFamilyQuestionTxt"))}};
 return <section className="family-growth-relay">
  <div className="growth-relay-head"><div><span className="warm-kicker"><HeartHandshake size={12}/> {tr("NX4FamilyGrowthRelayTxt")}</span><h2>{tr("EveryoneCanHelpTheFamilyGrowTxt")}</h2><p>{tr("OneSmallFactFromTheRightRelativeTxt")}</p></div><div className="growth-relay-trust"><ShieldCheck size={17}/><span><b>{tr("FactsStayGovernedTxt")}</b><small>{tr("AskVerifyPreserveTxt")}</small></span></div></div>
  {primary?<div className="growth-relay-grid">
   <article className="growth-relay-main card"><span className="growth-relay-badge"><Sparkles size={13}/> {tr("EasiestUsefulContributionTxt")}</span><div className="growth-relay-person"><span className="growth-relay-avatar">{primary.member.photo_url?<img src={primary.member.photo_url} alt=""/>:primary.member.full_name.split(/\s+/).map(x=>x[0]).slice(0,2).join("")}</span><div><h3>{primary.member.full_name}</h3><p>{primary.relation}{primary.distance<99&&primary.distance>0?` · ${primary.distance} relationship step${primary.distance===1?"":"s"} away`:""}</p></div></div><div className="growth-relay-question"><small>{tr("CanYourFamilyFillThisInTxt")}</small><b>{primary.missing[0]}</b>{primary.missing.length>1&&<span>+ {primary.missing.length-1} {tr("OtherMissingDetailTxt")}{primary.missing.length===2?"":"s"}</span>}</div><div className="card-actions"><button className="btn primary" onClick={()=>onSelect(primary.member)}>{tr("IKnowThisTxt")}{" "}<ArrowRight size={14}/></button><button className="btn" onClick={()=>ask(primary)} disabled={readOnly}><MessageCircle size={14}/> {tr("AskSomeoneTxt")}</button></div>{readOnly&&<small className="growth-readonly">{tr("PlaygroundShowsTheFlowWithoutSendingOrTxt")}</small>}</article>
   <article className="growth-relay-queue card"><div className="section-title"><div><span className="warm-kicker"><Users size={12}/> {tr("PassTheBatonTxt")}</span><h3>{tr("ThreeMoreTinyWaysToHelpTxt")}</h3></div></div>{gaps.slice(1,4).map(g=><div className="growth-queue-row" key={g.member.id}><button onClick={()=>onSelect(g.member)}><span>{g.member.full_name}</span><small>{g.relation} {tr("NeedsTxt")}{" "}{g.missing[0]}</small></button><button className="icon-button" title={tr("AskSomeoneWhoKnowsTxt")} disabled={readOnly} onClick={()=>ask(g)}><MessageCircle size={14}/></button></div>)}{gaps.length<=1&&<div className="growth-all-good"><CheckCircle2/><span><b>{tr("AlmostThereTxt")}</b><small>{tr("NoAdditionalHighValueGapsAreVisibleTxt")}</small></span></div>}</article>
   <article className="growth-relay-progress card"><Network size={23}/><span className="warm-kicker">{tr("GrowingTogetherTxt")}</span><h3>{completion}%</h3><p>{tr("OfProfilesHaveTheFourBasicContinuityTxt")}</p><div className="growth-progress-track"><span style={{width:`${completion}%`}}/></div><div className="growth-mini-stats"><span><b>{members.length}</b><small>{tr("PeopleTxt")}</small></span><span><b>{generations}</b><small>{tr("GenerationsTxt")}</small></span><span><b>{gaps.length}</b><small>{tr("UsefulPromptsTxt")}</small></span></div>{onOpenInvites&&<button className="btn small" onClick={onOpenInvites}>{tr("BringInAnotherRelativeTxt")}{" "}<ArrowRight size={13}/></button>}</article>
  </div>:<div className="card growth-relay-complete"><CheckCircle2/><div><h3>{tr("TheBasicsAreBeautifullyCoveredTxt")}</h3><p>{tr("ThereAreNoObviousStoryPhotoPlaceTxt")}</p></div></div>}
 </section>
}
