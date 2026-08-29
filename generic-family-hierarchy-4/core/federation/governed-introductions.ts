export type FederatedIntroductionStatus="pending"|"accepted"|"declined"|"cancelled";
export type FederatedIntroductionDirection="inbound"|"outbound";

export type IntroductionRouteCandidate={
 routeId:string;requestId:string;requestTitle:string;scopeKey:string;targetScopeProfileId:string;targetDisplayName:string;targetHeadline:string;targetNetworkName:string;umbrellaName:string;score:number;trustPathLabel:string;
};

export type FederatedIntroduction={
 id:string;direction:FederatedIntroductionDirection;status:FederatedIntroductionStatus;scopeKey:string;requestTitle:string;
 requesterAlias:string;message:string;requesterContactNote:string;targetResponseNote:string;targetContactNote:string;
 targetDisplayName:string;targetHeadline:string;targetNetworkName:string;umbrellaName:string;trustPathLabel:string;
 createdAt:string|null;respondedAt:string|null;updatedAt:string|null;
};

export const GOVERNED_INTRODUCTION_GUARDRAILS=[
 "An NF-6 route must be explicitly shortlisted before an introduction can be requested.",
 "The target sees the request and trust path before accepting, but the requester's private response channel stays withheld until acceptance.",
 "Accepting is explicit person-level consent for this introduction only. It does not create a reusable friendship, membership, global contact permission or endorsement.",
 "Introduction acceptance is revalidated against the current purpose opt-in, Network Passport, approved affiliation and active umbrella before the boundary opens.",
 "Contact details are supplied deliberately for this introduction; NF-7 never copies email, phone or other private fields from a source network profile.",
] as const;
