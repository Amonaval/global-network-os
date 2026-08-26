import type { NetworkMembership } from "../network/contracts";

/**
 * NX-1 account-scoped person anchor.
 *
 * This is intentionally NOT a universal profile. Network-local profile/entity data
 * remains owned by each vertical. The anchor only represents the authenticated
 * human and their own memberships so future consented cross-network capabilities
 * have a stable seam without merging network graphs.
 */
export type TrustedPersonIdentity = {
  id: string;
  email: string | null;
  displayName: string;
  memberships: NetworkMembership[];
};

export type TrustedIdentityPrivacyRule = {
  key: "isolated_profiles" | "private_memberships" | "explicit_portability" | "no_graph_merge";
  title: string;
  description: string;
};

export const TRUSTED_IDENTITY_PRIVACY_RULES: readonly TrustedIdentityPrivacyRule[] = [
  {
    key: "isolated_profiles",
    title: "Each network keeps its own profile",
    description: "Family, Alumni, Organization and other profile details stay inside their network context.",
  },
  {
    key: "private_memberships",
    title: "Your memberships are not a public directory",
    description: "Belonging to several networks does not expose one network's membership list to another.",
  },
  {
    key: "explicit_portability",
    title: "Nothing becomes portable by assumption",
    description: "Cross-network reuse of profile information must be an explicit, permission-aware action.",
  },
  {
    key: "no_graph_merge",
    title: "Networks never silently merge",
    description: "A shared person identity is a bridge for trusted actions, not a universal readable social graph.",
  },
] as const;
