import type { NetworkVerticalKind } from "../core/verticals/contracts";
import { createIdentityClaimingRuntime } from "../capabilities/identity-claiming/runtime";
import { createParticipationRuntime } from "../capabilities/participation/runtime";
import { ALUMNI_IDENTITY_CLAIM_ADAPTER } from "../verticals/alumni/identity/claiming-adapter";
import { ALUMNI_PARTICIPATION_ADAPTER } from "../verticals/alumni/participation/adapter";
import { FAMILY_IDENTITY_CLAIM_ADAPTER } from "../verticals/family/identity/claiming-adapter";
import { FAMILY_PARTICIPATION_ADAPTER } from "../verticals/family/participation/adapter";

const verticalCapabilities = {
  family: {
    identityClaiming: createIdentityClaimingRuntime(FAMILY_IDENTITY_CLAIM_ADAPTER),
    participation: createParticipationRuntime(FAMILY_PARTICIPATION_ADAPTER),
  },
  alumni: {
    identityClaiming: createIdentityClaimingRuntime(ALUMNI_IDENTITY_CLAIM_ADAPTER),
    participation: createParticipationRuntime(ALUMNI_PARTICIPATION_ADAPTER),
  },
} as const;

export type VerticalCapabilityRuntimeRegistry = typeof verticalCapabilities;

export function getVerticalCapabilityRuntime<K extends NetworkVerticalKind>(kind: K): VerticalCapabilityRuntimeRegistry[K] {
  return verticalCapabilities[kind];
}
