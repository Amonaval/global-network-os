"use client";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,CheckCircle2,Circle,Link2,Rocket,Sparkles,UserCheck,UsersRound} from "lucide-react";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import type {NetworkMembership} from "../core/network/contracts";
import type {NetworkLaunchSnapshot,NetworkLaunchStage} from "../core/activation/network-launch";
import {fetchMyNetworkLaunchSnapshots} from "../capabilities/launch-activation/remote";
import {useLanguage} from "../lib/i18n";

export default function NetworkLaunchActivation({identity,onOpenNetwork,onAddNetwork}:{identity:TrustedPersonIdentity;onOpenNetwork:(membership:NetworkMembership)=>Promise<void>|void;onAddNetwork:()=>void}){
 const {t}=useLanguage();const [rows,setRows]=useState<NetworkLaunchSnapshot[]>([]),[loading,setLoading]=useState(true),[selected,setSelected]=useState("");
 useEffect(()=>{fetchMyNetworkLaunchSnapshots().then(r=>{setRows(r);setSelected(v=>v||r[0]?.networkId||"")}).catch(()=>setRows([])).finally(()=>setLoading(false))},[]);
 const row=useMemo(()=>rows.find(x=>x.networkId===selected)||rows[0],[rows,selected]);
 const membership=useMemo(()=>identity.memberships.find(m=>m.network.id===row?.networkId),[identity.memberships,row]);
 const stageLabel=(s:NetworkLaunchStage)=>({seed:t("M7AStageSeedTxt"),invite:t("M7AStageInviteTxt"),claim:t("M7AStageClaimTxt"),bridge:t("M7AStageBridgeTxt"),outcome:t("M7AStageOutcomeTxt"),proven:t("M7AStageProvenTxt")}[s]);
 const next=(s:NetworkLaunchStage)=>({seed:t("M7ANextSeedTxt"),invite:t("M7ANextInviteTxt"),claim:t("M7ANextClaimTxt"),bridge:t("M7ANextBridgeTxt"),outcome:t("M7ANextOutcomeTxt"),proven:t("M7ANextProvenTxt")}[s]);
 const steps=row?[{key:"seed",label:t("M7AStepSeedTxt"),done:row.seededItems>=5,value:row.seededItems},{key:"invite",label:t("M7AStepMembersTxt"),done:row.activeMembers>=3,value:row.activeMembers},{key:"claim",label:t("M7AStepClaimsTxt"),done:row.claimedIdentities>=Math.min(3,row.activeMembers),value:row.claimedIdentities},{key:"bridge",label:t("M7AStepBridgeTxt"),done:row.acceptedBridges>=1,value:row.acceptedBridges},{key:"outcome",label:t("M7AStepOutcomeTxt"),done:row.acceptedIntroductions>=1,value:row.acceptedIntroductions}]:[];
 const act=()=>{if(!row){onAddNetwork();return}if(membership)void onOpenNetwork(membership)};
 return <section className="card m7a-launch" id="network-launch-activation">
  <div className="m7a-head"><div><span className="warm-kicker"><Rocket size={13}/> {t("M7ALaunchKickerTxt")}</span><h2>{t("M7ALaunchTitleTxt")}</h2><p>{t("M7ALaunchDescTxt")}</p></div>{row&&<span className="m7a-readiness"><b>{row.readiness}%</b>{t("M7AReadyTxt")}</span>}</div>
  {loading?<p>{t("M7ALoadingTxt")}</p>:rows.length===0?<div className="m7a-empty"><Rocket/><div><b>{t("M7AEmptyTitleTxt")}</b><span>{t("M7AEmptyDescTxt")}</span></div><button className="btn primary" onClick={onAddNetwork}>{t("CreateOrJoinTxt")}</button></div>:<>
   <div className="m7a-network-switch"><label>{t("M7AChooseNetworkTxt")}</label><select className="select" value={row?.networkId||""} onChange={e=>setSelected(e.target.value)}>{rows.map(x=><option key={x.networkId} value={x.networkId}>{x.networkName}</option>)}</select><span>{stageLabel(row!.stage)}</span></div>
   <div className="m7a-steps">{steps.map(s=><article className={s.done?"done":""} key={s.key}>{s.done?<CheckCircle2/>:<Circle/>}<div><b>{s.value}</b><span>{s.label}</span></div></article>)}</div>
   <div className="m7a-next"><Sparkles/><div><small>{t("BestNextActionTxt")}</small><b>{next(row!.stage)}</b><span>{t("M7AProgressiveDescTxt")}</span></div><button className="btn primary" onClick={act}>{row!.stage==="proven"?t("OpenNetworkTxt"):t("TakeNextStepTxt")} <ArrowRight size={15}/></button></div>
   <div className="m7a-principles"><span><UsersRound/>{t("M7AContributorPrincipleTxt")}</span><span><UserCheck/>{t("M7AClaimPrincipleTxt")}</span><span><Link2/>{t("M7AOutcomePrincipleTxt")}</span></div>
  </>}
 </section>
}
