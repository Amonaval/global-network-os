import type {VerticalDefinition} from "../../core/verticals/contracts";
import {HOUSING_SOCIETY_FEATURE_CATALOG} from "./features/catalog";
export const HOUSING_SOCIETY_VERTICAL={
 kind:"housing-society",displayName:"Residential Community / Housing Society",iconToken:"building-2",themeToken:"housing-society-civic",status:"active",
 capabilities:["network.context","network.membership","network.construction","network.affiliation","network.activity","runtime.launch-control","runtime.guide","runtime.playground","runtime.whats-new","identity.claiming","identity.invitations","identity.privacy","contribution.governed","community.groups-events","notifications.digest","domain.housing-society"],
 featureCatalog:HOUSING_SOCIETY_FEATURE_CATALOG,
 legacyNetworkLabels:{entityLabel:"Flat / Unit",entityLabelPlural:"Flats / Units",levelLabel:"Floor",levelLabelPlural:"Floors",parentLabel:"Owner",childLabel:"Resident",peerLabel:"Neighbour"}
} satisfies VerticalDefinition;
