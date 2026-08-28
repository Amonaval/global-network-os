"use client";
import {useEffect,useMemo,useState} from "react";
import {Cake,ChevronRight,Heart,Image,MapPin,Plus,Sparkles,Users,UsersRound} from "lucide-react";
import type {LifeEvent,Member,Memory,Relationship} from "../lib/types";
import {getNetworkRepository} from "../lib/repository";
import {useLanguage} from "../lib/i18n";
import FamilyExperienceHub from "./FamilyExperienceHub";

type HomeView="community"|"participation"|"tree";

type Props={
 members:Member[];events:LifeEvent[];memories?:Memory[];relationships?:Relationship[];networkName?:string;viewerMemberId?:string;
 onSelect:(m:Member)=>void;onGo:(v:HomeView)=>void;onAddRelative:()=>void;
 showMemories?:boolean;showSpecialDays?:boolean;showContributions?:boolean;showSharing?:boolean;showFamilyPulse?:boolean;showQuietDigest?:boolean;canAddRelative?:boolean;simple?:boolean;readOnly?:boolean;
};

function initials(name:string){return name.split(/\s+/).map(x=>x[0]).filter(Boolean).slice(0,2).join("").toUpperCase();}

export default function FamilyHome({members,events,memories:providedMemories,relationships=[],networkName,viewerMemberId,onSelect,onGo,onAddRelative,showMemories=true,showSpecialDays=true,showContributions=true,showFamilyPulse=true,showQuietDigest=true,canAddRelative=true,simple=false,readOnly=false}:Props){
 const {language}=useLanguage();
 const repo=getNetworkRepository();
 const [memories,setMemories]=useState<Memory[]>(providedMemories||[]);
 useEffect(()=>{if(providedMemories){setMemories(providedMemories);return;}repo.fetchMemories().then(setMemories).catch(()=>setMemories([]));},[providedMemories]);
 const copy=language==='hi'?{kicker:'आपका परिवार, साथ',sub:'रिश्तों को समझें, यादें सँजोएँ और पीढ़ियों को जुड़ा रखें।',tree:'मेरा परिवार देखें',memory:'एक याद जोड़ें',relative:'रिश्तेदार जोड़ें',today:'अगला पारिवारिक पल',recent:'हाल की याद',help:'एक छोटी मदद',helpBody:'किसी रिश्तेदार की अधूरी जानकारी पूरी करने में एक मिनट दें।',people:'लोग',generations:'पीढ़ियाँ',places:'शहर',stories:'यादें'}:language==='mr'?{kicker:'आपले कुटुंब, एकत्र',sub:'नाती समजा, आठवणी जपा आणि पिढ्यांना जोडून ठेवा.',tree:'माझे कुटुंब पहा',memory:'आठवण जोडा',relative:'नातेवाईक जोडा',today:'पुढचा कौटुंबिक क्षण',recent:'अलीकडची आठवण',help:'एक छोटी मदत',helpBody:'एखाद्या नातेवाईकाची अपूर्ण माहिती पूर्ण करण्यासाठी एक मिनिट द्या.',people:'लोक',generations:'पिढ्या',places:'शहरे',stories:'आठवणी'}:{kicker:'Your family, together',sub:'Know the relationships, keep the stories and help generations stay connected.',tree:'See my family',memory:'Preserve a memory',relative:'Add a relative',today:'Next family moment',recent:'Recently preserved',help:'One small way to help',helpBody:'Complete one missing family detail in about a minute.',people:'people',generations:'generations',places:'family cities',stories:'memories'};
 const viewer=viewerMemberId?members.find(m=>m.id===viewerMemberId):undefined;
 const heroMembers=useMemo(()=>viewer?[viewer,...members.filter(m=>m.id!==viewer.id)].slice(0,7):members.slice(0,7),[viewer,members]);
 const generations=useMemo(()=>new Set(members.map(m=>m.generation_level)).size,[members]);
 const places=useMemo(()=>new Set(members.map(m=>m.city).filter(Boolean)).size,[members]);
 const recent=memories[0];
 const incomplete=useMemo(()=>members.find(m=>!m.photo_url||!m.city||!m.date_of_birth||!m.bio),[members]);
 const upcoming=useMemo(()=>{
  const now=new Date();now.setHours(0,0,0,0);
  const nextOccurrence=(raw:string)=>{const d=new Date(`${raw.slice(0,10)}T00:00:00`);if(Number.isNaN(d.getTime()))return undefined;let next=new Date(now.getFullYear(),d.getMonth(),d.getDate());if(next<now)next.setFullYear(next.getFullYear()+1);return {next,days:Math.round((next.getTime()-now.getTime())/86400000)};};
  const birthdays=members.filter(m=>!m.date_of_death&&m.date_of_birth).flatMap(m=>{const when=nextOccurrence(m.date_of_birth!);return when?[{member:m,label:language==='hi'?'जन्मदिन':language==='mr'?'वाढदिवस':'Birthday',...when}]:[];});
  const anniversaries=events.filter(e=>e.event_type==='marriage'&&e.event_date).flatMap(e=>{const when=nextOccurrence(e.event_date!);const member=members.find(m=>m.id===e.member_id);return when&&member?[{member,label:language==='hi'?'विवाह वर्षगाँठ':language==='mr'?'लग्नाचा वाढदिवस':'Anniversary',...when}]:[];});
  return [...birthdays,...anniversaries].sort((a,b)=>a.days-b.days)[0];
 },[members,events,language]);
 return <section className={`family-home nx6-family-home ${simple?"simple-family-home":""}`}>
  <section className="nx6-family-hero">
   <div className="nx6-family-hero-copy"><span className="warm-kicker"><Sparkles size={12}/>{copy.kicker}</span><h1>{networkName||copy.kicker}</h1>{viewer&&<p className="nx6-you-line">You are <b>{viewer.full_name.split(/\s+/)[0]}</b> here. Start with the people closest to you, then explore outward.</p>}<p>{copy.sub}</p><div className="nx6-hero-actions"><button className="btn primary" onClick={()=>onGo("tree")}><UsersRound size={16}/>{copy.tree}</button>{showMemories&&<button className="btn nx6-ghost-btn" onClick={()=>onGo("community")}><Heart size={16}/>{copy.memory}</button>}{canAddRelative&&<button className="btn nx6-ghost-btn" onClick={onAddRelative}><Plus size={16}/>{copy.relative}</button>}</div></div>
   <div className="nx6-family-proof"><div className="nx6-face-stack">{heroMembers.map(m=><button key={m.id} onClick={()=>onSelect(m)} title={m.full_name}>{m.photo_url?<img src={m.photo_url} alt=""/>:<span>{initials(m.full_name)}</span>}</button>)}</div><strong>{members.length}</strong><span>{copy.people} · {generations} {copy.generations}</span><small>Private to this family network</small></div>
  </section>

  <div className="nx6-family-stats" aria-label="Family snapshot">
   <button onClick={()=>onGo("tree")}><Users size={17}/><span><b>{members.length}</b><small>{copy.people}</small></span><ChevronRight size={14}/></button>
   <button onClick={()=>onGo("tree")}><Sparkles size={17}/><span><b>{generations}</b><small>{copy.generations}</small></span><ChevronRight size={14}/></button>
   <button onClick={()=>onGo("tree")}><MapPin size={17}/><span><b>{places}</b><small>{copy.places}</small></span><ChevronRight size={14}/></button>
   {showMemories?<button onClick={()=>onGo("community")}><Heart size={17}/><span><b>{memories.length}</b><small>{copy.stories}</small></span><ChevronRight size={14}/></button>:<button onClick={()=>onGo("tree")}><Heart size={17}/><span><b>{relationships.length}</b><small>connections</small></span><ChevronRight size={14}/></button>}
  </div>

  {!simple&&showFamilyPulse&&<FamilyExperienceHub members={members} relationships={relationships} events={events} memories={memories} networkName={networkName} viewerMemberId={viewerMemberId} readOnly={readOnly} showQuietDigest={showQuietDigest} onSelect={onSelect} onGo={onGo}/>} 

  {(simple||showSpecialDays||showMemories||showContributions)&&<section className="nx6-family-now">
   <div className="nx6-section-head"><div><span className="warm-kicker">At a glance</span><h2>Family moments & small actions</h2></div><p>Useful things, without a noisy feed.</p></div>
   <div className="nx6-now-grid">
    {showSpecialDays&&upcoming&&<button className="nx6-now-card special" onClick={()=>onSelect(upcoming.member)}><span className="nx6-now-icon"><Cake size={20}/></span><span><small>{copy.today}</small><b>{upcoming.member.full_name}</b><em>{upcoming.label} · {upcoming.days===0?'Today':`${upcoming.days} day${upcoming.days===1?'':'s'} away`} · {upcoming.next.toLocaleDateString(language==='hi'?'hi-IN':language==='mr'?'mr-IN':'en-IN',{day:'numeric',month:'short'})}</em></span><ChevronRight size={17}/></button>}
    {showMemories&&<button className="nx6-now-card memory" onClick={()=>onGo("community")}><span className="nx6-now-icon">{recent?.photo_url?<img src={recent.photo_url} alt=""/>:<Image size={20}/>}</span><span><small>{copy.recent}</small><b>{recent?.title||'Preserve the first family memory'}</b><em>{recent?.story?.slice(0,72)||'A photo and two lines are enough to keep a story alive.'}</em></span><ChevronRight size={17}/></button>}
    {showContributions&&<button className="nx6-now-card help" onClick={()=>onGo("participation")}><span className="nx6-now-icon"><Sparkles size={20}/></span><span><small>{copy.help}</small><b>{incomplete?`Help complete ${incomplete.full_name}`:'Keep the family knowledge growing'}</b><em>{copy.helpBody}</em></span><ChevronRight size={17}/></button>}
   </div>
  </section>}
 </section>;
}
