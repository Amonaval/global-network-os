"use client";
import {useState} from "react";
import {MessageSquarePlus,ThumbsDown,ThumbsUp,X} from "lucide-react";
import type {GuideFeedbackType} from "../lib/guide-types";
import {submitGuideFeedback} from "../lib/remote";

export default function GuideFeedback({guideKey,screen,role,experience,demo,onNotify}:{guideKey?:string;screen?:string;role:string;experience:string;demo:boolean;onNotify:(s:string)=>void}){
 const [open,setOpen]=useState(false),[type,setType]=useState<GuideFeedbackType>("improvement"),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 const submit=async(t:GuideFeedbackType=type,msg=message)=>{if(demo){onNotify("Playground feedback is not saved. Sign in to send product feedback.");return}setBusy(true);try{await submitGuideFeedback({guide_key:guideKey,screen,feedback_type:t,message:msg||undefined,role,experience_mode:experience,app_version:"S2-E"});onNotify("Thanks — your feedback was saved.");setOpen(false);setMessage("")}catch(e:any){onNotify(e.message||"Feedback could not be saved. Please try again.")}finally{setBusy(false)}};
 return <div className="guide-feedback">
  <div className="guide-helpful"><span>Was this helpful?</span><button className="icon-button" aria-label="Helpful" onClick={()=>submit("helpful_yes","")} disabled={busy}><ThumbsUp size={15}/></button><button className="icon-button" aria-label="Not helpful" onClick={()=>submit("helpful_no","")} disabled={busy}><ThumbsDown size={15}/></button><button className="text-action" onClick={()=>setOpen(true)}><MessageSquarePlus size={14}/> Suggest an improvement</button></div>
  {open&&<div className="guide-feedback-panel"><div className="profile-section-head"><b>Help us improve this guide</b><button className="icon-button" onClick={()=>setOpen(false)} aria-label="Close feedback"><X size={15}/></button></div><select className="text-input" value={type} onChange={e=>setType(e.target.value as GuideFeedbackType)}><option value="confusing">Something confusing</option><option value="missing">Something missing</option><option value="feature_idea">Feature idea</option><option value="improvement">Improvement idea</option><option value="bug">Problem / bug</option><option value="family_need">Something my family needs</option><option value="other">Other</option></select><textarea className="text-input" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tell us what would make this clearer or more useful. Please don't include private family stories, contact details or sensitive profile information."/><button className="btn primary" disabled={busy||!message.trim()} onClick={()=>submit()}>{busy?"Sending…":"Send feedback"}</button></div>}
 </div>;
}
