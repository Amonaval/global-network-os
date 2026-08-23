"use client";
import { useEffect, useState } from "react";
import { ChevronDown, DoorOpen, LogOut, Plus, UsersRound } from "lucide-react";
import { fetchMyNetworks, NetworkMembership, setActiveNetwork } from "../lib/remote";

export default function FamilySwitcher({onSwitched,onCreate,onLobby,onLeave}:{onSwitched:()=>Promise<void>|void;onCreate:()=>void;onLobby?:()=>Promise<void>|void;onLeave?:()=>Promise<void>|void}) {
  const [families,setFamilies]=useState<NetworkMembership[]>([]);
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false);
  useEffect(()=>{fetchMyNetworks().then(setFamilies).catch(()=>setFamilies([]));},[]);
  const active=families.find(x=>x.is_active) || families[0];
  if(!active)return null;
  const switchTo=async(id:string)=>{if(id===active.network_id){setOpen(false);return;}setBusy(true);try{await setActiveNetwork(id);await onSwitched();setFamilies(await fetchMyNetworks());setOpen(false);}finally{setBusy(false);}};
  const lobby=async()=>{if(!onLobby)return;setBusy(true);try{await onLobby();setOpen(false);}finally{setBusy(false)}};
  const leave=async()=>{if(!onLeave)return;if(!window.confirm(`Leave ${active.name}? If you are its only account, the empty family will be archived. Families with other members must keep at least one Owner.`))return;setBusy(true);try{await onLeave();setOpen(false);}finally{setBusy(false)}};
  return <div className="family-switcher">
    <button className="family-switcher-trigger" onClick={()=>setOpen(!open)} disabled={busy}><UsersRound size={16}/><span><small>Family</small><b>{active.name}</b></span><ChevronDown size={15}/></button>
    {open&&<div className="family-switcher-menu">
      {families.map(f=><button key={f.network_id} className={f.is_active?"active":""} onClick={()=>switchTo(f.network_id)}><span>{f.name}<small>{f.role}</small></span>{f.is_active&&<b>Current</b>}</button>)}
      <button className="family-switcher-create" onClick={()=>{setOpen(false);onCreate();}}><Plus size={15}/> Create or join another family</button>
      {onLobby&&<button className="family-switcher-lobby" onClick={lobby}><DoorOpen size={15}/> Family lobby / choose fresh</button>}
      {onLeave&&<button className="family-switcher-leave" onClick={leave}><LogOut size={15}/> Leave this family</button>}
    </div>}
  </div>;
}
