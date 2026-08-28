"use client";
import type {ReactNode} from "react";
import {Building2,ChevronRight,GraduationCap,Handshake,Layers3,LogOut,Plus,ShieldCheck,Sparkles,Store,TreePine,UserRound,UsersRound} from "lucide-react";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import {TRUSTED_IDENTITY_PRIVACY_RULES} from "../core/identity/trusted-person";
import type {NetworkMembership} from "../core/network/contracts";
import type {NetworkVerticalKind} from "../core/verticals/contracts";
import {getVerticalDefinition} from "../app-shell/vertical-registry";

function icon(kind:NetworkVerticalKind,size=20):ReactNode{
 if(kind==="alumni")return <GraduationCap size={size}/>;
 if(kind==="organization")return <Building2 size={size}/>;
 if(kind==="business-trust")return <Handshake size={size}/>;
 if(kind==="franchise")return <Store size={size}/>;
 return <TreePine size={size}/>;
}

const outcome:Record<NetworkVerticalKind,string>={
 family:"Keep generations, relationships, memories and family life connected.",
 alumni:"Reconnect across batches, places, careers and shared history.",
 organization:"Understand people, expertise, ownership and how work connects.",
 "business-trust":"Discover businesses and services through meaningful trust paths.",
 franchise:"Connect locations, owners, operations and local communities.",
};

export default function MyNetworksHome({identity,onOpenNetwork,onAddNetwork,onExploreDemo,onSignOut}:{identity:TrustedPersonIdentity;onOpenNetwork:(membership:NetworkMembership)=>Promise<void>|void;onAddNetwork:()=>void;onExploreDemo?:(kind:NetworkVerticalKind)=>void;onSignOut?:()=>Promise<void>|void}){
 const memberships=identity.memberships.filter(m=>m.status==="active");
 const kinds:Array<NetworkVerticalKind>=["family","alumni","organization","business-trust","franchise"];
 return <div className="my-networks-page">
  <section className="my-networks-hero">
   <div className="my-networks-identity-mark"><UserRound size={24}/></div>
   <div className="my-networks-hero-copy"><span className="nx1-new-pill">New · one home for all your networks</span><span className="warm-kicker"><Layers3 size={13}/> Your trusted network home</span><h1>My Networks</h1><p>One sign-in. Different parts of your life. Each network stays separately governed and private.</p></div>
   <div className="my-networks-person"><small>Signed in as</small><b>{identity.displayName}</b>{identity.email&&<span>{identity.email}</span>}<em>{memberships.length} active network{memberships.length===1?"":"s"}</em>{onSignOut&&<button className="btn small my-networks-signout" onClick={()=>void onSignOut()}><LogOut size={14}/> Sign out</button>}</div>
  </section>

  <section className="my-networks-value-strip">
   <article><UsersRound/><span><b>Belong in many places</b><small>Family, alumni, work, business and communities can coexist without becoming one public graph.</small></span></article>
   <article><ShieldCheck/><span><b>Private by network</b><small>Your identity connects your own contexts; it does not expose one network to another.</small></span></article>
   <article><Sparkles/><span><b>Value that can compound</b><small>Future trusted introductions and network links can work through explicit consent, not silent data sharing.</small></span></article>
  </section>

  <section className="my-networks-section">
   <div className="my-networks-heading"><div><span className="warm-kicker">Your spaces</span><h2>Continue where it matters</h2><p>Every card opens its own independently governed network context.</p></div><button className="btn primary" onClick={onAddNetwork}><Plus size={16}/> Add or join network</button></div>
   {memberships.length>0?<div className="my-networks-grid">{memberships.map(m=>{const def=getVerticalDefinition(m.network.verticalKind);return <button key={m.network.id} className={`my-network-card ${m.isActive?"active":""}`} onClick={()=>onOpenNetwork(m)}>
    <span className={`my-network-icon ${m.network.verticalKind}`}>{icon(m.network.verticalKind,24)}</span>
    <span className="my-network-card-copy"><small>{def.displayName}</small><strong>{m.network.name}</strong><p>{outcome[m.network.verticalKind]}</p><span className="my-network-meta"><b>{m.role}</b>{m.isActive&&<em>Current context</em>}</span></span>
    <ChevronRight size={20}/>
   </button>})}</div>:<div className="card my-networks-empty"><Layers3/><div><h3>Your first network starts here</h3><p>Create or join a meaningful network, or explore the Playground to see how one identity can move between isolated contexts.</p></div><button className="btn primary" onClick={onAddNetwork}>Create or join</button></div>}
  </section>

  {onExploreDemo&&<section className="my-networks-section my-networks-playground">
   <div className="my-networks-heading"><div><span className="warm-kicker"><Sparkles size={12}/> Playground</span><h2>Experience the Network OS idea</h2><p>Switch between sample verticals without exposing or merging their data.</p></div></div>
   <div className="network-demo-strip">{kinds.map(kind=>{const def=getVerticalDefinition(kind);return <button key={kind} onClick={()=>onExploreDemo(kind)}><span className={`my-network-icon ${kind}`}>{icon(kind,18)}</span><span><b>{def.displayName}</b><small>{outcome[kind]}</small></span><ChevronRight size={17}/></button>})}</div>
  </section>}

  <section className="card my-networks-privacy">
   <div className="my-networks-privacy-intro"><ShieldCheck/><div><span className="warm-kicker">How your identity works</span><h2>Connected for you. Isolated by default.</h2><p>Your account is the trusted anchor. Your Family profile, Alumni profile and other network identities remain separate contexts.</p></div></div>
   <div className="my-networks-privacy-grid">{TRUSTED_IDENTITY_PRIVACY_RULES.map(rule=><article key={rule.key}><b>{rule.title}</b><p>{rule.description}</p></article>)}</div>
  </section>
 </div>;
}
