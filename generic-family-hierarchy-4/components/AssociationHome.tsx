"use client";
import {ArrowRight,BadgeCheck,BookOpen,CalendarDays,Cake,Clock3,GitBranch,HeartHandshake,History,RefreshCw,Sparkles,UsersRound} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../core/network-os/contracts";
import type {NetworkGroup} from "../capabilities/activity/remote";
import {useLanguage} from "../lib/i18n";

type GoTarget="explorer"|"directory"|"community"|"contribute"|"guide"|"connections";

function text(value:unknown){return value==null?"":String(value)}
function dateValue(value:unknown){const raw=text(value);const d=raw?new Date(raw):null;return d&&!Number.isNaN(d.getTime())?d:null}
function nextBirthday(dob:Date){const now=new Date();const next=new Date(now.getFullYear(),dob.getMonth(),dob.getDate());if(next.getTime()<new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime())next.setFullYear(now.getFullYear()+1);return next}
function formatShortDate(d:Date){return d.toLocaleDateString(undefined,{day:"numeric",month:"short"})}

export default function AssociationHome({networkName,entities,activities,groups,onGo,familyCommunity=false}:{networkName:string;entities:NetworkAffiliatedEntity[];activities:NetworkActivity[];groups:NetworkGroup[];onGo:(target:GoTarget)=>void;familyCommunity?:boolean}){
 const {t:xp2t}=useLanguage();
 const households=entities.filter(x=>x.entity.kind==="household"||x.entity.kind==="family");
 const people=entities.filter(x=>x.entity.kind==="person");
 const active=households.filter(x=>(x.affiliations.membership_status||[]).some(v=>v.toLowerCase()==="active")).length;
 const renewalDue=households.length-active;
 const upcomingEvents=activities.filter(a=>a.type==="event"&&a.startsAt&&new Date(a.startsAt).getTime()>=Date.now()).sort((a,b)=>new Date(a.startsAt!).getTime()-new Date(b.startsAt!).getTime()).slice(0,3);
 const birthdays=people.map(person=>{const dob=dateValue(person.entity.metadata?.dob);return dob?{person,dob,next:nextBirthday(dob)}:null}).filter((x):x is NonNullable<typeof x>=>!!x).sort((a,b)=>a.next.getTime()-b.next.getTime()).slice(0,4);
 const timeline=[...activities].filter(a=>a.startsAt||a.type==="memory"||a.type==="milestone").sort((a,b)=>text(b.startsAt).localeCompare(text(a.startsAt))).slice(0,6);
 const currentYear=households.flatMap(h=>h.affiliations.membership_year||[])[0]||"Current year";
 return <div className="association-signature-home">
  <section className="association-hero">
   <div className="association-hero-copy"><span className="association-kicker"><Sparkles size={13}/>  {xp2t("XP2Visible0021Txt")}</span><h1>{networkName}</h1><p>{xp2t("XP2Visible0022Txt")}</p><div className="association-hero-actions"><button className="btn primary" onClick={()=>onGo("directory")}><UsersRound size={16}/>  {xp2t("XP2Visible0023Txt")}</button><button className="btn" onClick={()=>onGo("community")}><CalendarDays size={16}/>  {xp2t("XP2Visible0024Txt")}</button><button className="btn" onClick={()=>onGo("explorer")}><GitBranch size={16}/>  {xp2t("XP2Visible0025Txt")}</button></div></div>
   <div className="association-emblem" aria-label={xp2t("XP2Visible0026Txt")}><div className="association-emblem-mark">म</div><small>{familyCommunity?"Family Community":"Community / Association"}</small><b>{currentYear}</b><span><BadgeCheck size={14}/>  {xp2t("XP2Visible0027Txt")}</span></div>
  </section>
  <section className="association-stat-grid">
   <article><UsersRound/><div><strong>{households.length}</strong><span>{xp2t("XP2Visible0028Txt")}</span></div></article>
   <article><HeartHandshake/><div><strong>{people.length}</strong><span>{xp2t("XP2Visible0029Txt")}</span></div></article>
   <article><BadgeCheck/><div><strong>{active}</strong><span>{xp2t("XP2Visible0030Txt")}</span></div></article>
   <article className={renewalDue?"attention":""}><RefreshCw/><div><strong>{renewalDue}</strong><span>{xp2t("XP2Visible0031Txt")}</span></div></article>
  </section>
  <div className="association-dashboard-grid">
   <section className="card association-now-card"><div className="association-section-title"><div><span>{xp2t("XP2Visible0032Txt")}</span><h2>{xp2t("XP2Visible0033Txt")}</h2></div><button onClick={()=>onGo("community")}>{xp2t("XP2Visible0034Txt")} <ArrowRight size={14}/></button></div><div className="association-upcoming-list">
    {birthdays.slice(0,2).map(({person,next})=><article key={person.entity.id}><span className="association-date-badge birthday"><Cake size={16}/></span><div><b>{person.entity.label}{xp2t("XP2Visible0035Txt")}</b><small>{formatShortDate(next)} · {text(person.entity.metadata?.relation)||"Family member"}</small></div></article>)}
    {upcomingEvents.map(event=><article key={event.id}><span className="association-date-badge"><CalendarDays size={16}/></span><div><b>{event.title}</b><small>{event.startsAt?formatShortDate(new Date(event.startsAt)):"Upcoming"}{event.place?` · ${event.place}`:""}{typeof event.goingCount==="number"?` · ${event.goingCount} going`:""}</small></div></article>)}
    {!birthdays.length&&!upcomingEvents.length&&<p className="muted">{xp2t("XP2Visible0036Txt")}</p>}
   </div></section>
   <section className="card association-family-card"><div className="association-section-title"><div><span>{xp2t("XP2Visible0037Txt")}</span><h2>{xp2t("XP2Visible0038Txt")}</h2></div><button onClick={()=>onGo("directory")}>{xp2t("XP2Visible0039Txt")} <ArrowRight size={14}/></button></div><p>{xp2t("XP2Visible0040Txt")}</p><div className="association-profile-chips">{people.slice(0,5).map(person=><span key={person.entity.id}><b>{person.entity.label}</b><small>{text(person.entity.metadata?.relation)||text(person.entity.metadata?.role)||"Member"}</small></span>)}</div><button className="btn small" onClick={()=>onGo("explorer")}><GitBranch size={14}/>  {xp2t("XP2Visible0041Txt")}</button></section>
   <section className="card association-timeline-card"><div className="association-section-title"><div><span>{xp2t("XP2Visible0042Txt")}</span><h2>{xp2t("XP2Visible0043Txt")}</h2></div><button onClick={()=>onGo("community")}>{xp2t("XP2Visible0044Txt")} <ArrowRight size={14}/></button></div><div className="association-mini-timeline">{timeline.map(item=><article key={item.id}><span><History size={14}/></span><div><small>{item.startsAt?new Date(item.startsAt).getFullYear():"Memory"}</small><b>{item.title}</b><p>{item.body}</p></div></article>)}</div></section>
   <section className="card association-community-card"><div className="association-section-title"><div><span>{xp2t("XP2Visible0045Txt")}</span><h2>{xp2t("XP2Visible0046Txt")}</h2></div><button onClick={()=>onGo("community")}>{xp2t("XP2Visible0047Txt")} <ArrowRight size={14}/></button></div><div className="association-group-list">{groups.slice(0,4).map(g=><div key={g.id}><span>{g.name}</span><b>{g.memberCount||0}</b></div>)}</div><div className="association-quick-links"><button onClick={()=>onGo("contribute")}><Clock3/>  {xp2t("XP2Visible0048Txt")}</button><button onClick={()=>onGo("guide")}><BookOpen/>  {xp2t("XP2Visible0049Txt")}</button><button onClick={()=>onGo("connections")}><HeartHandshake/>  {xp2t("XP2Visible0050Txt")}</button></div></section>
  </div>
 </div>
}
