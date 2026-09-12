"use client";
import {useEffect,useRef,useState,type ReactNode} from "react";
import {ChevronDown,UserRound} from "lucide-react";

export type NetworkAccountMenuItem={key:string;label:string;icon?:ReactNode;onClick:()=>void|Promise<void>;danger?:boolean;hint?:string};

export default function NetworkAccountMenu({label="Me",subtitle,items}:{label?:string;subtitle?:string;items:NetworkAccountMenuItem[]}){
 const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;const close=(event:MouseEvent)=>{if(root.current&&!root.current.contains(event.target as Node))setOpen(false)};const key=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};document.addEventListener("mousedown",close);window.addEventListener("keydown",key);return()=>{document.removeEventListener("mousedown",close);window.removeEventListener("keydown",key)};},[open]);
 return <div className="network-account-menu" ref={root}>
  <button data-testid="qa-account-menu" className={`network-account-trigger ${open?"active":""}`} type="button" aria-label={`${label}${subtitle?` — ${subtitle}`:""}`} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><span className="network-account-avatar"><UserRound size={16}/></span><span className="network-account-copy"><b>{label}</b>{subtitle&&<small>{subtitle}</small>}</span><ChevronDown size={14}/></button>
  {open&&<div className="network-account-popover" role="menu">{items.map(item=><button data-testid={`qa-account-menu-${item.key}`} type="button" role="menuitem" key={item.key} className={item.danger?"danger":""} onClick={()=>{setOpen(false);void item.onClick()}}><span className="network-account-item-icon">{item.icon}</span><span><b>{item.label}</b>{item.hint&&<small>{item.hint}</small>}</span></button>)}</div>}
 </div>;
}
