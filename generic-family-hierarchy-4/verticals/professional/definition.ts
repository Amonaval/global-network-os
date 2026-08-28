import type {VerticalDefinition} from "../../core/verticals/contracts";
import {PROFESSIONAL_FEATURE_CATALOG} from "./features/catalog";
export const PROFESSIONAL_VERTICAL={
 kind:"professional",
 displayName:"Trusted Expertise Network",
 iconToken:"briefcase",
 themeToken:"professional-violet",
 status:"active",
 capabilities:["network.context","network.membership","network.construction","network.affiliation","network.activity","network.intelligence","runtime.launch-control","runtime.guide","runtime.playground","runtime.whats-new","identity.privacy","contribution.governed","community.groups-events","notifications.digest","domain.professional-expertise"],
 featureCatalog:PROFESSIONAL_FEATURE_CATALOG,
 legacyNetworkLabels:{entityLabel:"Professional",entityLabelPlural:"Professionals",levelLabel:"Expertise",levelLabelPlural:"Expertise areas",parentLabel:"Referrer",childLabel:"Referred professional",peerLabel:"Collaborator"}
} satisfies VerticalDefinition;
