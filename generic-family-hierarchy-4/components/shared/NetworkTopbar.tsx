"use client";
import type {ReactNode} from "react";
import ThemeSwitcher from "../ThemeSwitcher";

export type NetworkTopbarBadge={label:string;tone?:"shared"|"demo"|"neutral";icon?:ReactNode};

export default function NetworkTopbar({icon,title,badges=[],middle,actions,className="",middleFullRow=false}:{icon:ReactNode;title:string;badges?:readonly NetworkTopbarBadge[];middle?:ReactNode;actions?:ReactNode;className?:string;middleFullRow?:boolean}){
 return <header className={`topbar network-topbar ${className}`.trim()} style={middleFullRow?{height:"auto",minHeight:64,flexWrap:"wrap",rowGap:8,paddingTop:9,paddingBottom:9}:undefined}>
  <div className="brand"><span className="brand-mark">{icon}</span><span className="network-title">{title}</span>{badges.map((badge,i)=><span key={`${badge.label}-${i}`} className={`mode-pill ${badge.tone||"neutral"}`}>{badge.icon}{badge.label}</span>)}</div>
  {middleFullRow&&middle?<div style={{order:3,flex:"1 0 100%",width:"100%",minWidth:0}}>{middle}</div>:middle}
  <div className="top-actions"><ThemeSwitcher compact/>{actions}</div>
 </header>;
}
