import type { NetworkVerticalKind } from "../verticals/contracts";

export type NetworkMembershipRole = "owner" | "admin" | "member";
export type NetworkMembershipStatus = "active" | "invited" | "suspended" | "left";

export type NetworkIdentity = {
  id: string;
  name: string;
  slug: string;
  verticalKind: NetworkVerticalKind;
};

export type NetworkResourcePolicy = {
  storageLimitBytes: number;
  photoUploadEnabled: boolean;
  photoMaxBytes: number;
};

/**
 * Neutral user↔network membership contract.
 * Vertical-specific profile/entity links do not belong here.
 */
export type NetworkMembership = {
  network: NetworkIdentity;
  role: NetworkMembershipRole;
  status: NetworkMembershipStatus;
  isActive: boolean;
  resources: NetworkResourcePolicy;
};

export type ActiveNetworkContext = {
  networkId: string | null;
  verticalKind: NetworkVerticalKind | null;
  membershipRole: NetworkMembershipRole | null;
};

export function toActiveNetworkContext(membership: NetworkMembership | null): ActiveNetworkContext {
  return membership
    ? {networkId: membership.network.id, verticalKind: membership.network.verticalKind, membershipRole: membership.role}
    : {networkId: null, verticalKind: null, membershipRole: null};
}

export function canAdministerNetwork(role: NetworkMembershipRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}
