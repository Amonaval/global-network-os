"use client";
import {useEffect,useMemo,useState} from "react";
import {CheckCircle2,ChevronRight,Rocket,X} from "lucide-react";
import type {NetworkVerticalKind} from "../../core/verticals/contracts";
import {getQuickStart,type QuickStartAction,type QuickStartSignal} from "../../core/activation/quick-start";
import {fetchQuickStartState,saveQuickStartState} from "../../capabilities/activation/remote";
import {useLanguage} from "../../lib/i18n";
export default function NetworkQuickStart({kind,networkId,role,signals,onAction}:{kind:NetworkVerticalKind;networkId:string;role:"owner"|"admin"|"member";signals:Partial<Record<QuickStartSignal,number>>;onAction:(action:QuickStartAction)=>Promise<void>|void}){
 const {t}=useLanguage();
 const definition=getQuickStart(kind),[dismissed,setDismissed]=useState(false),[completed,setCompleted]=useState<string[]>([]),[busy,setBusy]=useState<string>("");
 useEffect(()=>{let alive=true;fetchQuickStartState(networkId).then(s=>{if(alive){setDismissed(s.dismissed);setCompleted(s.completedStepIds)}}).catch(()=>{});return()=>{alive=false}},[networkId]);
 const visible=useMemo(()=>definition.steps.filter(step=>role==="owner"||role==="admin"||step.minimumRole==="member"),[definition,role]);
 const isDone=(step:(typeof visible)[number])=>completed.includes(step.id)||Boolean(step.completeWhen&&(signals[step.completeWhen.signal]||0)>=step.completeWhen.atLeast);
 const doneCount=visible.filter(isDone).length;
 const persist=async(nextDismissed:boolean,nextCompleted:string[])=>{setDismissed(nextDismissed);setCompleted(nextCompleted);try{await saveQuickStartState(networkId,{dismissed:nextDismissed,completedStepIds:nextCompleted})}catch{}};
 if(role==="member")return null;
 if(dismissed)return <section data-testid="qa-quick-start" className="card xp3-quick-start minimized"><div><Rocket size={17}/><span><b>{definition.title}</b><small>{doneCount}/{visible.length} {t("XP3CompleteTxt")}</small></span></div><button className="btn small" onClick={()=>void persist(false,completed)}>{t("XP3ResumeTxt")}</button></section>;
 return <section data-testid="qa-quick-start" className="card xp3-quick-start"><div className="xp3-quick-head"><div><span className="warm-kicker"><Rocket size={12}/> {t("XP3QuickStartTxt")}</span><h2>{definition.title}</h2><p>{definition.description}</p></div><button className="icon-button" aria-label={t("XP3DismissQuickStartTxt")} onClick={()=>void persist(true,completed)}><X size={16}/></button></div><div className="xp3-progress"><span style={{width:`${visible.length?Math.round(doneCount/visible.length*100):100}%`}}/><small>{doneCount} {t("XP3OfTxt")} {visible.length} {t("XP3CompleteTxt")}</small></div><div className="xp3-step-list">{visible.map(step=>{const done=isDone(step);return <button key={step.id} className={done?"done":""} disabled={busy===step.id} onClick={async()=>{if(done)return;setBusy(step.id);try{await onAction(step.action);const next=[...new Set([...completed,step.id])];await persist(false,next)}finally{setBusy("")}}}><span>{done?<CheckCircle2/>:<Rocket/>}</span><span><b>{step.title}</b><small>{step.description}</small></span><em>{done?t("XP3DoneTxt"):step.actionLabel}</em><ChevronRight size={15}/></button>})}</div></section>;
}
