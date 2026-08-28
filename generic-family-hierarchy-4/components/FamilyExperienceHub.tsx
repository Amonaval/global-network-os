"use client";
import {useState} from "react";
import {Clock3,Heart,History,UsersRound} from "lucide-react";
import type {LifeEvent,Member,Memory,Relationship} from "../lib/types";
import LivingFamilyLoop from "./LivingFamilyLoop";
import FamilyBelonging from "./FamilyBelonging";
import FamilyTimeMachine from "./FamilyTimeMachine";
import FamilyDigest from "./FamilyDigest";

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
 today:{label:"Today",title:"A meaningful reason to come back",description:"One real family moment, not another feed."},
 people:{label:"People",title:"Know the people behind the names",description:"Reconnect relatives, paths and familiar family circles."},
 legacy:{label:"Legacy",title:"Keep what the next generation could lose",description:"Move through family time and preserve missing context."},
};

export default function FamilyExperienceHub({members,relationships,events,memories,networkName,viewerMemberId,readOnly=false,showQuietDigest=true,onSelect,onGo}:Props){
 const [tab,setTab]=useState<HubTab>("today");
 const copy=TAB_COPY[tab];
 return <section className="family-experience-hub" aria-label="Family experience">
  <div className="family-experience-head">
   <div><span className="warm-kicker"><Heart size={12}/> Your family, alive</span><h2>{copy.title}</h2><p>{copy.description}</p></div>
   <div className="family-experience-tabs" role="tablist" aria-label="Family experience views">
    <button role="tab" aria-selected={tab==="today"} className={tab==="today"?"active":""} onClick={()=>setTab("today")}><Clock3 size={15}/><span>Today</span></button>
    <button role="tab" aria-selected={tab==="people"} className={tab==="people"?"active":""} onClick={()=>setTab("people")}><UsersRound size={15}/><span>People</span></button>
    <button role="tab" aria-selected={tab==="legacy"} className={tab==="legacy"?"active":""} onClick={()=>setTab("legacy")}><History size={15}/><span>Legacy</span></button>
   </div>
  </div>
  <div className="family-experience-stage" role="tabpanel" aria-label={copy.label}>
   {tab==="today"&&<><LivingFamilyLoop members={members} relationships={relationships} events={events} memories={memories} viewerMemberId={viewerMemberId} readOnly={readOnly} onSelect={onSelect} onGo={onGo}/>{showQuietDigest&&<FamilyDigest members={members} events={events} memories={memories} networkName={networkName} readOnly={readOnly} onSelect={onSelect} onGo={onGo}/>}</>}
   {tab==="people"&&<FamilyBelonging members={members} relationships={relationships} events={events} memories={memories} viewerMemberId={viewerMemberId} readOnly={readOnly} onSelect={onSelect} onGo={onGo}/>} 
   {tab==="legacy"&&<FamilyTimeMachine members={members} relationships={relationships} events={events} memories={memories} viewerMemberId={viewerMemberId} readOnly={readOnly} onSelect={onSelect} onGo={onGo}/>} 
  </div>
 </section>;
}
