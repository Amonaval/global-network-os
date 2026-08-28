export type ShowcaseRuntimeStatus="ready"|"needs_setup"|"blocked";
export type DiscoveryDiagnosticCode="ready"|"no_bridge"|"no_claimed_people"|"matching_unclaimed"|"no_match";

export type ShowcaseRuntimeCertification={
 activeNetworks:number;
 claimedContexts:number;
 acceptedBridges:number;
 discoveryBridges:number;
 introductionBridges:number;
 traversalBridges:number;
 acceptedOutcomes:number;
 status:ShowcaseRuntimeStatus;
};

export type DiscoveryDiagnostic={
 code:DiscoveryDiagnosticCode;
 targetNetworks:number;
 eligibleClaimedPeople:number;
};
