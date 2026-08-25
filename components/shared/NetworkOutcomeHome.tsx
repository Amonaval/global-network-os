"use client";
import {AlertTriangle,ArrowRight,BookOpenCheck,CalendarDays,Handshake,Lightbulb,Network,RefreshCw,Sparkles,UsersRound} from "lucide-react";
import type {NetworkActivity,NetworkAffiliatedEntity} from "../../core/network-os/contracts";
import type {NetworkGroup} from "../../capabilities/activity/remote";
import type {NetworkEntityRelationship} from "../../capabilities/template-product/remote";

type Kind="organization"|"business-trust"|"franchise"|"alumni";
type Target="explorer"|"directory"|"community"|"connections"|"contribute"|"guide";

const COPY={
 organization:{eyebrow:"Organizational intelligence",title:"What needs attention in your organization",focus:"Turn hidden expertise and ownership into action.",signals:["Find concentrated knowledge before it becomes a risk","See who owns, depends on or understands critical work","Reuse lessons instead of solving the same problem twice"],returnTitle:"Your organization gets smarter when knowledge is captured",returnText:"Review new lessons, ownership gaps and help requests regularly so the network stays useful after the initial import."},
 "business-trust":{eyebrow:"Trusted ecosystem",title:"Find evidence and warm paths, not another directory",focus:"Make sourcing and introductions safer and faster.",signals:["Prefer providers backed by recent network evidence","Trace who can make a warm introduction","Capture successful engagements so trust compounds"],returnTitle:"Trust improves when outcomes come back into the network",returnText:"Verify relationships and record successful outcomes so future sourcing decisions have provenance instead of anonymous ratings."},
 franchise:{eyebrow:"Franchise operations",title:"Help every location learn from the whole network",focus:"Stop stores from solving the same operational problem independently.",signals:["Find locations that already solved a similar issue","Reuse launch, staffing and operating lessons","Connect managers through regional and specialist circles"],returnTitle:"Every solved problem should become a reusable operating advantage",returnText:"Return to new playbook entries, support requests and training events so operating knowledge spreads across locations."},
 alumni:{eyebrow:"Alumni opportunity network",title:"Turn alumni identity into professional opportunity",focus:"Use shared identity to open doors, mentor and give back.",signals:["Find people by cohort, city, company and expertise","Use warm alumni context for introductions","Capture journeys that help the next alumnus move faster"],returnTitle:"The network becomes valuable when alumni keep giving back",returnText:"Return for mentoring needs, introductions, career journeys and chapter activity—not just directory updates."}
} as const;

export default function NetworkOutcomeHome({kind,entities,relationships,activities,groups,completeness,locationCount,onGo}:{kind:Kind;entities:readonly NetworkAffiliatedEntity[];relationships:readonly NetworkEntityRelationship[];activities:readonly NetworkActivity[];groups:readonly NetworkGroup[];completeness:number;locationCount:number;onGo:(target:Target)=>void}){
 const c=COPY[kind], upcoming=activities.filter(a=>a.type==="event"&&a.startsAt&&new Date(a.startsAt).getTime()>Date.now()).length, knowledge=activities.filter(a=>a.type==="memory"||a.type==="milestone").length;
 const gaps=Math.max(0,Math.round(entities.length*(100-completeness)/100));
 return <>
  <section className="card outcome-command-center">
   <div className="outcome-command-head"><div><span className="warm-kicker"><Sparkles size={12}/> {c.eyebrow}</span><h2>{c.title}</h2><p>{c.focus}</p></div><button className="btn primary" onClick={()=>onGo("connections")}><Network size={15}/> Explore useful paths</button></div>
   <div className="outcome-signal-grid">
    <button onClick={()=>onGo("connections")}><Handshake/><span><b>{relationships.length}</b><small>known relationship paths</small></span><ArrowRight/></button>
    <button onClick={()=>onGo("community")}><BookOpenCheck/><span><b>{knowledge}</b><small>reusable lessons / evidence</small></span><ArrowRight/></button>
    <button onClick={()=>onGo("community")}><UsersRound/><span><b>{groups.length}</b><small>active circles / communities</small></span><ArrowRight/></button>
    <button onClick={()=>onGo("contribute")}><AlertTriangle/><span><b>{gaps}</b><small>estimated context gaps</small></span><ArrowRight/></button>
   </div>
   <div className="outcome-reasons">{c.signals.map((s,i)=><article key={s}><span>{i+1}</span><p>{s}</p></article>)}</div>
  </section>
  <section className="return-loop-grid">
   <article className="card return-loop-card"><RefreshCw/><div><span className="warm-kicker">Return loop</span><h3>{c.returnTitle}</h3><p>{c.returnText}</p><button className="btn small" onClick={()=>onGo("community")}>See what changed <ArrowRight size={13}/></button></div></article>
   <article className="card return-loop-card"><CalendarDays/><div><span className="warm-kicker">Right now</span><h3>{upcoming} upcoming · {locationCount} locations</h3><p>Events, geography and communities give people a reason to return after the initial structure is built.</p><button className="btn small" onClick={()=>onGo("guide")}>See recommended workflow <ArrowRight size={13}/></button></div></article>
   <article className="card return-loop-card"><Lightbulb/><div><span className="warm-kicker">Next best action</span><h3>{completeness<80?"Improve missing context":"Activate the network"}</h3><p>{completeness<80?"Complete affiliations and relationships so discovery becomes trustworthy.":"Ask a real question, capture the answer and turn it into reusable network knowledge."}</p><button className="btn small" onClick={()=>onGo(completeness<80?"contribute":"connections")}>Take action <ArrowRight size={13}/></button></div></article>
  </section>
 </>;
}
