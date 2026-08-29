"use client";
import {useEffect,useMemo,useState} from "react";
import {Activity,Building2,Globe2,Layers3,Network,Search,ShieldCheck,Sparkles,Tag,UsersRound} from "lucide-react";
import {fetchMyUmbrellaRuntimeSummaries,fetchUmbrellaNetworkParticipants} from "../capabilities/federation/umbrella-runtime-remote";
import type {UmbrellaNetworkParticipant,UmbrellaRuntimeSummary} from "../core/federation/umbrella-runtime";
import {UMBRELLA_RUNTIME_GUARDRAILS} from "../core/federation/umbrella-runtime";
import {useLanguage} from "../lib/i18n";

export default function FederationUmbrellaRuntime(){
 const {t:tr}=useLanguage();
 const [summaries,setSummaries]=useState<UmbrellaRuntimeSummary[]>([]),[participants,setParticipants]=useState<UmbrellaNetworkParticipant[]>([]),[umbrellaId,setUmbrellaId]=useState(""),[query,setQuery]=useState(""),[vertical,setVertical]=useState("all"),[message,setMessage]=useState("");
 const loadSummaries=async()=>{const rows=await fetchMyUmbrellaRuntimeSummaries();setSummaries(rows);setUmbrellaId(v=>v&&rows.some(x=>x.umbrellaId===v)?v:(rows[0]?.umbrellaId||""))};
 useEffect(()=>{void loadSummaries().catch((e:any)=>setMessage(e.message||tr("NF3LoadFailedTxt")))},[]);
 useEffect(()=>{if(!umbrellaId){setParticipants([]);return}void fetchUmbrellaNetworkParticipants(umbrellaId).then(setParticipants).catch((e:any)=>setMessage(e.message||tr("NF3ParticipantsFailedTxt")))},[umbrellaId]);
 const current=summaries.find(x=>x.umbrellaId===umbrellaId);
 const verticals=useMemo(()=>Array.from(new Set(participants.map(x=>x.verticalKind))).sort(),[participants]);
 const filtered=useMemo(()=>participants.filter(x=>(vertical==="all"||x.verticalKind===vertical)&&(!query.trim()||`${x.networkName} ${x.passportTagline} ${x.passportLocation} ${x.passportCapabilities.join(" ")} ${x.passportScopes.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))),[participants,query,vertical]);
 const capabilityLeaders=useMemo(()=>{const m=new Map<string,number>();participants.forEach(p=>p.passportCapabilities.forEach(c=>m.set(c,(m.get(c)||0)+1)));return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).slice(0,8)},[participants]);
 const scopeLeaders=useMemo(()=>{const m=new Map<string,number>();participants.forEach(p=>p.passportScopes.forEach(c=>m.set(c,(m.get(c)||0)+1)));return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).slice(0,8)},[participants]);
 if(!summaries.length&&!message)return null;
 return <section className="card nf3-runtime-card">
  <div className="nf3-head"><div><span className="warm-kicker"><Network size={13}/> {tr("NF3KickerTxt")}</span><h2>{tr("NF3TitleTxt")}</h2><p>{tr("NF3DescTxt")}</p></div><span className="nf3-badge"><ShieldCheck size={14}/>{tr("NF3NetworksNotPeopleTxt")}</span></div>
  {summaries.length>0&&<>
   <div className="nf3-toolbar"><label>{tr("NF3UmbrellaTxt")}<select value={umbrellaId} onChange={e=>setUmbrellaId(e.target.value)}>{summaries.map(x=><option key={x.umbrellaId} value={x.umbrellaId}>{x.name}</option>)}</select></label>{current&&<div className="nf3-identity"><Building2 size={16}/><span><b>{current.name}</b><small>{current.umbrellaType}{current.locationLabel?` · ${current.locationLabel}`:""}</small></span><em>{current.role}</em></div>}</div>
   {current&&<><div className="nf3-metrics">
    <article><UsersRound/><span><b>{current.approvedNetworks}</b><small>{tr("NF3ApprovedNetworksTxt")}</small></span></article>
    <article><Activity/><span><b>{current.requestedNetworks}</b><small>{tr("NF3PendingTxt")}</small></span></article>
    <article><ShieldCheck/><span><b>{current.visiblePassportNetworks}/{current.approvedNetworks}</b><small>{tr("NF3VisiblePassportsTxt")}</small></span></article>
    <article><Layers3/><span><b>{current.verticalCount}</b><small>{tr("NF3VerticalsTxt")}</small></span></article>
    <article><Sparkles/><span><b>{current.healthScore}</b><small>{tr("NF3HealthScoreTxt")}</small></span><em className={`nf3-health ${current.health}`}>{current.health}</em></article>
   </div>
   <div className="nf3-health-note"><ShieldCheck size={15}/><span><b>{tr("NF3HealthPrivacyTitleTxt")}</b><small>{tr("NF3HealthPrivacyDescTxt")}</small></span></div></>}
   <div className="nf3-insights">
    <article><h3><Tag size={15}/>{tr("NF3CapabilityMixTxt")}</h3>{capabilityLeaders.length?<div className="nf3-chip-list">{capabilityLeaders.map(([k,n])=><span key={k}>{k}<b>{n}</b></span>)}</div>:<p>{tr("NF3NoCapabilitiesTxt")}</p>}</article>
    <article><h3><Sparkles size={15}/>{tr("NF3ScopeMixTxt")}</h3>{scopeLeaders.length?<div className="nf3-chip-list">{scopeLeaders.map(([k,n])=><span key={k}>{k}<b>{n}</b></span>)}</div>:<p>{tr("NF3NoScopesTxt")}</p>}</article>
   </div>
   <div className="nf3-directory-head"><div><h3>{tr("NF3DirectoryTitleTxt")}</h3><p>{tr("NF3DirectoryDescTxt")}</p></div><div className="nf3-filters"><div><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr("NF3SearchPlaceholderTxt")}/></div><select value={vertical} onChange={e=>setVertical(e.target.value)}><option value="all">{tr("NF3AllVerticalsTxt")}</option>{verticals.map(v=><option key={v} value={v}>{v}</option>)}</select></div></div>
   <div className="nf3-directory">{filtered.length===0?<p className="nf3-empty">{tr("NF3NoParticipantsTxt")}</p>:filtered.map(p=><article key={p.affiliationId} className="nf3-network-row"><div className="nf3-network-icon"><Building2 size={18}/></div><div className="nf3-network-copy"><div><small>{p.verticalKind} · {p.relationshipType}</small><h4>{p.networkName}</h4></div>{p.passportVisible?<><b>{p.passportTagline||tr("NF3PassportFallbackTxt")}</b><p>{p.passportSummary||tr("NF3SummaryFallbackTxt")}</p><div className="nf3-meta">{p.passportLocation&&<span><Globe2 size={12}/>{p.passportLocation}</span>}<span><ShieldCheck size={12}/>{p.passportVerification}</span><span>{p.passportVisibility}</span>{p.directoryDiscoverable&&<span>{tr("NF3DirectoryEligibleTxt")}</span>}</div><div className="nf3-tags">{p.passportCapabilities.slice(0,4).map(x=><em key={`c-${x}`}>{x}</em>)}{p.passportScopes.slice(0,3).map(x=><em key={`s-${x}`}>{x}</em>)}</div></>:<div className="nf3-withheld"><ShieldCheck size={14}/><span><b>{tr("NF3PassportWithheldTxt")}</b><small>{tr("NF3PassportWithheldHelpTxt")}</small></span></div>}</div>{p.contextLabel&&<aside>{p.contextLabel}</aside>}</article>)}</div>
  </>}
  {message&&<div className="nf3-message">{message}</div>}
  <details className="nf3-guardrails"><summary><ShieldCheck size={15}/>{tr("NF3GuardrailsTxt")}</summary><div>{UMBRELLA_RUNTIME_GUARDRAILS.map(x=><p key={x}><b>✓</b>{x}</p>)}</div></details>
 </section>;
}
