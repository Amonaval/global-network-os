"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {Bell,CheckCheck,ChevronRight,LoaderCircle,X,Smartphone} from "lucide-react";
import type {Notification} from "../../lib/types";
import {fetchNotifications,fetchNotificationUnreadCount,markAllNotificationsRead,markNotificationRead,setActiveNetwork} from "../../lib/remote";
import {buildNotificationDeepLink} from "../../lib/notification-routing";
import {disableWebPush,enableWebPush,getWebPushState} from "../../lib/push";
import {useLanguage} from "../../lib/i18n";

function relativeTime(value:string,locale:string){
 const seconds=Math.round((new Date(value).getTime()-Date.now())/1000),abs=Math.abs(seconds);
 const rtf=new Intl.RelativeTimeFormat(locale,{numeric:"auto"});
 if(abs<60)return rtf.format(seconds,"second");
 if(abs<3600)return rtf.format(Math.round(seconds/60),"minute");
 if(abs<86400)return rtf.format(Math.round(seconds/3600),"hour");
 return rtf.format(Math.round(seconds/86400),"day");
}

export default function NotificationCenter({disabled=false}:{disabled?:boolean}){
 const {language,t}=useLanguage();
 const locale=language==="hi"?"hi-IN":language==="mr"?"mr-IN":"en-IN";
 const [open,setOpen]=useState(false),[items,setItems]=useState<Notification[]>([]),[unread,setUnread]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(""),[pushState,setPushState]=useState<{supported:boolean;permission:string;subscribed:boolean}>({supported:false,permission:"default",subscribed:false});
 const load=useCallback(async()=>{if(disabled)return;try{setError("");const [rows,count]=await Promise.all([fetchNotifications({limit:80}),fetchNotificationUnreadCount()]);setItems(rows);setUnread(count)}catch(e:any){setError(e.message||t("NotificationsCouldNotLoadTxt"))}},[disabled,t]);
 useEffect(()=>{void load();void getWebPushState().then(setPushState).catch(()=>{});const onFocus=()=>void load();window.addEventListener("focus",onFocus);return()=>window.removeEventListener("focus",onFocus)},[load]);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[open]);
 const grouped=useMemo(()=>items,[items]);
 const openItem=async(n:Notification)=>{setBusy(true);try{if(!n.read_at)await markNotificationRead(n.id);if(n.network_id)await setActiveNetwork(n.network_id);const href=n.href||buildNotificationDeepLink({networkId:n.network_id,surface:String(n.metadata?.surface||"")||undefined,itemId:n.entity_id});window.location.assign(href)}catch(e:any){setError(e.message||t("NotificationCouldNotOpenTxt"));setBusy(false)}};
 const markAll=async()=>{setBusy(true);try{await markAllNotificationsRead();setItems(x=>x.map(n=>({...n,read_at:n.read_at||new Date().toISOString()})));setUnread(0)}catch(e:any){setError(e.message||t("NotificationsCouldNotUpdateTxt"))}finally{setBusy(false)}};
 if(disabled)return null;
 return <>
  <button data-testid="qa-notification-bell" className="notification-bell-button" aria-label={t("NotificationsTxt")} onClick={()=>{setOpen(true);void load()}}><Bell size={18}/>{unread>0&&<span>{unread>99?"99+":unread}</span>}</button>
  {open&&<div className="notification-drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><aside className="notification-drawer" role="dialog" aria-modal="true" aria-label={t("NotificationsTxt")}>
   <header><div><small>{t("YourUpdatesTxt")}</small><h2>{t("NotificationsTxt")}</h2></div><div><button className="icon-button" disabled={busy||unread===0} title={t("MarkAllReadTxt")} onClick={markAll}><CheckCheck size={18}/></button><button className="icon-button" aria-label={t("CloseTxt")} onClick={()=>setOpen(false)}><X size={18}/></button></div></header>
   <div className="notification-push-control"><Smartphone size={17}/><span><b>{t("DeviceNotificationsTxt")}</b><small>{pushState.subscribed?t("PushEnabledTxt"):t("PushEnableHelpTxt")}</small></span>{pushState.supported?<button className="btn small" disabled={busy} onClick={async()=>{setBusy(true);setError("");try{if(pushState.subscribed)await disableWebPush();else await enableWebPush();setPushState(await getWebPushState())}catch(e:any){setError(e.message||t("PushCouldNotChangeTxt"))}finally{setBusy(false)}}}>{pushState.subscribed?t("DisableTxt"):t("EnableTxt")}</button>:<em>{t("NotSupportedTxt")}</em>}</div>
   {error&&<div className="notification-error">{error}</div>}
   {busy&&<div className="notification-busy"><LoaderCircle className="spin" size={18}/>{t("OpeningTxt")}</div>}
   <div className="notification-list">{grouped.length===0?<div className="notification-empty"><Bell size={24}/><b>{t("NoNotificationsYetTxt")}</b><span>{t("NotificationsWillAppearHereTxt")}</span></div>:grouped.map(n=><button key={n.id} className={`notification-card ${n.read_at?"read":"unread"} priority-${n.priority||"normal"}`} onClick={()=>void openItem(n)}>
    <span className="notification-card-dot"/><span className="notification-card-copy"><small>{n.network_name||"TrustWeave"} · {relativeTime(n.created_at,locale)}</small><b>{n.title}</b>{n.body&&<p>{n.body}</p>}<em>{(n.priority==="urgent"||n.priority==="high")?t(n.priority==="urgent"?"UrgentTxt":"ImportantTxt"):""}</em></span><ChevronRight size={16}/>
   </button>)}</div>
  </aside></div>}
 </>;
}
