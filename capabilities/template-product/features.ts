import type {FeatureCatalog,FeatureDefinition} from "../../core/features/contracts";
import type {ProductizedVerticalKind} from "../../templates/productized/config";
export type ProductizedExperienceLevel="member"|"connected"|"admin";
export type ProductizedFeatureBundle="core"|"discover"|"community"|"connect"|"contribute"|"admin";
export function productizedFeatureKey(kind:ProductizedVerticalKind,suffix:string){return `${kind}.${suffix}` as const}
export function createProductizedFeatureCatalog(kind:ProductizedVerticalKind,label:string):FeatureCatalog<string,ProductizedFeatureBundle,ProductizedExperienceLevel>{
 const features:FeatureDefinition<string,ProductizedFeatureBundle,ProductizedExperienceLevel>[]=[
  {key:`${kind}.core.home`,bundle:"core",label:`${label} home`,description:"Network overview, health and next actions.",minimumExperience:"member",defaultLaunch:"released"},
  {key:`${kind}.shared.explorer`,bundle:"discover",label:"Network explorer",description:"Explore the same entities through configurable hierarchy projections.",minimumExperience:"member",defaultLaunch:"released"},
  {key:`${kind}.core.directory`,bundle:"discover",label:"Directory",description:"Search and filter network entities and affiliations.",minimumExperience:"member",defaultLaunch:"released"},
  {key:`${kind}.shared.community`,bundle:"community",label:"Community life",description:"Groups, events, RSVP, memories/history, milestones and updates.",minimumExperience:"member",defaultLaunch:"released"},
  {key:`${kind}.shared.places`,bundle:"discover",label:"Places",description:"Understand geographic distribution and regional coverage.",minimumExperience:"member",defaultLaunch:"released"},
  {key:`${kind}.core.connections`,bundle:"connect",label:"Relationships",description:"Explore typed relationships and connection context.",minimumExperience:"connected",defaultLaunch:"released"},
  {key:`${kind}.shared.contribute`,bundle:"contribute",label:"Contributions",description:"Help keep network information current through governed suggestions.",minimumExperience:"member",defaultLaunch:"released"},
  {key:`${kind}.admin.manage`,bundle:"admin",label:`${label} admin`,description:"Manage entities, relationships, invitations and network structure.",minimumExperience:"admin",defaultLaunch:"released"},
  {key:`${kind}.admin.import`,bundle:"admin",label:"Import",description:"Preview and import structured network data from Excel or CSV.",minimumExperience:"admin",defaultLaunch:"released"},
 ];
 return {catalogId:kind,features,experienceRank:{member:1,connected:2,admin:3},experienceLabels:{member:{label:"Member",description:"Core discovery and network participation."},connected:{label:"Connected",description:"Relationships and trusted network context."},admin:{label:"Admin",description:"Network administration and growth."}}};
}
