"use client";
import {useMemo,useState} from "react";
import {AlertTriangle,ArrowRight,BrainCircuit,CheckCircle2,GitBranch,Lightbulb,Search,Sparkles,UsersRound} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../../core/network-os/contracts";
import type {NetworkEntityRelationship} from "../../capabilities/template-product/remote";
import type {IntelligenceVerticalKind} from "../../core/intelligence/contracts";
import {analyzeHealth,askNetwork,buildInsights,suggestedQuestions} from "../../core/intelligence/engine";
import {NetworkMetric,NetworkSectionHead} from "./NetworkUi";

type Target="explorer"|"directory"|"community"|"connections"|"contribute"|"intelligence";
const COPY={
 family:{title:"Family Intelligence",description:"Find information gaps, useful connections and shared context without exposing private data beyond your current permissions."},
 alumni:{title:"Alumni Intelligence",description:"Turn cohort, company, city and relationship context into mentoring, discovery and warm professional paths."},
 organization:{title:"Organizational Intelligence",description:"Find expertise, structural risk, ownership context and useful connection paths from the network you are allowed to see."},
 "business-trust":{title:"Trust Intelligence",description:"Use provenance, shared context and known relationship paths to support sourcing and warm introductions."},
 franchise:{title:"Franchise Intelligence",description:"Find reusable operating knowledge, peer locations and network gaps across the franchise system."}
} as const;
export default function NetworkIntelligenceCenter({kind,entities,relationships,activities=[],dimensionKeys=[],onGo,onEntityOpen}:{kind:IntelligenceVerticalKind;entities:readonly NetworkAffiliatedEntity[];relationships:readonly NetworkEntityRelationship[];activities?:readonly NetworkActivity[];dimensionKeys?:readonly string[];onGo:(target:Target)=>void;onEntityOpen?:(entity:NetworkAffiliatedEntity)=>void}){
 const dataset=useMemo(()=>({entities,relationships,activities}),[entities,relationships,activities]);
 const health=useMemo(()=>analyzeHealth(dataset,dimensionKeys),[dataset,dimensionKeys]);
 const insights=useMemo(()=>buildInsights(kind,dataset,dimensionKeys),[kind,dataset,dimensionKeys]);
 const questions=useMemo(()=>suggestedQuestions(kind),[kind]);
 const [question,setQuestion]=useState(questions[0]||""),[answer,setAnswer]=useState(()=>askNetwork(kind,dataset,questions[0]||"",dimensionKeys));
 const run=(q=question)=>{const next=q.trim();if(!next)return;setQuestion(next);setAnswer(askNetwork(kind,dataset,next,dimensionKeys));};
 const entity=(id?:string)=>id?entities.find(e=>e.entity.id===id):undefined;
 return <div className="network-intelligence-center">
  <NetworkSectionHead kicker={<><BrainCircuit size={13}/> G9 · Permission-aware intelligence</>} title={COPY[kind].title} description={COPY[kind].description}/>
  <section className="network-metric-grid intelligence-metrics"><NetworkMetric value={`${health.completeness}%`} label="Context completeness"/><NetworkMetric value={health.isolatedEntityIds.length} label="Isolated entities"/><NetworkMetric value={health.missingLinkCandidates.length} label="Link opportunities"/><NetworkMetric value={health.highConnectivity[0]?.degree||0} label="Top connectivity"/></section>
  <section className="card ask-network-card"><div className="ask-network-head"><div><span className="warm-kicker"><Sparkles size={12}/> Ask Network</span><h2>Ask a question. Get evidence, not a black box.</h2><p>G9 answers from deterministic network data first. It does not send the unrestricted network to an LLM.</p></div><span className={`intelligence-confidence ${answer.confidence}`}><CheckCircle2 size={14}/>{answer.confidence} confidence</span></div><div className="ask-network-input"><Search size={18}/><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")run()}} placeholder="Ask about expertise, paths, gaps, suppliers, locations…"/><button className="btn primary" onClick={()=>run()}>Ask</button></div><div className="intelligence-question-chips">{questions.map(q=><button key={q} onClick={()=>run(q)}>{q}</button>)}</div><article className="intelligence-answer"><span className="warm-kicker">Answer</span><h3>{answer.headline}</h3><p>{answer.answer}</p></article><div className="intelligence-evidence"><b>Why this answer</b>{answer.evidence.length?answer.evidence.map((e,i)=><button key={`${e.kind}-${i}`} onClick={()=>{const found=entity(e.entityId);if(found)onEntityOpen?.(found)}}><span>{e.kind==="health"?<AlertTriangle/>:e.kind==="relationship"?<GitBranch/>:<Lightbulb/>}</span><div><strong>{e.label}</strong><small>{e.detail}</small></div></button>):<p className="muted">No strong evidence matched. Ask with a specific city, company, skill, service, team, batch, store or relationship need.</p>}</div></section>
  <section className="intelligence-insight-grid">{insights.map(x=><article className={`card intelligence-insight ${x.severity}`} key={x.id}><div className="intelligence-insight-icon">{x.severity==="attention"?<AlertTriangle/>:x.id==="connector"?<UsersRound/>:<Lightbulb/>}</div><span className="warm-kicker">{x.severity}</span><h3>{x.title}</h3><p>{x.summary}</p><small>{x.reason}</small><div className="intelligence-proof-row">{x.evidence.slice(0,3).map((e,i)=><span key={i}>{e.detail}</span>)}</div><button className="btn small" onClick={()=>onGo(x.actionTarget)}>{x.actionLabel}<ArrowRight size={13}/></button></article>)}</section>
  <section className="card intelligence-principles"><BrainCircuit/><div><h3>G9 intelligence contract</h3><p><b>Tenant isolated · permission aware · provenance visible · deterministic first.</b> AI can be added later only to summarize already-authorized evidence, never as an unrestricted alternate data path.</p></div></section>
 </div>;
}
