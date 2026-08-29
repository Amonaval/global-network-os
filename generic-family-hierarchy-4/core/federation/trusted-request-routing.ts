export type FederatedRequestStatus="open"|"closed"|"cancelled";
export type FederatedRouteStatus="suggested"|"shortlisted"|"dismissed";

export type FederatedRequestContext={
 networkId:string;networkName:string;umbrellaId:string;umbrellaName:string;scopeKey:string;passportVisibility:"federation"|"public";
};

export type FederatedTrustedRequest={
 id:string;scopeKey:string;title:string;description:string;locationLabel:string;tags:string[];status:FederatedRequestStatus;
 networkId:string;networkName:string;umbrellaId:string;umbrellaName:string;createdAt:string|null;updatedAt:string|null;
};

export type FederatedRequestRoute={
 id:string;requestId:string;targetScopeProfileId:string;displayName:string;headline:string;summary:string;locationLabel:string;tags:string[];
 contactMode:"introduction_only"|"direct_request";targetNetworkId:string;targetNetworkName:string;umbrellaId:string;umbrellaName:string;
 score:number;reasons:string[];trustPathLabel:string;status:FederatedRouteStatus;generatedAt:string|null;
};

export const TRUSTED_REQUEST_ROUTING_GUARDRAILS=[
 "A request is scoped to one source Network, one approved Umbrella and one declared purpose. It is not broadcast globally.",
 "Routing uses only active NF-5 purpose profiles whose owners explicitly opted into the same purpose and federation context.",
 "A suggested route is not an introduction. NF-6 does not notify the target, reveal private contact details or imply endorsement.",
 "Route scores are deterministic relevance hints based on selective outward data. They are not universal reputation scores.",
 "Closing or cancelling a request stops future routing without changing any underlying network membership, affiliation or purpose opt-in.",
] as const;
