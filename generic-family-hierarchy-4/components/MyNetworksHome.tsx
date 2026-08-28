"use client";
// [NX-1][NX-6] Trusted multi-network home + later UX unification. Reviewable via window.nxFeatures.

import type {ReactNode} from "react";
import {Building2,ChevronRight,GraduationCap,Handshake,Layers3,LogOut,Plus,ShieldCheck,Sparkles,Store,TreePine,UserRound,UsersRound} from "lucide-react";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import {TRUSTED_IDENTITY_PRIVACY_RULES} from "../core/identity/trusted-person";
import type {NetworkMembership} from "../core/network/contracts";
import type {NetworkVerticalKind} from "../core/verticals/contracts";
import {getVerticalDefinition} from "../app-shell/vertical-registry";

function icon(kind:NetworkVerticalKind,size=20):ReactNode{if(kind==="alumni")return <GraduationCap size={size}/>;if(kind==="organization")return <Building2 size={size}/>;if(kind==="business-trust")return <Handshake size={size}/>;if(kind==="franchise")return <Store size={size}/>;return <TreePine size={size}/>;}
const outcome:Record<NetworkVerticalKind,string>={family:"Keep generations, relationships and family memory connected.",alumni:"Reconnect across batches, places, careers and shared history.",organization:"Understand people, expertise, ownership and how work connects.","business-trust":"Discover businesses and services through meaningful trust paths.",franchise:"Connect locations, owners, operations and local communities."};

export default function MyNetworksHome({identity,onOpenNetwork,onAddNetwork,onExploreDemo,onSignOut}:{identity:TrustedPersonIdentity;onOpenNetwork:(membership:NetworkMembership)=>Promise<void>|void;onAddNetwork:()=>void;onExploreDemo?:(kind:NetworkVerticalKind)=>void;onSignOut?:()=>Promise<void>|void}){
 const memberships=identity.memberships.filter(m=>m.status==="active");const kinds:Array<NetworkVerticalKind>=["family","alumni","organization","business-trust","franchise"];
 return <div className="my-networks-page nx6-my-networks">
  <section className="nx6-networks-hero">
   <div className="nx6-networks-copy"><span className="warm-kicker"><Layers3 size={13}/> Your trusted network home</span><h1>One identity. Your meaningful networks.</h1><p>Move between Family, Alumni, work and other networks without turning them into one public graph.</p><div className="nx6-networks-actions"><button className="btn primary" onClick={onAddNetwork}><Plus size={16}/> Add or join network</button>{onExploreDemo&&<button className="btn" onClick={()=>onExploreDemo("family")}><Sparkles size={16}/> Experience a sample</button>}</div></div>
   <div className="nx6-identity-card"><span className="nx6-identity-icon"><UserRound size={21}/></span><div><small>Signed in as</small><b>{identity.displayName}</b>{identity.email&&<span>{identity.email}</span>}<em>{memberships.length} active network{memberships.length===1?"":"s"}</em></div>{onSignOut&&<button className="nx6-text-button danger" onClick={()=>void onSignOut()}><LogOut size={14}/> Sign out</button>}</div>
  </section>

  <section className="nx6-trust-strip"><ShieldCheck size={19}/><div><b>Connected for you. Isolated by default.</b><span>Joining more networks never merges their profiles, membership lists or relationship graphs.</span></div><span className="nx6-private-pill">Private by network</span></section>

  <section className="my-networks-section nx6-networks-section">
   <div className="my-networks-heading"><div><span className="warm-kicker">Your spaces</span><h2>Continue where it matters</h2><p>Each card opens a separately governed network context.</p></div></div>
   {memberships.length>0?<div className="my-networks-grid nx6-networks-grid">{memberships.map(m=>{const def=getVerticalDefinition(m.network.verticalKind);return <button key={m.network.id} className={`my-network-card nx6-network-card ${m.isActive?"active":""}`} onClick={()=>onOpenNetwork(m)}>
    <span className={`my-network-icon ${m.network.verticalKind}`}>{icon(m.network.verticalKind,24)}</span><span className="my-network-card-copy"><small>{def.displayName}</small><strong>{m.network.name}</strong><p>{outcome[m.network.verticalKind]}</p><span className="my-network-meta"><b>{m.role}</b>{m.isActive&&<em>Current</em>}</span></span><ChevronRight size={20}/>
   </button>})}</div>:<div className="card my-networks-empty"><Layers3/><div><h3>Your first network starts here</h3><p>Create or join one, or use the Playground to understand the Network OS idea first.</p></div><button className="btn primary" onClick={onAddNetwork}>Create or join</button></div>}
  </section>

  {onExploreDemo&&<details className="card nx6-playground-drawer"><summary><span><Sparkles size={16}/><span><b>Safe Playground</b><small>Explore all five network products with sample data</small></span></span><ChevronRight size={18}/></summary><div className="network-demo-strip nx6-demo-strip">{kinds.map(kind=>{const def=getVerticalDefinition(kind);return <button key={kind} onClick={()=>onExploreDemo(kind)}><span className={`my-network-icon ${kind}`}>{icon(kind,18)}</span><span><b>{def.displayName}</b><small>{outcome[kind]}</small></span><ChevronRight size={17}/></button>})}</div></details>}

  <details className="card nx6-privacy-drawer"><summary><span><ShieldCheck size={17}/><span><b>How privacy and identity work</b><small>See what can—and cannot—cross network boundaries</small></span></span><ChevronRight size={18}/></summary><div className="my-networks-privacy-grid">{TRUSTED_IDENTITY_PRIVACY_RULES.map(rule=><article key={rule.key}><b>{rule.title}</b><p>{rule.description}</p></article>)}</div></details>
 </div>;
}
