"use client";
import {ArrowRight,BookOpen,Rocket,ShieldCheck} from "lucide-react";
import {getVerticalDefinition} from "../../app-shell/vertical-registry";
import {getContextualGuide,type ContextualGuideRole,type ContextualGuideTarget} from "../../core/guide/contextual-guide";
import type {NetworkVerticalKind} from "../../core/verticals/contracts";
import {useLanguage,type MessageToken} from "../../lib/i18n";
export default function NetworkContextualGuide({kind,role,isPlatformOwner=false,onGo}:{kind:NetworkVerticalKind;role:ContextualGuideRole;isPlatformOwner?:boolean;onGo:(target:ContextualGuideTarget)=>void}){
 const {t}=useLanguage(),definition=getVerticalDefinition(kind),tasks=getContextualGuide(kind,role,isPlatformOwner);
 return <section className="card xp7-context-guide"><div className="xp7-guide-head"><div><span className="warm-kicker"><BookOpen size={12}/> {t("XP7ContextGuideTxt")}</span><h2>{t("XP7GuideStartTxt")}</h2><p>{definition.displayName} · {t(role==="member"?"XP7GuideMemberDescTxt":"XP7GuideAdminDescTxt")}</p></div>{role!=="member"?<ShieldCheck/>:<Rocket/>}</div><div className="xp7-guide-tasks">{tasks.map(task=><button key={task.id} onClick={()=>onGo(task.target)}><span><b>{t(task.titleToken as MessageToken)}</b><small>{t(task.descriptionToken as MessageToken)}</small></span><ArrowRight size={15}/></button>)}</div></section>;
}
