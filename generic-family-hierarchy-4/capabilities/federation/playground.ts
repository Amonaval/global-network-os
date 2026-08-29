import {assessFederationDistribution} from "../../core/federation/distribution";
import type {FederationDistributionCandidate} from "../../core/federation/contracts";

export const FEDERATION_DISTRIBUTION_PLAYGROUND: readonly FederationDistributionCandidate[] = [
 {id:"community-umbrella",label:"Regional community umbrella",domain:"Community / Family",childNetworkCount:42,averageMembersPerNetwork:145,organizerReach:86,governanceReadiness:78,dataReadiness:58,domainFit:94,referralMultiplier:1.1},
 {id:"alumni-association",label:"Alumni association with chapters",domain:"Alumni",childNetworkCount:18,averageMembersPerNetwork:420,organizerReach:81,governanceReadiness:82,dataReadiness:76,domainFit:90,referralMultiplier:.7},
 {id:"trade-federation",label:"Regional business federation",domain:"Business",childNetworkCount:64,averageMembersPerNetwork:38,organizerReach:74,governanceReadiness:68,dataReadiness:64,domainFit:88,referralMultiplier:.9},
] as const;

export const FEDERATION_DISTRIBUTION_ASSESSMENTS=FEDERATION_DISTRIBUTION_PLAYGROUND.map(assessFederationDistribution).sort((a,b)=>b.multiplicationScore-a.multiplicationScore);
