import {fetchNetworkAffiliatedEntities,fetchNetworkProjections} from "../capabilities/affiliation/remote";
import {buildProjectionTree} from "../capabilities/affiliation/runtime";
import {fetchNetworkActivities,fetchNetworkGroups} from "../capabilities/activity/remote";
export const networkOsRuntime={affiliation:{fetchEntities:fetchNetworkAffiliatedEntities,fetchProjections:fetchNetworkProjections,buildProjectionTree},activity:{fetch:fetchNetworkActivities,groups:fetchNetworkGroups}};
