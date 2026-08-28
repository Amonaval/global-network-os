import type {NetworkVerticalKind} from "../verticals/contracts";
export type NetworkLaunchStage="seed"|"invite"|"claim"|"bridge"|"outcome"|"proven";
export type NetworkLaunchSnapshot={networkId:string;networkName:string;verticalKind:NetworkVerticalKind;role:"owner"|"admin";seededItems:number;activeMembers:number;claimedIdentities:number;acceptedBridges:number;acceptedIntroductions:number;stage:NetworkLaunchStage;readiness:number};
