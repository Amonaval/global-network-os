"use client";
import {useLanguage} from "../lib/i18n";
// [NX-1][NX-6][NX-7][NX-8] Trusted multi-network home + guided journey workspace.

import {useEffect,useMemo,useState,type ReactNode} from "react";
import dynamic from "next/dynamic";
import {ArrowRight,BookOpen,BriefcaseBusiness,Building2,ChevronRight,Compass,GraduationCap,Handshake,HeartHandshake,Info,Layers3,Link2,LockKeyhole,LogOut,Plus,Rocket,ShieldCheck,Sparkles,Store,TreePine,UserCheck,UserRound,UsersRound,Waypoints,X} from "lucide-react";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import {TRUSTED_IDENTITY_PRIVACY_RULES} from "../core/identity/trusted-person";
import type {NetworkMembership} from "../core/network/contracts";
import type {NetworkVerticalKind} from "../core/verticals/contracts";
import {getVerticalDefinition} from "../app-shell/vertical-registry";
import {fetchEffectivePlatformFeatures} from "../capabilities/launch-runtime/remote";
import {advancedNetworkFeatureKey,type AdvancedNetworkFeatureSuffix} from "../core/features/advanced-network";

// Advanced capabilities are delivered only when their journey AND tool are selected and Launch Control enables them.
const NetworkBridgeManager=dynamic(()=>import("./NetworkBridgeManager"),{ssr:false});
const CrossNetworkDiscovery=dynamic(()=>import("./CrossNetworkDiscovery"),{ssr:false});
const NetworkEffectPulse=dynamic(()=>import("./NetworkEffectPulse"),{ssr:false});
const NetworkEffectShowcase=dynamic(()=>import("./NetworkEffectShowcase"),{ssr:false});
const NetworkLaunchActivation=dynamic(()=>import("./NetworkLaunchActivation"),{ssr:false});
const AdminPilotLaunchConsole=dynamic(()=>import("./AdminPilotLaunchConsole"),{ssr:false});
const PilotFeedbackLearningLoop=dynamic(()=>import("./PilotFeedbackLearningLoop"),{ssr:false});
const ShowcaseRuntimeCertification=dynamic(()=>import("./ShowcaseRuntimeCertification"),{ssr:false});
const PilotEvidenceDecisionGate=dynamic(()=>import("./PilotEvidenceDecisionGate"),{ssr:false});
const FederationDistributionSupernode=dynamic(()=>import("./FederationDistributionSupernode"),{ssr:false});
const NetworkPassportManager=dynamic(()=>import("./NetworkPassportManager"),{ssr:false});
const NetworkFederationAffiliationManager=dynamic(()=>import("./NetworkFederationAffiliationManager"),{ssr:false});
const FederationUmbrellaRuntime=dynamic(()=>import("./FederationUmbrellaRuntime"),{ssr:false});
const FederatedDirectoryDiscovery=dynamic(()=>import("./FederatedDirectoryDiscovery"),{ssr:false});
const FederatedPurposeScopeFramework=dynamic(()=>import("./FederatedPurposeScopeFramework"),{ssr:false});
const TrustedRequestRouting=dynamic(()=>import("./TrustedRequestRouting"),{ssr:false});
const GovernedFederatedIntroductions=dynamic(()=>import("./GovernedFederatedIntroductions"),{ssr:false});
const FederatedOutcomeTrustReceipt=dynamic(()=>import("./FederatedOutcomeTrustReceipt"),{ssr:false});

function icon(kind:NetworkVerticalKind,size=20):ReactNode{if(kind==="alumni")return <GraduationCap size={size}/>;if(kind==="association")return <UsersRound size={size}/>;if(kind==="organization")return <Building2 size={size}/>;if(kind==="business-trust")return <Handshake size={size}/>;if(kind==="franchise")return <Store size={size}/>;if(kind==="professional")return <BriefcaseBusiness size={size}/>;return <TreePine size={size}/>;}
const outcome:Record<NetworkVerticalKind,string>={family:"Keep generations, relationships and family memory connected.",association:"Run families, membership, events and community participation in one private association.",alumni:"Reconnect across batches, places, careers and shared history.",organization:"Understand people, expertise, ownership and how work connects.","business-trust":"Discover businesses and services through meaningful trust paths.",franchise:"Connect locations, owners, operations and local communities.",professional:"Find trusted expertise, warm referrals and reusable professional knowledge."};

type WorkspaceSection="overview"|"trust"|"federation"|"outcomes"|"launch";
type ToolDefinition={key:AdvancedNetworkFeatureSuffix;label:string;description:string;helper:string;icon:ReactNode;step?:string};
type HelpTopic={title:string;lead:string;sections:Array<{label:string;body:string}>;privacy?:string;next?:string};
const TRUST_FEATURES:AdvancedNetworkFeatureSuffix[]=["identity_reach","trust_bridges","cross_network_discovery","network_effect_pulse"];
const FEDERATION_FEATURES:AdvancedNetworkFeatureSuffix[]=["federation_distribution","network_passport","network_affiliation","umbrella_runtime","federated_directory"];
const OUTCOME_FEATURES:AdvancedNetworkFeatureSuffix[]=["application_scopes","trusted_request_routing","governed_introductions","outcome_trust_receipt"];
const LAUNCH_FEATURES:AdvancedNetworkFeatureSuffix[]=["guided_launch","wow_showcase","pilot_console","pilot_feedback","runtime_certification","product_decision_gate"];

export default function MyNetworksHome({identity,onOpenNetwork,onAddNetwork,onExploreDemo,onSignOut}:{identity:TrustedPersonIdentity;onOpenNetwork:(membership:NetworkMembership)=>Promise<void>|void;onAddNetwork:()=>void;onExploreDemo?:(kind:NetworkVerticalKind)=>void;onSignOut?:()=>Promise<void>|void}){
 const {t:tr}=useLanguage();
 const memberships=identity.memberships.filter(m=>m.status==="active");
 const kinds:Array<NetworkVerticalKind>=["family","association","alumni","organization","business-trust","franchise","professional"];
 const initialKind=(memberships.find(m=>m.isActive)?.network.verticalKind||memberships[0]?.network.verticalKind||"family") as NetworkVerticalKind;
 const availableKinds=useMemo(()=>Array.from(new Set(memberships.map(m=>m.network.verticalKind))) as NetworkVerticalKind[],[memberships]);
 const [workspaceKind,setWorkspaceKind]=useState<NetworkVerticalKind>(initialKind);
 const [section,setSection]=useState<WorkspaceSection>("overview");
 const [activeTool,setActiveTool]=useState<AdvancedNetworkFeatureSuffix|null>(null);
 const [advancedRows,setAdvancedRows]=useState<Record<string,boolean>>({});
 const [helpTopic,setHelpTopic]=useState<HelpTopic|null>(null);
 useEffect(()=>{let live=true;fetchEffectivePlatformFeatures().then(rows=>{if(!live)return;setAdvancedRows(Object.fromEntries(rows.filter(r=>r.feature_key.includes(".advanced.")).map(r=>[r.feature_key,r.enabled])))}).catch(()=>{if(live)setAdvancedRows({})});return()=>{live=false}},[]);
 useEffect(()=>{if(availableKinds.length&&!availableKinds.includes(workspaceKind))setWorkspaceKind(availableKinds[0])},[availableKinds,workspaceKind]);
 const enabled=(suffix:AdvancedNetworkFeatureSuffix)=>advancedRows[advancedNetworkFeatureKey(workspaceKind,suffix)]===true;
 const enabledCount=(features:AdvancedNetworkFeatureSuffix[])=>features.filter(enabled).length;
 const advancedReach=useMemo(()=>({activeNetworks:memberships.length,verticals:new Set(memberships.map(m=>m.network.verticalKind)).size,ownedNetworks:memberships.filter(m=>m.role==="owner").length,administeredNetworks:memberships.filter(m=>m.role==="owner"||m.role==="admin").length}),[memberships]);
 const isAdmin=advancedReach.administeredNetworks>0;

 const trustTools:ToolDefinition[]=[
  {key:"identity_reach",label:tr("NX8ReachSnapshotTxt"),description:tr("NX8ReachSnapshotDescTxt"),helper:tr("NX8ReachSnapshotHelpTxt"),icon:<Layers3 size={18}/>},
  {key:"trust_bridges",label:tr("NX8TrustedLinksTxt"),description:tr("NX8TrustedLinksDescTxt"),helper:tr("NX8TrustedLinksHelpTxt"),icon:<Link2 size={18}/>},
  {key:"cross_network_discovery",label:tr("NX8CrossNetworkDiscoveryTxt"),description:tr("NX8CrossNetworkDiscoveryDescTxt"),helper:tr("NX8CrossNetworkDiscoveryHelpTxt"),icon:<Compass size={18}/>},
  {key:"network_effect_pulse",label:tr("NX8NetworkPulseTxt"),description:tr("NX8NetworkPulseDescTxt"),helper:tr("NX8NetworkPulseHelpTxt"),icon:<Waypoints size={18}/>},
 ];
 const federationTools:ToolDefinition[]=[
  {key:"network_passport",label:tr("NX8PassportStepTxt"),description:tr("NX8PassportStepDescTxt"),helper:tr("NX8PassportStepHelpTxt"),icon:<BookOpen size={18}/>,step:"1"},
  {key:"network_affiliation",label:tr("NX8AffiliationStepTxt"),description:tr("NX8AffiliationStepDescTxt"),helper:tr("NX8AffiliationStepHelpTxt"),icon:<Handshake size={18}/>,step:"2"},
  {key:"umbrella_runtime",label:tr("NX8UmbrellaStepTxt"),description:tr("NX8UmbrellaStepDescTxt"),helper:tr("NX8UmbrellaStepHelpTxt"),icon:<Layers3 size={18}/>,step:"3"},
  {key:"federated_directory",label:tr("NX8DirectoryStepTxt"),description:tr("NX8DirectoryStepDescTxt"),helper:tr("NX8DirectoryStepHelpTxt"),icon:<Compass size={18}/>,step:"4"},
  {key:"federation_distribution",label:tr("NX8DistributionStepTxt"),description:tr("NX8DistributionStepDescTxt"),helper:tr("NX8DistributionStepHelpTxt"),icon:<Rocket size={18}/>},
 ];
 const outcomeTools:ToolDefinition[]=[
  {key:"application_scopes",label:tr("NX8PurposeStepTxt"),description:tr("NX8PurposeStepDescTxt"),helper:tr("NX8PurposeStepHelpTxt"),icon:<UserCheck size={18}/>,step:"1"},
  {key:"trusted_request_routing",label:tr("NX8RequestStepTxt"),description:tr("NX8RequestStepDescTxt"),helper:tr("NX8RequestStepHelpTxt"),icon:<Waypoints size={18}/>,step:"2"},
  {key:"governed_introductions",label:tr("NX8IntroStepTxt"),description:tr("NX8IntroStepDescTxt"),helper:tr("NX8IntroStepHelpTxt"),icon:<HeartHandshake size={18}/>,step:"3"},
  {key:"outcome_trust_receipt",label:tr("NX8OutcomeStepTxt"),description:tr("NX8OutcomeStepDescTxt"),helper:tr("NX8OutcomeStepHelpTxt"),icon:<ShieldCheck size={18}/>,step:"4"},
 ];
 const launchTools:ToolDefinition[]=[
  {key:"guided_launch",label:tr("NX8GuidedLaunchTxt"),description:tr("NX8GuidedLaunchDescTxt"),helper:tr("NX8GuidedLaunchHelpTxt"),icon:<Rocket size={18}/>},
  {key:"wow_showcase",label:tr("NX8ShowcaseTxt"),description:tr("NX8ShowcaseDescTxt"),helper:tr("NX8ShowcaseHelpTxt"),icon:<Sparkles size={18}/>},
  {key:"pilot_console",label:tr("NX8PilotConsoleTxt"),description:tr("NX8PilotConsoleDescTxt"),helper:tr("NX8PilotConsoleHelpTxt"),icon:<Layers3 size={18}/>},
  {key:"pilot_feedback",label:tr("NX8FeedbackTxt"),description:tr("NX8FeedbackDescTxt"),helper:tr("NX8FeedbackHelpTxt"),icon:<UserCheck size={18}/>},
  {key:"runtime_certification",label:tr("NX8CertificationTxt"),description:tr("NX8CertificationDescTxt"),helper:tr("NX8CertificationHelpTxt"),icon:<ShieldCheck size={18}/>},
  {key:"product_decision_gate",label:tr("NX8DecisionGateTxt"),description:tr("NX8DecisionGateDescTxt"),helper:tr("NX8DecisionGateHelpTxt"),icon:<Compass size={18}/>},
 ];
 const toolsForSection=(value:WorkspaceSection)=>value==="trust"?trustTools:value==="federation"?federationTools:value==="outcomes"?outcomeTools:value==="launch"?launchTools:[];
 const enabledTools=(value:WorkspaceSection)=>toolsForSection(value).filter(item=>enabled(item.key));
 useEffect(()=>{if(section==="overview"){setActiveTool(null);return;}const tools=enabledTools(section);if(!activeTool||!tools.some(item=>item.key===activeTool))setActiveTool(tools[0]?.key||null)},[section,workspaceKind,advancedRows]); // eslint-disable-line react-hooks/exhaustive-deps

 const sectionMeta:{key:WorkspaceSection;label:string;plainLabel:string;description:string;question:string;count:number;icon:ReactNode;audience:string}[]=[
  {key:"overview",label:tr("NX7OverviewTxt"),plainLabel:tr("NX8SpacesPlainTxt"),description:tr("NX8SpacesPlainDescTxt"),question:tr("NX8SpacesQuestionTxt"),count:memberships.length,icon:<Layers3 size={20}/>,audience:tr("NX8EverydayBadgeTxt")},
  {key:"trust",label:tr("NX7TrustReachTxt"),plainLabel:tr("NX8TrustPlainTxt"),description:tr("NX8TrustPlainDescTxt"),question:tr("NX8TrustQuestionTxt"),count:enabledCount(TRUST_FEATURES),icon:<Link2 size={20}/>,audience:tr("NX8AdvancedBadgeTxt")},
  {key:"federation",label:tr("NX7FederationTxt"),plainLabel:tr("NX8FederationPlainTxt"),description:tr("NX8FederationPlainDescTxt"),question:tr("NX8FederationQuestionTxt"),count:enabledCount(FEDERATION_FEATURES),icon:<Handshake size={20}/>,audience:tr("NX8AdminBadgeTxt")},
  {key:"outcomes",label:tr("NX7RequestsOutcomesTxt"),plainLabel:tr("NX8OutcomesPlainTxt"),description:tr("NX8OutcomesPlainDescTxt"),question:tr("NX8OutcomesQuestionTxt"),count:enabledCount(OUTCOME_FEATURES),icon:<HeartHandshake size={20}/>,audience:tr("NX8EverydayBadgeTxt")},
  {key:"launch",label:tr("NX7LaunchLearnTxt"),plainLabel:tr("NX8LaunchPlainTxt"),description:tr("NX8LaunchPlainDescTxt"),question:tr("NX8LaunchQuestionTxt"),count:enabledCount(LAUNCH_FEATURES),icon:<Rocket size={20}/>,audience:tr("NX8AdminBadgeTxt")},
 ];
 const visibleSections=sectionMeta.filter(item=>item.key!=="launch"||isAdmin);
 const currentMeta=sectionMeta.find(item=>item.key===section)||sectionMeta[0];
 const currentTool=toolsForSection(section).find(item=>item.key===activeTool)||null;
 const renderEmptyJourney=(features:AdvancedNetworkFeatureSuffix[])=>(enabledCount(features)===0?<div className="card nx8-empty-journey"><LockKeyhole size={23}/><div><span>{tr("NX8NotEnabledBadgeTxt")}</span><h3>{tr("NX7JourneyUnavailableTxt")}</h3><p>{tr("NX8JourneyUnavailableFriendlyTxt")}</p></div></div>:null);

 const sectionHelp=(value:WorkspaceSection):HelpTopic=>{
  if(value==="trust")return {title:tr("NX9HelpTrustTitleTxt"),lead:tr("NX9HelpTrustLeadTxt"),sections:[{label:tr("NX9WhyItMattersTxt"),body:tr("NX9HelpTrustWhyTxt")},{label:tr("NX9GoodMomentTxt"),body:tr("NX9HelpTrustWhenTxt")}],privacy:tr("NX9HelpTrustPrivacyTxt"),next:tr("NX9HelpTrustNextTxt")};
  if(value==="federation")return {title:tr("NX9HelpFederationTitleTxt"),lead:tr("NX9HelpFederationLeadTxt"),sections:[{label:tr("NX9MentalModelTxt"),body:tr("NX9HelpFederationModelTxt")},{label:tr("NX9UseItForTxt"),body:tr("NX9HelpFederationUseTxt")}],privacy:tr("NX9HelpFederationPrivacyTxt"),next:tr("NX9HelpFederationNextTxt")};
  if(value==="outcomes")return {title:tr("NX9HelpOutcomesTitleTxt"),lead:tr("NX9HelpOutcomesLeadTxt"),sections:[{label:tr("NX9JourneyTxt"),body:tr("NX9HelpOutcomesJourneyTxt")},{label:tr("NX9BestForTxt"),body:tr("NX9HelpOutcomesBestTxt")}],privacy:tr("NX9HelpOutcomesPrivacyTxt"),next:tr("NX9HelpOutcomesNextTxt")};
  if(value==="launch")return {title:tr("NX9HelpLaunchTitleTxt"),lead:tr("NX9HelpLaunchLeadTxt"),sections:[{label:tr("NX9OperatorViewTxt"),body:tr("NX9HelpLaunchOperatorTxt")},{label:tr("NX9UseItForTxt"),body:tr("NX9HelpLaunchUseTxt")}],privacy:tr("NX9HelpLaunchPrivacyTxt"),next:tr("NX9HelpLaunchNextTxt")};
  return {title:tr("NX9HelpHomeTitleTxt"),lead:tr("NX9HelpHomeLeadTxt"),sections:[{label:tr("NX9EverydayFirstTxt"),body:tr("NX9HelpHomeEverydayTxt")},{label:tr("NX9AdvancedOnlyWhenNeededTxt"),body:tr("NX9HelpHomeAdvancedTxt")}],privacy:tr("NX9HelpHomePrivacyTxt"),next:tr("NX9HelpHomeNextTxt")};
 };
 const toolHelp=(tool:ToolDefinition):HelpTopic=>{
  const privacyKeys=new Set<AdvancedNetworkFeatureSuffix>(["network_passport","network_affiliation","umbrella_runtime","federated_directory","application_scopes","trusted_request_routing","governed_introductions","outcome_trust_receipt","trust_bridges","cross_network_discovery"]);
  const journey=sectionHelp(section);
  return {title:tool.label,lead:tool.helper,sections:[{label:tr("NX9WhatThisDoesTxt"),body:tool.description},{label:tr("NX9WhenToOpenTxt"),body:tr(`NX9ToolWhen_${tool.key}` as any)}],privacy:privacyKeys.has(tool.key)?tr(`NX9ToolPrivacy_${tool.key}` as any):journey.privacy,next:tr(`NX9ToolNext_${tool.key}` as any)};
 };

 const renderTool=()=>{
  if(!activeTool)return null;
  switch(activeTool){
   case "identity_reach":return <section className="card m6-reach-card"><div className="m6-reach-head"><div><span className="warm-kicker"><Link2 size={13}/> {tr("YourNetworkReachTxt")}</span><h2>{tr("WhatYourMembershipsMeanTogetherTxt")}</h2><p>{tr("M6ReachPrivacyDescTxt")}</p></div><span className="m6-reach-badge"><ShieldCheck size={14}/>{tr("AggregateOnlyTxt")}</span></div><div className="m6-reach-grid"><article><Layers3/><span><b>{advancedReach.activeNetworks}</b><small>{tr("ActiveNetworksTxt")}</small></span></article><article><Sparkles/><span><b>{advancedReach.verticals}</b><small>{tr("NetworkTypesTxt")}</small></span></article><article><UsersRound/><span><b>{advancedReach.ownedNetworks}</b><small>{tr("OwnedTxt")}</small></span></article><article><UserCheck/><span><b>{advancedReach.administeredNetworks}</b><small>{tr("AdministeredTxt")}</small></span></article></div><div className="m6-reach-foot"><span>{getVerticalDefinition(workspaceKind).displayName} · {tr("LaunchControlTxt")}</span><span>{tr("CrossNetworkBridgesNowGovernedTxt")}</span></div></section>;
   case "trust_bridges":return <NetworkBridgeManager identity={identity} allowPathTraversal={enabled("multihop_paths")}/>;
   case "cross_network_discovery":return <CrossNetworkDiscovery identity={identity} allowMultiHop={enabled("multihop_paths")}/>;
   case "network_effect_pulse":return <NetworkEffectPulse/>;
   case "network_passport":return <NetworkPassportManager identity={identity}/>;
   case "network_affiliation":return <NetworkFederationAffiliationManager identity={identity}/>;
   case "umbrella_runtime":return <FederationUmbrellaRuntime/>;
   case "federated_directory":return <FederatedDirectoryDiscovery/>;
   case "federation_distribution":return <FederationDistributionSupernode/>;
   case "application_scopes":return <FederatedPurposeScopeFramework/>;
   case "trusted_request_routing":return <TrustedRequestRouting/>;
   case "governed_introductions":return <GovernedFederatedIntroductions/>;
   case "outcome_trust_receipt":return <FederatedOutcomeTrustReceipt/>;
   case "guided_launch":return <NetworkLaunchActivation identity={identity} onOpenNetwork={onOpenNetwork} onAddNetwork={onAddNetwork}/>;
   case "wow_showcase":return <NetworkEffectShowcase/>;
   case "pilot_console":return <AdminPilotLaunchConsole identity={identity} onOpenNetwork={onOpenNetwork}/>;
   case "pilot_feedback":return <PilotFeedbackLearningLoop identity={identity}/>;
   case "runtime_certification":return <ShowcaseRuntimeCertification/>;
   case "product_decision_gate":return <PilotEvidenceDecisionGate identity={identity}/>;
   default:return null;
  }
 };

 const openSection=(next:WorkspaceSection)=>{setSection(next);setActiveTool(null);window.requestAnimationFrame(()=>document.getElementById("nx8-workspace")?.scrollIntoView({behavior:"smooth",block:"start"}))};

 return <div className="my-networks-page nx6-my-networks nx8-workspace">
  <section className="nx8-topbar">
   <div className="nx8-welcome"><span className="nx8-welcome-icon"><Layers3 size={20}/></span><div><small>{tr("NX8HomeEyebrowTxt")}</small><h1>{tr("NX8HomeTitleTxt")}</h1><p>{tr("NX8HomeDescTxt")}</p></div></div>
   <div className="nx8-top-actions"><button className="btn primary" onClick={onAddNetwork}><Plus size={16}/> {tr("AddOrJoinNetworkTxt")}</button>{onExploreDemo&&<button className="btn" onClick={()=>onExploreDemo("family")}><Sparkles size={16}/> {tr("ExperienceASampleTxt")}</button>}<div className="nx8-account"><span><UserRound size={16}/></span><div><b>{identity.displayName}</b><small>{memberships.length} {tr("ActiveNetworkTxt")}{memberships.length===1?"":"s"}</small></div>{onSignOut&&<button className="nx6-text-button danger" onClick={()=>void onSignOut()} aria-label={tr("SignOutTxt")}><LogOut size={14}/></button>}</div></div>
  </section>

  <section className="nx8-trust-note"><ShieldCheck size={18}/><div><b>{tr("NX8PrivacyPromiseTxt")}</b><span>{tr("NX8PrivacyPromiseDescTxt")}</span></div><span>{tr("PrivateByNetwork2Txt")}</span></section>

  <section className="nx8-start" id="nx8-workspace">
   <div className="nx8-start-copy"><span className="warm-kicker">{tr("NX8ChooseWorkspaceKickerTxt")}</span><div className="nx9-title-row"><h2>{section==="overview"?tr("NX8ChooseWorkspaceTitleTxt"):currentMeta.plainLabel}</h2><button className="nx9-info-button" onClick={()=>setHelpTopic(sectionHelp(section))} aria-label={tr("NX9AboutThisAreaTxt")} title={tr("NX9AboutThisAreaTxt")}><Info size={15}/></button></div><p>{section==="overview"?tr("NX8ChooseWorkspaceDescTxt"):currentMeta.question}</p></div>
   {section!=="overview"&&<button className="nx8-back-button" onClick={()=>openSection("overview")}><Layers3 size={15}/>{tr("NX8BackToSpacesTxt")}</button>}
  </section>

  <nav className="nx8-primary-nav" aria-label={tr("NX7WorkspaceNavigationTxt")}>
   {visibleSections.map(item=><button key={item.key} className={section===item.key?"active":""} onClick={()=>openSection(item.key)}>
    <span className="nx8-primary-icon">{item.icon}</span><span className="nx8-primary-copy"><small>{item.audience}</small><b>{item.plainLabel}</b><em>{item.description}</em></span><span className="nx8-primary-count">{item.count}</span><ArrowRight size={17}/>
   </button>)}
  </nav>

  {section!=="overview"&&<section className="nx8-context-bar">
   <div><span>{tr("NX8WorkingInTxt")}</span><b>{getVerticalDefinition(workspaceKind).displayName}</b><small>{tr("NX8ContextPlainHelpTxt")}</small></div>
   <label><span>{tr("NX8ChangeNetworkTypeTxt")}</span><select value={workspaceKind} onChange={e=>setWorkspaceKind(e.target.value as NetworkVerticalKind)}>{(availableKinds.length?availableKinds:[initialKind]).map(kind=><option key={kind} value={kind}>{getVerticalDefinition(kind).displayName}</option>)}</select></label>
  </section>}

  {section==="overview"&&<>
   <section className="nx8-overview-grid">
    <div className="nx8-spaces-panel">
     <div className="my-networks-heading"><div><span className="warm-kicker">{tr("YourSpacesTxt")}</span><h2>{tr("NX8YourNetworksTitleTxt")}</h2><p>{tr("NX8YourNetworksDescTxt")}</p></div></div>
     {memberships.length>0?<div className="my-networks-grid nx6-networks-grid nx8-network-grid">{memberships.map(m=>{const def=getVerticalDefinition(m.network.verticalKind);return <button key={m.network.id} className={`my-network-card nx6-network-card ${m.isActive?"active":""}`} onClick={()=>onOpenNetwork(m)}><span className={`my-network-icon ${m.network.verticalKind}`}>{icon(m.network.verticalKind,24)}</span><span className="my-network-card-copy"><small>{def.displayName}</small><strong>{m.network.name}</strong><p>{outcome[m.network.verticalKind]}</p><span className="my-network-meta"><b>{m.role}</b>{m.isActive&&<em>{tr("CurrentTxt")}</em>}</span></span><ChevronRight size={20}/></button>})}</div>:<div className="card my-networks-empty"><Layers3/><div><h3>{tr("YourFirstNetworkStartsHereTxt")}</h3><p>{tr("CreateOrJoinOneOrUseTheTxt")}</p></div><button className="btn primary" onClick={onAddNetwork}>{tr("CreateOrJoinTxt")}</button></div>}
    </div>
    <aside className="nx8-quick-panel"><span className="warm-kicker">{tr("NX8QuickStartKickerTxt")}</span><h3>{tr("NX8QuickStartTitleTxt")}</h3><p>{tr("NX8QuickStartDescTxt")}</p><button onClick={()=>openSection("outcomes")}><HeartHandshake/><span><b>{tr("NX8QuickAskTxt")}</b><small>{tr("NX8QuickAskDescTxt")}</small></span><ChevronRight/></button><button onClick={()=>openSection("federation")}><Handshake/><span><b>{tr("NX8QuickFederateTxt")}</b><small>{tr("NX8QuickFederateDescTxt")}</small></span><ChevronRight/></button><button onClick={()=>openSection("trust")}><Link2/><span><b>{tr("NX8QuickConnectTxt")}</b><small>{tr("NX8QuickConnectDescTxt")}</small></span><ChevronRight/></button>{isAdmin&&<button onClick={()=>openSection("launch")}><Rocket/><span><b>{tr("NX8QuickAdminTxt")}</b><small>{tr("NX8QuickAdminDescTxt")}</small></span><ChevronRight/></button>}</aside>
   </section>
   <section className="nx8-understand-panel"><div><span className="warm-kicker">{tr("NX8LearnKickerTxt")}</span><h2>{tr("NX8LearnTitleTxt")}</h2><p>{tr("NX8LearnDescTxt")}</p></div><div className="nx8-learning-cards"><article><Link2/><span><b>{tr("NX8LearnTrustTxt")}</b><small>{tr("NX8LearnTrustDescTxt")}</small></span><button className="nx9-mini-info" onClick={()=>setHelpTopic(sectionHelp("trust"))} aria-label={tr("NX9LearnMoreTxt")}><Info size={13}/></button></article><article><Handshake/><span><b>{tr("NX8LearnFederationTxt")}</b><small>{tr("NX8LearnFederationDescTxt")}</small></span><button className="nx9-mini-info" onClick={()=>setHelpTopic(sectionHelp("federation"))} aria-label={tr("NX9LearnMoreTxt")}><Info size={13}/></button></article><article><HeartHandshake/><span><b>{tr("NX8LearnOutcomeTxt")}</b><small>{tr("NX8LearnOutcomeDescTxt")}</small></span><button className="nx9-mini-info" onClick={()=>setHelpTopic(sectionHelp("outcomes"))} aria-label={tr("NX9LearnMoreTxt")}><Info size={13}/></button></article></div></section>
   {onExploreDemo&&<details className="card nx6-playground-drawer"><summary><span><Sparkles size={16}/><span><b>{tr("SafePlaygroundTxt")}</b><small>{tr("ExploreAllSixNetworkProductsWithSampleTxt")}</small></span></span><ChevronRight size={18}/></summary><div className="network-demo-strip nx6-demo-strip">{kinds.map(kind=>{const def=getVerticalDefinition(kind);return <button key={kind} onClick={()=>onExploreDemo(kind)}><span className={`my-network-icon ${kind}`}>{icon(kind,18)}</span><span><b>{def.displayName}</b><small>{outcome[kind]}</small></span><ChevronRight size={17}/></button>})}</div></details>}
   <details className="card nx6-privacy-drawer"><summary><span><ShieldCheck size={17}/><span><b>{tr("HowPrivacyAndIdentityWorkTxt")}</b><small>{tr("SeeWhatCanAndCannotCrossNetworkTxt")}</small></span></span><ChevronRight size={18}/></summary><div className="my-networks-privacy-grid">{TRUSTED_IDENTITY_PRIVACY_RULES.map(rule=><article key={rule.key}><b>{rule.title}</b><p>{rule.description}</p></article>)}</div></details>
  </>}

  {section!=="overview"&&<section className="nx8-journey-shell">
   <aside className="nx8-tool-rail">
    <div className="nx8-tool-rail-head"><small>{tr("NX8ChooseStepTxt")}</small><b>{currentMeta.label}</b><span>{enabledTools(section).length} {tr("NX7EnabledTxt")}</span></div>
    {enabledTools(section).map(item=><button key={item.key} className={activeTool===item.key?"active":""} onClick={()=>setActiveTool(item.key)}>{item.step&&<span className="nx8-tool-step">{item.step}</span>}<span className="nx8-tool-icon">{item.icon}</span><span><b>{item.label}</b><small>{item.description}</small></span><ChevronRight size={16}/></button>)}
    {enabledCount(section==="trust"?TRUST_FEATURES:section==="federation"?FEDERATION_FEATURES:section==="outcomes"?OUTCOME_FEATURES:LAUNCH_FEATURES)===0&&<span className="nx8-no-tools">{tr("NX8NoToolsTxt")}</span>}
   </aside>
   <main className="nx8-tool-stage">
    {section==="trust"&&renderEmptyJourney(TRUST_FEATURES)}
    {section==="federation"&&renderEmptyJourney(FEDERATION_FEATURES)}
    {section==="outcomes"&&renderEmptyJourney(OUTCOME_FEATURES)}
    {section==="launch"&&renderEmptyJourney(LAUNCH_FEATURES)}
    {currentTool&&<header className="nx8-tool-header"><div className="nx8-tool-header-icon">{currentTool.icon}</div><div><span>{currentMeta.label}{currentTool.step?` · ${tr("NX8StepTxt")} ${currentTool.step}`:""}</span><div className="nx9-tool-title-row"><h2>{currentTool.label}</h2><button className="nx9-info-button prominent" onClick={()=>setHelpTopic(toolHelp(currentTool))} aria-label={tr("NX9ExplainThisToolTxt")} title={tr("NX9ExplainThisToolTxt")}><Info size={15}/></button></div><p>{currentTool.helper}</p></div><span className="nx8-enabled-badge"><ShieldCheck size={13}/>{tr("NX8EnabledHereTxt")}</span></header>}
    {renderTool()}
   </main>
  </section>}
  {helpTopic&&<div className="nx9-help-backdrop" role="presentation" onMouseDown={()=>setHelpTopic(null)}><section className="nx9-help-modal" role="dialog" aria-modal="true" aria-label={helpTopic.title} onMouseDown={e=>e.stopPropagation()}><header><div><span className="nx9-help-kicker"><Sparkles size={13}/>{tr("NX9ContextGuideTxt")}</span><h2>{helpTopic.title}</h2><p>{helpTopic.lead}</p></div><button className="nx9-help-close" onClick={()=>setHelpTopic(null)} aria-label={tr("CloseTxt")}><X size={18}/></button></header><div className="nx9-help-grid">{helpTopic.sections.map((item,index)=><article key={`${item.label}-${index}`}><span>{index+1}</span><div><b>{item.label}</b><p>{item.body}</p></div></article>)}</div>{helpTopic.privacy&&<aside className="nx9-help-guardrail"><ShieldCheck size={18}/><div><b>{tr("NX9GoodToKnowTxt")}</b><p>{helpTopic.privacy}</p></div></aside>}{helpTopic.next&&<footer><span>{tr("NX9NextMoveTxt")}</span><p>{helpTopic.next}</p><button className="btn primary" onClick={()=>setHelpTopic(null)}>{tr("NX9GotItTxt")}</button></footer>}</section></div>}
 </div>;
}
