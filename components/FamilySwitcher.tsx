"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Plus, UsersRound } from "lucide-react";
import { fetchMyNetworks, NetworkMembership, setActiveNetwork } from "../lib/remote";

export default function FamilySwitcher({onSwitched,onCreate}:{onSwitched:()=>Promise<void>|void;onCreate:()=>void}) {
  const [families,setFamilies]=useState<NetworkMembership[]>([]);
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false);
  useEffect(()=>{fetchMyNetworks().then(setFamilies).catch(()=>setFamilies([]));},[]);
  const active=families.find(x=>x.is_active);
  if(!active)return null;
  const switchTo=async(id:string)=>{if(id===active.network_id){setOpen(false);return;}setBusy(true);try{await setActiveNetwork(id);await onSwitched();setFamilies(await fetchMyNetworks());setOpen(false);}finally{setBusy(false);}};
  return <div className="family-switcher">
    <button className="family-switcher-trigger" onClick={()=>setOpen(!open)} disabled={busy}><UsersRound size={16}/><span><small>Family</small><b>{active.name}</b></span><ChevronDown size={15}/></button>
    {open&&<div className="family-switcher-menu">
      {families.map(f=><button key={f.network_id} className={f.is_active?"active":""} onClick={()=>switchTo(f.network_id)}><span>{f.name}<small>{f.role}</small></span>{f.is_active&&<b>Current</b>}</button>)}
      <button className="family-switcher-create" onClick={()=>{setOpen(false);onCreate();}}><Plus size={15}/> Create another family</button>
    </div>}
  </div>;
}
