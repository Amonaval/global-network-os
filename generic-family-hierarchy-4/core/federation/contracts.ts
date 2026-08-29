export type FederationRelationshipType = "affiliation" | "chapter" | "association" | "franchise" | "federation" | "verified_membership";
export type FederationAffiliationStatus = "requested" | "approved" | "suspended" | "revoked";

export type FederationPrivacyInvariant = {
  key: "affiliation_not_access" | "network_not_person" | "application_not_global" | "private_graph_stays_private";
  statement: string;
};

export const FEDERATION_PRIVACY_INVARIANTS: readonly FederationPrivacyInvariant[] = [
  {key:"affiliation_not_access",statement:"Network affiliation never grants implicit access to the child network's private people or graph."},
  {key:"network_not_person",statement:"A network participating in an umbrella never enrolls its members into that umbrella automatically."},
  {key:"application_not_global",statement:"Participation in one purpose/application scope never creates global discoverability."},
  {key:"private_graph_stays_private",statement:"Federation operates on explicit outward network data and aggregate signals; private topology stays inside the source network."},
];

export type FederationDistributionCandidate = {
  id:string;
  label:string;
  domain:string;
  childNetworkCount:number;
  averageMembersPerNetwork:number;
  organizerReach:number;
  governanceReadiness:number;
  dataReadiness:number;
  domainFit:number;
  referralMultiplier:number;
};

export type FederationDistributionAssessment = FederationDistributionCandidate & {
  projectedDirectMembers:number;
  projectedSecondWaveNetworks:number;
  projectedTotalNetworks:number;
  projectedTotalMembers:number;
  multiplicationScore:number;
  tier:"seed"|"multiplier"|"supernode";
  reasons:string[];
};
