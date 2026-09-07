"use client";
import {AlertTriangle,ArrowRight,BookOpenCheck,CalendarDays,Handshake,Lightbulb,Network,RefreshCw,Sparkles,UsersRound} from "lucide-react";
import type {NetworkActivity,NetworkAffiliatedEntity} from "../../core/network-os/contracts";
import type {NetworkGroup} from "../../capabilities/activity/remote";
import type {NetworkEntityRelationship} from "../../capabilities/template-product/remote";
import {useLanguage} from "../../lib/i18n";
import type {MessageToken} from "../../lib/i18n/catalog";

type Kind="family-association"|"association"|"organization"|"business-trust"|"franchise"|"alumni"|"professional";
type Target="explorer"|"directory"|"community"|"connections"|"contribute"|"guide";
type OutcomeCopy={eyebrow:MessageToken;title:MessageToken;focus:MessageToken;signals:[MessageToken,MessageToken,MessageToken];returnTitle:MessageToken;returnText:MessageToken};

const COPY:Record<Kind,OutcomeCopy>={
 "family-association":{eyebrow:"AlumniOutcomeEyebrowTxt",title:"AlumniOutcomeTitleTxt",focus:"AlumniOutcomeFocusTxt",signals:["AlumniSignal1Txt","AlumniSignal2Txt","AlumniSignal3Txt"],returnTitle:"AlumniReturnTitleTxt",returnText:"AlumniReturnDescTxt"},
 association:{eyebrow:"AlumniOutcomeEyebrowTxt",title:"AlumniOutcomeTitleTxt",focus:"AlumniOutcomeFocusTxt",signals:["AlumniSignal1Txt","AlumniSignal2Txt","AlumniSignal3Txt"],returnTitle:"AlumniReturnTitleTxt",returnText:"AlumniReturnDescTxt"},
 organization:{eyebrow:"OrgOutcomeEyebrowTxt",title:"OrgOutcomeTitleTxt",focus:"OrgOutcomeFocusTxt",signals:["OrgSignal1Txt","OrgSignal2Txt","OrgSignal3Txt"],returnTitle:"OrgReturnTitleTxt",returnText:"OrgReturnDescTxt"},
 "business-trust":{eyebrow:"TrustOutcomeEyebrowTxt",title:"TrustOutcomeTitleTxt",focus:"TrustOutcomeFocusTxt",signals:["TrustSignal1Txt","TrustSignal2Txt","TrustSignal3Txt"],returnTitle:"TrustReturnTitleTxt",returnText:"TrustReturnDescTxt"},
 franchise:{eyebrow:"FranchiseOutcomeEyebrowTxt",title:"FranchiseOutcomeTitleTxt",focus:"FranchiseOutcomeFocusTxt",signals:["FranchiseSignal1Txt","FranchiseSignal2Txt","FranchiseSignal3Txt"],returnTitle:"FranchiseReturnTitleTxt",returnText:"FranchiseReturnDescTxt"},
 alumni:{eyebrow:"AlumniOutcomeEyebrowTxt",title:"AlumniOutcomeTitleTxt",focus:"AlumniOutcomeFocusTxt",signals:["AlumniSignal1Txt","AlumniSignal2Txt","AlumniSignal3Txt"],returnTitle:"AlumniReturnTitleTxt",returnText:"AlumniReturnDescTxt"},
 professional:{eyebrow:"ProfessionalOutcomeEyebrowTxt",title:"ProfessionalOutcomeTitleTxt",focus:"ProfessionalOutcomeFocusTxt",signals:["ProfessionalSignal1Txt","ProfessionalSignal2Txt","ProfessionalSignal3Txt"],returnTitle:"ProfessionalReturnTitleTxt",returnText:"ProfessionalReturnDescTxt"}
};

export default function NetworkOutcomeHome({kind,entities,relationships,activities,groups,completeness,locationCount,onGo}:{kind:Kind;entities:readonly NetworkAffiliatedEntity[];relationships:readonly NetworkEntityRelationship[];activities:readonly NetworkActivity[];groups:readonly NetworkGroup[];completeness:number;locationCount:number;onGo:(target:Target)=>void}){
 const {t}=useLanguage();
 const c=COPY[kind], upcoming=activities.filter(a=>a.type==="event"&&a.startsAt&&new Date(a.startsAt).getTime()>Date.now()).length, knowledge=activities.filter(a=>a.type==="memory"||a.type==="milestone").length;
 const gaps=Math.max(0,Math.round(entities.length*(100-completeness)/100));
 return <>
  <section className="card outcome-command-center">
   <div className="outcome-command-head"><div><span className="warm-kicker"><Sparkles size={12}/> {t(c.eyebrow)}</span><h2>{t(c.title)}</h2><p>{t(c.focus)}</p></div><button className="btn primary" onClick={()=>onGo("connections")}><Network size={15}/> {t("ExploreUsefulPathsTxt")}</button></div>
   <div className="outcome-signal-grid">
    <button onClick={()=>onGo("connections")}><Handshake/><span><b>{relationships.length}</b><small>{t("KnownRelationshipPathsTxt")}</small></span><ArrowRight/></button>
    <button onClick={()=>onGo("community")}><BookOpenCheck/><span><b>{knowledge}</b><small>{t("ReusableLessonsEvidenceTxt")}</small></span><ArrowRight/></button>
    <button onClick={()=>onGo("community")}><UsersRound/><span><b>{groups.length}</b><small>{t("ActiveCirclesCommunitiesTxt")}</small></span><ArrowRight/></button>
    <button onClick={()=>onGo("contribute")}><AlertTriangle/><span><b>{gaps}</b><small>{t("EstimatedContextGapsTxt")}</small></span><ArrowRight/></button>
   </div>
   <div className="outcome-reasons">{c.signals.map((token,i)=><article key={token}><span>{i+1}</span><p>{t(token)}</p></article>)}</div>
  </section>
  <section className="return-loop-grid">
   <article className="card return-loop-card"><RefreshCw/><div><span className="warm-kicker">{t("ReturnLoopTxt")}</span><h3>{t(c.returnTitle)}</h3><p>{t(c.returnText)}</p><button className="btn small" onClick={()=>onGo("community")}>{t("SeeWhatChangedTxt")} <ArrowRight size={13}/></button></div></article>
   <article className="card return-loop-card"><CalendarDays/><div><span className="warm-kicker">{t("RightNowTxt")}</span><h3>{upcoming} {t("UpcomingTxt")} · {locationCount} {t("LocationsTxt")}</h3><p>{t("EventsGeographyReturnDescTxt")}</p><button className="btn small" onClick={()=>onGo("guide")}>{t("SeeRecommendedWorkflowTxt")} <ArrowRight size={13}/></button></div></article>
   <article className="card return-loop-card"><Lightbulb/><div><span className="warm-kicker">{t("NextBestActionTxt")}</span><h3>{completeness<80?t("ImproveMissingContextTxt"):t("ActivateNetworkTxt")}</h3><p>{completeness<80?t("CompleteAffiliationsDescTxt"):t("AskRealQuestionDescTxt")}</p><button className="btn small" onClick={()=>onGo(completeness<80?"contribute":"connections")}>{t("TakeActionTxt")} <ArrowRight size={13}/></button></div></article>
  </section>
 </>;
}
