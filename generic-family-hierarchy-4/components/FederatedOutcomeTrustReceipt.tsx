"use client";
import {useEffect,useState} from "react";
import {BadgeCheck,CheckCircle2,ClipboardCheck,History,Route,ShieldCheck} from "lucide-react";
import {FEDERATED_OUTCOME_OPTIONS,OUTCOME_TRUST_RECEIPT_GUARDRAILS,type FederatedOutcomeCandidate,type FederatedOutcomeCode,type FederatedTrustReceipt} from "../core/federation/outcome-trust-receipt";
import {getFederatedTrustReceipt,getMyFederatedOutcomeCandidates,recordMyFederatedOutcome} from "../capabilities/federation/outcome-trust-receipt-remote";
import {useLanguage} from "../lib/i18n";

export default function FederatedOutcomeTrustReceipt(){
 const {t}=useLanguage();
 const [items,setItems]=useState<FederatedOutcomeCandidate[]>([]),[selected,setSelected]=useState(""),[code,setCode]=useState<FederatedOutcomeCode>("helpful"),[note,setNote]=useState(""),[closeRequest,setCloseRequest]=useState(false),[receipt,setReceipt]=useState<FederatedTrustReceipt|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 const load=async()=>{setBusy(true);try{const rows=await getMyFederatedOutcomeCandidates();setItems(rows);const next=selected&&rows.some((x:FederatedOutcomeCandidate)=>x.introductionId===selected)?selected:(rows[0]?.introductionId||"");setSelected(next);if(next)setReceipt(await getFederatedTrustReceipt(next));else setReceipt(null)}catch(e:any){setNotice(e.message||t("NF8LoadFailedTxt"))}finally{setBusy(false)}};
 useEffect(()=>{void load()},[]);
 const choose=async(id:string)=>{setSelected(id);setNotice("");try{setReceipt(await getFederatedTrustReceipt(id))}catch(e:any){setNotice(e.message||t("NF8ReceiptFailedTxt"))}};
 const current=items.find((x:FederatedOutcomeCandidate)=>x.introductionId===selected)||null;
 const save=async()=>{if(!current)return;setBusy(true);try{await recordMyFederatedOutcome({introductionId:current.introductionId,outcomeCode:code,note,closeRequest:current.myRole==="requester"&&closeRequest});setNotice(t("NF8SavedTxt"));setNote("");setCloseRequest(false);await load()}catch(e:any){setNotice(e.message||t("NF8SaveFailedTxt"));setBusy(false)}};
 return <section className="card nf8-outcome-card">
  <div className="nf8-head"><div><span className="warm-kicker"><ClipboardCheck size={13}/>{t("NF8KickerTxt")}</span><h2>{t("NF8TitleTxt")}</h2><p>{t("NF8DescTxt")}</p></div><span className="nf8-badge"><ShieldCheck size={14}/>{t("NF8PrivateEvidenceTxt")}</span></div>
  {items.length===0?<div className="nf8-empty"><CheckCircle2 size={22}/><div><b>{t("NF8EmptyTitleTxt")}</b><p>{t("NF8EmptyDescTxt")}</p></div></div>:<div className="nf8-grid">
   <div className="nf8-list"><h3>{t("NF8AcceptedTxt")}</h3>{items.map(i=><button key={i.introductionId} className={selected===i.introductionId?"active":""} onClick={()=>void choose(i.introductionId)}><span><b>{i.requestTitle}</b><small>{i.scopeKey} · {i.umbrellaName}</small></span><em>{i.myOutcomeCode||t("NF8AwaitingTxt")}</em></button>)}</div>
   {current&&<div className="nf8-main"><div className="nf8-path"><Route size={16}/><span><b>{t("NF8TrustReceiptTxt")}</b><small>{current.trustPathLabel}</small></span></div><div className="nf8-people"><span><small>{t("NF8RequesterTxt")}</small><b>{current.requesterAlias}</b></span><span><small>{t("NF8RecipientTxt")}</small><b>{current.targetDisplayName}</b></span></div>
    <div className="nf8-form"><h3>{t("NF8RecordTitleTxt")}</h3><p>{t("NF8RecordDescTxt")}</p><label>{t("NF8OutcomeTxt")}<select value={code} onChange={e=>setCode(e.target.value as FederatedOutcomeCode)}>{FEDERATED_OUTCOME_OPTIONS.map(o=><option key={o.key} value={o.key}>{o.label}</option>)}</select></label><label>{t("NF8NoteTxt")}<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t("NF8NotePlaceholderTxt")}/></label>{current.myRole==="requester"&&current.requestStatus==="open"&&<label className="nf8-check"><input type="checkbox" checked={closeRequest} onChange={e=>setCloseRequest(e.target.checked)}/><span>{t("NF8CloseRequestTxt")}</span></label>}<button className="btn primary" disabled={busy} onClick={()=>void save()}><BadgeCheck size={13}/>{current.myOutcomeCode?t("NF8UpdateOutcomeTxt"):t("NF8SaveOutcomeTxt")}</button>{current.counterpartyOutcomeCode&&<small className="nf8-counterparty">{t("NF8CounterpartyTxt")}: <b>{current.counterpartyOutcomeCode}</b></small>}</div>
    {receipt&&<div className="nf8-receipt"><div className="nf8-receipt-title"><History size={15}/><div><b>{t("NF8ReceiptTimelineTxt")}</b><small>{t("NF8ReceiptTimelineDescTxt")}</small></div></div><div className="nf8-timeline"><span><b>{t("NF8RoutedTxt")}</b><small>{receipt.routedAt||"—"}</small></span><span><b>{t("NF8RequestedTxt")}</b><small>{receipt.introductionRequestedAt||"—"}</small></span><span><b>{t("NF8ConsentedTxt")}</b><small>{receipt.acceptedAt||"—"}</small></span></div><div className="nf8-evidence"><span>{t("NF8RequesterEvidenceTxt")}: <b>{receipt.requesterOutcomeCode||t("NF8NotRecordedTxt")}</b></span><span>{t("NF8RecipientEvidenceTxt")}: <b>{receipt.recipientOutcomeCode||t("NF8NotRecordedTxt")}</b></span></div></div>}
   </div>}
  </div>}
  {notice&&<p className="notice">{notice}</p>}
  <details className="nf8-guard"><summary>{t("NF8GuardrailsTxt")}</summary><ul>{OUTCOME_TRUST_RECEIPT_GUARDRAILS.map(x=><li key={x}>{x}</li>)}</ul></details>
 </section>;
}
