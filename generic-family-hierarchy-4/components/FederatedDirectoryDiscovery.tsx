"use client";
import {useEffect,useMemo,useState} from "react";
import {Building2,Compass,Globe2,Network,Search,ShieldCheck,Sparkles,Tags} from "lucide-react";
import {searchFederatedNetworks} from "../capabilities/federation/federated-discovery-remote";
import {FEDERATED_DISCOVERY_GUARDRAILS,type FederatedNetworkDiscoveryResult} from "../core/federation/federated-discovery";
import {useLanguage} from "../lib/i18n";

export default function FederatedDirectoryDiscovery(){
 const {t:tr}=useLanguage();
 const [query,setQuery]=useState(""),[purpose,setPurpose]=useState("all"),[results,setResults]=useState<FederatedNetworkDiscoveryResult[]>([]),[message,setMessage]=useState(""),[loading,setLoading]=useState(false);
 const run=async()=>{setLoading(true);setMessage("");try{setResults(await searchFederatedNetworks(query,purpose))}catch(e:any){setMessage(e.message||tr("NF4SearchFailedTxt"))}finally{setLoading(false)}};
 useEffect(()=>{void run()},[]);
 const purposeOptions=useMemo(()=>Array.from(new Set(results.flatMap(r=>r.participationScopes))).sort(),[results]);
 return <section className="card nf4-discovery-card">
  <div className="nf4-head"><div><span className="warm-kicker"><Compass size={13}/> {tr("NF4KickerTxt")}</span><h2>{tr("NF4TitleTxt")}</h2><p>{tr("NF4DescTxt")}</p></div><span className="nf4-badge"><ShieldCheck size={14}/>{tr("NF4NetworksOnlyTxt")}</span></div>
  <div className="nf4-searchbar"><div><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void run()}} placeholder={tr("NF4SearchPlaceholderTxt")}/></div><select value={purpose} onChange={e=>setPurpose(e.target.value)}><option value="all">{tr("NF4AllPurposesTxt")}</option>{purposeOptions.map(x=><option key={x} value={x}>{x}</option>)}</select><button className="btn primary" onClick={()=>void run()} disabled={loading}>{loading?tr("NF4SearchingTxt"):tr("NF4SearchTxt")}</button></div>
  <div className="nf4-purpose-note"><Sparkles size={15}/><span><b>{tr("NF4PurposeTitleTxt")}</b><small>{tr("NF4PurposeDescTxt")}</small></span></div>
  <div className="nf4-results">{results.length===0&&!loading?<p className="nf4-empty">{tr("NF4EmptyTxt")}</p>:results.map(r=><article key={`${r.umbrellaId}-${r.networkId}-${r.sourceNetworkId}`}>
   <div className="nf4-icon"><Building2 size={18}/></div><div className="nf4-copy"><small>{r.verticalKind} · {r.relationshipType}</small><h3>{r.networkName}</h3><b>{r.tagline||tr("NF4PassportFallbackTxt")}</b><p>{r.summary||tr("NF4SummaryFallbackTxt")}</p><div className="nf4-meta">{r.locationLabel&&<span><Globe2 size={12}/>{r.locationLabel}</span>}<span><ShieldCheck size={12}/>{r.verificationState}</span>{r.passportVisibility==="public"&&r.passportSlug&&<a href={`/passport/${r.passportSlug}`} target="_blank" rel="noreferrer">{tr("NF4OpenPassportTxt")}</a>}</div><div className="nf4-tags">{r.capabilities.slice(0,4).map(x=><em key={`c-${x}`}><Tags size={10}/>{x}</em>)}{r.participationScopes.slice(0,4).map(x=><em key={`s-${x}`}><Sparkles size={10}/>{x}</em>)}</div></div>
   <aside><span className="nf4-route"><Network size={13}/>{tr("NF4TrustRouteTxt")}</span><b>{r.sourceNetworkName}</b><i>→</i><b>{r.umbrellaName}</b><i>→</i><b>{r.networkName}</b><small>{tr("NF4RouteExplainTxt")}</small></aside>
  </article>)}</div>
  {message&&<div className="nf4-message">{message}</div>}
  <details className="nf4-guardrails"><summary><ShieldCheck size={15}/>{tr("NF4GuardrailsTxt")}</summary><div>{FEDERATED_DISCOVERY_GUARDRAILS.map(x=><p key={x}><b>✓</b>{x}</p>)}</div></details>
 </section>;
}
