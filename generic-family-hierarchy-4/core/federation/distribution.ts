import type {FederationDistributionAssessment,FederationDistributionCandidate} from "./contracts";

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

/**
 * Aggregate-only prioritization for institutional seeding.
 * No person-level profile, membership edge or private graph is required.
 */
export function assessFederationDistribution(candidate:FederationDistributionCandidate):FederationDistributionAssessment{
  const childNetworks=Math.max(0,Math.round(candidate.childNetworkCount));
  const avgMembers=Math.max(0,Math.round(candidate.averageMembersPerNetwork));
  const organizer=clamp(candidate.organizerReach,0,100);
  const governance=clamp(candidate.governanceReadiness,0,100);
  const data=clamp(candidate.dataReadiness,0,100);
  const fit=clamp(candidate.domainFit,0,100);
  const referral=clamp(candidate.referralMultiplier,0,3);
  const scaleScore=clamp(Math.log10(Math.max(1,childNetworks))*36,0,100);
  const score=Math.round(scaleScore*.30+organizer*.22+governance*.18+data*.10+fit*.15+clamp(referral/3*100,0,100)*.05);
  const projectedDirectMembers=childNetworks*avgMembers;
  const projectedSecondWaveNetworks=Math.round(childNetworks*referral);
  const projectedTotalNetworks=childNetworks+projectedSecondWaveNetworks;
  const projectedTotalMembers=projectedTotalNetworks*avgMembers;
  const tier=score>=75&&childNetworks>=20?"supernode":score>=55&&childNetworks>=8?"multiplier":"seed";
  const reasons:string[]=[];
  if(childNetworks>=20)reasons.push(`${childNetworks} child networks create one-to-many onboarding leverage.`);
  if(organizer>=75)reasons.push("Organizer reach is strong enough to activate downstream coordinators.");
  if(governance>=70)reasons.push("Governance readiness reduces affiliation and approval friction.");
  if(data>=70)reasons.push("Existing structured data can accelerate first-value onboarding.");
  if(fit>=80)reasons.push("Domain fit is strong, so member value can be explained without exposing the broader platform thesis.");
  if(referral>=1)reasons.push(`Adjacent-network referrals could add roughly ${projectedSecondWaveNetworks} second-wave networks.`);
  if(!reasons.length)reasons.push("Treat as a learning seed until organizer, governance and network density improve.");
  return {...candidate,projectedDirectMembers,projectedSecondWaveNetworks,projectedTotalNetworks,projectedTotalMembers,multiplicationScore:score,tier,reasons};
}
