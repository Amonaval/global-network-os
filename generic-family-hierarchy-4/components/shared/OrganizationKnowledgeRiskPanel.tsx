"use client";
import {useLanguage} from "../../lib/i18n";
import {useEffect,useMemo,useState} from "react";
import {AlertTriangle,CheckCircle2,RefreshCw,ShieldAlert,UserRoundSearch} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../../core/network-os/contracts";
import type {NetworkEntityRelationship} from "../../capabilities/template-product/remote";
import {buildOrganizationKnowledgeRiskReport} from "../../capabilities/organization-risk/engine";
import {fetchOrganizationKnowledgeRiskBackend} from "../../capabilities/organization-risk/remote";
import type {OrganizationKnowledgeRiskBackend} from "../../capabilities/organization-risk/contracts";
import {NetworkSectionHead} from "./NetworkUi";
const empty:OrganizationKnowledgeRiskBackend={unansweredQuestions:[],staleEvidenceCount:0,conflictedAssertionCount:0,verifiedAssertionCount:0,evidenceCount:0};
export default function OrganizationKnowledgeRiskPanel({entities,relationships,activities=[]}:{entities:readonly NetworkAffiliatedEntity[];relationships:readonly NetworkEntityRelationship[];activities?:readonly NetworkActivity[]}){
 const {t:tr}=useLanguage();
 const [backend,setBackend]=useState(empty),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const load=async()=>{setBusy(true);setError("");try{setBackend(await fetchOrganizationKnowledgeRiskBackend())}catch(e:any){setError(e.message||"Knowledge-risk signals unavailable.")}finally{setBusy(false)}};
 useEffect(()=>{void load()},[]);const report=useMemo(()=>buildOrganizationKnowledgeRiskReport({dataset:{entities,relationships,activities},backend}),[entities,relationships,activities,backend]);
 return <section className="card organization-risk-loop"><NetworkSectionHead kicker={<><ShieldAlert size={13}/> {tr("G91DKnowledgeRiskLoopTxt")}</>} title={tr("OrganizationalKnowledgeRiskTxt")} description={tr("ProactiveDeterministicSignalsFromVerifiedOwnershipDependenciesTxt")}/>
  <div className="intelligence-metric-row"><div><strong>{report.score}</strong><span>{tr("RiskScoreTxt")}</span></div><div><strong>{report.signals.filter(x=>x.severity==="attention").length}</strong><span>{tr("AttentionItemsTxt")}</span></div><div><strong>{backend.evidenceCount}</strong><span>{tr("EvidenceRecordsTxt")}</span></div><div><strong>{backend.verifiedAssertionCount}</strong><span>{tr("VerifiedAssertionsTxt")}</span></div></div>
  <div className="card-actions"><span className={`intelligence-confidence ${report.status}`}>{report.status==="healthy"?<CheckCircle2 size={14}/>:<AlertTriangle size={14}/>} {report.status}</span><button className="btn small" disabled={busy} onClick={()=>void load()}><RefreshCw size={14}/>{busy?tr("RefreshingTxt"):tr("RefreshRisksTxt")}</button></div>{error&&<p className="muted">{error}</p>}
  <div className="intelligence-evidence">{report.signals.length?report.signals.slice(0,8).map(s=><article key={s.id} className="knowledge-risk-card"><div><span className="warm-kicker">{s.kind.replaceAll("_"," ")} · {s.score}/100</span><h3>{s.title}</h3><p>{s.summary}</p><small>{s.evidence.join(" · ")}</small></div><div className="knowledge-risk-action"><UserRoundSearch size={16}/><span>{s.action}</span></div></article>):<p className="muted">{tr("NoMaterialOrganizationalKnowledgeRisksDetectedFromTxt")}</p>}</div>
 </section>;
}
