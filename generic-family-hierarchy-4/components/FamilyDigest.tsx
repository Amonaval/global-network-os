"use client";
import {useEffect,useMemo,useState} from "react";
import {Bell,CalendarHeart,ChevronDown,ChevronUp,Heart,Share2,Sparkles,Users,Handshake,CalendarDays} from "lucide-react";
import {LifeEvent,Member,Memory} from "../lib/types";
import {FamilyDigest as FamilyDigestData,fetchMyFamilyDigest,markFamilyDigestOpened,markFamilyDigestShared} from "../lib/remote";

type Props={
  members:Member[];events:LifeEvent[];memories:Memory[];networkName?:string;readOnly?:boolean;
  onSelect:(m:Member)=>void;onGo:(v:"community"|"participation"|"tree")=>void;
};

const emptyDigest=(name?:string):FamilyDigestData=>({generated_at:new Date().toISOString(),network_name:name,days:7,new_since_last_open:0,recent_memories:[],new_members:[],gatherings:[],open_contributions:0,introductions:[]});

export default function FamilyDigest({members,events,memories,networkName,readOnly=false,onSelect,onGo}:Props){
 const [digest,setDigest]=useState<FamilyDigestData>(()=>emptyDigest(networkName));
 const [open,setOpen]=useState(false),[loading,setLoading]=useState(!readOnly),[loadError,setLoadError]=useState(false);
 useEffect(()=>{
  if(readOnly){setDigest({...emptyDigest(networkName),new_since_last_open:6,recent_memories:memories.slice(0,2).map(m=>({id:m.id,title:m.title,body:m.story,created_at:m.created_at})),new_members:members.slice(-2).map(m=>({id:m.id,title:m.full_name,full_name:m.full_name,city:m.city,profession:m.profession})),open_contributions:3,contribution_hint:"Help complete one relative's story",introductions:[{id:"demo-intro",title:"Trusted introduction",person_name:"Ananya Somani",status:"pending",direction:"incoming"}]});setLoading(false);return;}
  setLoading(true);fetchMyFamilyDigest(7).then(v=>{setDigest(v);setLoadError(false)}).catch(()=>setLoadError(true)).finally(()=>setLoading(false));
 },[readOnly,networkName,members,memories]);
 const upcoming=useMemo(()=>{const now=new Date();now.setHours(0,0,0,0);return members.filter(m=>!m.date_of_death&&m.date_of_birth).map(m=>{const d=new Date(`${m.date_of_birth}T00:00:00`);let next=new Date(now.getFullYear(),d.getMonth(),d.getDate());if(next<now)next.setFullYear(next.getFullYear()+1);return {m,next,days:Math.round((next.getTime()-now.getTime())/86400000)}}).filter(x=>x.days<=14).sort((a,b)=>a.days-b.days).slice(0,3)},[members]);
 const onThisWeek=useMemo(()=>{const now=new Date();return events.filter(e=>e.event_date).map(e=>({e,d:new Date(`${e.event_date}T00:00:00`)})).filter(x=>x.d.getFullYear()<now.getFullYear()&&Math.abs(((new Date(now.getFullYear(),x.d.getMonth(),x.d.getDate())).getTime()-now.getTime())/86400000)<=3).slice(0,2)},[events]);
 const meaningful=digest.recent_memories.length+digest.new_members.length+digest.gatherings.length+digest.introductions.length+digest.open_contributions+upcoming.length+onThisWeek.length;
 const preview=[
  upcoming[0]?`${upcoming[0].m.full_name}'s birthday ${upcoming[0].days===0?'is today':`is in ${upcoming[0].days} day${upcoming[0].days===1?'':'s'}`}`:null,
  digest.recent_memories[0]?`New memory: ${digest.recent_memories[0].title}`:null,
  digest.introductions[0]?`${digest.introductions[0].direction==='incoming'?'New':'Updated'} trusted introduction`:null,
  digest.open_contributions?`${digest.open_contributions} small way${digest.open_contributions===1?'':'s'} to help the family`:null,
 ].filter(Boolean).slice(0,3) as string[];
 const toggle=async()=>{const next=!open;setOpen(next);if(next&&!readOnly)markFamilyDigestOpened().catch(()=>{});};
 const share=async()=>{const lines=[`❤️ ${networkName||digest.network_name||'Our family'} · family highlights`];if(upcoming.length)lines.push(`🎂 ${upcoming.length} family moment${upcoming.length===1?'':'s'} coming up`);if(digest.recent_memories.length)lines.push(`📖 ${digest.recent_memories.length} new family memor${digest.recent_memories.length===1?'y':'ies'}`);if(digest.new_members.length)lines.push(`👪 ${digest.new_members.length} new family profile${digest.new_members.length===1?'':'s'}`);if(digest.gatherings.length)lines.push(`📅 ${digest.gatherings.length} upcoming gathering${digest.gatherings.length===1?'':'s'}`);if(digest.introductions.length)lines.push(`🤝 ${digest.introductions.length} trusted introduction update${digest.introductions.length===1?'':'s'}`);if(digest.open_contributions)lines.push(`✨ ${digest.open_contributions} small way${digest.open_contributions===1?'':'s'} to help the family`);lines.push('Open the family network to see the private details.');const text=lines.join('\n');const native=typeof navigator.share==='function';try{if(native)await navigator.share({title:`${networkName||'Family'} digest`,text});else await navigator.clipboard?.writeText(text);if(!readOnly)markFamilyDigestShared(native?'native':'copy').catch(()=>{});}catch(e:any){if(e?.name!=='AbortError'){} }};
 if(loadError&&!readOnly)return null;
 return <section className={`family-digest card ${open?'open':''}`}>
   <button className="family-digest-head" onClick={toggle} aria-expanded={open}>
    <span className="family-digest-mark"><Bell size={19}/></span><span className="family-digest-title"><span className="warm-kicker"><Sparkles size={11}/> Quiet family digest</span><b>{meaningful?"A few things worth coming back for":"You're all caught up"}</b><small>{loading?'Gathering the meaningful bits…':preview[0]||'No noisy feed. Only useful family updates.'}</small></span>
    <span className="family-digest-meta">{digest.new_since_last_open>0&&<em>{digest.new_since_last_open} new</em>}{open?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</span>
   </button>
   {open&&<div className="family-digest-body">
    <div className="digest-summary-strip">{preview.map((x,i)=><span key={i}>{x}</span>)}{preview.length===0&&<span>Nothing urgent. Your family is quietly up to date.</span>}</div>
    <div className="digest-sections">
     {upcoming.length>0&&<div className="digest-section"><h4><CalendarHeart size={15}/> Coming up</h4>{upcoming.map(x=><button key={x.m.id} onClick={()=>onSelect(x.m)}><b>{x.m.full_name}</b><small>{x.days===0?'Birthday today':`Birthday · ${x.next.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`}</small></button>)}</div>}
     {onThisWeek.length>0&&<div className="digest-section"><h4><CalendarDays size={15}/> Remember</h4>{onThisWeek.map(({e,d})=><button key={e.id} onClick={()=>{const m=members.find(x=>x.id===e.member_id);if(m)onSelect(m)}}><b>{e.title}</b><small>{new Date().getFullYear()-d.getFullYear()} years ago</small></button>)}</div>}
     {digest.recent_memories.length>0&&<div className="digest-section"><h4><Heart size={15}/> New memories</h4>{digest.recent_memories.map(m=><button key={m.id} onClick={()=>onGo('community')}><b>{m.title}</b><small>{m.member_name||m.body||'Open family memories'}</small></button>)}</div>}
     {digest.new_members.length>0&&<div className="digest-section"><h4><Users size={15}/> Family grew</h4>{digest.new_members.map(m=><div className="digest-static" key={m.id}><b>{m.full_name||m.title}</b><small>{[m.profession,m.city].filter(Boolean).join(' · ')||'New family profile'}</small></div>)}</div>}
     {digest.gatherings.length>0&&<div className="digest-section"><h4><CalendarDays size={15}/> Gatherings</h4>{digest.gatherings.map(g=><button key={g.id} onClick={()=>onGo('community')}><b>{g.title}</b><small>{g.event_at?new Date(g.event_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):''}{g.location?` · ${g.location}`:''}</small></button>)}</div>}
     {digest.introductions.length>0&&<div className="digest-section"><h4><Handshake size={15}/> Trusted introductions</h4>{digest.introductions.map(i=><div className="digest-static" key={i.id}><b>{i.person_name||'Community introduction'}</b><small>{i.direction==='incoming'?'Someone is asking for a respectful introduction':`Status · ${i.status||'updated'}`}</small></div>)}</div>}
     {digest.open_contributions>0&&<div className="digest-section digest-help"><h4><Sparkles size={15}/> One small way to help</h4><button onClick={()=>onGo('participation')}><b>{digest.contribution_hint||'Help complete a family profile'}</b><small>{digest.open_contributions} open suggestion{digest.open_contributions===1?'':'s'} · usually about a minute</small></button></div>}
    </div>
    <div className="family-digest-actions"><button className="btn small" onClick={share}><Share2 size={14}/> Share this week's highlights</button><span>Private details stay in the app; the shared summary contains only these highlight titles.</span></div>
   </div>}
  </section>;
}
