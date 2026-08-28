import type {VerticalAppComposition} from "../../core/verticals/app-composition";
import type {ProductizedNetworkConfig,ProductizedVerticalKind} from "../../templates/productized/config";
const label=(en:string)=>({en,hi:en,mr:en});
export function createProductizedAppComposition(kind:ProductizedVerticalKind,cfg:ProductizedNetworkConfig):VerticalAppComposition{return {
 kind,renderStatus:"active",featureCatalogId:kind,
 primaryNavigation:[
  {viewId:"home",featureKey:`${kind}.core.home`,iconToken:"home",label:label("Home")},
  {viewId:"intelligence",featureKey:`${kind}.shared.intelligence`,iconToken:"intelligence",label:label("Intelligence")},
  {viewId:"explorer",featureKey:`${kind}.shared.explorer`,iconToken:"layers",label:label("Explore")},
  {viewId:"directory",featureKey:`${kind}.core.directory`,iconToken:"users",label:label("Directory")},
  {viewId:"community",featureKey:`${kind}.shared.community`,iconToken:"calendar",label:label("Community")},
  {viewId:"places",featureKey:`${kind}.shared.places`,iconToken:"map",label:label("Places")},
  {viewId:"connections",featureKey:`${kind}.core.connections`,iconToken:"heart-handshake",label:label("Connections")},
  {viewId:"contribute",featureKey:`${kind}.shared.contribute`,iconToken:"contribute",label:label("Contribute")},
  {viewId:"guide",iconToken:"book-open",label:label("Guide")},
 ],
 mobileMoreNavigation:[{viewId:"admin",featureKey:`${kind}.admin.manage`,iconToken:"settings",label:label("Admin"),adminOnly:true}],
 mobileBottomViewIds:["home","explorer","directory","community"],mobileMoreActiveViewIds:["intelligence","places","connections","contribute","admin","guide"],
 guide:{registryId:`${kind}-guide-g8`,guideByView:{home:`${kind}-home`,intelligence:`${kind}-intelligence`,explorer:`${kind}-explorer`,directory:`${kind}-directory`,community:`${kind}-community`,places:`${kind}-places`,connections:`${kind}-connections`,contribute:`${kind}-contribute`,admin:`${kind}-admin`},actionToView:{"Open explorer":"explorer","Open directory":"directory","Open community":"community","Open admin":"admin"},playgroundViewIds:["home","intelligence","explorer","directory","community","places","connections","contribute"]},
 playground:{enabled:true,startView:"home",publicNetworkSettings:{name:cfg.sampleName,network_template:kind,vertical_kind:kind}},
 launch:{bundles:[{key:"core",label:"Core",description:"Home and essential network access"},{key:"intelligence",label:"Intelligence",description:"Search, paths, health, missing links and Ask Network"},{key:"discover",label:"Discover",description:"Explorer, directory and places"},{key:"community",label:"Community",description:"Groups, events, history and milestones"},{key:"connect",label:"Connect",description:"Typed relationships and paths"},{key:"contribute",label:"Contribute",description:"Governed network improvement"},{key:"admin",label:"Admin",description:"Import and management"},{key:"network-effect",label:"Advanced network effect",description:"M6 trusted reach, bridges, discovery, pulse and governed multi-hop paths"},{key:"showcase",label:"Advanced showcase",description:"M7 synthetic WOW theater"},{key:"pilot-ops",label:"Advanced pilot operations",description:"M7 guided launch, pilot console, feedback, certification and decision gate"}],playgroundExcludedBundles:["admin","network-effect","showcase","pilot-ops"],playgroundTitle:`${cfg.label} Playground`,playgroundDescription:cfg.sampleDescription,playgroundRecommendation:"Explore the hierarchy, directory, community and relationship views before creating a real network.",dayOneTitle:`${cfg.label} ready`,dayOneDescription:"A complete first release powered by Generic Network OS capabilities.",pilotTargetsTitle:`${cfg.shortLabel} pilot`,pilotTargetsDescription:"Start with one coherent real-world network and a small admin team.",footnoteTitle:"Shared engine, domain semantics",footnoteDescription:"Reusable mechanics stay generic while relationship vocabulary and business meaning remain template-specific."},
 whatsNew:{featureToView:{[`${kind}.shared.intelligence`]:"intelligence",[`${kind}.shared.explorer`]:"explorer",[`${kind}.core.directory`]:"directory",[`${kind}.shared.community`]:"community",[`${kind}.shared.places`]:"places",[`${kind}.core.connections`]:"connections",[`${kind}.shared.contribute`]:"contribute",[`${kind}.admin.manage`]:"admin",[`${kind}.admin.import`]:"admin"},defaultView:"home",kicker:`New in ${cfg.shortLabel}`,fallbackTitle:`${cfg.shortLabel} update`,fallbackDescription:"A new network capability is ready."}
};}
