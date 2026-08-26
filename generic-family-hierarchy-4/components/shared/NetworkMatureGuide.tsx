"use client";
import {ArrowRight,CheckCircle2,Rocket,Route,ShieldCheck,Sparkles} from "lucide-react";

type Target="explorer"|"directory"|"community"|"connections"|"contribute"|"admin"|"guide"|"launch";
export default function NetworkMatureGuide({product,structureTitle,knowledgeTitle,helpTitle,isAdmin,isPlatformOwner,onGo}:{product:string;structureTitle:string;knowledgeTitle:string;helpTitle:string;isAdmin:boolean;isPlatformOwner:boolean;onGo:(target:Target)=>void}){
 const journeys=[
  {title:"Understand the network",body:structureTitle,target:"explorer" as Target},
  {title:"Find the right path",body:"Open a person, business or location and understand how it connects to the rest of the network.",target:"connections" as Target},
  {title:knowledgeTitle,body:"Capture outcomes, lessons and evidence so knowledge survives beyond individual conversations.",target:"community" as Target},
  {title:helpTitle,body:"Turn a missing answer into a network request and capture the useful response for the next person.",target:"contribute" as Target}
 ];
 return <>
  <section className="card mature-guide-hero"><div><span className="warm-kicker"><Sparkles size={12}/> Goal-based guide</span><h2>Start with what you need to achieve</h2><p>{product} is useful when it helps someone understand context, reach the right person and capture the outcome—not when every field is perfectly filled.</p></div><Route/></section>
  <div className="mature-guide-journeys">{journeys.map((j,i)=><button className="card" key={j.title} onClick={()=>onGo(j.target)}><span>{i+1}</span><div><h3>{j.title}</h3><p>{j.body}</p></div><ArrowRight/></button>)}</div>
  <section className="card guide-governance"><ShieldCheck/><div><h3>Governance without hidden controls</h3><p>Network admins manage their network. Platform owners decide which capabilities are released. These remain separate permissions.</p><div className="card-actions">{isAdmin&&<button className="btn small" onClick={()=>onGo("admin")}><CheckCircle2 size={14}/> Network Admin</button>}{isPlatformOwner&&<button className="btn primary small" onClick={()=>onGo("launch")}><Rocket size={14}/> Open Launch Control</button>}</div></div></section>
 </>;
}
