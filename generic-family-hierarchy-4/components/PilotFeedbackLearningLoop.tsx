"use client";
import {useEffect,useMemo,useState} from "react";
import {AlertCircle,CheckCircle2,Lightbulb,MessageSquareText,RefreshCw,Send,ShieldCheck,ThumbsUp} from "lucide-react";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import type {PilotFeedbackContext,PilotFeedbackMoment,PilotFeedbackOutcome,PilotFrictionCode,PilotLearningSummary} from "../core/activation/pilot-learning";
import {fetchPilotFeedbackContext,fetchPilotLearningSummary,submitPilotFeedback} from "../capabilities/pilot-learning/remote";
import {useLanguage} from "../lib/i18n";

const moments:PilotFeedbackMoment[]=["launch","participation","claim","bridge","discovery","introduction","outcome","general"];
const frictions:PilotFrictionCode[]=["next_step","setup","data","permission","discovery","consent","technical","other"];

export default function PilotFeedbackLearningLoop({identity}:{identity:TrustedPersonIdentity}){
 const {t}=useLanguage();
 const [contexts,setContexts]=useState<PilotFeedbackContext[]>([]),[summary,setSummary]=useState<PilotLearningSummary|null>(null),[networkId,setNetworkId]=useState(""),[moment,setMoment]=useState<PilotFeedbackMoment>("general"),[outcome,setOutcome]=useState<PilotFeedbackOutcome|"">(""),[friction,setFriction]=useState<PilotFrictionCode>("none"),[note,setNote]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const isAdmin=identity.memberships.some(m=>m.status==="active"&&(m.role==="owner"||m.role==="admin"));
 const load=()=>{fetchPilotFeedbackContext().then(x=>{setContexts(x);if(!networkId&&x[0]){setNetworkId(x[0].networkId);setMoment(x[0].suggestedMoment)}}).catch(()=>setContexts([]));if(isAdmin)fetchPilotLearningSummary(30).then(setSummary).catch(()=>setSummary(null))};
 useEffect(()=>{load()},[]);
 const selected=useMemo(()=>contexts.find(x=>x.networkId===networkId),[contexts,networkId]);
 const chooseNetwork=(id:string)=>{setNetworkId(id);const x=contexts.find(v=>v.networkId===id);if(x)setMoment(x.suggestedMoment)};
 const momentLabel=(x:PilotFeedbackMoment)=>({launch:t("M7DMomentLaunchTxt"),participation:t("M7DMomentParticipationTxt"),claim:t("M7DMomentClaimTxt"),bridge:t("M7DMomentBridgeTxt"),discovery:t("M7DMomentDiscoveryTxt"),introduction:t("M7DMomentIntroductionTxt"),outcome:t("M7DMomentOutcomeTxt"),general:t("M7DMomentGeneralTxt")}[x]);
 const outcomeLabel=(x:PilotFeedbackOutcome)=>({helpful:t("M7DHelpfulTxt"),partial:t("M7DPartialTxt"),blocked:t("M7DBlockedTxt")}[x]);
 const frictionLabel=(x:PilotFrictionCode)=>({none:t("M7DFrictionNoneTxt"),next_step:t("M7DFrictionNextStepTxt"),setup:t("M7DFrictionSetupTxt"),data:t("M7DFrictionDataTxt"),permission:t("M7DFrictionPermissionTxt"),discovery:t("M7DFrictionDiscoveryTxt"),consent:t("M7DFrictionConsentTxt"),technical:t("M7DFrictionTechnicalTxt"),other:t("M7DFrictionOtherTxt")}[x]);
 const send=async()=>{if(!networkId||!outcome)return;setBusy(true);setMessage("");try{await submitPilotFeedback({networkId,moment,outcome,friction:outcome==="helpful"?"none":friction,note});setMessage(t("M7DThanksTxt"));setOutcome("");setFriction("none");setNote("");if(isAdmin)setSummary(await fetchPilotLearningSummary(30))}catch(e:any){setMessage(e?.message||t("M7DCouldNotSaveTxt"))}finally{setBusy(false)}};
 if(contexts.length===0)return null;
 return <section className="card m7d-loop" id="pilot-feedback-learning-loop">
  <div className="m7d-head"><div><span className="warm-kicker"><MessageSquareText size={13}/> {t("M7DKickerTxt")}</span><h2>{t("M7DTitleTxt")}</h2><p>{t("M7DDescTxt")}</p></div>{isAdmin&&<button className="btn" onClick={load}><RefreshCw size={14}/>{t("RefreshTxt")}</button>}</div>
  <div className="m7d-feedback">
   <div className="m7d-prompt"><Lightbulb/><div><b>{t("M7DPromptTitleTxt")}</b><span>{selected?`${selected.networkName} · ${momentLabel(moment)}`:t("M7DPromptFallbackTxt")}</span></div></div>
   <div className="m7d-fields"><label><span>{t("NetworkTxt")}</span><select value={networkId} onChange={e=>chooseNetwork(e.target.value)}>{contexts.map(x=><option key={x.networkId} value={x.networkId}>{x.networkName}</option>)}</select></label><label><span>{t("M7DMomentTxt")}</span><select value={moment} onChange={e=>setMoment(e.target.value as PilotFeedbackMoment)}>{moments.map(x=><option key={x} value={x}>{momentLabel(x)}</option>)}</select></label></div>
   <div className="m7d-outcomes"><button className={outcome==="helpful"?"selected":""} onClick={()=>{setOutcome("helpful");setFriction("none")}}><ThumbsUp/>{t("M7DHelpfulTxt")}</button><button className={outcome==="partial"?"selected":""} onClick={()=>setOutcome("partial")}><AlertCircle/>{t("M7DPartialTxt")}</button><button className={outcome==="blocked"?"selected":""} onClick={()=>setOutcome("blocked")}><AlertCircle/>{t("M7DBlockedTxt")}</button></div>
   {outcome&&outcome!=="helpful"&&<label className="m7d-friction"><span>{t("M7DWhatGotInWayTxt")}</span><select value={friction} onChange={e=>setFriction(e.target.value as PilotFrictionCode)}><option value="none">{t("M7DChooseFrictionTxt")}</option>{frictions.map(x=><option key={x} value={x}>{frictionLabel(x)}</option>)}</select></label>}
   {outcome&&<label className="m7d-note"><span>{t("M7DOptionalNoteTxt")}</span><textarea value={note} maxLength={600} onChange={e=>setNote(e.target.value)} placeholder={t("M7DNotePlaceholderTxt")}/><small><ShieldCheck size={12}/>{t("M7DPrivacyHintTxt")}</small></label>}
   {outcome&&<div className="m7d-submit"><button className="btn primary" disabled={busy||(outcome!=="helpful"&&friction==="none")} onClick={send}><Send size={14}/>{busy?t("SavingTxt"):t("M7DSendFeedbackTxt")}</button>{message&&<span>{message}</span>}</div>}
  </div>
  {isAdmin&&summary&&<div className="m7d-learning">
   <div className="m7d-learning-head"><div><span className="warm-kicker"><Lightbulb size={13}/> {t("M7DLearningKickerTxt")}</span><h3>{t("M7DLearningTitleTxt")}</h3></div><span>{summary.days} {t("DaysTxt")}</span></div>
   <div className="m7d-learning-grid"><article><b>{summary.feedback}</b><span>{t("M7DResponsesTxt")}</span></article><article><b>{summary.helpfulRate}%</b><span>{t("M7DHelpfulRateTxt")}</span></article><article><b>{summary.blocked}</b><span>{t("M7DBlockedResponsesTxt")}</span></article><article><b>{summary.topFriction?frictionLabel(summary.topFriction):t("M7DNoFrictionYetTxt")}</b><span>{t("M7DTopFrictionTxt")}</span></article></div>
   <div className="m7d-network-learning">{summary.networks.slice(0,5).map(x=><article key={x.networkId}><div><b>{x.networkName}</b><span>{x.feedback} {t("M7DResponsesTxt")}</span></div><strong>{x.helpful} / {x.feedback} {t("M7DHelpfulShortTxt")}</strong></article>)}</div>
   {summary.recentNotes.length>0&&<div className="m7d-notes"><b>{t("M7DRecentLearningTxt")}</b>{summary.recentNotes.slice(0,3).map((x,i)=><blockquote key={`${x.createdAt}-${i}`}><p>{x.note}</p><footer>{x.networkName} · {momentLabel(x.moment)} · {outcomeLabel(x.outcome)}</footer></blockquote>)}</div>}
   <div className="m7d-rule"><CheckCircle2/><span><b>{t("M7DLearningRuleTxt")}</b> {t("M7DLearningRuleDescTxt")}</span></div>
  </div>}
 </section>;
}
