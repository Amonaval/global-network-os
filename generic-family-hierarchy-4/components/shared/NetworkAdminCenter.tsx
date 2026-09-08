"use client";
import {useMemo} from "react";
import {Archive,Download,FileSpreadsheet,KeyRound,Layers3,LockKeyhole,Rocket,ShieldCheck,UsersRound,Wrench} from "lucide-react";
import type {NetworkVerticalKind} from "../../core/verticals/contracts";
import {getNetworkAdminModules,type NetworkAdminModuleId} from "../../core/admin/contracts";
import {useLanguage,type MessageToken} from "../../lib/i18n";
const icons:Record<NetworkAdminModuleId,any>={overview:ShieldCheck,members:UsersRound,roles:UsersRound,invitations:KeyRound,claims:KeyRound,import:FileSpreadsheet,privacy:LockKeyhole,features:Layers3,corrections:Wrench,media:Layers3,lifecycle:Archive,export:Download,launch:Rocket,settings:Wrench};
export default function NetworkAdminCenter({kind,networkName,role,isPlatformOwner=false,activeMembers=0,featureCount=0,pendingWork=0,onModule}:{kind:NetworkVerticalKind;networkName:string;role:"owner"|"admin"|"member";isPlatformOwner?:boolean;activeMembers?:number;featureCount?:number;pendingWork?:number;onModule:(module:NetworkAdminModuleId)=>void}){
 const {t}=useLanguage(),isOwner=role==="owner";const modules=useMemo(()=>getNetworkAdminModules(kind,{isOwner,isPlatformOwner}),[kind,isOwner,isPlatformOwner]);
 const readiness=Math.max(10,Math.min(100,Math.round((Math.min(activeMembers,5)/5*.5+Math.min(featureCount,8)/8*.3+(pendingWork===0?.2:.05))*100)));
 return <section className="card xp4-admin-center"><div className="xp4-admin-head"><div><span className="warm-kicker"><ShieldCheck size={12}/> {t("XP4AdminCenterTxt")}</span><h2>{networkName}</h2><p>{t("XP4AdminCenterDescTxt")}</p></div><div className="xp4-readiness"><strong>{readiness}%</strong><small>{t("XP4ReadinessTxt")}</small></div></div><div className="network-metric-grid"><div className="network-metric"><b>{activeMembers}</b><span>{t("XP4ActiveMembersTxt")}</span></div><div className="network-metric"><b>{featureCount}</b><span>{t("XP4ActiveCapabilitiesTxt")}</span></div><div className="network-metric"><b>{pendingWork}</b><span>{t("XP4PendingAdminWorkTxt")}</span></div></div><div className="xp4-admin-modules">{modules.map(module=>{const Icon=icons[module.id];return <button key={module.id} onClick={()=>onModule(module.id)}><Icon size={17}/><span><b>{t(module.labelToken as MessageToken)}</b><small>{t(module.descriptionToken as MessageToken)}</small></span></button>})}</div></section>;
}
