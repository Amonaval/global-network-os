import type { NetworkMembership, NetworkMembershipRole, NetworkMembershipStatus } from "../../core/network/contracts";
import type { NetworkVerticalKind } from "../../core/verticals/contracts";
import { supabase } from "../../lib/supabase";

/**
 * Transport projection for the neutral part of the historical get_my_networks() RPC.
 * The deployed RPC may return additional Family-only fields (notably member_id);
 * capability code intentionally does not model or expose them.
 */
type NetworkMembershipTransportRow = {
  network_id: string;
  name: string;
  slug: string;
  role: NetworkMembershipRole;
  status: NetworkMembershipStatus;
  storage_limit_bytes: number;
  photo_upload_enabled: boolean;
  photo_max_bytes: number;
  is_active: boolean;
  vertical_kind?: NetworkVerticalKind | null;
  network_template?: string | null;
};

const NETWORK_VERTICAL_KINDS: readonly NetworkVerticalKind[] = [
  "family",
  "alumni",
  "association",
  "family-association",
  "housing-society",
  "organization",
  "business-trust",
  "franchise",
  "professional",
];

function isNetworkVerticalKind(value: unknown): value is NetworkVerticalKind {
  return typeof value === "string" && NETWORK_VERTICAL_KINDS.includes(value as NetworkVerticalKind);
}

function resolveTransportVerticalKind(row: NetworkMembershipTransportRow): NetworkVerticalKind {
  if (isNetworkVerticalKind(row.vertical_kind)) return row.vertical_kind;
  if (isNetworkVerticalKind(row.network_template)) return row.network_template;
  return "family";
}

function toNetworkMembership(row: NetworkMembershipTransportRow): NetworkMembership {
  return {
    network: {
      id: row.network_id,
      name: row.name,
      slug: row.slug,
      verticalKind: resolveTransportVerticalKind(row),
    },
    role: row.role,
    status: row.status,
    isActive: Boolean(row.is_active),
    resources: {
      storageLimitBytes: Number(row.storage_limit_bytes || 0),
      photoUploadEnabled: Boolean(row.photo_upload_enabled),
      photoMaxBytes: Number(row.photo_max_bytes || 0),
    },
  };
}

/** Neutral user↔network memberships; vertical profile/entity links are discarded. */
export async function fetchMyNetworkMemberships(): Promise<NetworkMembership[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_my_networks");
  if (error) throw error;
  return ((data || []) as NetworkMembershipTransportRow[]).map(toNetworkMembership);
}

/** Switch the current network context using the unchanged historical RPC. */
export async function setActiveNetwork(networkId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc("set_active_network", { p_network_id: networkId });
  if (error) throw error;
}
