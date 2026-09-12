"use client";
import {useEffect,useMemo,useState} from "react";
import {BellRing,Trash2} from "lucide-react";
import type {ProductizedNetworkMember} from "../../capabilities/template-product/remote";
import {fetchNetworkNotificationRoles,removeNetworkNotificationRole,setNetworkNotificationRole,type NetworkNotificationRole} from "../../lib/remote";
import {useLanguage} from "../../lib/i18n";

type Kind="family-association"|"housing-society"|string;
const rolesFor=(kind:Kind)=>kind==="family-association"?[["president","President"],["secretary","Secretary"],["treasurer","Treasurer"],["events","Events"],["membership","Membership"]]:kind==="housing-society"?[["chairman","Chairman"],["secretary","Secretary"],["treasurer","Treasurer"],["complaint-resolver","Complaint resolver"],["facilities","Facilities"],["security","Security"]]:[["coordinator","Coordinator"],["moderator","Moderator"]];
export default function NetworkNotificationRoleAdmin({kind,members,onNotify}:{kind:Kind;members:ProductizedNetworkMember[];onNotify:(message:string)=>void}){
 const {t}=useLanguage();const [rows,setRows]=useState<NetworkNotificationRole[]>([]),[busy,setBusy]=useState(false);const active=useMemo(()=>members.filter(m=>m.status==="active"),[members]);
 const load=()=>fetchNetworkNotificationRoles().then(setRows).catch(()=>setRows([]));useEffect(()=>{void load()},[kind,members.length]);
 return <section className="card notification-role-admin"><div className="product-member-admin-head"><div><h3><BellRing size={17}/> {t("ResponsibilityRoutingTxt")}</h3><p>{t("ResponsibilityRoutingDescTxt")}</p></div></div><div className="notification-role-grid">{rolesFor(kind).map(([key,label])=>{const assigned=rows.find(r=>r.role_key===key&&r.active);return <label key={key}><span><b>@{label.replace(/\s+/g,"")}</b><small>{label}</small></span><select className="select" value={assigned?.user_id||""} disabled={busy} onChange={async e=>{setBusy(true);try{if(assigned)await removeNetworkNotificationRole(key,assigned.user_id);if(e.target.value)await setNetworkNotificationRole(key,label,e.target.value,true);await load();onNotify(t("ResponsibilityRoutingSavedTxt"))}catch(err:any){onNotify(err.message||t("ResponsibilityRoutingFailedTxt"))}finally{setBusy(false)}}}><option value="">{t("UnassignedTxt")}</option>{active.map(m=><option key={m.userId} value={m.userId}>{m.entityLabel||m.email||m.userId}</option>)}</select>{assigned&&<button className="icon-button" title={t("RemoveTxt")} disabled={busy} onClick={async()=>{setBusy(true);try{await removeNetworkNotificationRole(key,assigned.user_id);await load()}finally{setBusy(false)}}}><Trash2 size={14}/></button>}</label>})}</div><small className="form-help">{t("MentionRoutingHelpTxt")}</small></section>;
}
