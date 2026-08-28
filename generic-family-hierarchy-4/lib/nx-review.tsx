"use client";
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
export type NxVersion="NX-1"|"NX-2"|"NX-3"|"NX-4"|"NX-5"|"NX-6";
export const NX_CATALOG:Record<NxVersion,{title:string;summary:string;surfaces:string[]}>= {
 "NX-1":{title:"My Networks & Trusted Identity",summary:"One account across separately governed networks.",surfaces:["My Networks","network switching","identity/privacy explanation","multi-network Playground"]},
 "NX-2":{title:"Living Network",summary:"Return-value moments without a social feed.",surfaces:["Living Family","rediscover relative","family digest"]},
 "NX-3":{title:"Family Time Machine",summary:"Generational timeline and preservation opportunities.",surfaces:["Time Machine","generation coverage","what could be forgotten"]},
 "NX-4":{title:"Family Growth Relay",summary:"Distributed family contribution and ask-someone flow.",surfaces:["Growth Relay","I know this","Ask someone"]},
 "NX-5":{title:"Connection & Belonging",summary:"Relationship context and family circles.",surfaces:["Who is this person?","relationship path","Family Circles","reconnect"]},
 "NX-6":{title:"WOW Product Unification",summary:"Today / People / Legacy composition and UX consolidation.",surfaces:["Family Experience Hub","NX6 My Networks layout","profile/navigation unification"]}
};
type State={reviewMode:boolean;enabled:Record<NxVersion,boolean>;setEnabled:(v:NxVersion,on:boolean)=>void};
const C=createContext<State|null>(null); const KEY="network-os-nx-review-v1";
const defaults=()=>Object.fromEntries((Object.keys(NX_CATALOG) as NxVersion[]).map(v=>[v,true])) as Record<NxVersion,boolean>;
declare global{interface Window{nxFeatures?:boolean}}
export function NxReviewProvider({children}:{children:ReactNode}){const [reviewMode,setReviewMode]=useState(false);const [enabled,setEnabledState]=useState<Record<NxVersion,boolean>>(defaults());
 useEffect(()=>{try{const raw=window.localStorage.getItem(KEY);if(raw)setEnabledState({...defaults(),...JSON.parse(raw)})}catch{};const timer=window.setInterval(()=>setReviewMode(window.nxFeatures===true),300);return()=>window.clearInterval(timer)},[]);
 const setEnabled=(v:NxVersion,on:boolean)=>setEnabledState(prev=>{const next={...prev,[v]:on};try{window.localStorage.setItem(KEY,JSON.stringify(next))}catch{};return next});
 const value=useMemo(()=>({reviewMode,enabled,setEnabled}),[reviewMode,enabled]);return <C.Provider value={value}>{children}</C.Provider>}
export function useNxReview(){const c=useContext(C);if(!c)throw new Error("useNxReview must be used within NxReviewProvider");return c}
export function useNxEnabled(v:NxVersion){const {reviewMode,enabled}=useNxReview();return !reviewMode||enabled[v]}
