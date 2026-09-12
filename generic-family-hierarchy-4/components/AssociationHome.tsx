"use client";
import {ArrowRight,BadgeCheck,BellRing,BookOpen,CalendarDays,Cake,Clock3,GitBranch,HeartHandshake,History,Megaphone,RefreshCw,Sparkles,UsersRound} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../core/network-os/contracts";
import type {NetworkGroup} from "../capabilities/activity/remote";
import {useLanguage} from "../lib/i18n";

type GoTarget="explorer"|"directory"|"community"|"contribute"|"guide"|"connections";

function text(value:unknown){return value==null?"":String(value)}
function dateValue(value:unknown){const raw=text(value);const d=raw?new Date(raw):null;return d&&!Number.isNaN(d.getTime())?d:null}
function nextBirthday(dob:Date){const now=new Date();const next=new Date(now.getFullYear(),dob.getMonth(),dob.getDate());if(next.getTime()<new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime())next.setFullYear(now.getFullYear()+1);return next}
function formatShortDate(d:Date){return d.toLocaleDateString(undefined,{day:"numeric",month:"short"})}
function initials(label:string){return label.split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]?.toUpperCase()).join("")||"M"}

export default function AssociationHome({networkName,entities,activities,groups,onGo,familyCommunity=false}:{networkName:string;entities:NetworkAffiliatedEntity[];activities:NetworkActivity[];groups:NetworkGroup[];onGo:(target:GoTarget)=>void;familyCommunity?:boolean}){
 const {t}=useLanguage();
 const households=entities.filter(x=>x.entity.kind==="household"||x.entity.kind==="family");
 const people=entities.filter(x=>x.entity.kind==="person");
 const active=households.filter(x=>(x.affiliations.membership_status||[]).some(v=>v.toLowerCase()==="active")).length;
 const renewalDue=Math.max(0,households.length-active);
 const upcomingEvents=activities.filter(a=>a.type==="event"&&a.startsAt&&new Date(a.startsAt).getTime()>=Date.now()).sort((a,b)=>new Date(a.startsAt!).getTime()-new Date(b.startsAt!).getTime()).slice(0,4);
 const announcements=activities.filter(a=>a.type==="announcement").slice(0,3);
 const birthdays=people.map(person=>{const dob=dateValue(person.entity.metadata?.dob);return dob?{person,dob,next:nextBirthday(dob)}:null}).filter((x):x is NonNullable<typeof x>=>!!x).sort((a,b)=>a.next.getTime()-b.next.getTime()).slice(0,4);
 const timeline=[...activities].filter(a=>a.startsAt||a.type==="memory"||a.type==="milestone").sort((a,b)=>text(b.startsAt).localeCompare(text(a.startsAt))).slice(0,5);
 const currentYear=households.flatMap(h=>h.affiliations.membership_year||[])[0]||"2026–27";
 const attentionCount=(renewalDue?1:0)+(announcements.length?1:0)+(upcomingEvents.length?1:0);
 return <div data-testid="qa-fca-flagship-home" className="association-signature-home">
  <section className="association-hero">
   <div className="association-hero-copy"><span className="association-kicker"><Sparkles size={13}/> {t("CommunityFamilyBelongingTxt")}</span><h1>{networkName}</h1><p>{t("CommunityHomeHeroDescTxt")}</p><div className="association-hero-actions"><button className="btn primary" onClick={()=>onGo("directory")}><UsersRound size={16}/> {t("FamiliesTxt")}</button><button className="btn" onClick={()=>onGo("community")}><CalendarDays size={16}/> {t("EventsCommunityTxt")}</button><button className="btn" onClick={()=>onGo("contribute")}><HeartHandshake size={16}/> {t("BuildTogetherTxt")}</button></div></div>
   <div className="association-emblem" aria-label={t("CommunityIdentityTxt")}><div className="association-emblem-mark">म</div><small>{familyCommunity?t("FamilyCommunityTxt"):t("CommunityAssociationTxt")}</small><b>{currentYear}</b><span><BadgeCheck size={14}/> {t("PrivateMemberCommunityTxt")}</span></div>
  </section>

  <section className="association-attention-strip">
   <div><span className="association-attention-icon"><BellRing size={17}/></span><div><small>{t("CommunityTodayTxt")}</small><b>{attentionCount?`${attentionCount} ${t("ThingsWorthAttentionTxt")}`:t("AllCaughtUpTxt")}</b></div></div>
   <div className="association-attention-items">
    <button onClick={()=>onGo("directory")}><strong>{renewalDue}</strong><span>{t("RenewalsDueTxt")}</span></button>
    <button onClick={()=>onGo("community")}><strong>{upcomingEvents.length}</strong><span>{t("UpcomingEventsTxt")}</span></button>
    <button onClick={()=>onGo("community")}><strong>{birthdays.length}</strong><span>{t("BirthdaysComingUpTxt")}</span></button>
   </div>
  </section>

  <section className="association-stat-grid">
   <article><UsersRound/><div><strong>{households.length}</strong><span>{t("FamiliesTxt")}</span></div></article>
   <article><HeartHandshake/><div><strong>{people.length}</strong><span>{t("MembersTxt")}</span></div></article>
   <article><BadgeCheck/><div><strong>{active}</strong><span>{t("ActiveMembershipsTxt")}</span></div></article>
   <article className={renewalDue?"attention":""}><RefreshCw/><div><strong>{renewalDue}</strong><span>{t("RenewalsDueTxt")}</span></div></article>
  </section>

  <div className="association-dashboard-grid">
   <section className="card association-now-card"><div className="association-section-title"><div><span>{t("ComingUpTxt")}</span><h2>{t("CommunityMomentsTxt")}</h2></div><button onClick={()=>onGo("community")}>{t("ViewAllTxt")} <ArrowRight size={14}/></button></div><div className="association-upcoming-list">
    {birthdays.slice(0,2).map(({person,next})=><article key={person.entity.id}><span className="association-date-badge birthday"><Cake size={16}/></span><div><b>{person.entity.label}</b><small>{formatShortDate(next)} · {text(person.entity.metadata?.relation)||t("FamilyMemberTxt")}</small></div></article>)}
    {upcomingEvents.slice(0,3).map(event=><article key={event.id}><span className="association-date-badge"><CalendarDays size={16}/></span><div><b>{event.title}</b><small>{event.startsAt?formatShortDate(new Date(event.startsAt)):t("UpcomingTxt")}{event.place?` · ${event.place}`:""}{typeof event.goingCount==="number"?` · ${event.goingCount} ${t("GoingTxt")}`:""}</small></div></article>)}
    {!birthdays.length&&!upcomingEvents.length&&<p className="muted">{t("NoUpcomingCommunityMomentsTxt")}</p>}
   </div></section>

   <section className="card association-family-card"><div className="association-section-title"><div><span>{t("PeopleTxt")}</span><h2>{t("FamiliesMembersTxt")}</h2></div><button onClick={()=>onGo("directory")}>{t("OpenDirectoryTxt")} <ArrowRight size={14}/></button></div><p>{t("FamiliesMembersDescTxt")}</p><div className="association-avatar-row">{people.slice(0,6).map(person=><span key={person.entity.id} title={person.entity.label}>{initials(person.entity.label)}</span>)}</div><div className="association-profile-chips">{people.slice(0,4).map(person=><span key={person.entity.id}><b>{person.entity.label}</b><small>{text(person.entity.metadata?.profession)||text(person.entity.metadata?.role)||t("MemberTxt")}</small></span>)}</div><button className="btn small" onClick={()=>onGo("explorer")}><GitBranch size={14}/> {t("ExploreFamilyStructureTxt")}</button></section>

   <section className="card association-announcement-card"><div className="association-section-title"><div><span>{t("StayInformedTxt")}</span><h2>{t("AnnouncementsTxt")}</h2></div><button onClick={()=>onGo("community")}>{t("CommunityLifeTxt")} <ArrowRight size={14}/></button></div><div className="association-announcement-list">{announcements.length?announcements.map(a=><article key={a.id}><span><Megaphone size={15}/></span><div><b>{a.title}</b>{a.body&&<p>{a.body}</p>}</div></article>):<article><span><Megaphone size={15}/></span><div><b>{t("MembershipRenewalOpenTxt")}</b><p>{t("MembershipRenewalOpenDescTxt")}</p></div></article>}</div></section>

   <section className="card association-community-card"><div className="association-section-title"><div><span>{t("ParticipateTxt")}</span><h2>{t("CommunityGroupsTxt")}</h2></div><button onClick={()=>onGo("community")}>{t("ExploreTxt")} <ArrowRight size={14}/></button></div><div className="association-group-list">{groups.slice(0,4).map(g=><div key={g.id}><span>{g.name}</span><b>{g.memberCount||0}</b></div>)}</div><div className="association-quick-links"><button onClick={()=>onGo("contribute")}><Clock3/> {t("BuildTogetherTxt")}</button><button onClick={()=>onGo("guide")}><BookOpen/> {t("GuideHelpTxt")}</button><button onClick={()=>onGo("connections")}><HeartHandshake/> {t("CommunityConnectionsTxt")}</button></div></section>

   <section className="card association-timeline-card association-wide-card"><div className="association-section-title"><div><span>{t("OurJourneyTxt")}</span><h2>{t("CommunityHistoryTxt")}</h2></div><button onClick={()=>onGo("community")}>{t("ViewHistoryTxt")} <ArrowRight size={14}/></button></div><div className="association-mini-timeline">{timeline.map(item=><article key={item.id}><span><History size={14}/></span><div><small>{item.startsAt?new Date(item.startsAt).getFullYear():t("MemoryTxt")}</small><b>{item.title}</b>{item.body&&<p>{item.body}</p>}</div></article>)}</div></section>
  </div>
 </div>
}
