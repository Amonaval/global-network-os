import type {FeatureCatalog,FeatureDefinition} from "../../../core/features/contracts";
export type AlumniExperienceLevel="member"|"connected"|"admin";
export type AlumniFeatureBundle="core"|"intelligence"|"discover"|"connect"|"community"|"admin";
export const ALUMNI_FEATURES=[
 {key:"alumni.core.home",bundle:"core",label:"Alumni home",description:"Institution-focused alumni starting point.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"alumni.shared.intelligence",bundle:"intelligence",label:"Alumni intelligence",description:"Permission-aware discovery, network health, warm-path reasoning and evidence-backed Ask Network.",minimumExperience:"connected",defaultLaunch:"test"},
 {key:"alumni.shared.explorer",bundle:"discover",label:"Network explorer",description:"Navigate institution, program, batch, stream, city and company through configurable projections.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"alumni.core.directory",bundle:"discover",label:"Alumni directory",description:"Search approved alumni by batch, program, city and career.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"alumni.core.cohorts",bundle:"discover",label:"Batches & programs",description:"Legacy cohort discovery now powered by the broader explorer model.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"alumni.shared.community",bundle:"community",label:"Community life",description:"Shared groups, reunions, events, RSVP, memories and milestones.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"alumni.shared.places",bundle:"discover",label:"Alumni places",description:"Understand where the alumni network lives and works.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"alumni.core.connections",bundle:"connect",label:"Connections",description:"Claim your profile and connect through trusted alumni identity.",minimumExperience:"connected",defaultLaunch:"released"},
 {key:"alumni.admin.import",bundle:"admin",label:"Import alumni",description:"Preview and import alumni lists from Excel or CSV.",minimumExperience:"admin",defaultLaunch:"released"},
 {key:"alumni.admin.manage",bundle:"admin",label:"Alumni admin",description:"Manage alumni profiles, invitations and network growth.",minimumExperience:"admin",defaultLaunch:"released"},
] as const satisfies readonly FeatureDefinition<string,AlumniFeatureBundle,AlumniExperienceLevel>[];
export type AlumniFeatureKey=typeof ALUMNI_FEATURES[number]["key"];
export const ALUMNI_FEATURE_CATALOG:FeatureCatalog<AlumniFeatureKey,AlumniFeatureBundle,AlumniExperienceLevel>={catalogId: "alumni",features:ALUMNI_FEATURES,experienceRank:{member:1,connected:2,admin:3},experienceLabels:{member:{label:"Member",description:"Core alumni discovery and shared network life."},connected:{label:"Connected",description:"Identity and trusted connections."},admin:{label:"Admin",description:"Alumni network administration."}}};
