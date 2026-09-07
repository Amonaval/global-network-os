import {createProductizedFeatureCatalog} from "../../../capabilities/template-product/features";
import type {FeatureDefinition} from "../../../core/features/contracts";

const base=createProductizedFeatureCatalog("association","Community / Association");
const me:FeatureDefinition<string,any,any>={key:"association.core.me",bundle:"core",label:"Me & My Family",description:"Personal profile, household relationships, membership and participation context.",minimumExperience:"member",defaultLaunch:"released"};
export const ASSOCIATION_FEATURE_CATALOG={...base,features:[...base.features,me]};
