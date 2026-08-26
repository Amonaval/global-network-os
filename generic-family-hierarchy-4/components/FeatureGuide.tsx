"use client";
import {useEffect,useState} from "react";
import {BookOpen,ChevronDown,ChevronUp,ExternalLink,Lightbulb,PlayCircle,ShieldCheck} from "lucide-react";
import type {GuideEntry} from "../lib/guide-types";

type Props={entry?:GuideEntry;onOpenGuide?:(key:string)=>void;onOpenFeature?:(action?:string)=>void;onTryPlayground?:(key:string)=>void;rememberKey?:string};
export default function FeatureGuide({entry,onOpenGuide,onOpenFeature,onTryPlayground,rememberKey}:Props){
 const storageKey=`family-guide-seen:${rememberKey||entry?.key||"section"}`;
 const [open,setOpen]=useState(false),[seen,setSeen]=useState(false);
 useEffect(()=>{try{setSeen(localStorage.getItem(storageKey)==="1")}catch{}},[storageKey]);
 if(!entry)return null;
 const toggle=()=>{const next=!open;setOpen(next);if(next){setSeen(true);try{localStorage.setItem(storageKey,"1")}catch{}}};
 return <section className={`feature-guide ${open?"open":""}`} aria-label={`Guide for ${entry.title}`}>
  <button className="feature-guide-toggle" type="button" onClick={toggle} aria-expanded={open}>
   <span className="feature-guide-icon"><BookOpen size={18}/></span><span><b>What can I do here?</b><small>{seen?entry.summary:`New here? ${entry.summary}`}</small></span>{open?<ChevronUp size={18}/>:<ChevronDown size={18}/>} 
  </button>
  {open&&<div className="feature-guide-body">
   <div className="feature-guide-grid"><div><h4>Why use it?</h4><p>{entry.why}</p></div><div><h4>How to use it</h4><ol>{entry.steps.slice(0,4).map(x=><li key={x}>{x}</li>)}</ol></div></div>
   {entry.examples.length>0&&<div className="feature-guide-examples"><Lightbulb size={16}/><div><b>Try this</b><p>{entry.examples.slice(0,2).join(" · ")}</p></div></div>}
   <div className="feature-guide-trust"><ShieldCheck size={15}/><span>{entry.privacy}</span></div>
   <div className="card-actions">
    <button className="btn small" type="button" onClick={()=>onOpenGuide?.(entry.key)}>Open full guide <ExternalLink size={13}/></button>
    {entry.playground&&onTryPlayground&&<button className="btn small" type="button" onClick={()=>onTryPlayground(entry.key)}><PlayCircle size={13}/> Try in Playground</button>}
    {entry.action&&onOpenFeature&&<button className="btn small primary" type="button" onClick={()=>onOpenFeature(entry.action)}>Open feature</button>}
   </div>
  </div>}
 </section>;
}
