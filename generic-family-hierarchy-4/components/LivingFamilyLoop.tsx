"use client";
import {useLanguage} from "../lib/i18n";
// [NX-2] Living Network return-loop capability. Reviewable via window.nxFeatures.

import {useMemo} from "react";
import {BookHeart,CalendarHeart,ChevronRight,Clock3,Heart,History,MapPin,Sparkles,Users} from "lucide-react";
import {LifeEvent,Member,Memory,Relationship} from "../lib/types";
import {findRelationshipPath,relationshipLabelToViewer} from "../lib/relationship-intelligence";
import {trackFamilyEngagement} from "../lib/remote";

type Props={
  members:Member[];
  relationships:Relationship[];
  events:LifeEvent[];
  memories:Memory[];
  viewerMemberId?:string;
  readOnly?:boolean;
  onSelect:(member:Member)=>void;
  onGo:(view:"community"|"participation"|"tree")=>void;
};

type DailyMoment={
  kind:"celebrate"|"remember"|"rediscover"|"preserve";
  kicker:string;
  title:string;
  body:string;
  action:string;
  member?:Member;
};

function dayKey(){
  const now=new Date();
  return Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
}

function ageFrom(date?:string){
  if(!date)return undefined;
  const birth=new Date(`${date}T00:00:00`);
  if(Number.isNaN(birth.getTime()))return undefined;
  const now=new Date();
  let age=now.getFullYear()-birth.getFullYear();
  if(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate()))age--;
  return age;
}

export default function LivingFamilyLoop({members,relationships,events,memories,viewerMemberId,readOnly=false,onSelect,onGo}:Props){
 const {t:tr}=useLanguage();
  const viewer=viewerMemberId?members.find(m=>m.id===viewerMemberId):undefined;
  const today=dayKey();

  const upcoming=useMemo(()=>{
    const now=new Date();now.setHours(0,0,0,0);
    return members.filter(m=>!m.date_of_death&&m.date_of_birth).map(m=>{
      const d=new Date(`${m.date_of_birth}T00:00:00`);let next=new Date(now.getFullYear(),d.getMonth(),d.getDate());if(next<now)next.setFullYear(next.getFullYear()+1);
      return {member:m,days:Math.round((next.getTime()-now.getTime())/86400000),next};
    }).filter(x=>x.days<=7).sort((a,b)=>a.days-b.days);
  },[members]);

  const connected=useMemo(()=>{
    if(!viewer)return [] as {member:Member;label:string;distance:number}[];
    return members.filter(m=>m.id!==viewer.id&&!m.date_of_death).map(member=>{
      const path=findRelationshipPath(members,relationships,viewer.id,member.id);
      return path?{member,label:relationshipLabelToViewer(members,relationships,viewer.id,member.id)||"Family relative",distance:path.distance}:null;
    }).filter(Boolean) as {member:Member;label:string;distance:number}[];
  },[viewer,members,relationships]);

  const rediscover=useMemo(()=>{
    const candidates=connected.filter(x=>x.distance>=2).sort((a,b)=>b.distance-a.distance||a.member.full_name.localeCompare(b.member.full_name));
    return candidates.length?candidates[today%candidates.length]:undefined;
  },[connected,today]);

  const preserveMember=useMemo(()=>{
    const living=members.filter(m=>!m.date_of_death&&m.id!==viewerMemberId);
    const candidates=living.map(member=>({member,age:ageFrom(member.date_of_birth),score:(member.bio?0:3)+(member.photo_url?0:1)+(member.city?0:1)}))
      .filter(x=>x.score>0)
      .sort((a,b)=>(b.age||0)-(a.age||0)||b.score-a.score);
    return candidates[0]?.member;
  },[members,viewerMemberId]);

  const oldMemory=useMemo(()=>[...memories].filter(m=>m.created_at).sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime())[0],[memories]);
  const historicEvent=useMemo(()=>[...events].filter(e=>e.event_date).sort((a,b)=>(a.event_date||"").localeCompare(b.event_date||""))[0],[events]);

  const daily=useMemo<DailyMoment>(()=>{
    if(upcoming[0]?.days===0)return {kind:"celebrate",kicker:tr("TodayInYourFamilyTxt"),title:`It’s ${upcoming[0].member.full_name}’s birthday`,body:"A small call or message can mean more than another scroll through a feed.",action:"Open their profile",member:upcoming[0].member};
    const mode=today%3;
    if(mode===0&&rediscover)return {kind:"rediscover",kicker:tr("RediscoverSomeoneTxt"),title:`Do you know ${rediscover.member.full_name}?`,body:`${rediscover.label} · ${rediscover.distance} relationship ${rediscover.distance===1?"step":"steps"} from you${rediscover.member.city?` · ${rediscover.member.city}`:""}. Open their profile and reconnect the name to the person.`,action:"Meet this relative",member:rediscover.member};
    if(mode===1&&(oldMemory||historicEvent)){
      if(oldMemory)return {kind:"remember",kicker:tr("RememberTogetherTxt"),title:oldMemory.title,body:oldMemory.story?.slice(0,150)||"A family story worth keeping visible across generations.",action:"Open family memories"};
      return {kind:"remember",kicker:tr("FromYourFamilyHistoryTxt"),title:historicEvent!.title,body:`This moment from ${historicEvent!.event_date} is part of the family story future generations should not have to rediscover from scratch.`,action:"See the family tree",member:members.find(m=>m.id===historicEvent!.member_id)};
    }
    if(preserveMember)return {kind:"preserve",kicker:tr("PreserveOneStoryTxt"),title:`What should the next generation know about ${preserveMember.full_name}?`,body:preserveMember.bio?"Their profile still has missing context. One photo, city or detail makes the family record more human.":"Their story is still mostly a name in the tree. Add one meaningful detail while someone still remembers it.",action:"Help preserve their story",member:preserveMember};
    if(rediscover)return {kind:"rediscover",kicker:tr("RediscoverSomeoneTxt"),title:`Meet ${rediscover.member.full_name}`,body:`${rediscover.label}. Family networks become meaningful when names turn back into people.`,action:"Open their profile",member:rediscover.member};
    return {kind:"remember",kicker:tr("AMeaningfulMinuteTxt"),title:tr("YourFamilyIsMoreThanATree2Txt"),body:"Add one memory, story or missing detail that someone younger may otherwise never know.",action:"Preserve a memory"};
  },[upcoming,today,rediscover,oldMemory,historicEvent,preserveMember,members]);

  const generations=useMemo(()=>new Set(members.map(m=>m.generation_level)).size,[members]);
  const living=useMemo(()=>members.filter(m=>!m.date_of_death),[members]);
  const oldest=useMemo(()=>[...living].filter(m=>m.date_of_birth).sort((a,b)=>(a.date_of_birth||"").localeCompare(b.date_of_birth||""))[0],[living]);
  const youngest=useMemo(()=>[...living].filter(m=>m.date_of_birth).sort((a,b)=>(b.date_of_birth||"").localeCompare(a.date_of_birth||""))[0],[living]);
  const knownStories=members.filter(m=>Boolean(m.bio)).length+memories.length+events.filter(e=>Boolean(e.description)).length;
  const cities=new Set(members.map(m=>m.city).filter(Boolean)).size;

  const act=()=>{
    if(!readOnly)trackFamilyEngagement(`living_${daily.kind}`,'member',daily.member?.id).catch(()=>{});
    if(daily.kind==="rediscover"&&daily.member)return onSelect(daily.member);
    if(daily.kind==="celebrate"&&daily.member)return onSelect(daily.member);
    if(daily.kind==="preserve")return onGo("participation");
    if(daily.kind==="remember")return onGo(oldMemory?"community":"tree");
  };

  return <section className="living-family-loop" aria-label={tr("LivingFamilyConnectionTxt")}>
    <div className="living-loop-heading">
      <div><span className="warm-kicker"><Heart size={12}/> {tr("LivingFamilyTxt")}</span><h2>{tr("OneMeaningfulFamilyMinuteTxt")}</h2></div>
      <p>{tr("NoEndlessFeedComeBackForATxt")}</p>
    </div>

    <div className="living-loop-grid">
      <article className={`living-daily-card ${daily.kind}`}>
        <div className="living-daily-icon">{daily.kind==="celebrate"?<CalendarHeart/>:daily.kind==="remember"?<History/>:daily.kind==="preserve"?<BookHeart/>:<Users/>}</div>
        <div className="living-daily-copy"><span>{daily.kicker}</span><h3>{daily.title}</h3><p>{daily.body}</p><button className="living-link" onClick={act}>{daily.action}<ChevronRight size={15}/></button></div>
      </article>

      <article className="living-generations-card">
        <div className="living-card-head"><span className="living-small-icon"><Sparkles size={17}/></span><div><span>{tr("AcrossGenerationsTxt")}</span><h3>{generations} {tr("GenerationsStillConnectedHereTxt")}</h3></div></div>
        {oldest&&youngest&&oldest.id!==youngest.id?<div className="generation-bridge">
          <button onClick={()=>onSelect(oldest)}><small>{tr("OlderGenerationTxt")}</small><b>{oldest.full_name}</b><em>{ageFrom(oldest.date_of_birth)??""}{ageFrom(oldest.date_of_birth)!==undefined?tr("YrsTxt"):""}</em></button>
          <div className="generation-line"><span/><Heart size={15}/><span/></div>
          <button onClick={()=>onSelect(youngest)}><small>{tr("YoungerGenerationTxt")}</small><b>{youngest.full_name}</b><em>{ageFrom(youngest.date_of_birth)??""}{ageFrom(youngest.date_of_birth)!==undefined?tr("YrsTxt"):""}</em></button>
        </div>:<p className="living-muted">{tr("AddBirthdaysAcrossGenerationsToMakeFamilyTxt")}</p>}
        <p className="generation-purpose">{tr("NamesRelationshipsAndStoriesThatLiveOnlyTxt")}</p>
      </article>
    </div>

    <div className="family-continuity-strip">
      <div><Clock3 size={17}/><span><b>{generations}</b><small>{tr("GenerationsRepresentedTxt")}</small></span></div>
      <div><MapPin size={17}/><span><b>{cities}</b><small>{tr("FamilyCitiesConnectedTxt")}</small></span></div>
      <div><BookHeart size={17}/><span><b>{knownStories}</b><small>{tr("StoriesAndLifeContextPreservedTxt")}</small></span></div>
      <button onClick={()=>onGo("participation")}><Sparkles size={15}/><span><b>{tr("PreserveOneMoreThingTxt")}</b><small>{tr("HelpAFutureRelativeKnowThisFamilyTxt")}</small></span><ChevronRight size={16}/></button>
    </div>
  </section>;
}
