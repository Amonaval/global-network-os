export type UmbrellaRuntimeHealth="ready"|"watch"|"setup";

export type UmbrellaRuntimeSummary={
 umbrellaId:string;name:string;slug:string;umbrellaType:string;summary:string;locationLabel:string;role:"owner"|"admin";
 approvedNetworks:number;requestedNetworks:number;suspendedNetworks:number;visiblePassportNetworks:number;publicPassportNetworks:number;
 verticalCount:number;capabilityCount:number;scopeCount:number;profileFreshnessPct:number;healthScore:number;health:UmbrellaRuntimeHealth;
};

export type UmbrellaNetworkParticipant={
 affiliationId:string;networkId:string;networkName:string;verticalKind:string;relationshipType:string;contextLabel:string;
 passportVisible:boolean;passportSlug:string;passportVisibility:"private"|"federation"|"public";passportTagline:string;passportSummary:string;
 passportLocation:string;passportEstablished:string;passportExternalUrl:string;passportCapabilities:string[];passportScopes:string[];
 passportVerification:string;directoryDiscoverable:boolean;passportUpdatedAt:string|null;affiliationUpdatedAt:string|null;
};

export const UMBRELLA_RUNTIME_GUARDRAILS=[
 "An umbrella governs participating networks, not the people inside those networks.",
 "The network directory is composed only from approved affiliations and the source network's currently permitted Passport fields.",
 "Changing a Passport back to Private removes its outward profile content from the umbrella runtime without deleting the approved institutional relationship.",
 "Aggregate health is derived from affiliation and Passport metadata only; it never queries child-network members, contacts, relationships or graph topology.",
] as const;
