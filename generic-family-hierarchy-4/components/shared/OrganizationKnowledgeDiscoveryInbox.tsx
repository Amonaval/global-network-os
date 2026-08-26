"use client";
import {useEffect,useState} from "react";
import {BrainCircuit,CheckCircle2,GitMerge,ShieldCheck,XCircle} from "lucide-react";
import {fetchOrganizationKnowledgeCandidates,reviewOrganizationKnowledgeCandidate} from "../../capabilities/organization-knowledge/remote";
import type {OrganizationCandidate} from "../../capabilities/organization-knowledge/contracts";

function endpoint(v:any){return v?.label||v?.value||v?.candidateKey||v?.entityId||"Unknown"}
export default function OrganizationKnowledgeDiscoveryInbox(){
 const [rows,setRows]=useState<OrganizationCandidate[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const load=async()=>{try{setRows(await fetchOrganizationKnowledgeCandidates("candidate"))}catch(e:any){setMessage(e.message||"Could not load discoveries.")}};
 useEffect(()=>{load()},[]);
 const act=async(id:string,action:"accept"|"reject")=>{setBusy(true);try{await reviewOrganizationKnowledgeCandidate(id,action);setMessage(action==="accept"?"Discovery verified and safely committed where applicable.":"Discovery rejected; evidence history was preserved.");await load()}catch(e:any){setMessage(e.message||"Could not review discovery.")}finally{setBusy(false)}};
 return <section className="card">
  <div className="product-member-admin-head"><div><span className="warm-kicker"><BrainCircuit size={12}/> G9.1-B Knowledge Discovery</span><h3>Evidence-backed candidate facts</h3><p>AI discoveries remain candidates until an admin verifies them. Accepting expertise or supported relationships commits through a governed database function; raw model output never writes graph truth directly.</p></div><span className="entity-kind-pill">{rows.length} pending</span></div>
  {message&&<p className="muted">{message}</p>}
  <div className="product-member-list">{rows.map(r=><div className="product-member-row" key={r.id}><div className="product-member-identity"><GitMerge/><span><b>{endpoint(r.subject)} · {r.predicate.replaceAll("_"," ")} · {endpoint(r.object)}</b><small>{r.kind} · {Math.round(r.confidence*100)}% confidence · {r.evidenceIds.length} evidence item{r.evidenceIds.length===1?"":"s"}</small><small>{r.extractionMethod}{r.extractorVersion?` · ${r.extractorVersion}`:""}</small></span></div><div className="product-member-actions"><button className="btn small" disabled={busy} onClick={()=>act(r.id,"reject")}><XCircle size={14}/> Reject</button><button className="btn primary small" disabled={busy} onClick={()=>act(r.id,"accept")}><CheckCircle2 size={14}/> Verify</button></div></div>)}{rows.length===0&&<div className="notice success-notice"><ShieldCheck size={15}/><span>No pending candidate facts. Verified graph truth remains unchanged until evidence discoveries arrive.</span></div>}</div>
 </section>;
}
