import type {NetworkVerticalKind} from "../verticals/contracts";
export type PilotHealth="starting"|"progressing"|"attention"|"proven";
export type PilotPriority="high"|"medium"|"low";
export type PilotNetworkSnapshot={networkId:string;networkName:string;verticalKind:NetworkVerticalKind;role:"owner"|"admin";seededItems:number;activeMembers:number;claimedIdentities:number;acceptedBridges:number;discoverySearches30d:number;introductionRequests30d:number;acceptedIntroductions30d:number;lastActivityAt:string|null;ageDays:number;readiness:number;health:PilotHealth;priority:PilotPriority;blocker:"seed"|"participation"|"claim"|"bridge"|"discovery"|"introduction"|"none"};
export type PilotPortfolioSummary={networks:number;proven:number;attention:number;progressing:number;starting:number;totalMembers:number;totalClaims:number;acceptedOutcomes30d:number;highestPriorityNetworkId:string|null};
