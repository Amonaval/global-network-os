"use client";
import {useEffect,useMemo,useState} from "react";
import {Check,Clipboard,Link2,RefreshCw,ShieldCheck,Unlink,Workflow,X} from "lucide-react";
import {useLanguage} from "../lib/i18n";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import type {NetworkTrustBridge,NetworkBridgeRelationshipType} from "../core/trust/network-bridge";
import {NETWORK_BRIDGE_RELATIONSHIP_LABELS} from "../core/trust/network-bridge";
import {fetchMyNetworkTrustBridges,getNetworkBridgeCode,requestNetworkTrustBridge,reviewNetworkTrustBridge,revokeNetworkTrustBridge} from "../capabilities/network-trust/remote";

export default function NetworkBridgeManager({identity}:{identity:TrustedPersonIdentity}){
 const {t:tr}=useLanguage();
 const adminMemberships=useMemo(()=>identity.memberships.filter(m=>m.status==="active"&&(m.role==="owner"||m.role==="admin")),[identity.memberships]);
 const [bridges,setBridges]=useState<NetworkTrustBridge[]>([]),[sourceId,setSourceId]=useState(adminMemberships[0]?.network.id||""),[code,setCode]=useState(""),[targetCode,setTargetCode]=useState(""),[relationshipType,setRelationshipType]=useState<NetworkBridgeRelationshipType>("trusted_peer"),[contextLabel,setContextLabel]=useState(""),[discovery,setDiscovery]=useState(false),[introductions,setIntroductions]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const load=async()=>{try{setBridges(await fetchMyNetworkTrustBridges())}catch(e:any){setMessage(e.message||tr("CouldNotLoadNetworkBridgesTxt"))}};
 useEffect(()=>{void load()},[]);
 useEffect(()=>{setCode("")},[sourceId]);
 const withBusy=async(fn:()=>Promise<void>)=>{setBusy(true);setMessage("");try{await fn()}catch(e:any){setMessage(e.message||tr("NetworkBridgeActionFailedTxt"))}finally{setBusy(false)}};
 const showCode=()=>withBusy(async()=>{if(!sourceId)return;setCode(await getNetworkBridgeCode(sourceId))});
 const regenerate=()=>withBusy(async()=>{if(!sourceId)return;setCode(await getNetworkBridgeCode(sourceId,true));setMessage(tr("BridgeCodeRegeneratedTxt"))});
 const request=()=>withBusy(async()=>{if(!sourceId||!targetCode.trim())return;await requestNetworkTrustBridge({sourceNetworkId:sourceId,targetCode:targetCode.trim(),relationshipType,contextLabel:contextLabel.trim()||undefined,capabilities:{discovery,introductions}});setTargetCode("");setContextLabel("");setMessage(tr("BridgeRequestSentTxt"));await load()});
 const review=(id:string,accept:boolean)=>withBusy(async()=>{await reviewNetworkTrustBridge(id,accept);setMessage(accept?tr("BridgeAcceptedTxt"):tr("BridgeDeclinedTxt"));await load()});
 const revoke=(id:string)=>withBusy(async()=>{await revokeNetworkTrustBridge(id);setMessage(tr("BridgeRevokedTxt"));await load()});
 if(!adminMemberships.length&&bridges.length===0)return null;
 return <section className="card m6b-bridge-card">
  <div className="m6b-head"><div><span className="warm-kicker"><Workflow size={13}/> {tr("TrustedNetworkBridgesTxt")}</span><h2>{tr("ConnectNetworksWithoutMergingThemTxt")}</h2><p>{tr("M6BBridgePrivacyDescTxt")}</p></div><span className="m6b-governed-pill"><ShieldCheck size={14}/>{tr("GovernedAndRevocableTxt")}</span></div>
  {adminMemberships.length>0&&<div className="m6b-create-grid">
   <div className="m6b-code-panel"><label>{tr("NetworkYouAdministerTxt")}<select value={sourceId} onChange={e=>setSourceId(e.target.value)}>{adminMemberships.map(m=><option key={m.network.id} value={m.network.id}>{m.network.name} · {m.role}</option>)}</select></label><div className="m6b-code-actions"><button className="btn" disabled={busy||!sourceId} onClick={showCode}><Link2 size={14}/>{code?tr("ShowBridgeCodeAgainTxt"):tr("GetBridgeCodeTxt")}</button>{code&&<><code>{code}</code><button className="btn icon-only" title={tr("CopyTxt")} onClick={()=>void navigator.clipboard?.writeText(code)}><Clipboard size={14}/></button><button className="btn icon-only" title={tr("RegenerateTxt")} disabled={busy} onClick={regenerate}><RefreshCw size={14}/></button></>}</div><small>{tr("BridgeCodeSharingHelpTxt")}</small></div>
   <div className="m6b-request-panel"><label>{tr("OtherNetworksBridgeCodeTxt")}<input value={targetCode} onChange={e=>setTargetCode(e.target.value.toUpperCase())} placeholder="A1B2C3D4E5F6"/></label><label>{tr("RelationshipTxt")}<select value={relationshipType} onChange={e=>setRelationshipType(e.target.value as NetworkBridgeRelationshipType)}>{Object.entries(NETWORK_BRIDGE_RELATIONSHIP_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>{tr("ContextOptionalTxt")}<input value={contextLabel} onChange={e=>setContextLabel(e.target.value)} placeholder={tr("BridgeContextPlaceholderTxt")}/></label><div className="m6b-capabilities"><span>{tr("ProposedCapabilitiesTxt")}</span><label><input type="checkbox" checked={discovery} onChange={e=>setDiscovery(e.target.checked)}/>{tr("AllowFutureDiscoveryTxt")}</label><label><input type="checkbox" checked={introductions} onChange={e=>setIntroductions(e.target.checked)}/>{tr("AllowFutureIntroductionsTxt")}</label></div><button className="btn primary" disabled={busy||!sourceId||!targetCode.trim()} onClick={request}>{tr("RequestBridgeTxt")}</button></div>
  </div>}
  {message&&<div className="m6b-message">{message}</div>}
  <div className="m6b-list-head"><b>{tr("BridgeActivityTxt")}</b><span>{bridges.filter(b=>b.status==="accepted").length} {tr("AcceptedTxt")}</span></div>
  {bridges.length===0?<div className="m6b-empty"><Unlink size={18}/><span>{tr("NoNetworkBridgesYetTxt")}</span></div>:<div className="m6b-list">{bridges.map(b=>{const other=b.direction==="incoming"?b.requesterNetworkName:b.recipientNetworkName;return <article key={b.id} className={`m6b-bridge-row ${b.status}`}><div className="m6b-bridge-icon"><Link2 size={16}/></div><div className="m6b-bridge-copy"><div><b>{other}</b><span className={`m6b-status ${b.status}`}>{b.status}</span></div><small>{NETWORK_BRIDGE_RELATIONSHIP_LABELS[b.relationshipType]}{b.contextLabel?` · ${b.contextLabel}`:""}</small><em>{b.capabilities.discovery?tr("DiscoveryProposedTxt"):tr("DiscoveryOffTxt")} · {b.capabilities.introductions?tr("IntroductionsProposedTxt"):tr("IntroductionsOffTxt")}</em></div><div className="m6b-row-actions">{b.canReview&&<><button className="btn primary" disabled={busy} onClick={()=>review(b.id,true)}><Check size={14}/>{tr("AcceptTxt")}</button><button className="btn" disabled={busy} onClick={()=>review(b.id,false)}><X size={14}/>{tr("DeclineTxt")}</button></>}{b.canRevoke&&<button className="btn danger" disabled={busy} onClick={()=>revoke(b.id)}><Unlink size={14}/>{tr("RevokeTxt")}</button>}</div></article>})}</div>}
  <div className="m6b-inert-note"><ShieldCheck size={14}/><span>{tr("M6BCapabilitiesInertTxt")}</span></div>
 </section>
}
