"use client";
import {useEffect,useMemo,useState} from 'react';
import {AlertTriangle,CheckCircle2,ClipboardCheck,PauseCircle,RefreshCw,Save,ShieldCheck,TrendingUp,XCircle} from 'lucide-react';
import type {TrustedPersonIdentity} from '../core/identity/trusted-person';
import type {PilotFeedbackMoment} from '../core/activation/pilot-learning';
import type {PilotDecisionDisposition,PilotDecisionGate} from '../core/activation/pilot-decision';
import {fetchPilotDecisionGate,recordPilotProductDecision} from '../capabilities/pilot-decision/remote';
import {useLanguage} from '../lib/i18n';

const dispositions:PilotDecisionDisposition[]=['invest','fix','hold','stop'];
const icons={invest:<TrendingUp/>,fix:<AlertTriangle/>,hold:<PauseCircle/>,stop:<XCircle/>};

export default function PilotEvidenceDecisionGate({identity}:{identity:TrustedPersonIdentity}){
 const {t}=useLanguage();
 const isAdmin=identity.memberships.some(m=>m.status==='active'&&(m.role==='owner'||m.role==='admin'));
 const [gate,setGate]=useState<PilotDecisionGate|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const [moment,setMoment]=useState<PilotFeedbackMoment>('general'),[disposition,setDisposition]=useState<PilotDecisionDisposition>('hold'),[rationale,setRationale]=useState(''),[nextAction,setNextAction]=useState('');
 const load=async()=>{if(!isAdmin)return;setBusy(true);setMessage('');try{const x=await fetchPilotDecisionGate(30);setGate(x);const first=x?.evidence?.[0];if(first){setMoment(first.moment);setDisposition(first.recommendation)}}catch(e:any){setMessage(e?.message||t('M7FLoadFailedTxt'))}finally{setBusy(false)}};
 useEffect(()=>{void load()},[isAdmin]);
 const selected=useMemo(()=>gate?.evidence.find(x=>x.moment===moment)||null,[gate,moment]);
 const momentLabel=(x:PilotFeedbackMoment)=>({launch:t('M7DMomentLaunchTxt'),participation:t('M7DMomentParticipationTxt'),claim:t('M7DMomentClaimTxt'),bridge:t('M7DMomentBridgeTxt'),discovery:t('M7DMomentDiscoveryTxt'),introduction:t('M7DMomentIntroductionTxt'),outcome:t('M7DMomentOutcomeTxt'),general:t('M7DMomentGeneralTxt')}[x]);
 const dispositionLabel=(x:PilotDecisionDisposition)=>({invest:t('M7FInvestTxt'),fix:t('M7FFixTxt'),hold:t('M7FHoldTxt'),stop:t('M7FStopTxt')}[x]);
 const dispositionDesc=(x:PilotDecisionDisposition)=>({invest:t('M7FInvestDescTxt'),fix:t('M7FFixDescTxt'),hold:t('M7FHoldDescTxt'),stop:t('M7FStopDescTxt')}[x]);
 const save=async()=>{if(!gate||!rationale.trim())return;setBusy(true);setMessage('');try{await recordPilotProductDecision({moment,disposition,evidenceDays:gate.days,rationale,nextAction});setMessage(t('M7FSavedTxt'));setRationale('');setNextAction('');await load()}catch(e:any){setMessage(e?.message||t('M7FSaveFailedTxt'))}finally{setBusy(false)}};
 if(!isAdmin)return null;
 return <section className="card m7f-gate" id="pilot-evidence-decision-gate">
  <div className="m7f-head"><div><span className="warm-kicker"><ClipboardCheck size={13}/> {t('M7FKickerTxt')}</span><h2>{t('M7FTitleTxt')}</h2><p>{t('M7FDescTxt')}</p></div><button className="btn" disabled={busy} onClick={()=>void load()}><RefreshCw size={14}/>{t('RefreshTxt')}</button></div>
  {gate&&<>
   <div className={`m7f-readiness ${gate.readyForDecision?'ready':'learning'}`}><span>{gate.readyForDecision?<CheckCircle2/>:<AlertTriangle/>}</span><div><b>{gate.readyForDecision?t('M7FReadyTxt'):t('M7FLearningTxt')}</b><small>{gate.totalFeedback} {t('M7FSignalsTxt')} · {t('M7FMinimumTxt')} {gate.minimumEvidence}</small></div></div>
   <div className="m7f-evidence">{gate.evidence.map(x=><button key={x.moment} className={moment===x.moment?'selected':''} onClick={()=>{setMoment(x.moment);setDisposition(x.recommendation)}}><div><b>{momentLabel(x.moment)}</b><small>{x.feedback} {t('M7FSignalsTxt')} · {x.helpfulRate}% {t('M7FHelpfulTxt')}</small></div><span className={`m7f-rec ${x.recommendation}`}>{dispositionLabel(x.recommendation)}</span><p>{x.reason}</p>{x.topFriction&&<em>{t('M7FTopFrictionTxt')}: {x.topFriction}</em>}</button>)}</div>
   {selected&&<div className="m7f-decision"><div className="m7f-decision-head"><div><b>{t('M7FRecordDecisionTxt')}</b><span>{momentLabel(moment)} · {selected.confidence} {t('M7FConfidenceTxt')}</span></div><span className={`m7f-rec ${selected.recommendation}`}>{t('M7FRecommendedTxt')}: {dispositionLabel(selected.recommendation)}</span></div>
    <div className="m7f-options">{dispositions.map(x=><button key={x} className={`${x} ${disposition===x?'selected':''}`} onClick={()=>setDisposition(x)}>{icons[x]}<span><b>{dispositionLabel(x)}</b><small>{dispositionDesc(x)}</small></span></button>)}</div>
    <label><span>{t('M7FRationaleTxt')}</span><textarea maxLength={800} value={rationale} onChange={e=>setRationale(e.target.value)} placeholder={t('M7FRationalePlaceholderTxt')}/></label>
    <label><span>{t('M7FNextActionTxt')}</span><input maxLength={300} value={nextAction} onChange={e=>setNextAction(e.target.value)} placeholder={t('M7FNextActionPlaceholderTxt')}/></label>
    <div className="m7f-save"><button className="btn primary" disabled={busy||!rationale.trim()} onClick={()=>void save()}><Save size={14}/>{t('M7FSaveDecisionTxt')}</button>{message&&<span>{message}</span>}</div>
   </div>}
   {gate.latestDecisions.length>0&&<div className="m7f-history"><b>{t('M7FLatestDecisionsTxt')}</b>{gate.latestDecisions.slice(0,5).map(x=><article key={x.id}><span className={`m7f-rec ${x.disposition}`}>{dispositionLabel(x.disposition)}</span><div><b>{momentLabel(x.moment)}</b><p>{x.rationale}</p>{x.nextAction&&<small>{t('M7FNextTxt')}: {x.nextAction}</small>}</div></article>)}</div>}
   <div className="m7f-rule"><ShieldCheck/><span><b>{t('M7FGateRuleTxt')}</b> {t('M7FGateRuleDescTxt')}</span></div>
  </>}
  {!gate&&!busy&&message&&<div className="m7f-error"><AlertTriangle size={15}/>{message}</div>}
 </section>;
}
