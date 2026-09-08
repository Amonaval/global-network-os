"use client";
import {useEffect,useState} from "react";
import {KeyRound,Mail,RefreshCw,UserCheck,XCircle} from "lucide-react";
import {createNetworkInvitation,listNetworkInvitations,resendNetworkInvitation,revokeNetworkInvitation} from "../../capabilities/participation/remote";
import type {NetworkParticipationInvitation} from "../../core/participation/contracts";
import {useLanguage} from "../../lib/i18n";

export default function NetworkParticipationAdmin({networkId,onNotify}:{networkId:string;onNotify:(s:string)=>void}){
 const {t}=useLanguage();
 const [rows,setRows]=useState<NetworkParticipationInvitation[]>([]);
 const [email,setEmail]=useState("");
 const [busy,setBusy]=useState(false);
 const load=async()=>{try{setRows(await listNetworkInvitations(networkId))}catch(e:any){onNotify(e.message||t("XP6LoadInvitesFailedTxt"))}};
 useEffect(()=>{void load()},[networkId]);
 const create=async()=>{setBusy(true);try{const d=await createNetworkInvitation(networkId,email);setEmail("");await navigator.clipboard?.writeText(d.link);onNotify(d.delivery==="email"?t("XP6EmailRequestedTxt"):t("XP6LinkCopiedTxt"));await load()}catch(e:any){onNotify(e.message||t("XP6InviteFailedTxt"))}finally{setBusy(false)}};
 const resend=async(row:NetworkParticipationInvitation)=>{setBusy(true);try{const d=await resendNetworkInvitation(networkId,row.id);await navigator.clipboard?.writeText(d.link);onNotify(d.delivery==="email"?t("XP6EmailRequestedTxt"):t("XP6LinkCopiedTxt"));await load()}catch(e:any){onNotify(e.message||t("XP6InviteFailedTxt"))}finally{setBusy(false)}};
 const revoke=async(row:NetworkParticipationInvitation)=>{setBusy(true);try{await revokeNetworkInvitation(networkId,row.id);await load()}catch(e:any){onNotify(e.message||t("XP6InviteFailedTxt"))}finally{setBusy(false)}};
 return <section className="card xp6-participation">
  <div className="xp6-head"><KeyRound/><div><h3>{t("XP6InvitationClaimingTxt")}</h3><p>{t("XP6InvitationClaimingDescTxt")}</p></div></div>
  <div className="xp6-invite-compose"><input className="text-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("XP6EmailPlaceholderTxt")}/><button className="btn primary" disabled={busy||!email.includes("@")} onClick={create}><Mail size={14}/>{t("XP6InviteByEmailTxt")}</button></div>
  <div className="xp6-invite-list">{rows.slice(0,12).map(row=><div key={row.id} className="xp6-invite-row"><span><b>{row.email}</b><small>{row.status} · {t("XP6ExpiresTxt")} {new Date(row.expiresAt).toLocaleDateString()}</small></span>{row.status==="pending"&&<div className="card-actions"><button className="btn small" disabled={busy} onClick={()=>void resend(row)}><RefreshCw size={13}/>{t("XP6ResendTxt")}</button><button className="btn small danger-text" disabled={busy} onClick={()=>void revoke(row)}><XCircle size={13}/>{t("XP6RevokeTxt")}</button></div>}{row.status==="accepted"&&<UserCheck size={16}/>}</div>)}</div>
  <small>{t("XP6ClaimingNoteTxt")}</small>
 </section>;
}
