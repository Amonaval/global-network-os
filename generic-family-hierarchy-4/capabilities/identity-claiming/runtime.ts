import type {
  ClaimableIdentitySummary,
  IdentityClaimAdapter,
  IdentityClaimRequest,
  IdentityClaimResult,
} from "../../core/identity/contracts";

export type IdentityClaimingRuntime = {
  readonly adapter: IdentityClaimAdapter;
  listClaimableIdentities(): Promise<ClaimableIdentitySummary[]>;
  claimIdentity(request: IdentityClaimRequest): Promise<IdentityClaimResult>;
};

export function createIdentityClaimingRuntime(adapter: IdentityClaimAdapter): IdentityClaimingRuntime {
  return {
    adapter,
    listClaimableIdentities: () => adapter.listClaimableIdentities(),
    async claimIdentity(request) {
      if (request.identity.verticalKind !== adapter.verticalKind) {
        throw new Error(`Identity belongs to ${request.identity.verticalKind}, not ${adapter.verticalKind}.`);
      }
      const eligibility = adapter.getEligibility(request);
      if (!eligibility.eligible) throw new Error(eligibility.reason || "This identity cannot be claimed.");
      return adapter.claimIdentity(request);
    },
  };
}
