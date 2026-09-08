"use client";
import {useEffect,useMemo,useState} from "react";
import {AlertTriangle,CheckCircle2,HeartPulse} from "lucide-react";
import {listNetworkInvitations} from "../../capabilities/participation/remote";
import {evaluateNetworkHealth,type NetworkHealthSignals} from "../../core/readiness/network-health";
import {useLanguage,type MessageToken} from "../../lib/i18n";
export default function NetworkHealthPanel({networkId,signals}:{networkId:string;signals:NetworkHealthSignals}){
 const {t}=useLanguage(),[pendingInvitations,setPendingInvitations]=useState<number|null>(null);
 useEffect(()=>{let alive=true;listNetworkInvitations(networkId).then(rows=>{if(alive)setPendingInvitations(rows.filter(x=>x.status==="pending").length)}).catch(()=>{if(alive)setPendingInvitations(null)});return()=>{alive=false}},[networkId]);
 const health=useMemo(()=>evaluateNetworkHealth(signals,pendingInvitations),[signals,pendingInvitations]);
 return <section className="xp7-health"><div className="xp7-health-head"><div><span className="warm-kicker"><HeartPulse size={12}/> {t("XP7NetworkHealthTxt")}</span><h3>{health.score}% {t("XP7ReadyTxt")}</h3><p>{t("XP7NetworkHealthDescTxt")}</p></div><strong className={health.ready?"ready":"attention"}>{health.ready?t("XP7HealthyTxt"):t("XP7NeedsAttentionTxt")}</strong></div><div className="xp7-health-grid">{health.checks.map(check=><div key={check.id} className={check.status}>{check.status==="ready"?<CheckCircle2 size={15}/>:<AlertTriangle size={15}/>}<span><b>{t(check.labelToken as MessageToken)}</b><small>{check.value}</small></span></div>)}</div></section>;
}
