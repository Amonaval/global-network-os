export type FederationUmbrellaType="community"|"association"|"federation"|"institution"|"ecosystem"|"other";
export type FederationAffiliationRelationship="member"|"chapter"|"affiliate"|"constituent"|"franchisee"|"partner"|"other";
export type FederationAffiliationStatus="requested"|"approved"|"declined"|"suspended"|"revoked";

export type FederationUmbrella={
 id:string;name:string;slug:string;umbrellaType:FederationUmbrellaType;summary:string;locationLabel:string;status:"active"|"archived";role:"owner"|"admin";createdAt:string|null;
};

export type FederationUmbrellaSearchResult={id:string;name:string;slug:string;umbrellaType:FederationUmbrellaType;summary:string;locationLabel:string};

export type NetworkUmbrellaAffiliation={
 id:string;networkId:string;networkName:string;verticalKind:string;umbrellaId:string;umbrellaName:string;umbrellaSlug:string;relationshipType:FederationAffiliationRelationship;status:FederationAffiliationStatus;contextLabel:string;direction:"network"|"umbrella"|"both";canReview:boolean;canSuspend:boolean;canRevoke:boolean;passportSlug:string;passportTagline:string;passportSummary:string;passportLocation:string;passportVerification:string;requestedAt:string|null;updatedAt:string|null;
};

export const FEDERATION_AFFILIATION_GUARDRAILS=[
 "An approved affiliation verifies a network-to-umbrella relationship; it does not grant access to the network's members or graph.",
 "A network must expose a federation/public Network Passport before requesting affiliation, so reviewers see only governed outward network data.",
 "Umbrella approval never enrolls individual members into the umbrella or any application scope.",
 "Suspension or revocation removes the active institutional provenance without altering the source network or its private data.",
] as const;
