"use client";
import {useLanguage} from "../lib/i18n";
// [NX-5] Family connection, relationship context and belonging capability. Reviewable via window.nxFeatures.

import {useMemo} from "react";
import {ChevronRight,Heart,MapPin,Network,Sparkles,Users} from "lucide-react";
import {LifeEvent,Member,Memory,Relationship} from "../lib/types";
import {describeRelationshipToViewer,findRelationshipPath,getCommonAncestors,relationshipLabelToViewer} from "../lib/relationship-intelligence";
import {trackFamilyEngagement} from "../lib/remote";

type Props={
  members:Member[];
  relationships:Relationship[];
  memories:Memory[];
  events:LifeEvent[];
  viewerMemberId?:string;
  readOnly?:boolean;
  onSelect:(member:Member)=>void;
  onGo:(view:"community"|"participation"|"tree")=>void;
};

type Circle={key:string;title:string;subtitle:string;members:Member[];icon:"generation"|"place"|"close"};

function dayKey(){
  const now=new Date();
  return Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
}

function firstName(name:string){return name.trim().split(/\s+/)[0]||name;}

function initials(name:string){return name.split(/\s+/).map(x=>x[0]).filter(Boolean).slice(0,2).join("").toUpperCase();}

export default function FamilyBelonging({members,relationships,memories,events,viewerMemberId,readOnly=false,onSelect,onGo}:Props){
 const {t:tr}=useLanguage();
  const viewer=viewerMemberId?members.find(m=>m.id===viewerMemberId):undefined;
  const connected=useMemo(()=>{
    if(!viewer)return [] as {member:Member;distance:number;label:string}[];
    return members.filter(m=>m.id!==viewer.id).map(member=>{
      const path=findRelationshipPath(members,relationships,viewer.id,member.id);
      return path?{member,distance:path.distance,label:relationshipLabelToViewer(members,relationships,viewer.id,member.id)||"Family relative"}:null;
    }).filter(Boolean) as {member:Member;distance:number;label:string}[];
  },[viewer,members,relationships]);

  const spotlight=useMemo(()=>{
    if(!viewer||!connected.length)return undefined;
    const candidates=connected
      .filter(x=>x.distance>=2&&x.distance<=6)
      .sort((a,b)=>b.distance-a.distance||a.member.full_name.localeCompare(b.member.full_name));
    const pool=candidates.length?candidates:connected;
    return pool[dayKey()%pool.length];
  },[viewer,connected]);

  const spotlightPath=useMemo(()=>viewer&&spotlight?findRelationshipPath(members,relationships,viewer.id,spotlight.member.id):null,[viewer,spotlight,members,relationships]);
  const commonAncestors=useMemo(()=>viewer&&spotlight?getCommonAncestors(members,relationships,viewer.id,spotlight.member.id).slice(0,2):[],[viewer,spotlight,members,relationships]);
  const connectionDescription=useMemo(()=>viewer&&spotlight?describeRelationshipToViewer(members,relationships,viewer.id,spotlight.member.id):null,[viewer,spotlight,members,relationships]);
  const connectedMemories=useMemo(()=>spotlight?memories.filter(memory=>memory.member_id===spotlight.member.id||memory.related_member_ids?.includes(spotlight.member.id)).length:0,[spotlight,memories]);
  const connectedEvents=useMemo(()=>spotlight?events.filter(event=>event.member_id===spotlight.member.id).length:0,[spotlight,events]);

  const circles=useMemo<Circle[]>(()=>{
    if(!members.length)return [];
    const result:Circle[]=[];
    if(viewer){
      const sameGeneration=members.filter(m=>m.id!==viewer.id&&m.generation_level===viewer.generation_level);
      if(sameGeneration.length)result.push({key:"generation",title:tr("YourGenerationTxt"),subtitle:`${sameGeneration.length} relatives around your generation`,members:sameGeneration,icon:"generation"});
      if(viewer.city){
        const local=members.filter(m=>m.id!==viewer.id&&m.city?.trim().toLowerCase()===viewer.city?.trim().toLowerCase());
        if(local.length)result.push({key:"place",title:`Family around ${viewer.city}`,subtitle:`${local.length} relatives share this family place`,members:local,icon:"place"});
      }
      const close=connected.filter(x=>x.distance<=2).map(x=>x.member);
      if(close.length)result.push({key:"close",title:tr("YourCloseFamilyTxt"),subtitle:`${close.length} people within 2 relationship steps`,members:close,icon:"close"});
    }else{
      const generations=[...new Set(members.map(m=>m.generation_level))].sort((a,b)=>a-b);
      const biggest=generations.map(g=>({g,items:members.filter(m=>m.generation_level===g)})).sort((a,b)=>b.items.length-a.items.length)[0];
      if(biggest?.items.length)result.push({key:"generation",title:`Generation ${biggest.g}`,subtitle:`${biggest.items.length} relatives represented`,members:biggest.items,icon:"generation"});
      const byCity=new Map<string,Member[]>();
      members.forEach(m=>{if(m.city)byCity.set(m.city,[...(byCity.get(m.city)||[]),m]);});
      const city=[...byCity.entries()].sort((a,b)=>b[1].length-a[1].length)[0];
      if(city?.[1].length>1)result.push({key:"place",title:`Family around ${city[0]}`,subtitle:`${city[1].length} relatives connected by place`,members:city[1],icon:"place"});
    }
    return result.slice(0,3);
  },[members,viewer,connected]);

  const openSpotlight=()=>{
    if(!spotlight)return;
    if(!readOnly)trackFamilyEngagement("belonging_reconnect","member",spotlight.member.id).catch(()=>{});
    onSelect(spotlight.member);
  };

  if(!viewer&&!circles.length)return null;

  return <section className="family-belonging" aria-label={tr("FamilyConnectionAndBelongingTxt")}>
    <div className="belonging-heading">
      <div><span className="warm-kicker"><Heart size={12}/> {tr("ConnectionAndBelongingTxt")}</span><h2>{tr("KnowThePeopleBehindTheFamilyTreeTxt")}</h2></div>
      <p>{tr("APrivateFamilyNetworkShouldHelpNamesTxt")}</p>
    </div>

    <div className="belonging-grid">
      <article className="belonging-spotlight">
        {viewer&&spotlight&&spotlightPath?<>
          <div className="belonging-spotlight-head">
            <span className="belonging-icon"><Sparkles size={18}/></span>
            <div><span>{tr("ReconnectWithYourWiderFamilyTxt")}</span><h3>{tr("DoYouKnowTxt")}{" "}{spotlight.member.full_name}?</h3></div>
          </div>
          <div className="belonging-person-row">
            <button className="belonging-avatar" onClick={openSpotlight} aria-label={`Open ${spotlight.member.full_name}`}>
              {spotlight.member.photo_url?<img src={spotlight.member.photo_url} alt=""/>:<span>{initials(spotlight.member.full_name)}</span>}
            </button>
            <div className="belonging-person-copy">
              <b>{spotlight.label}</b>
              <p>{connectionDescription||`${spotlight.member.full_name} is ${spotlight.distance} relationship steps from you.`}</p>
              <div className="belonging-signals">
                {spotlight.member.city&&<span><MapPin size={12}/>{spotlight.member.city}</span>}
                {commonAncestors[0]&&<span><Network size={12}/>{tr("ConnectedThroughTxt")}{" "}{firstName(commonAncestors[0].full_name)}</span>}
                {(connectedMemories+connectedEvents)>0&&<span><Heart size={12}/>{connectedMemories+connectedEvents} {tr("PreservedFamilyTxt")}{" "}{connectedMemories+connectedEvents===1?tr("MomentTxt"):tr("MomentsTxt")}</span>}
              </div>
            </div>
          </div>
          <div className="belonging-path" aria-label={tr("RelationshipPathTxt")}>
            {spotlightPath.memberIds.map((id,index)=>{
              const member=members.find(m=>m.id===id); if(!member)return null;
              return <div className="belonging-path-step" key={`${id}-${index}`}>
                <button onClick={()=>onSelect(member)} title={member.full_name}><span>{index===0?tr("YouTxt"):initials(member.full_name)}</span><small>{index===0?tr("YouTxt"):firstName(member.full_name)}</small></button>
                {index<spotlightPath.memberIds.length-1&&<ChevronRight size={14}/>}
              </div>;
            })}
          </div>
          <div className="belonging-actions"><button className="btn primary" onClick={openSpotlight}>{tr("MeetThisRelativeTxt")}</button><button className="btn" onClick={()=>onGo("tree")}><Network size={14}/>{tr("SeeInFamilyTreeTxt")}</button></div>
        </>:<div className="belonging-empty"><Users size={24}/><div><h3>{tr("ClaimYourFamilyProfileToPersonalizeConnectionsTxt")}</h3><p>{tr("OnceTheAppKnowsWhichFamilyMemberTxt")}</p></div><button className="btn" onClick={()=>onGo("tree")}>{tr("ExploreTheFamilyTxt")}</button></div>}
      </article>

      <article className="belonging-circles-card">
        <div className="belonging-circles-head"><span>{tr("FamilyCirclesTxt")}</span><h3>{tr("SeeYourFamilyInFamiliarGroupsTxt")}</h3><p>{tr("DerivedFromTheFamilyGraphNotAnotherTxt")}</p></div>
        <div className="belonging-circles">
          {circles.map(circle=><div className="belonging-circle" key={circle.key}>
            <span className="belonging-circle-icon">{circle.icon==="place"?<MapPin size={16}/>:circle.icon==="close"?<Heart size={16}/>:<Users size={16}/>}</span>
            <div className="belonging-circle-copy"><b>{circle.title}</b><small>{circle.subtitle}</small><div className="belonging-circle-faces">{circle.members.slice(0,6).map(member=><button key={member.id} onClick={()=>onSelect(member)} title={member.full_name}>{member.photo_url?<img src={member.photo_url} alt=""/>:<span>{initials(member.full_name)}</span>}</button>)}{circle.members.length>6&&<em>+{circle.members.length-6}</em>}</div></div>
          </div>)}
          {!circles.length&&<p className="belonging-muted">{tr("AddRelationshipGenerationAndPlaceContextToTxt")}</p>}
        </div>
      </article>
    </div>
  </section>;
}
