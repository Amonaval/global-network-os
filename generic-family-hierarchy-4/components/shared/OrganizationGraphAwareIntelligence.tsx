"use client";
import {useLanguage} from "../../lib/i18n";
import {useMemo,useState} from "react";
import {BrainCircuit,CheckCircle2,FileText,GitBranch,Search,Sparkles} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../../core/network-os/contracts";
import type {NetworkEntityRelationship} from "../../capabilities/template-product/remote";
import {answerOrganizationQuestion} from "../../capabilities/graph-aware-intelligence/orchestrator";
import {fetchOrganizationGraphAwareEvidence} from "../../capabilities/graph-aware-intelligence/remote";
import {recordOrganizationIntelligenceQuery} from "../../capabilities/organization-risk/remote";
import OrganizationKnowledgeRiskPanel from "./OrganizationKnowledgeRiskPanel";
import type {GraphAwareAnswer} from "../../capabilities/graph-aware-intelligence/contracts";
import {NetworkSectionHead} from "./NetworkUi";

export default function OrganizationGraphAwareIntelligence({entities,relationships,activities=[],dimensionKeys=[],onEntityOpen,isAdmin=false}:{entities:readonly NetworkAffiliatedEntity[];relationships:readonly NetworkEntityRelationship[];activities?:readonly NetworkActivity[];dimensionKeys?:readonly string[];onEntityOpen?:(entity:NetworkAffiliatedEntity)=>void;isAdmin?:boolean}){
 const {t:tr}=useLanguage();
 const dataset=useMemo(()=>({entities,relationships,activities}),[entities,relationships,activities]);
 const prompts=["Who knows Identity Gateway best?","Who owns Identity Gateway?","What depends on Identity Gateway?","Why did we choose Redis?"];
 const [question,setQuestion]=useState<string>(prompts[0]),[answer,setAnswer]=useState<GraphAwareAnswer|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const run=async(q=question)=>{const next=q.trim();if(!next)return;setQuestion(next);setBusy(true);setError("");try{const evidence=await fetchOrganizationGraphAwareEvidence(next);const resolved=answerOrganizationQuestion(dataset,next,evidence,dimensionKeys);setAnswer(resolved);void recordOrganizationIntelligenceQuery(next,resolved).catch(()=>{});}catch(e:any){setError(e.message||"Evidence retrieval unavailable. Falling back to verified graph data.");const resolved=answerOrganizationQuestion(dataset,next,{verified:[],documents:[]},dimensionKeys);setAnswer(resolved);void recordOrganizationIntelligenceQuery(next,resolved).catch(()=>{});}finally{setBusy(false)}};
 const open=(id?:string)=>{const e=id?entities.find(x=>x.entity.id===id):undefined;if(e)onEntityOpen?.(e)};
 const graphReasons=answer?.reasons.filter(r=>r.kind==="graph")||[],supportingReasons=answer?.reasons.filter(r=>r.kind!=="graph")||[];
 return <div className="network-intelligence-center graph-aware-intelligence"><NetworkSectionHead kicker={<><BrainCircuit size={13}/> {tr("G91CGraphEvidenceTxt")}</>} title={tr("OrganizationalIntelligenceTxt")} description={tr("CombineVerifiedGraphTruthWithAuthorizedDocumentaryTxt")}/>
  <section className="card ask-network-card"><div className="ask-network-head"><div><span className="warm-kicker"><Sparkles size={12}/> {tr("AskOrganizationTxt")}</span><h2>{tr("AskWhoKnowsWhoOwnsWhatDependsTxt")}</h2><p>{tr("AnswersCombineDeterministicGraphReasoningWithEvidenceTxt")}</p></div>{answer&&<span className={`intelligence-confidence ${answer.confidence}`}><CheckCircle2 size={14}/>{answer.confidence} {tr("Confidence2Txt")}</span>}</div>
   <div className="ask-network-input"><Search size={18}/><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")run()}} placeholder={tr("WhoOwnsIdentityGatewayTxt")}/><button className="btn primary" disabled={busy} onClick={()=>run()}>{busy?tr("CheckingTxt"):tr("AskTxt")}</button></div>
   <div className="intelligence-question-chips">{prompts.map(q=><button key={q} onClick={()=>run(q)}>{q}</button>)}</div>{error&&<p className="muted">{error}</p>}
   {answer&&<><article className="intelligence-answer"><span className="warm-kicker">{answer.intent} · {answer.synthesis}</span><h3>{answer.headline}</h3><p>{answer.answer}</p>{supportingReasons[0]&&<p className="intelligence-answer-why"><b>{tr("WhyTxt")}</b> {supportingReasons[0].label}{supportingReasons[0].freshness&&supportingReasons[0].freshness!=="unknown"?` · ${supportingReasons[0].freshness}`:""}</p>}</article>
    <div className="intelligence-disclosure"><details><summary>{tr("ViewSupportingEvidenceTxt")}{supportingReasons.length})</summary><div className="intelligence-evidence">{supportingReasons.length?supportingReasons.slice(0,6).map((r,i)=><button key={`${r.kind}-${i}`} onClick={()=>open(r.entityId)}><span><FileText/></span><div><strong>{r.label}</strong><small>{r.detail}{r.freshness&&r.freshness!=="unknown"?` · ${r.freshness}`:""}</small></div></button>):<p className="muted">{tr("NoDocumentaryEvidenceMatchedThisQuestionTxt")}</p>}</div></details>
    <details><summary>{tr("TechnicalGraphReasoningTxt")}{graphReasons.length})</summary><div className="intelligence-evidence">{graphReasons.length?graphReasons.map((r,i)=><button key={`graph-${i}`} onClick={()=>open(r.entityId)}><span><GitBranch/></span><div><strong>{r.label}</strong><small>{r.detail}</small></div></button>):<p className="muted">{tr("NoGraphReasoningDetailsTxt")}</p>}</div></details></div></>}
  </section>{isAdmin&&<OrganizationKnowledgeRiskPanel entities={entities} relationships={relationships} activities={activities}/>}<section className="card intelligence-principles"><BrainCircuit/><div><h3>{tr("G91CIntelligenceContractTxt")}</h3><p><b>{tr("VerifiedGraphTruthAuthorizedEvidenceVisibleProvenanceTxt")}</b> {tr("RetrievalCanEnrichAnAnswerButItTxt")}</p></div></section></div>;
}
