import type { NetworkVerticalKind } from "../core/verticals/contracts";
import { createIdentityClaimingRuntime } from "../capabilities/identity-claiming/runtime";
import { createParticipationRuntime } from "../capabilities/participation/runtime";
import { createNetworkConstructionRuntime } from "../capabilities/construction/runtime";
import { ALUMNI_IDENTITY_CLAIM_ADAPTER } from "../verticals/alumni/identity/claiming-adapter";
import { ALUMNI_PARTICIPATION_ADAPTER } from "../verticals/alumni/participation/adapter";
import { ALUMNI_CONSTRUCTION_ADAPTER } from "../verticals/alumni/construction/adapter";
import { FAMILY_IDENTITY_CLAIM_ADAPTER } from "../verticals/family/identity/claiming-adapter";
import { FAMILY_PARTICIPATION_ADAPTER } from "../verticals/family/participation/adapter";
import { FAMILY_CONSTRUCTION_ADAPTER } from "../verticals/family/construction/adapter";

const verticalCapabilities = {
  family: {
    identityClaiming: createIdentityClaimingRuntime(FAMILY_IDENTITY_CLAIM_ADAPTER),
    participation: createParticipationRuntime(FAMILY_PARTICIPATION_ADAPTER),
    construction: createNetworkConstructionRuntime(FAMILY_CONSTRUCTION_ADAPTER),
  },
  association: {mode:"productized-template", identityClaiming:null, participation:null, construction:null},
  "family-association": {mode:"productized-template", identityClaiming:null, participation:null, construction:null},
  alumni: {
    identityClaiming: createIdentityClaimingRuntime(ALUMNI_IDENTITY_CLAIM_ADAPTER),
    participation: createParticipationRuntime(ALUMNI_PARTICIPATION_ADAPTER),
    construction: createNetworkConstructionRuntime(ALUMNI_CONSTRUCTION_ADAPTER),
  },
  organization: {mode:"productized-template", identityClaiming:null, participation:null, construction:null},
  "business-trust": {mode:"productized-template", identityClaiming:null, participation:null, construction:null},
  franchise: {mode:"productized-template", identityClaiming:null, participation:null, construction:null},
  professional: {mode:"productized-template", identityClaiming:null, participation:null, construction:null},
} as const;

export type VerticalCapabilityRuntimeRegistry = typeof verticalCapabilities;

export function getVerticalCapabilityRuntime<K extends NetworkVerticalKind>(kind: K): VerticalCapabilityRuntimeRegistry[K] {
  return verticalCapabilities[kind];
}
