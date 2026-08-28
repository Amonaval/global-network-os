"use client";
import {useLanguage} from "../../lib/i18n";
import {ArrowRight,CheckCircle2,Rocket,Route,ShieldCheck,Sparkles} from "lucide-react";

type Target="explorer"|"directory"|"community"|"connections"|"contribute"|"admin"|"guide"|"launch";
export default function NetworkMatureGuide({product,structureTitle,knowledgeTitle,helpTitle,isAdmin,isPlatformOwner,onGo}:{product:string;structureTitle:string;knowledgeTitle:string;helpTitle:string;isAdmin:boolean;isPlatformOwner:boolean;onGo:(target:Target)=>void}){
 const {t:tr}=useLanguage();
 const journeys=[
  {title:tr("UnderstandTheNetworkTxt"),body:structureTitle,target:"explorer" as Target},
  {title:tr("FindTheRightPathTxt"),body:"Open a person, business or location and understand how it connects to the rest of the network.",target:"connections" as Target},
  {title:knowledgeTitle,body:"Capture outcomes, lessons and evidence so knowledge survives beyond individual conversations.",target:"community" as Target},
  {title:helpTitle,body:"Turn a missing answer into a network request and capture the useful response for the next person.",target:"contribute" as Target}
 ];
 return <>
  <section className="card mature-guide-hero"><div><span className="warm-kicker"><Sparkles size={12}/> {tr("GoalBasedGuideTxt")}</span><h2>{tr("StartWithWhatYouNeedToAchieveTxt")}</h2><p>{product} {tr("IsUsefulWhenItHelpsSomeoneUnderstandTxt")}</p></div><Route/></section>
  <div className="mature-guide-journeys">{journeys.map((j,i)=><button className="card" key={j.title} onClick={()=>onGo(j.target)}><span>{i+1}</span><div><h3>{j.title}</h3><p>{j.body}</p></div><ArrowRight/></button>)}</div>
  <section className="card guide-governance"><ShieldCheck/><div><h3>{tr("GovernanceWithoutHiddenControlsTxt")}</h3><p>{tr("NetworkAdminsManageTheirNetworkPlatformOwnersTxt")}</p><div className="card-actions">{isAdmin&&<button className="btn small" onClick={()=>onGo("admin")}><CheckCircle2 size={14}/> {tr("NetworkAdminTxt")}</button>}{isPlatformOwner&&<button className="btn primary small" onClick={()=>onGo("launch")}><Rocket size={14}/> {tr("OpenLaunchControlTxt")}</button>}</div></div></section>
 </>;
}
