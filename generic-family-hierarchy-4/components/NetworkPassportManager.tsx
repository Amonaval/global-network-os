"use client";
import {useEffect,useMemo,useState} from "react";
import {CheckCircle2,Copy,ExternalLink,Globe2,IdCard,LockKeyhole,Save,ShieldCheck} from "lucide-react";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import type {NetworkPassport,NetworkPassportInput,NetworkPassportVisibility} from "../core/federation/network-passport";
import {NETWORK_PASSPORT_GUARDRAILS} from "../core/federation/network-passport";
import {fetchMyNetworkPassports,saveNetworkPassport} from "../capabilities/federation/passport-remote";
import {useLanguage} from "../lib/i18n";

const csv=(value:string)=>value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,12);
const slugify=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64);
export default function NetworkPassportManager({identity}:{identity:TrustedPersonIdentity}){
 const {t:tr}=useLanguage();
 const adminMemberships=useMemo(()=>identity.memberships.filter(m=>m.status==="active"&&(m.role==="owner"||m.role==="admin")),[identity.memberships]);
 const [rows,setRows]=useState<NetworkPassport[]>([]),[networkId,setNetworkId]=useState(adminMemberships[0]?.network.id||""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const current=rows.find(r=>r.networkId===networkId);const membership=adminMemberships.find(m=>m.network.id===networkId);
 const [form,setForm]=useState<Omit<NetworkPassportInput,"networkId">>({publicSlug:"",tagline:"",summary:"",locationLabel:"",establishedLabel:"",externalUrl:"",capabilities:[],participationScopes:[],visibility:"private",directoryDiscoverable:false});
 const load=async()=>{try{const next=await fetchMyNetworkPassports();setRows(next)}catch(e:any){setMessage(e.message||tr("NF1LoadFailedTxt"))}};
 useEffect(()=>{void load()},[]);
 useEffect(()=>{const r=rows.find(x=>x.networkId===networkId);const name=adminMemberships.find(m=>m.network.id===networkId)?.network.name||"";setForm(r?{publicSlug:r.publicSlug,tagline:r.tagline,summary:r.summary,locationLabel:r.locationLabel,establishedLabel:r.establishedLabel,externalUrl:r.externalUrl,capabilities:r.capabilities,participationScopes:r.participationScopes,visibility:r.visibility,directoryDiscoverable:r.directoryDiscoverable}:{publicSlug:slugify(name),tagline:"",summary:"",locationLabel:"",establishedLabel:"",externalUrl:"",capabilities:[],participationScopes:[],visibility:"private",directoryDiscoverable:false})},[networkId,rows,adminMemberships]);
 if(!adminMemberships.length)return null;
 const save=async()=>{setBusy(true);setMessage("");try{await saveNetworkPassport({...form,networkId,publicSlug:slugify(form.publicSlug)});setMessage(tr("NF1SavedTxt"));await load()}catch(e:any){setMessage(e.message||tr("NF1SaveFailedTxt"))}finally{setBusy(false)}};
 const publicUrl=typeof window!=="undefined"&&form.publicSlug?`${window.location.origin}/passport/${slugify(form.publicSlug)}`:"";
 return <section className="card nf1-passport-card">
  <div className="nf1-passport-head"><div><span className="warm-kicker"><IdCard size={13}/> {tr("NF1KickerTxt")}</span><h2>{tr("NF1TitleTxt")}</h2><p>{tr("NF1DescTxt")}</p></div><span className="nf1-passport-pill"><ShieldCheck size={14}/>{tr("NF1NetworkLevelOnlyTxt")}</span></div>
  <div className="nf1-passport-layout"><div className="nf1-passport-form">
   <label>{tr("NF1NetworkTxt")}<select value={networkId} onChange={e=>setNetworkId(e.target.value)}>{adminMemberships.map(m=><option key={m.network.id} value={m.network.id}>{m.network.name} · {m.role}</option>)}</select></label>
   <div className="nf1-two"><label>{tr("NF1PublicSlugTxt")}<input value={form.publicSlug} onChange={e=>setForm({...form,publicSlug:e.target.value})} placeholder={tr("NF1SlugPlaceholderTxt")}/></label><label>{tr("NF1VisibilityTxt")}<select value={form.visibility} onChange={e=>setForm({...form,visibility:e.target.value as NetworkPassportVisibility})}><option value="private">{tr("NF1PrivateTxt")}</option><option value="federation">{tr("NF1FederationTxt")}</option><option value="public">{tr("NF1PublicTxt")}</option></select></label></div>
   <label>{tr("NF1TaglineTxt")}<input value={form.tagline} maxLength={120} onChange={e=>setForm({...form,tagline:e.target.value})} placeholder={tr("NF1TaglinePlaceholderTxt")}/></label>
   <label>{tr("NF1SummaryTxt")}<textarea value={form.summary} maxLength={800} onChange={e=>setForm({...form,summary:e.target.value})} placeholder={tr("NF1SummaryPlaceholderTxt")}/></label>
   <div className="nf1-two"><label>{tr("NF1LocationTxt")}<input value={form.locationLabel} maxLength={120} onChange={e=>setForm({...form,locationLabel:e.target.value})}/></label><label>{tr("NF1EstablishedTxt")}<input value={form.establishedLabel} maxLength={80} onChange={e=>setForm({...form,establishedLabel:e.target.value})}/></label></div>
   <label>{tr("NF1ExternalUrlTxt")}<input value={form.externalUrl} maxLength={300} onChange={e=>setForm({...form,externalUrl:e.target.value})} placeholder={tr("NF1HttpsPlaceholderTxt")}/></label>
   <label>{tr("NF1CapabilitiesTxt")}<input value={form.capabilities.join(", ")} onChange={e=>setForm({...form,capabilities:csv(e.target.value)})} placeholder={tr("NF1CapabilitiesPlaceholderTxt")}/><small>{tr("NF1CommaSeparatedTxt")}</small></label>
   <label>{tr("NF1ScopesTxt")}<input value={form.participationScopes.join(", ")} onChange={e=>setForm({...form,participationScopes:csv(e.target.value)})} placeholder={tr("NF1ScopesPlaceholderTxt")}/><small>{tr("NF1ScopesHelpTxt")}</small></label>
   <label className="nf1-check"><input type="checkbox" checked={form.directoryDiscoverable} onChange={e=>setForm({...form,directoryDiscoverable:e.target.checked})}/><span><b>{tr("NF1DirectoryDiscoverableTxt")}</b><small>{tr("NF1DirectoryDiscoverableHelpTxt")}</small></span></label>
   <div className="nf1-actions"><button className="btn primary" disabled={busy||!networkId||!form.publicSlug.trim()} onClick={save}><Save size={14}/>{busy?tr("NF1SavingTxt"):tr("NF1SaveTxt")}</button>{form.visibility==="public"&&publicUrl&&<><a className="btn" href={publicUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/>{tr("NF1OpenPublicTxt")}</a><button className="btn icon-only" title={tr("CopyTxt")} onClick={()=>void navigator.clipboard?.writeText(publicUrl)}><Copy size={14}/></button></>}</div>{message&&<div className="nf1-message">{message}</div>}
  </div>
  <aside className="nf1-passport-preview"><span className="nf1-preview-label"><Globe2 size={14}/>{tr("NF1PreviewTxt")}</span><small>{membership?.network.verticalKind}</small><h3>{membership?.network.name}</h3><b>{form.tagline||tr("NF1TaglineFallbackTxt")}</b><p>{form.summary||tr("NF1SummaryFallbackTxt")}</p>{form.locationLabel&&<span>{form.locationLabel}</span>}<div className="nf1-chip-row">{form.capabilities.map(x=><em key={x}>{x}</em>)}</div><div className="nf1-scope-box"><small>{tr("NF1DeclaredScopesTxt")}</small>{form.participationScopes.length?<div>{form.participationScopes.map(x=><span key={x}><CheckCircle2 size={12}/>{x}</span>)}</div>:<p>{tr("NF1NoScopesTxt")}</p>}</div><div className="nf1-visibility"><LockKeyhole size={14}/><span>{tr("NF1VisibilityRuleTxt")} <b>{form.visibility}</b></span></div></aside>
  </div>
  <details className="nf1-guardrails"><summary><ShieldCheck size={15}/>{tr("NF1GuardrailsTxt")}</summary><div>{NETWORK_PASSPORT_GUARDRAILS.map(rule=><p key={rule}><b>✓</b>{rule}</p>)}</div></details>
 </section>;
}
