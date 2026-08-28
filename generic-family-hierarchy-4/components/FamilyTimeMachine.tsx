"use client";
// [NX-3] Family Time Machine / generational legacy capability. Reviewable via window.nxFeatures.

import {useMemo,useState} from "react";
import {BookHeart,Camera,ChevronRight,Clock3,History,MapPin,Sparkles,Users} from "lucide-react";
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

type LegacyItem={year:number;kind:"person"|"event"|"memory";title:string;detail:string;member?:Member;location?:string};
type Era={key:string;from:number;to:number;label:string;items:LegacyItem[];people:number;places:string[]};

type PreservationNeed={member:Member;score:number;missing:string[];age?:number;relation?:string};

function yearOf(raw?:string){if(!raw)return undefined;const y=Number(raw.slice(0,4));return Number.isFinite(y)&&y>0?y:undefined}
function ageFrom(date?:string){const y=yearOf(date);if(!y)return undefined;const now=new Date();const birth=new Date(`${date}T00:00:00`);let age=now.getFullYear()-birth.getFullYear();if(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate()))age--;return age}
function eraLabel(from:number,to:number){return from===to?`${from}`:`${from}–${to}`}
function safeText(value?:string,max=128){const v=value?.trim();return v?v.length>max?`${v.slice(0,max-1)}…`:v:""}

export default function FamilyTimeMachine({members,relationships,events,memories,viewerMemberId,readOnly=false,onSelect,onGo}:Props){
  const [activeEra,setActiveEra]=useState(0);
  const currentYear=new Date().getFullYear();
  const viewer=viewerMemberId?members.find(m=>m.id===viewerMemberId):undefined;

  const legacyItems=useMemo<LegacyItem[]>(()=>{
    const items:LegacyItem[]=[];
    members.forEach(member=>{
      const birth=yearOf(member.date_of_birth);
      if(birth)items.push({year:birth,kind:"person",title:`${member.full_name} was born`,detail:member.city?`Family connection recorded in ${member.city}.`:"A known point in the family timeline.",member,location:member.city});
      const death=yearOf(member.date_of_death);
      if(death)items.push({year:death,kind:"event",title:`Remembering ${member.full_name}`,detail:"Their place in the family remains connected to later generations.",member,location:member.city});
    });
    events.forEach(event=>{const year=yearOf(event.event_date);if(!year)return;const member=members.find(m=>m.id===event.member_id);items.push({year,kind:"event",title:event.title,detail:safeText(event.description)||`${event.event_type.charAt(0).toUpperCase()+event.event_type.slice(1)} in the family story.`,member,location:event.location})});
    memories.forEach(memory=>{const year=yearOf(memory.created_at);if(!year)return;const member=memory.member_id?members.find(m=>m.id===memory.member_id):undefined;items.push({year,kind:"memory",title:memory.title,detail:safeText(memory.story)||"A family memory preserved for later generations.",member})});
    return items.filter(x=>x.year>=1900&&x.year<=currentYear+1).sort((a,b)=>a.year-b.year||a.title.localeCompare(b.title));
  },[members,events,memories,currentYear]);

  const eras=useMemo<Era[]>(()=>{
    if(!legacyItems.length)return [];
    const min=Math.min(...legacyItems.map(x=>x.year));
    const max=Math.max(...legacyItems.map(x=>x.year),currentYear);
    const span=Math.max(1,max-min+1);
    const bucket=span>90?25:span>55?20:span>30?15:10;
    const start=Math.floor(min/bucket)*bucket;
    const result:Era[]=[];
    for(let from=start;from<=max;from+=bucket){
      const to=Math.min(from+bucket-1,max);
      const items=legacyItems.filter(x=>x.year>=from&&x.year<=to);
      if(!items.length)continue;
      const people=new Set(items.map(x=>x.member?.id).filter(Boolean)).size;
      const places=[...new Set(items.map(x=>x.location).filter(Boolean) as string[])].slice(0,5);
      result.push({key:`${from}-${to}`,from,to,label:eraLabel(from,to),items:items.slice(0,8),people,places});
    }
    return result;
  },[legacyItems,currentYear]);

  const preservationNeeds=useMemo<PreservationNeed[]>(()=>{
    return members.map(member=>{
      const missing:string[]=[];
      if(!member.photo_url)missing.push("photo");
      if(!member.bio)missing.push("story");
      if(!member.date_of_birth)missing.push("birthday");
      if(!member.city)missing.push("place");
      const age=ageFrom(member.date_of_birth);
      const relation=viewer&&member.id!==viewer.id?relationshipLabelToViewer(members,relationships,viewer.id,member.id)||undefined:undefined;
      const ageWeight=age!==undefined?Math.max(0,Math.min(5,Math.floor(age/15))):1;
      const deceasedWeight=member.date_of_death?3:0;
      const gapWeight=missing.includes("story")?4:0;
      const score=missing.length*2+ageWeight+deceasedWeight+gapWeight;
      return {member,score,missing,age,relation};
    }).filter(x=>x.missing.length>0).sort((a,b)=>b.score-a.score||b.missing.length-a.missing.length||a.member.full_name.localeCompare(b.member.full_name)).slice(0,6);
  },[members,relationships,viewer]);

  const branchRisk=useMemo(()=>{
    const byGen=new Map<number,{members:Member[];stories:number;photos:number}>();
    members.forEach(m=>{const g=byGen.get(m.generation_level)||{members:[],stories:0,photos:0};g.members.push(m);if(m.bio)g.stories++;if(m.photo_url)g.photos++;byGen.set(m.generation_level,g)});
    return [...byGen.entries()].map(([generation,g])=>({generation,count:g.members.length,storyGap:g.members.length-g.stories,photoGap:g.members.length-g.photos,score:(g.members.length-g.stories)*2+(g.members.length-g.photos)})).sort((a,b)=>b.score-a.score)[0];
  },[members]);

  const active=eras[Math.min(activeEra,Math.max(0,eras.length-1))];
  const totalPlaces=new Set(legacyItems.map(x=>x.location).filter(Boolean)).size;
  const preservedStories=memories.length+events.filter(e=>Boolean(e.description)).length+members.filter(m=>Boolean(m.bio)).length;
  const pathKnown=viewer?members.filter(m=>m.id!==viewer.id&&findRelationshipPath(members,relationships,viewer.id,m.id)).length:relationships.length;

  const openItem=(item:LegacyItem)=>{
    if(!readOnly)trackFamilyEngagement(`legacy_${item.kind}`,'member',item.member?.id).catch(()=>{});
    if(item.member)return onSelect(item.member);
    if(item.kind==="memory")return onGo("community");
    return onGo("tree");
  };

  return <section className="family-time-machine" aria-label="Family time machine and generational legacy">
    <div className="legacy-heading">
      <div><span className="warm-kicker"><History size={12}/> Family Time Machine</span><h2>See how your family became today</h2></div>
      <p>Built only from dates, people, places and stories your family has actually preserved.</p>
    </div>

    {eras.length?<div className="time-machine-shell">
      <div className="time-machine-rail" role="tablist" aria-label="Family eras">
        {eras.map((era,index)=><button key={era.key} role="tab" aria-selected={index===activeEra} className={index===activeEra?"active":""} onClick={()=>setActiveEra(index)}><span>{era.label}</span><small>{era.items.length} known moments</small></button>)}
      </div>
      {active&&<article className="era-stage">
        <div className="era-stage-head"><div><span>Family chapter</span><h3>{active.label}</h3><p>{active.people} people represented{active.places.length?` · ${active.places.join(" · ")}`:""}</p></div><div className="era-signal"><Clock3 size={18}/><b>{active.items.length}</b><small>preserved moments</small></div></div>
        <div className="era-moments">{active.items.map((item,index)=><button key={`${item.kind}-${item.year}-${index}`} onClick={()=>openItem(item)} className={`era-moment ${item.kind}`}><span className="era-year">{item.year}</span><span className="era-copy"><b>{item.title}</b><small>{item.detail}</small>{item.location&&<em><MapPin size={11}/>{item.location}</em>}</span><ChevronRight size={15}/></button>)}</div>
        {active.items.length>=8&&<small className="era-more-note">Showing a concise chapter, not every stored record.</small>}
      </article>}
    </div>:<div className="legacy-empty card"><History size={28}/><div><h3>Your Time Machine is waiting for its first anchors</h3><p>Add birthdays, life events or memories. The app will build the family timeline only from real information your family preserves.</p></div><button className="btn primary" onClick={()=>onGo("community")}>Preserve a first memory</button></div>}

    <div className="legacy-proof-strip">
      <div><Users size={17}/><span><b>{members.length}</b><small>people carried forward</small></span></div>
      <div><MapPin size={17}/><span><b>{totalPlaces}</b><small>known places in the story</small></span></div>
      <div><BookHeart size={17}/><span><b>{preservedStories}</b><small>stories & context preserved</small></span></div>
      <div><Sparkles size={17}/><span><b>{pathKnown}</b><small>relationship connections mapped</small></span></div>
    </div>

    <div className="legacy-risk-wrap">
      <div className="legacy-risk-head"><div><span className="warm-kicker"><BookHeart size={12}/> What could be forgotten?</span><h2>Preserve the people future generations may know only by name</h2></div><p>This is a preservation priority, not a score. Older generations and profiles with missing context rise first.</p></div>
      <div className="legacy-risk-grid">
        <article className="legacy-priority-card">
          {preservationNeeds[0]?<><div className="legacy-priority-icon"><BookHeart/></div><span>Highest preservation opportunity</span><h3>{preservationNeeds[0].member.full_name}</h3><p>{preservationNeeds[0].relation?`${preservationNeeds[0].relation} · `:""}{preservationNeeds[0].age!==undefined?`${preservationNeeds[0].age} yrs · `:""}Missing {preservationNeeds[0].missing.join(", ")}.</p><button className="btn primary" onClick={()=>{if(!readOnly)trackFamilyEngagement('legacy_preserve_priority','member',preservationNeeds[0].member.id).catch(()=>{});onSelect(preservationNeeds[0].member)}}>Open & preserve <ChevronRight size={15}/></button></>:<><Sparkles size={24}/><h3>Strong family record</h3><p>The core profile details we check are already well preserved.</p></>}
        </article>
        <div className="legacy-needs-list">
          {preservationNeeds.slice(1,5).map(need=><button key={need.member.id} onClick={()=>onSelect(need.member)}><span className="legacy-avatar">{need.member.photo_url?<img src={need.member.photo_url} alt=""/>:need.member.full_name.split(/\s+/).map(x=>x[0]).slice(0,2).join("")}</span><span><b>{need.member.full_name}</b><small>{need.relation?`${need.relation} · `:""}Needs {need.missing.join(" · ")}</small></span><ChevronRight size={15}/></button>)}
          {!preservationNeeds.slice(1,5).length&&<div className="legacy-no-needs"><Sparkles size={20}/><span><b>No urgent profile gaps found</b><small>Memories and life stories can still make the family record richer.</small></span></div>}
        </div>
        <article className="legacy-generation-gap">
          <div><Camera size={19}/><span>Generation coverage</span></div>
          {branchRisk?<><h3>Generation {branchRisk.generation}</h3><p>{branchRisk.count} people · {branchRisk.storyGap} without a story · {branchRisk.photoGap} without a photo.</p><button className="living-link" onClick={()=>onGo("participation")}>Help preserve this generation <ChevronRight size={15}/></button></>:<p>Add more relatives to reveal which generation needs preservation attention.</p>}
        </article>
      </div>
    </div>
  </section>;
}
