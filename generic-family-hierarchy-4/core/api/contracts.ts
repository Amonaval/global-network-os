import type {ProductizedVerticalKind} from "../../templates/productized/config";

export type ApiSuccess<T>={ok:true;data:T;requestId:string};
export type ApiFailure={ok:false;error:{code:string;message:string};requestId:string};
export type ApiResponse<T>=ApiSuccess<T>|ApiFailure;

export type CreateNetworkCommand=
 | {kind:"family";name:string;slug?:string;description?:string}
 | {kind:ProductizedVerticalKind;name:string;contextValue:string;description?:string};
export type CreateNetworkResult={networkId:string};

export type JoinNetworkCommand={kind:"family"|"productized";code:string};
export type JoinNetworkResult={networkId:string};

export type CreateGraphRelationshipCommand={fromEntityId:string;toEntityId:string;relationshipType:string;metadata?:Record<string,unknown>};
export type CreateGraphRelationshipResult={relationshipId:string};

export type BootstrapInstitutionRow={kind?:string;label:string;metadata?:Record<string,unknown>;affiliations?:Record<string,string|string[]>};
export type BootstrapInstitutionCommand={rows:BootstrapInstitutionRow[]};
export type BootstrapInstitutionResult={inserted:number;updated:number;skipped:number};

export type ClaimIdentityCommand={kind:"family"|"alumni"|"productized";subjectId:string};
export type ClaimIdentityResult={networkId:string};
