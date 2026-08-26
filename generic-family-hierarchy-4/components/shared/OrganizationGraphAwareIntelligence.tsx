"use client";
import {useMemo,useState} from "react";
import {BrainCircuit,CheckCircle2,FileText,GitBranch,Search,Sparkles} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../../core/network-os/contracts";
import type {NetworkEntityRelationship} from "../../capabilities/template-product/remote";
import {answerOrganizationQuestion} from "../../capabilities/graph-aware-intelligence/orchestrator";
import {fetchOrganizationGraphAwareEvidence} from "../../capabilities/graph-aware-intelligence/remote";
import type {GraphAwareAnswer} from "../../capabilities/graph-aware-intelligence/contracts";
import {NetworkSectionHead} from "./NetworkUi";

export default function OrganizationGraphAwareIntelligence({entities,relationships,activities=[],dimensionKeys=[],onEntityOpen}:{entities:readonly NetworkAffiliatedEntity[];relationships:readonly NetworkEntityRelationship[];activities?:readonly NetworkActivity[];dimensionKeys?:readonly string[];onEntityOpen?:(entity:NetworkAffiliatedEntity)=>void}){
 const dataset=useMemo(()=>({entities,relationships,activities}),[entities,relationships,activities]);
 const prompts=["Who knows Identity Gateway best?","Who owns Identity Gateway?","What depends on Identity Gateway?","Why did we choose Redis?"];
 const [question,setQuestion]=useState(prompts[0]),[answer,setAnswer]=useState<GraphAwareAnswer|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const run=async(q=question)=>{const next=q.trim();if(!next)return;setQuestion(next);setBusy(true);setError("");try{const evidence=await fetchOrganizationGraphAwareEvidence(next);setAnswer(answerOrganizationQuestion(dataset,next,evidence,dimensionKeys));}catch(e:any){setError(e.message||"Evidence retrieval unavailable. Falling back to verified graph data.");setAnswer(answerOrganizationQuestion(dataset,next,{verified:[],documents:[]},dimensionKeys));}finally{setBusy(false)}};
 const open=(id?:string)=>{const e=id?entities.find(x=>x.entity.id===id):undefined;if(e)onEntityOpen?.(e)};
 return <div className="network-intelligence-center graph-aware-intelligence"><NetworkSectionHead kicker={<><BrainCircuit size={13}/> G9.1-C · Graph + evidence</>} title="Organizational Intelligence" description="Combine verified graph truth with authorized documentary evidence. The LLM is optional; graph truth is never rewritten by an answer."/>
  <section className="card ask-network-card"><div className="ask-network-head"><div><span className="warm-kicker"><Sparkles size={12}/> Ask Organization</span><h2>Ask who knows, who owns, what depends, or why.</h2><p>Answers combine deterministic graph reasoning with evidence already authorized for this network.</p></div>{answer&&<span className={`intelligence-confidence ${answer.confidence}`}><CheckCircle2 size={14}/>{answer.confidence} confidence</span>}</div>
   <div className="ask-network-input"><Search size={18}/><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")run()}} placeholder="Who owns Identity Gateway?"/><button className="btn primary" disabled={busy} onClick={()=>run()}>{busy?"Checking…":"Ask"}</button></div>
   <div className="intelligence-question-chips">{prompts.map(q=><button key={q} onClick={()=>run(q)}>{q}</button>)}</div>{error&&<p className="muted">{error}</p>}
   {answer&&<><article className="intelligence-answer"><span className="warm-kicker">{answer.intent} · {answer.synthesis}</span><h3>{answer.headline}</h3><p>{answer.answer}</p></article><div className="intelligence-evidence"><b>Why this answer</b>{answer.reasons.length?answer.reasons.map((r,i)=><button key={`${r.kind}-${i}`} onClick={()=>open(r.entityId)}><span>{r.kind==="graph"?<GitBranch/>:<FileText/>}</span><div><strong>{r.label}</strong><small>{r.detail}{r.freshness&&r.freshness!=="unknown"?` · ${r.freshness}`:""}</small></div></button>):<p className="muted">No matching graph or evidence signal was found.</p>}</div></>}
  </section><section className="card intelligence-principles"><BrainCircuit/><div><h3>G9.1-C intelligence contract</h3><p><b>Verified graph truth + authorized evidence + visible provenance.</b> Retrieval can enrich an answer, but it cannot silently create or alter canonical relationships.</p></div></section></div>;
}
