"use client";
import {useEffect,useState,type ReactNode} from "react";
import {BriefcaseBusiness,Building2,ChevronDown,GraduationCap,Handshake,Plus,Store,TreePine} from "lucide-react";
import type {NetworkMembership} from "../../core/network/contracts";
import type {NetworkVerticalKind} from "../../core/verticals/contracts";
import {fetchMyNetworkMemberships,setActiveNetwork} from "../../lib/remote";
import {getVerticalDefinition} from "../../app-shell/vertical-registry";
import {useLanguage} from "../../lib/i18n";
function kindIcon(kind:NetworkVerticalKind,size=14):ReactNode{if(kind==="alumni")return <GraduationCap size={size}/>;if(kind==="organization")return <Building2 size={size}/>;if(kind==="business-trust")return <Handshake size={size}/>;if(kind==="franchise")return <Store size={size}/>;if(kind==="professional")return <BriefcaseBusiness size={size}/>;return <TreePine size={size}/>}
export default function NetworkSwitcher({onSwitched,onCreate,label}:{onSwitched:()=>Promise<void>|void;onCreate?:()=>void;label?:string}){
 const {t}=useLanguage();
 const [networks,setNetworks]=useState<NetworkMembership[]>([]),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 const load=()=>fetchMyNetworkMemberships().then(setNetworks).catch(()=>setNetworks([]));
 useEffect(()=>{load()},[]);
 const active=networks.find(x=>x.isActive)||networks[0];
 if(!active)return null;
 const kind=active.network.verticalKind;
 const switchTo=async(id:string)=>{if(id===active.network.id){setOpen(false);return;}setBusy(true);try{await setActiveNetwork(id);await onSwitched();await load();setOpen(false);}finally{setBusy(false)}};
 return <div className="family-switcher network-switcher">
  <button className="family-switcher-trigger" onClick={()=>setOpen(v=>!v)} disabled={busy}>{kindIcon(kind,16)}<span><small>{label||t("NetworkTxt")}</small><b>{active.network.name}</b></span><ChevronDown size={15}/></button>
  {open&&<div className="family-switcher-menu network-switcher-menu">
   <div className="network-switcher-menu-head"><span><b>{t("YourNetworksTxt")}</b><small>{networks.length} {t("AvailableTxt")}</small></span></div>
   <div className="network-switcher-list">{networks.map(n=><button key={n.network.id} className={n.isActive?"active":""} onClick={()=>switchTo(n.network.id)}><span className="network-switcher-row"><i className={`network-kind-icon ${n.network.verticalKind}`}>{kindIcon(n.network.verticalKind)}</i><span className="network-switcher-copy"><b>{n.network.name}</b><small>{getVerticalDefinition(n.network.verticalKind).displayName} · {n.role}</small></span></span>{n.isActive&&<b className="network-current-pill">{t("CurrentTxt")}</b>}</button>)}</div>
   {onCreate&&<button className="family-switcher-create" onClick={()=>{setOpen(false);onCreate()}}><Plus size={15}/> {t("AddJoinNetworkTxt")}</button>}
  </div>}
 </div>;
}
