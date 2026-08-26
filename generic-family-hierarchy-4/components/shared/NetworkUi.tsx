import type {ReactNode} from "react";

export function NetworkMetric({value,label,detail,icon}:{value:ReactNode;label:string;detail?:string;icon?:ReactNode}){return <div className="network-metric">{icon&&<span className="network-metric-icon">{icon}</span>}<div><b>{value}</b><span>{label}</span>{detail&&<small>{detail}</small>}</div></div>}
export function NetworkSectionHead({kicker,title,description,action}:{kicker?:ReactNode;title:string;description?:string;action?:ReactNode}){return <div className="network-section-head"><div>{kicker&&<span className="warm-kicker">{kicker}</span>}<h2>{title}</h2>{description&&<p>{description}</p>}</div>{action}</div>}
export function NetworkEmpty({icon,title,description,action}:{icon?:ReactNode;title:string;description:string;action?:ReactNode}){return <div className="network-empty">{icon&&<span>{icon}</span>}<h3>{title}</h3><p>{description}</p>{action}</div>}
export function InitialsAvatar({name,size="md"}:{name:string;size?:"sm"|"md"|"lg"}){const initials=name.split(/\s+/).filter(Boolean).map(x=>x[0]).slice(0,2).join("").toUpperCase();return <span className={`network-avatar ${size}`}>{initials||"?"}</span>}
