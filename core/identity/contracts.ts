import type { NetworkVerticalKind } from "../verticals/contracts";

/** A vertical-owned identity/profile reference. It deliberately carries no Family member_id semantics. */
export type VerticalIdentityRef = {
  verticalKind: NetworkVerticalKind;
  subjectType: string;
  subjectId: string;
};

export type ClaimMethod = "verified_email" | "invitation" | "admin_link" | "self_assertion";

export type ClaimableIdentitySummary = {
  identity: VerticalIdentityRef;
  networkId: string;
  networkName: string;
  displayName: string;
  secondaryLabel?: string | null;
  claimMethod: ClaimMethod;
};

export type IdentityClaimEligibility = {
  eligible: boolean;
  method: ClaimMethod;
  verificationRequired: boolean;
  reason?: string;
};

export type IdentityClaimRequest = {
  identity: VerticalIdentityRef;
  method: ClaimMethod;
};

export type IdentityClaimResult = {
  claimed: boolean;
  identity: VerticalIdentityRef;
  networkId: string;
  method: ClaimMethod;
};

/**
 * Neutral account↔vertical-identity binding. Persistence is intentionally unspecified:
 * Family still uses profiles.member_id/network_memberships.member_id; Alumni must not.
 */
export type IdentityBinding = {
  accountUserId: string;
  networkId: string;
  identity: VerticalIdentityRef;
  status: "active" | "released";
};

export type IdentityCapabilityAvailability = "ready" | "skeleton";

export interface IdentityClaimAdapter {
  readonly verticalKind: NetworkVerticalKind;
  readonly subjectType: string;
  readonly availability: IdentityCapabilityAvailability;
  listClaimableIdentities(): Promise<ClaimableIdentitySummary[]>;
  getEligibility(request: IdentityClaimRequest): IdentityClaimEligibility;
  claimIdentity(request: IdentityClaimRequest): Promise<IdentityClaimResult>;
}

export function isIdentityRefForVertical(identity: VerticalIdentityRef, verticalKind: NetworkVerticalKind): boolean {
  return identity.verticalKind === verticalKind;
}
