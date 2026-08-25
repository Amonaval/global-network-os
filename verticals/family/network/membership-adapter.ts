import type { NetworkMembership, NetworkMembershipRole, NetworkMembershipStatus } from "../../../core/network/contracts";

/**
 * Exact compatibility shape returned by the historical get_my_networks() RPC.
 * member_id is deliberately kept here because it points to family_members and is NOT a core membership concept.
 */
export type LegacyFamilyNetworkMembershipRow = {
  network_id: string;
  name: string;
  slug: string;
  role: NetworkMembershipRole;
  status: NetworkMembershipStatus;
  storage_limit_bytes: number;
  photo_upload_enabled: boolean;
  photo_max_bytes: number;
  is_active: boolean;
  member_id?: string | null;
};

export type FamilyProfileMembershipLink = {
  familyMemberId: string | null;
};

/** Convert the legacy Family-bound transport row into the neutral core contract. */
export function adaptLegacyFamilyNetworkMembership(row: LegacyFamilyNetworkMembershipRow): NetworkMembership {
  return {
    network: {id: row.network_id, name: row.name, slug: row.slug, verticalKind: "family"},
    role: row.role,
    status: row.status,
    isActive: row.is_active,
    resources: {
      storageLimitBytes: Number(row.storage_limit_bytes || 0),
      photoUploadEnabled: Boolean(row.photo_upload_enabled),
      photoMaxBytes: Number(row.photo_max_bytes || 0),
    },
  };
}

/**
 * Family-only compatibility link. Alumni and future verticals must define their own profile/entity link semantics.
 */
export function getFamilyProfileMembershipLink(row: LegacyFamilyNetworkMembershipRow): FamilyProfileMembershipLink {
  return {familyMemberId: row.member_id || null};
}
