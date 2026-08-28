"use client";
import {useLanguage} from "../lib/i18n";
import {useState} from "react";
import {MessageSquarePlus,ThumbsDown,ThumbsUp,X} from "lucide-react";
import type {GuideFeedbackType} from "../lib/guide-types";
import {submitGuideFeedback} from "../lib/remote";

export default function GuideFeedback({guideKey,screen,role,experience,demo,onNotify}:{guideKey?:string;screen?:string;role:string;experience:string;demo:boolean;onNotify:(s:string)=>void}){
 const {t:tr}=useLanguage();
 const [open,setOpen]=useState(false),[type,setType]=useState<GuideFeedbackType>("improvement"),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 const submit=async(t:GuideFeedbackType=type,msg=message)=>{if(demo){onNotify(tr("PlaygroundFeedbackIsNotSavedSignInTxt"));return}setBusy(true);try{await submitGuideFeedback({guide_key:guideKey,screen,feedback_type:t,message:msg||undefined,role,experience_mode:experience,app_version:"S2-E"});onNotify(tr("ThanksYourFeedbackWasSavedTxt"));setOpen(false);setMessage("")}catch(e:any){onNotify(e.message||"Feedback could not be saved. Please try again.")}finally{setBusy(false)}};
 return <div className="guide-feedback">
  <div className="guide-helpful"><span>{tr("WasThisHelpfulTxt")}</span><button className="icon-button" aria-label={tr("HelpfulTxt")} onClick={()=>submit("helpful_yes","")} disabled={busy}><ThumbsUp size={15}/></button><button className="icon-button" aria-label={tr("NotHelpfulTxt")} onClick={()=>submit("helpful_no","")} disabled={busy}><ThumbsDown size={15}/></button><button className="text-action" onClick={()=>setOpen(true)}><MessageSquarePlus size={14}/> {tr("SuggestAnImprovementTxt")}</button></div>
  {open&&<div className="guide-feedback-panel"><div className="profile-section-head"><b>{tr("HelpUsImproveThisGuideTxt")}</b><button className="icon-button" onClick={()=>setOpen(false)} aria-label={tr("CloseFeedbackTxt")}><X size={15}/></button></div><select className="text-input" value={type} onChange={e=>setType(e.target.value as GuideFeedbackType)}><option value="confusing">{tr("SomethingConfusingTxt")}</option><option value="missing">{tr("SomethingMissingTxt")}</option><option value="feature_idea">{tr("FeatureIdeaTxt")}</option><option value="improvement">{tr("ImprovementIdeaTxt")}</option><option value="bug">{tr("ProblemBugTxt")}</option><option value="family_need">{tr("SomethingMyFamilyNeedsTxt")}</option><option value="other">{tr("OtherTxt")}</option></select><textarea className="text-input" value={message} onChange={e=>setMessage(e.target.value)} placeholder={tr("TellUsWhatWouldMakeThisClearerTxt")}/><button className="btn primary" disabled={busy||!message.trim()} onClick={()=>submit()}>{busy?tr("SendingTxt"):tr("SendFeedbackTxt")}</button></div>}
 </div>;
}
