import type {
  IdentityClaimAdapter,
  IdentityClaimRequest,
  IdentityClaimResult,
  IdentityClaimEligibility,
} from "../../../core/identity/contracts";

export const ALUMNI_IDENTITY_SUBJECT_TYPE = "alumni_profile" as const;

function alumniClaimEligibility(request: IdentityClaimRequest): IdentityClaimEligibility {
  return {
    eligible: false,
    method: request.method,
    verificationRequired: true,
    reason: "Alumni identity claiming is not available until Alumni profile storage and RLS are implemented.",
  };
}

/**
 * Explicit second-consumer skeleton. It must never fall back to family_members or Family claiming RPCs.
 */
export const ALUMNI_IDENTITY_CLAIM_ADAPTER: IdentityClaimAdapter = {
  verticalKind: "alumni",
  subjectType: ALUMNI_IDENTITY_SUBJECT_TYPE,
  availability: "skeleton",
  async listClaimableIdentities() {
    return [];
  },
  getEligibility: alumniClaimEligibility,
  async claimIdentity(request): Promise<IdentityClaimResult> {
    const eligibility = alumniClaimEligibility(request);
    throw new Error(eligibility.reason);
  },
};
