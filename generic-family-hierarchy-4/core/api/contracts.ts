import type {ProductizedVerticalKind} from "../../templates/productized/config";

export type ApiSuccess<T>={ok:true;data:T;requestId:string};
export type ApiFailure={ok:false;error:{code:string;message:string};requestId:string};
export type ApiResponse<T>=ApiSuccess<T>|ApiFailure;

export type CreateNetworkCommand=
 | {kind:"family";name:string;slug?:string;description?:string}
 | {kind:ProductizedVerticalKind;name:string;contextValue:string;description?:string};
export type CreateNetworkResult={networkId:string;approvalStatus?:"pending"|"approved"|"rejected"};

export type JoinNetworkCommand={kind:"family"|"productized";code:string};
export type JoinNetworkResult={networkId:string};

export type CreateGraphRelationshipCommand={fromEntityId:string;toEntityId:string;relationshipType:string;metadata?:Record<string,unknown>};
export type CreateGraphRelationshipResult={relationshipId:string};

export type BootstrapInstitutionRow={kind?:string;label:string;metadata?:Record<string,unknown>;affiliations?:Record<string,string|string[]>};
export type BootstrapInstitutionCommand={rows:BootstrapInstitutionRow[]};
export type BootstrapInstitutionResult={inserted:number;updated:number;skipped:number};

export type ClaimIdentityCommand={kind:"family"|"alumni"|"productized";subjectId:string};
export type ClaimIdentityResult={networkId:string};

export type RequestNetworkBridgeCommand={sourceNetworkId:string;targetCode:string;relationshipType:"affiliation"|"community"|"partner"|"parent_child"|"trusted_peer";contextLabel?:string;capabilities:{discovery:boolean;introductions:boolean;pathTraversal:boolean}};
export type RequestNetworkBridgeResult={bridgeId:string};
export type ReviewNetworkBridgeCommand={bridgeId:string;accept:boolean};
export type ReviewNetworkBridgeResult={bridgeId:string;status:"accepted"|"declined"};
export type RevokeNetworkBridgeCommand={bridgeId:string};
export type RevokeNetworkBridgeResult={bridgeId:string;status:"revoked"};
export type NetworkBridgeCodeCommand={networkId:string;regenerate?:boolean};
export type NetworkBridgeCodeResult={networkId:string;code:string};

export type DiscoverTrustedNetworkCommand={sourceNetworkId:string;query:string;limit?:number};
export type DiscoverTrustedNetworkResult={candidates:Array<{candidateId:string;targetNetworkId:string;targetNetworkName:string;bridgeId:string;relationshipType:string;matchHint:string;pathDepth:1|2;pathSummary:string}>};
export type RequestTrustedIntroductionCommand={candidateId:string;message:string};
export type RequestTrustedIntroductionResult={introductionId:string};
export type ReviewTrustedIntroductionCommand={introductionId:string;accept:boolean};
export type ReviewTrustedIntroductionResult={introductionId:string;status:"accepted"|"declined"};
