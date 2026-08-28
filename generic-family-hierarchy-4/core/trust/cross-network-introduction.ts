export type CrossNetworkDiscoveryResult={candidateId:string;targetNetworkId:string;targetNetworkName:string;bridgeId:string;relationshipType:string;matchHint:string;pathDepth:1|2;pathSummary:string};
export type TrustedIntroductionStatus="pending"|"accepted"|"declined"|"cancelled";
export type TrustedIntroduction={id:string;direction:"incoming"|"outgoing";sourceNetworkName:string;targetNetworkName:string;otherName:string|null;message:string;status:TrustedIntroductionStatus;createdAt:string;updatedAt:string;canReview:boolean;pathDepth:1|2;pathSummary:string};
