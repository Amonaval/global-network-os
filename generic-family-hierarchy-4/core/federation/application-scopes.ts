export const FEDERATED_APPLICATION_SCOPES=[
 {key:"jobs",label:"Jobs & referrals",description:"Opt in to purpose-specific professional opportunity discovery."},
 {key:"business",label:"Business discovery",description:"Opt in to business, supplier or collaboration discovery."},
 {key:"expertise",label:"Expertise",description:"Offer expertise through a governed federation context."},
 {key:"mentoring",label:"Mentoring",description:"Opt in as a mentor or mentoring participant."},
 {key:"matrimony",label:"Matrimony",description:"Declare only the first consent boundary; vertical-specific eligibility and reveal rules remain separate."},
 {key:"relocation",label:"Relocation help",description:"Offer or request location-specific community support."},
 {key:"events",label:"Events",description:"Participate in federation-scoped event discovery."},
 {key:"volunteering",label:"Volunteering",description:"Offer time or skills for governed community initiatives."},
 {key:"community-help",label:"Community help",description:"Opt in to purpose-specific community assistance."},
] as const;

export type FederatedApplicationScopeKey=typeof FEDERATED_APPLICATION_SCOPES[number]["key"]|string;
export type FederatedScopeContext={networkId:string;networkName:string;umbrellaId:string;umbrellaName:string;scopeKey:string;passportVisibility:"federation"|"public"};
export type FederatedScopeProfile={id:string;scopeKey:string;displayName:string;headline:string;summary:string;locationLabel:string;tags:string[];contactMode:"introduction_only"|"direct_request";networkId:string;networkName:string;umbrellaId:string;umbrellaName:string;sourceNetworkId:string;sourceNetworkName:string;trustPathLabel:string;isMine:boolean;updatedAt:string|null};
export type MyFederatedScopeProfile={id:string;scopeKey:string;displayName:string;headline:string;summary:string;locationLabel:string;tags:string[];contactMode:"introduction_only"|"direct_request";networkId:string;networkName:string;umbrellaId:string;umbrellaName:string;active:boolean;updatedAt:string|null};

export const FEDERATED_SCOPE_GUARDRAILS=[
 "A Network Passport declaring a purpose is only a network-level capability declaration. A person becomes discoverable only after their own explicit purpose opt-in.",
 "Opt-in is purpose-specific, umbrella-specific and source-network-specific. Joining one purpose never creates global discoverability or enrollment in another purpose.",
 "Federated scope profiles are selective outward snapshots. They do not expose the source network's private member record, contact details, relationships or graph topology.",
 "Withdrawal is immediate for future reads: deactivating a scope profile removes it from purpose discovery without deleting the person's underlying network membership.",
 "Trust receipts explain the institutional route that permits the scoped result. They do not claim endorsement, reputation or guaranteed outcome.",
] as const;
