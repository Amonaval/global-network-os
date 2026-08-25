"use client";
import {useEffect,useState} from "react";
import {ChevronDown,GraduationCap,Plus,TreePine} from "lucide-react";
import type {NetworkMembership} from "../../core/network/contracts";
import {fetchMyNetworkMemberships,setActiveNetwork} from "../../lib/remote";

export default function NetworkSwitcher({onSwitched,onCreate,label="Network"}:{onSwitched:()=>Promise<void>|void;onCreate?:()=>void;label?:string}){
 const [networks,setNetworks]=useState<NetworkMembership[]>([]),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 const load=()=>fetchMyNetworkMemberships().then(setNetworks).catch(()=>setNetworks([]));
 useEffect(()=>{load()},[]);
 const active=networks.find(x=>x.isActive)||networks[0];
 if(!active)return null;
 const kind=active.network.verticalKind;
 const switchTo=async(id:string)=>{if(id===active.network.id){setOpen(false);return;}setBusy(true);try{await setActiveNetwork(id);await onSwitched();await load();setOpen(false);}finally{setBusy(false)}};
 return <div className="family-switcher network-switcher">
  <button className="family-switcher-trigger" onClick={()=>setOpen(v=>!v)} disabled={busy}>{kind==="alumni"?<GraduationCap size={16}/>:<TreePine size={16}/>}<span><small>{label}</small><b>{active.network.name}</b></span><ChevronDown size={15}/></button>
  {open&&<div className="family-switcher-menu network-switcher-menu">
   {networks.map(n=><button key={n.network.id} className={n.isActive?"active":""} onClick={()=>switchTo(n.network.id)}><span className="network-switcher-row"><i className={`network-kind-icon ${n.network.verticalKind}`}>{n.network.verticalKind==="alumni"?<GraduationCap size={14}/>:<TreePine size={14}/>}</i><span><b>{n.network.name}</b><small>{n.network.verticalKind==="alumni"?"Alumni Network":"Family Network"} · {n.role}</small></span></span>{n.isActive&&<b>Current</b>}</button>)}
   {onCreate&&<button className="family-switcher-create" onClick={()=>{setOpen(false);onCreate()}}><Plus size={15}/> Add or join a network</button>}
  </div>}
 </div>;
}
