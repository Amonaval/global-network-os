"use client";
import {useMemo} from "react";
import {CheckCircle2,ClipboardCopy,Download,RefreshCw,ShieldCheck,UsersRound} from "lucide-react";
import {institutionalBootstrapScore,institutionalBootstrapStages} from "../../core/bootstrap/runtime";
import {useLanguage} from "../../lib/i18n";

type MemberLike={status:string;role:string;entityLabel?:string|null};
export default function InstitutionalBootstrapPanel({networkLabel,entityCount,members,joinCode,dimensionLabels,onRegenerate,onNotify}:{networkLabel:string;entityCount:number;members:readonly MemberLike[];joinCode:string;dimensionLabels:readonly string[];onRegenerate:()=>Promise<string>;onNotify:(message:string)=>void}){
 const {t}=useLanguage();
 const active=members.filter(m=>m.status==="active"),claimed=active.filter(m=>!!m.entityLabel),admins=active.filter(m=>m.role==="owner"||m.role==="admin");
 const snapshot={entityCount,activeMemberCount:active.length,claimedMemberCount:claimed.length,adminCount:admins.length};
 const stages=useMemo(()=>institutionalBootstrapStages(snapshot),[entityCount,active.length,claimed.length,admins.length]);
 const score=institutionalBootstrapScore(snapshot);
 const labels={seed:t("BootstrapSeedTxt"),invite:t("BootstrapInviteTxt"),claim:t("BootstrapClaimTxt"),delegate:t("BootstrapDelegateTxt"),enrich:t("BootstrapEnrichTxt")};
 const copyLaunch=async()=>{const message=`${networkLabel}\n\n${t("BootstrapLaunchMessageTxt")}\n${t("JoinCodeTxt")}: ${joinCode}`;if(typeof navigator!=="undefined"&&navigator.clipboard)await navigator.clipboard.writeText(message);onNotify(t("BootstrapLaunchCopiedTxt"))};
 const downloadTemplate=()=>{const headers=["label","email",...dimensionLabels.map(x=>x.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,""))];const content=headers.join(",")+"\n";const blob=new Blob([content],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="network-seed-template.csv";a.click();URL.revokeObjectURL(url)};
 return <section className="card institutional-bootstrap" data-mission="M3">
  <div className="institutional-bootstrap-head"><div><span className="warm-kicker"><UsersRound size={12}/> {t("InstitutionalBootstrapTxt")}</span><h3>{t("BootstrapFromOneSponsorTxt")}</h3><p>{t("BootstrapDescriptionTxt")}</p></div><div className="bootstrap-score"><b>{score}%</b><small>{t("ActivationReadyTxt")}</small></div></div>
  <div className="bootstrap-stage-grid">{stages.map(stage=><article key={stage.key} className={stage.complete?"complete":""}><div>{stage.complete?<CheckCircle2 size={17}/>:<ShieldCheck size={17}/>}<b>{labels[stage.key]}</b></div><span>{stage.progress}%</span><div className="bootstrap-progress"><i style={{width:`${stage.progress}%`}}/></div></article>)}</div>
  <div className="bootstrap-actions"><button className="btn small" onClick={downloadTemplate}><Download size={14}/> {t("DownloadSeedTemplateTxt")}</button><button className="btn small" disabled={!joinCode} onClick={copyLaunch}><ClipboardCopy size={14}/> {t("CopyLaunchInviteTxt")}</button><button className="btn small" onClick={async()=>{await onRegenerate();onNotify(t("JoinCodeRegeneratedTxt"))}}><RefreshCw size={14}/> {t("RegenerateJoinCodeTxt")}</button></div>
  <p className="page-subtitle">{t("BootstrapReuseNoteTxt")}</p>
 </section>
}
