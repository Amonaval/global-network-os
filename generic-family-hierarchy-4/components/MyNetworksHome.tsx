"use client";
import {useLanguage} from "../lib/i18n";
// [NX-1][NX-6] Trusted multi-network home + later UX unification. Reviewable via window.nxFeatures.

import type {ReactNode} from "react";
import {BriefcaseBusiness,Building2,ChevronRight,GraduationCap,Handshake,Layers3,Link2,LogOut,Plus,ShieldCheck,Sparkles,Store,TreePine,UserCheck,UserRound,UsersRound} from "lucide-react";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import {TRUSTED_IDENTITY_PRIVACY_RULES} from "../core/identity/trusted-person";
import type {NetworkMembership} from "../core/network/contracts";
import type {NetworkVerticalKind} from "../core/verticals/contracts";
import {getVerticalDefinition} from "../app-shell/vertical-registry";
import NetworkBridgeManager from "./NetworkBridgeManager";
import CrossNetworkDiscovery from "./CrossNetworkDiscovery";
import NetworkEffectPulse from "./NetworkEffectPulse";
import NetworkEffectShowcase from "./NetworkEffectShowcase";
import NetworkLaunchActivation from "./NetworkLaunchActivation";
import AdminPilotLaunchConsole from "./AdminPilotLaunchConsole";

function icon(kind:NetworkVerticalKind,size=20):ReactNode{if(kind==="alumni")return <GraduationCap size={size}/>;if(kind==="organization")return <Building2 size={size}/>;if(kind==="business-trust")return <Handshake size={size}/>;if(kind==="franchise")return <Store size={size}/>;if(kind==="professional")return <BriefcaseBusiness size={size}/>;return <TreePine size={size}/>;}
const outcome:Record<NetworkVerticalKind,string>={family:"Keep generations, relationships and family memory connected.",alumni:"Reconnect across batches, places, careers and shared history.",organization:"Understand people, expertise, ownership and how work connects.","business-trust":"Discover businesses and services through meaningful trust paths.",franchise:"Connect locations, owners, operations and local communities.",professional:"Find trusted expertise, warm referrals and reusable professional knowledge."};

export default function MyNetworksHome({identity,onOpenNetwork,onAddNetwork,onExploreDemo,onSignOut}:{identity:TrustedPersonIdentity;onOpenNetwork:(membership:NetworkMembership)=>Promise<void>|void;onAddNetwork:()=>void;onExploreDemo?:(kind:NetworkVerticalKind)=>void;onSignOut?:()=>Promise<void>|void}){
 const {t:tr}=useLanguage();
 const memberships=identity.memberships.filter(m=>m.status==="active");const kinds:Array<NetworkVerticalKind>=["family","alumni","organization","business-trust","franchise","professional"];
 return <div className="my-networks-page nx6-my-networks">
  <section className="nx6-networks-hero">
   <div className="nx6-networks-copy"><span className="warm-kicker"><Layers3 size={13}/> {tr("YourTrustedNetworkHomeTxt")}</span><h1>{tr("OneIdentityYourMeaningfulNetworksTxt")}</h1><p>{tr("MoveBetweenFamilyAlumniWorkAndOtherTxt")}</p><div className="nx6-networks-actions"><button className="btn primary" onClick={onAddNetwork}><Plus size={16}/> {tr("AddOrJoinNetworkTxt")}</button>{onExploreDemo&&<button className="btn" onClick={()=>onExploreDemo("family")}><Sparkles size={16}/> {tr("ExperienceASampleTxt")}</button>}</div></div>
   <div className="nx6-identity-card"><span className="nx6-identity-icon"><UserRound size={21}/></span><div><small>{tr("SignedInAsTxt")}</small><b>{identity.displayName}</b>{identity.email&&<span>{identity.email}</span>}<em>{memberships.length} {tr("ActiveNetworkTxt")}{memberships.length===1?"":"s"}</em></div>{onSignOut&&<button className="nx6-text-button danger" onClick={()=>void onSignOut()}><LogOut size={14}/> {tr("SignOutTxt")}</button>}</div>
  </section>

  <section className="nx6-trust-strip"><ShieldCheck size={19}/><div><b>{tr("ConnectedForYouIsolatedByDefaultTxt")}</b><span>{tr("JoiningMoreNetworksNeverMergesTheirProfilesTxt")}</span></div><span className="nx6-private-pill">{tr("PrivateByNetwork2Txt")}</span></section>

  <section className="card m6-reach-card">
   <div className="m6-reach-head"><div><span className="warm-kicker"><Link2 size={13}/> {tr("YourNetworkReachTxt")}</span><h2>{tr("WhatYourMembershipsMeanTogetherTxt")}</h2><p>{tr("M6ReachPrivacyDescTxt")}</p></div><span className="m6-reach-badge"><ShieldCheck size={14}/>{tr("AggregateOnlyTxt")}</span></div>
   <div className="m6-reach-grid">
    <article><Layers3/><span><b>{identity.reach.activeNetworks}</b><small>{tr("ActiveNetworksTxt")}</small></span></article>
    <article><Sparkles/><span><b>{identity.reach.verticals}</b><small>{tr("NetworkTypesTxt")}</small></span></article>
    <article><UsersRound/><span><b>{identity.reach.uniqueMemberAccounts}</b><small>{tr("DistinctMemberAccountsTxt")}</small></span></article>
    <article><UserCheck/><span><b>{identity.reach.claimedContexts}/{identity.reach.activeNetworks}</b><small>{tr("IdentityLinkedContextsTxt")}</small></span></article>
   </div>
   <div className="m6-reach-foot"><span><b>{identity.reach.ownedNetworks}</b> {tr("OwnedTxt")} · <b>{identity.reach.administeredNetworks}</b> {tr("AdministeredTxt")}</span><span>{tr("CrossNetworkBridgesNowGovernedTxt")}</span></div>
  </section>

  <NetworkLaunchActivation identity={identity} onOpenNetwork={onOpenNetwork} onAddNetwork={onAddNetwork}/>
  <AdminPilotLaunchConsole identity={identity} onOpenNetwork={onOpenNetwork}/>
  <NetworkEffectShowcase/>
  <NetworkBridgeManager identity={identity}/>
  <CrossNetworkDiscovery identity={identity}/>
  <NetworkEffectPulse/>

  <section className="my-networks-section nx6-networks-section">
   <div className="my-networks-heading"><div><span className="warm-kicker">{tr("YourSpacesTxt")}</span><h2>{tr("ContinueWhereItMattersTxt")}</h2><p>{tr("EachCardOpensASeparatelyGovernedNetworkTxt")}</p></div></div>
   {memberships.length>0?<div className="my-networks-grid nx6-networks-grid">{memberships.map(m=>{const def=getVerticalDefinition(m.network.verticalKind);return <button key={m.network.id} className={`my-network-card nx6-network-card ${m.isActive?"active":""}`} onClick={()=>onOpenNetwork(m)}>
    <span className={`my-network-icon ${m.network.verticalKind}`}>{icon(m.network.verticalKind,24)}</span><span className="my-network-card-copy"><small>{def.displayName}</small><strong>{m.network.name}</strong><p>{outcome[m.network.verticalKind]}</p><span className="my-network-meta"><b>{m.role}</b>{m.isActive&&<em>{tr("CurrentTxt")}</em>}</span></span><ChevronRight size={20}/>
   </button>})}</div>:<div className="card my-networks-empty"><Layers3/><div><h3>{tr("YourFirstNetworkStartsHereTxt")}</h3><p>{tr("CreateOrJoinOneOrUseTheTxt")}</p></div><button className="btn primary" onClick={onAddNetwork}>{tr("CreateOrJoinTxt")}</button></div>}
  </section>

  {onExploreDemo&&<details className="card nx6-playground-drawer"><summary><span><Sparkles size={16}/><span><b>{tr("SafePlaygroundTxt")}</b><small>{tr("ExploreAllSixNetworkProductsWithSampleTxt")}</small></span></span><ChevronRight size={18}/></summary><div className="network-demo-strip nx6-demo-strip">{kinds.map(kind=>{const def=getVerticalDefinition(kind);return <button key={kind} onClick={()=>onExploreDemo(kind)}><span className={`my-network-icon ${kind}`}>{icon(kind,18)}</span><span><b>{def.displayName}</b><small>{outcome[kind]}</small></span><ChevronRight size={17}/></button>})}</div></details>}

  <details className="card nx6-privacy-drawer"><summary><span><ShieldCheck size={17}/><span><b>{tr("HowPrivacyAndIdentityWorkTxt")}</b><small>{tr("SeeWhatCanAndCannotCrossNetworkTxt")}</small></span></span><ChevronRight size={18}/></summary><div className="my-networks-privacy-grid">{TRUSTED_IDENTITY_PRIVACY_RULES.map(rule=><article key={rule.key}><b>{rule.title}</b><p>{rule.description}</p></article>)}</div></details>
 </div>;
}
