import type {
  ClaimableIdentitySummary,
  IdentityClaimAdapter,
  IdentityClaimRequest,
  IdentityClaimResult,
  IdentityClaimEligibility,
  VerticalIdentityRef,
} from "../../../core/identity/contracts";
import { supabase } from "../../../lib/supabase";
import {postCommand} from "../../../lib/api-client";
import type {ClaimIdentityResult} from "../../../core/api/contracts";

export const FAMILY_IDENTITY_SUBJECT_TYPE = "family_person" as const;

/** Historical Family transport shape. Kept stable for existing Setup/NetworkApp callers. */
export type ClaimableFamilyProfile = {
  network_id: string;
  family_name: string;
  member_id: string;
  member_name: string;
};

export function familyIdentityRef(memberId: string): VerticalIdentityRef {
  return {verticalKind: "family", subjectType: FAMILY_IDENTITY_SUBJECT_TYPE, subjectId: memberId};
}

export async function fetchMyClaimableProfiles(): Promise<ClaimableFamilyProfile[]> {
  if (!supabase) return [];
  const {data, error} = await supabase.rpc("get_my_claimable_profiles");
  if (error) throw error;
  return (data || []) as ClaimableFamilyProfile[];
}

export async function claimProfileByVerifiedEmail(memberId: string): Promise<string> {
  const data=await postCommand<ClaimIdentityResult>("/api/v1/identities/claim",{kind:"family",subjectId:memberId});
  return data.networkId;
}

function getFamilyClaimEligibility(request: IdentityClaimRequest): IdentityClaimEligibility {
  if (request.identity.verticalKind !== "family" || request.identity.subjectType !== FAMILY_IDENTITY_SUBJECT_TYPE) {
    return {eligible: false, method: request.method, verificationRequired: true, reason: "This is not a Family profile identity."};
  }
  if (request.method !== "verified_email") {
    return {eligible: false, method: request.method, verificationRequired: true, reason: "Family self-claim currently requires a verified email match."};
  }
  return {eligible: true, method: "verified_email", verificationRequired: true};
}

export const FAMILY_IDENTITY_CLAIM_ADAPTER: IdentityClaimAdapter = {
  verticalKind: "family",
  subjectType: FAMILY_IDENTITY_SUBJECT_TYPE,
  availability: "ready",
  async listClaimableIdentities(): Promise<ClaimableIdentitySummary[]> {
    return (await fetchMyClaimableProfiles()).map(row => ({
      identity: familyIdentityRef(row.member_id),
      networkId: row.network_id,
      networkName: row.family_name,
      displayName: row.member_name,
      claimMethod: "verified_email" as const,
    }));
  },
  getEligibility: getFamilyClaimEligibility,
  async claimIdentity(request): Promise<IdentityClaimResult> {
    const eligibility = getFamilyClaimEligibility(request);
    if (!eligibility.eligible) throw new Error(eligibility.reason || "This Family profile cannot be claimed.");
    const networkId = await claimProfileByVerifiedEmail(request.identity.subjectId);
    return {claimed: true, identity: request.identity, networkId, method: "verified_email"};
  },
};
