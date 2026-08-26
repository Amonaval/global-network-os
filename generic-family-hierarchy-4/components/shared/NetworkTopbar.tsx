"use client";
import type {ReactNode} from "react";
import ThemeSwitcher from "../ThemeSwitcher";

export type NetworkTopbarBadge={label:string;tone?:"shared"|"demo"|"neutral";icon?:ReactNode};

export default function NetworkTopbar({icon,title,badges=[],middle,actions,className=""}:{icon:ReactNode;title:string;badges?:readonly NetworkTopbarBadge[];middle?:ReactNode;actions?:ReactNode;className?:string}){
 return <header className={`topbar network-topbar ${className}`.trim()}>
  <div className="brand"><span className="brand-mark">{icon}</span><span className="network-title">{title}</span>{badges.map((badge,i)=><span key={`${badge.label}-${i}`} className={`mode-pill ${badge.tone||"neutral"}`}>{badge.icon}{badge.label}</span>)}</div>
  {middle}
  <div className="top-actions"><ThemeSwitcher compact/>{actions}</div>
 </header>;
}
