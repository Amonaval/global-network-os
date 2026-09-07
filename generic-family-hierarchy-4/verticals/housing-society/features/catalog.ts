import {createProductizedFeatureCatalog} from "../../../capabilities/template-product/features";
import type {FeatureDefinition} from "../../../core/features/contracts";

const base=createProductizedFeatureCatalog("housing-society","Housing Society");
const foundation:FeatureDefinition<string,any,any>[]=[
 {key:"housing-society.core.property",bundle:"core",label:"Society property structure",description:"Building, wing, floor and flat/unit structure with occupancy context.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.core.residents",bundle:"discover",label:"Residents & units",description:"Resident and unit discovery using society-scoped directory/search primitives.",minimumExperience:"member",defaultLaunch:"released"},
];
export const HOUSING_SOCIETY_FEATURE_CATALOG={...base,features:[...base.features.filter(f=>f.key!=="housing-society.shared.intelligence"),...foundation]};
