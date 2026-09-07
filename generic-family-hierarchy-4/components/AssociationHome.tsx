"use client";
import {ArrowRight,BadgeCheck,BookOpen,CalendarDays,Cake,Clock3,GitBranch,HeartHandshake,History,RefreshCw,Sparkles,UsersRound} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../core/network-os/contracts";
import type {NetworkGroup} from "../capabilities/activity/remote";

type GoTarget="explorer"|"directory"|"community"|"contribute"|"guide"|"connections";

function text(value:unknown){return value==null?"":String(value)}
function dateValue(value:unknown){const raw=text(value);const d=raw?new Date(raw):null;return d&&!Number.isNaN(d.getTime())?d:null}
function nextBirthday(dob:Date){const now=new Date();const next=new Date(now.getFullYear(),dob.getMonth(),dob.getDate());if(next.getTime()<new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime())next.setFullYear(now.getFullYear()+1);return next}
function formatShortDate(d:Date){return d.toLocaleDateString(undefined,{day:"numeric",month:"short"})}

export default function AssociationHome({networkName,entities,activities,groups,onGo,familyCommunity=false}:{networkName:string;entities:NetworkAffiliatedEntity[];activities:NetworkActivity[];groups:NetworkGroup[];onGo:(target:GoTarget)=>void;familyCommunity?:boolean}){
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
   <div className="association-hero-copy"><span className="association-kicker"><Sparkles size={13}/> Community • Family • Belonging</span><h1>{networkName}</h1><p>A living home for every registered family—people, relationships, celebrations, memories, membership and community participation together.</p><div className="association-hero-actions"><button className="btn primary" onClick={()=>onGo("directory")}><UsersRound size={16}/> Families & Members</button><button className="btn" onClick={()=>onGo("community")}><CalendarDays size={16}/> Community Life</button><button className="btn" onClick={()=>onGo("explorer")}><GitBranch size={16}/> Family Structure</button></div></div>
   <div className="association-emblem" aria-label="Community identity"><div className="association-emblem-mark">म</div><small>{familyCommunity?"Family Community":"Community / Association"}</small><b>{currentYear}</b><span><BadgeCheck size={14}/> Private member network</span></div>
  </section>
  <section className="association-stat-grid">
   <article><UsersRound/><div><strong>{households.length}</strong><span>Registered families</span></div></article>
   <article><HeartHandshake/><div><strong>{people.length}</strong><span>Family members</span></div></article>
   <article><BadgeCheck/><div><strong>{active}</strong><span>Active memberships</span></div></article>
   <article className={renewalDue?"attention":""}><RefreshCw/><div><strong>{renewalDue}</strong><span>Renewal due</span></div></article>
  </section>
  <div className="association-dashboard-grid">
   <section className="card association-now-card"><div className="association-section-title"><div><span>Coming up</span><h2>Celebrations & events</h2></div><button onClick={()=>onGo("community")}>View all <ArrowRight size={14}/></button></div><div className="association-upcoming-list">
    {birthdays.slice(0,2).map(({person,next})=><article key={person.entity.id}><span className="association-date-badge birthday"><Cake size={16}/></span><div><b>{person.entity.label}'s birthday</b><small>{formatShortDate(next)} · {text(person.entity.metadata?.relation)||"Family member"}</small></div></article>)}
    {upcomingEvents.map(event=><article key={event.id}><span className="association-date-badge"><CalendarDays size={16}/></span><div><b>{event.title}</b><small>{event.startsAt?formatShortDate(new Date(event.startsAt)):"Upcoming"}{event.place?` · ${event.place}`:""}{typeof event.goingCount==="number"?` · ${event.goingCount} going`:""}</small></div></article>)}
    {!birthdays.length&&!upcomingEvents.length&&<p className="muted">Birthdays and upcoming community events will appear here automatically.</p>}
   </div></section>
   <section className="card association-family-card"><div className="association-section-title"><div><span>Family-grade profiles</span><h2>Every person matters</h2></div><button onClick={()=>onGo("directory")}>Open directory <ArrowRight size={14}/></button></div><p>Representative is only the official family contact. Spouse, children and other registered members keep their own profile, contact details and relationships.</p><div className="association-profile-chips">{people.slice(0,5).map(person=><span key={person.entity.id}><b>{person.entity.label}</b><small>{text(person.entity.metadata?.relation)||text(person.entity.metadata?.role)||"Member"}</small></span>)}</div><button className="btn small" onClick={()=>onGo("explorer")}><GitBranch size={14}/> Explore household relationships</button></section>
   <section className="card association-timeline-card"><div className="association-section-title"><div><span>Community history</span><h2>Our journey through the years</h2></div><button onClick={()=>onGo("community")}>Open history <ArrowRight size={14}/></button></div><div className="association-mini-timeline">{timeline.map(item=><article key={item.id}><span><History size={14}/></span><div><small>{item.startsAt?new Date(item.startsAt).getFullYear():"Memory"}</small><b>{item.title}</b><p>{item.body}</p></div></article>)}</div></section>
   <section className="card association-community-card"><div className="association-section-title"><div><span>Participation</span><h2>Committees & community pulse</h2></div><button onClick={()=>onGo("community")}>Participate <ArrowRight size={14}/></button></div><div className="association-group-list">{groups.slice(0,4).map(g=><div key={g.id}><span>{g.name}</span><b>{g.memberCount||0}</b></div>)}</div><div className="association-quick-links"><button onClick={()=>onGo("contribute")}><Clock3/> Keep information current</button><button onClick={()=>onGo("guide")}><BookOpen/> Explore & Guide</button><button onClick={()=>onGo("connections")}><HeartHandshake/> Community connections</button></div></section>
  </div>
 </div>
}
