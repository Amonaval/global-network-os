export type FederatedDiscoveryPurpose="all"|"jobs"|"business"|"mentoring"|"matrimony"|"events"|"volunteering"|"community-help"|"expertise"|string;

export type FederatedNetworkDiscoveryResult={
 networkId:string;networkName:string;verticalKind:string;passportSlug:string;passportVisibility:"federation"|"public";
 tagline:string;summary:string;locationLabel:string;establishedLabel:string;externalUrl:string;capabilities:string[];participationScopes:string[];
 verificationState:string;umbrellaId:string;umbrellaName:string;umbrellaSlug:string;relationshipType:string;contextLabel:string;
 sourceNetworkId:string;sourceNetworkName:string;matchedPurpose:string;trustPathLabel:string;passportUpdatedAt:string|null;
};

export const FEDERATED_DISCOVERY_GUARDRAILS=[
 "Federated discovery returns Networks, not people. Person/resource discovery requires a separate future purpose-and-consent contract.",
 "A result is eligible only when the requester has an active source-network membership, both source and target affiliations are approved under the same active umbrella, and the target Passport is Federation/Public and directory-discoverable.",
 "Purpose filters match only network-declared outward participation scopes or capabilities. They never imply that any member of the target network opted into that purpose.",
 "Each result carries an explainable institutional trust path: your source network → approved umbrella → target network.",
 "No child-network member, profile, contact, relationship or private graph table is queried by the NF-4 discovery function.",
] as const;
