"use client";
import {useState} from "react";
import {ArrowRight,Heart,Link2,Plus,UserRound} from "lucide-react";
import {Member} from "../lib/types";

const RELS=[
  {value:"father",label:"Father",gender:"Male"},
  {value:"mother",label:"Mother",gender:"Female"},
  {value:"husband",label:"Husband",gender:"Male"},
  {value:"wife",label:"Wife",gender:"Female"},
  {value:"son",label:"Son",gender:"Male"},
  {value:"daughter",label:"Daughter",gender:"Female"},
] as const;

export default function QuickFamilyStart({viewer,suggestedName="",onAddMyself,onAddRelative,onImport,onBuildTogether,onDismiss}:{viewer?:Member;suggestedName?:string;onAddMyself:(name:string,gender:Member["gender"])=>Promise<void>;onAddRelative:(name:string,relationship:string,gender:Member["gender"])=>Promise<void>;onImport:()=>void;onBuildTogether?:()=>void;onDismiss:()=>void}){
 const [name,setName]=useState(viewer?"":suggestedName),[gender,setGender]=useState<Member["gender"]>("Male"),[relationship,setRelationship]=useState("father"),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const add=async()=>{if(!name.trim())return;setBusy(true);setError("");try{if(!viewer)await onAddMyself(name.trim(),gender);else{const rel=RELS.find(x=>x.value===relationship)!;await onAddRelative(name.trim(),relationship,rel.gender as Member["gender"]);setName("");}}catch(e:any){setError(e.message||"Could not add this person.")}finally{setBusy(false)}};
 return <section className="card quick-family-start">
   <div className="quick-family-start-copy"><span className="warm-kicker"><Heart size={12}/> Start with the people closest to you</span><h2>{viewer?`Build ${viewer.full_name.split(/\s+/)[0]}’s close family`:"Add yourself first"}</h2><p>{viewer?"Add a parent, partner or child with only a name. Everything else can come later.":"Your family already exists. Add yourself so the app can say “Father”, “Sister”, “Cousin” and show your personal family line."}</p></div>
   <div className="quick-family-start-form">
    {viewer&&<label><span>Relationship to you</span><select className="select" value={relationship} onChange={e=>setRelationship(e.target.value)}>{RELS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}</select></label>}
    <label><span>{viewer?"Their name":"Your name"}</span><input className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder={viewer?"e.g. Sunita Deshmukh":"e.g. Amit Deshmukh"} onKeyDown={e=>e.key==="Enter"&&add()}/></label>
    {!viewer&&<label><span>Gender <em>optional profile detail</em></span><select className="select" value={gender} onChange={e=>setGender(e.target.value as Member["gender"])}><option>Male</option><option>Female</option><option>Other</option></select></label>}
    <button className="btn primary" disabled={busy||!name.trim()} onClick={add}>{busy?"Adding…":<>{viewer?<Plus size={16}/>:<UserRound size={16}/>} {viewer?"Add relative":"Add myself"} <ArrowRight size={15}/></>}</button>
   </div>
   <div className="quick-family-start-alt">{onBuildTogether&&<button className="text-action quick-build-together" onClick={onBuildTogether}><Link2 size={14}/> Recommended: ask relatives through simple forms</button>}<button className="text-action" onClick={onImport}>Have a list? Use Excel / CSV</button><button className="text-action" onClick={onDismiss}>I’ll do this later</button></div>
   {error&&<div className="notice danger-text">{error}</div>}
 </section>
}
