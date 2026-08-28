"use client";
import {DEFAULT_CATALOG} from "../lib/i18n/catalog";
import {useLanguage} from "../lib/i18n";
// [NX-6] Today / People / Legacy unification shell; child capabilities retain their own NX tags.

import {useState} from "react";
import {Clock3,Heart,History,UsersRound} from "lucide-react";
import type {LifeEvent,Member,Memory,Relationship} from "../lib/types";
import LivingFamilyLoop from "./LivingFamilyLoop";
import FamilyBelonging from "./FamilyBelonging";
import FamilyTimeMachine from "./FamilyTimeMachine";
import FamilyDigest from "./FamilyDigest";
import {useNxEnabled} from "../lib/nx-review";

type HubTab="today"|"people"|"legacy";

type Props={
 members:Member[];
 relationships:Relationship[];
 events:LifeEvent[];
 memories:Memory[];
 networkName?:string;
 viewerMemberId?:string;
 readOnly?:boolean;
 showQuietDigest?:boolean;
 onSelect:(member:Member)=>void;
 onGo:(view:"community"|"participation"|"tree")=>void;
};

const TAB_COPY:Record<HubTab,{label:string;title:string;description:string}>={
 today:{label:DEFAULT_CATALOG.TodayTxt,title:DEFAULT_CATALOG.AMeaningfulReasonToComeBackTxt,description:DEFAULT_CATALOG.OneRealFamilyMomentNotAnotherFeedTxt},
 people:{label:DEFAULT_CATALOG.People2Txt,title:DEFAULT_CATALOG.KnowThePeopleBehindTheNamesTxt,description:DEFAULT_CATALOG.ReconnectRelativesPathsAndFamiliarFamilyCirclesTxt},
 legacy:{label:DEFAULT_CATALOG.LegacyTxt,title:DEFAULT_CATALOG.KeepWhatTheNextGenerationCouldLoseTxt,description:DEFAULT_CATALOG.MoveThroughFamilyTimeAndPreserveMissingTxt},
};

export default function FamilyExperienceHub({members,relationships,events,memories,networkName,viewerMemberId,readOnly=false,showQuietDigest=true,onSelect,onGo}:Props){
 const {t:tr}=useLanguage();
 const nx2=useNxEnabled("NX-2"),nx3=useNxEnabled("NX-3"),nx5=useNxEnabled("NX-5");
 const allowed:HubTab[]=[...(nx2?["today" as const]:[]),...(nx5?["people" as const]:[]),...(nx3?["legacy" as const]:[])];
 const [tab,setTab]=useState<HubTab>("today");
 const activeTab=allowed.includes(tab)?tab:(allowed[0]||"today");
 const copy=TAB_COPY[activeTab];
 if(!allowed.length)return null;
 return <section className="family-experience-hub" aria-label={tr("FamilyExperienceTxt")}>
  <div className="family-experience-head">
   <div><span className="warm-kicker"><Heart size={12}/> {tr("YourFamilyAliveTxt")}</span><h2>{copy.title}</h2><p>{copy.description}</p></div>
   <div className="family-experience-tabs" role="tablist" aria-label={tr("FamilyExperienceViewsTxt")}>
    {nx2&&<button role="tab" aria-selected={activeTab==="today"} className={activeTab==="today"?"active":""} onClick={()=>setTab("today")}><Clock3 size={15}/><span>{tr("TodayTxt")}</span></button>}
    {nx5&&<button role="tab" aria-selected={activeTab==="people"} className={activeTab==="people"?"active":""} onClick={()=>setTab("people")}><UsersRound size={15}/><span>{tr("People2Txt")}</span></button>}
    {nx3&&<button role="tab" aria-selected={activeTab==="legacy"} className={activeTab==="legacy"?"active":""} onClick={()=>setTab("legacy")}><History size={15}/><span>{tr("LegacyTxt")}</span></button>}
   </div>
  </div>
  <div className="family-experience-stage" role="tabpanel" aria-label={copy.label}>
   {activeTab==="today"&&<><LivingFamilyLoop members={members} relationships={relationships} events={events} memories={memories} viewerMemberId={viewerMemberId} readOnly={readOnly} onSelect={onSelect} onGo={onGo}/>{showQuietDigest&&<FamilyDigest members={members} events={events} memories={memories} networkName={networkName} readOnly={readOnly} onSelect={onSelect} onGo={onGo}/>}</>}
   {activeTab==="people"&&<FamilyBelonging members={members} relationships={relationships} events={events} memories={memories} viewerMemberId={viewerMemberId} readOnly={readOnly} onSelect={onSelect} onGo={onGo}/>} 
   {activeTab==="legacy"&&<FamilyTimeMachine members={members} relationships={relationships} events={events} memories={memories} viewerMemberId={viewerMemberId} readOnly={readOnly} onSelect={onSelect} onGo={onGo}/>} 
  </div>
 </section>;
}
