"use client";
import {DEFAULT_CATALOG} from "../../lib/i18n/catalog";
import {useLanguage} from "../../lib/i18n";
import {useMemo,useState} from "react";
import {AlertTriangle,ArrowRight,BrainCircuit,CheckCircle2,GitBranch,Lightbulb,Search,Sparkles,UsersRound} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../../core/network-os/contracts";
import type {NetworkEntityRelationship} from "../../capabilities/template-product/remote";
import type {IntelligenceVerticalKind} from "../../core/intelligence/contracts";
import {analyzeHealth,askNetwork,buildInsights,suggestedQuestions} from "../../core/intelligence/engine";
import {NetworkMetric,NetworkSectionHead} from "./NetworkUi";

type Target="explorer"|"directory"|"community"|"connections"|"contribute"|"intelligence";
const COPY={
 family:{title:DEFAULT_CATALOG.FamilyIntelligenceTxt,description:DEFAULT_CATALOG.FindInformationGapsUsefulConnectionsAndSharedTxt},
 alumni:{title:DEFAULT_CATALOG.AlumniIntelligenceTxt,description:DEFAULT_CATALOG.TurnCohortCompanyCityAndRelationshipContextTxt},
 organization:{title:DEFAULT_CATALOG.OrganizationalIntelligenceTxt,description:DEFAULT_CATALOG.FindExpertiseStructuralRiskOwnershipContextAndTxt},
 "business-trust":{title:DEFAULT_CATALOG.TrustIntelligenceTxt,description:DEFAULT_CATALOG.UseProvenanceSharedContextAndKnownRelationshipTxt},
 franchise:{title:DEFAULT_CATALOG.FranchiseIntelligenceTxt,description:DEFAULT_CATALOG.FindReusableOperatingKnowledgePeerLocationsAndTxt},
 professional:{title:DEFAULT_CATALOG.ProfessionalIntelligenceTxt,description:DEFAULT_CATALOG.FindTrustedExpertiseWarmReferralPathsCredentialTxt}
} as const;
export default function NetworkIntelligenceCenter({kind,entities,relationships,activities=[],dimensionKeys=[],onGo,onEntityOpen}:{kind:IntelligenceVerticalKind;entities:readonly NetworkAffiliatedEntity[];relationships:readonly NetworkEntityRelationship[];activities?:readonly NetworkActivity[];dimensionKeys?:readonly string[];onGo:(target:Target)=>void;onEntityOpen?:(entity:NetworkAffiliatedEntity)=>void}){
 const {t:tr}=useLanguage();
 const dataset=useMemo(()=>({entities,relationships,activities}),[entities,relationships,activities]);
 const health=useMemo(()=>analyzeHealth(dataset,dimensionKeys),[dataset,dimensionKeys]);
 const insights=useMemo(()=>buildInsights(kind,dataset,dimensionKeys),[kind,dataset,dimensionKeys]);
 const questions=useMemo(()=>suggestedQuestions(kind),[kind]);
 const [question,setQuestion]=useState<string>(questions[0]||""),[answer,setAnswer]=useState(()=>askNetwork(kind,dataset,questions[0]||"",dimensionKeys));
 const run=(q=question)=>{const next=q.trim();if(!next)return;setQuestion(next);setAnswer(askNetwork(kind,dataset,next,dimensionKeys));};
 const entity=(id?:string)=>id?entities.find(e=>e.entity.id===id):undefined;
 return <div className="network-intelligence-center">
  <NetworkSectionHead kicker={<><BrainCircuit size={13}/> {tr("G9PermissionAwareIntelligenceTxt")}</>} title={COPY[kind].title} description={COPY[kind].description}/>
  <section className="network-metric-grid intelligence-metrics"><NetworkMetric value={`${health.completeness}%`} label={tr("ContextCompletenessTxt")}/><NetworkMetric value={health.isolatedEntityIds.length} label={tr("IsolatedEntitiesTxt")}/><NetworkMetric value={health.missingLinkCandidates.length} label={tr("LinkOpportunitiesTxt")}/><NetworkMetric value={health.highConnectivity[0]?.degree||0} label={tr("TopConnectivityTxt")}/></section>
  <section className="card ask-network-card"><div className="ask-network-head"><div><span className="warm-kicker"><Sparkles size={12}/> {tr("AskNetworkTxt")}</span><h2>{tr("AskAQuestionGetEvidenceNotATxt")}</h2><p>{tr("G9AnswersFromDeterministicNetworkDataFirstTxt")}</p></div><span className={`intelligence-confidence ${answer.confidence}`}><CheckCircle2 size={14}/>{answer.confidence} {tr("Confidence2Txt")}</span></div><div className="ask-network-input"><Search size={18}/><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")run()}} placeholder={tr("AskAboutExpertisePathsGapsSuppliersLocationsTxt")}/><button className="btn primary" onClick={()=>run()}>{tr("AskTxt")}</button></div><div className="intelligence-question-chips">{questions.map(q=><button key={q} onClick={()=>run(q)}>{q}</button>)}</div><article className="intelligence-answer"><span className="warm-kicker">{tr("AnswerTxt")}</span><h3>{answer.headline}</h3><p>{answer.answer}</p></article><div className="intelligence-evidence"><b>{tr("WhyThisAnswerTxt")}</b>{answer.evidence.length?answer.evidence.map((e,i)=><button key={`${e.kind}-${i}`} onClick={()=>{const found=entity(e.entityId);if(found)onEntityOpen?.(found)}}><span>{e.kind==="health"?<AlertTriangle/>:e.kind==="relationship"?<GitBranch/>:<Lightbulb/>}</span><div><strong>{e.label}</strong><small>{e.detail}</small></div></button>):<p className="muted">{tr("NoStrongEvidenceMatchedAskWithATxt")}</p>}</div></section>
  <section className="intelligence-insight-grid">{insights.map(x=><article className={`card intelligence-insight ${x.severity}`} key={x.id}><div className="intelligence-insight-icon">{x.severity==="attention"?<AlertTriangle/>:x.id==="connector"?<UsersRound/>:<Lightbulb/>}</div><span className="warm-kicker">{x.severity}</span><h3>{x.title}</h3><p>{x.summary}</p><small>{x.reason}</small><div className="intelligence-proof-row">{x.evidence.slice(0,3).map((e,i)=><span key={i}>{e.detail}</span>)}</div><button className="btn small" onClick={()=>onGo(x.actionTarget)}>{x.actionLabel}<ArrowRight size={13}/></button></article>)}</section>
  <section className="card intelligence-principles"><BrainCircuit/><div><h3>{tr("G9IntelligenceContractTxt")}</h3><p><b>{tr("TenantIsolatedPermissionAwareProvenanceVisibleDeterministicTxt")}</b> {tr("AICanBeAddedLaterOnlyToTxt")}</p></div></section>
 </div>;
}
