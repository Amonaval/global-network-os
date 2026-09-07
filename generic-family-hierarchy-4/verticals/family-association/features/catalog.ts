import {createProductizedFeatureCatalog} from "../../../capabilities/template-product/features";
import type {FeatureDefinition} from "../../../core/features/contracts";

const base=createProductizedFeatureCatalog("family-association","Family Community Association");
const extras:FeatureDefinition<string,any,any>[]=[
 {key:"family-association.core.me",bundle:"core",label:"Me & My Family",description:"Personal profile, family, annual membership and participation context.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"family-association.core.membership",bundle:"core",label:"Annual family membership",description:"April-March family membership, renewal, grace period and membership history.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"family-association.community.our-year",bundle:"community",label:"Our Year",description:"Past and upcoming events, celebrations, awards and chapter milestones in one annual timeline.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"family-association.admin.governance",bundle:"admin",label:"Committee & role governance",description:"Year-versioned committee terms and controlled role/portfolio catalogs.",minimumExperience:"admin",defaultLaunch:"released"},
 {key:"family-association.admin.finance",bundle:"admin",label:"Annual community finance",description:"Track opening balance, family collections, donations, allocations and closing balance with configurable visibility.",minimumExperience:"admin",defaultLaunch:"test"},
];
export const FAMILY_ASSOCIATION_FEATURE_CATALOG={...base,features:[...base.features.filter(f=>f.key!=="family-association.shared.intelligence"),...extras]};
