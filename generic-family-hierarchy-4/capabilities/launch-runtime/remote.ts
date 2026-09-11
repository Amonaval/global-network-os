import type { LaunchState } from "../../core/features/contracts";
import type { NetworkVerticalKind } from "../../core/verticals/contracts";
import { supabase } from "../../lib/supabase";

export type PlaygroundFeatureRow = { feature_key: string; enabled: boolean; updated_at?: string };
export type ShowcasePaletteKey = "signature" | "warm" | "modern" | "classic" | "minimal";
export type ShowcaseVerticalSetting = {
  vertical_kind: NetworkVerticalKind;
  create_enabled: boolean;
  playground_enabled: boolean;
  featured: boolean;
  palette_key: ShowcasePaletteKey;
  updated_at?: string;
};

export type PlatformFeatureRow = { feature_key: string; rollout_state: LaunchState; enabled: boolean };
export type PlatformLaunchFeature = {
  feature_key: string;
  bundle_key: string;
  rollout_state: LaunchState;
  pilot_network_ids: string[];
  announcement_version: number;
  updated_at: string;
  vertical_kind?: NetworkVerticalKind;
};

/**
 * Compatibility name retained because the deployed RPC is get_platform_family_targets().
 * Semantically this is a launch-runtime network target and can be renamed only when the
 * backend evolves additively; G1.4 intentionally does not rename RPCs.
 */
export type PlatformFamilyTarget = {
  network_id: string;
  name: string;
  slug: string;
  status: string;
  member_count: number;
  vertical_kind?: NetworkVerticalKind;
};

export type PlatformRolloutAudit = {
  id: number;
  feature_key: string;
  bundle_key: string;
  previous_state: string;
  new_state: string;
  pilot_network_ids: string[];
  announced: boolean;
  changed_at: string;
};

export type FeatureAnnouncement = {
  feature_key: string;
  announcement_version: number;
  rollout_state: LaunchState;
  updated_at: string;
};

export async function fetchPlaygroundFeatures(): Promise<PlaygroundFeatureRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_playground_features");
  if (error) throw error;
  return (data || []) as PlaygroundFeatureRow[];
}

export async function fetchPlaygroundLaunchConsole(): Promise<PlaygroundFeatureRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_playground_launch_console");
  if (error) throw error;
  return (data || []) as PlaygroundFeatureRow[];
}

export async function setPlaygroundFeatureVisibility(featureKey: string, enabled: boolean): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc("set_playground_feature_visibility", {
    p_feature_key: featureKey,
    p_enabled: enabled,
  });
  if (error) throw error;
}

export async function fetchEffectivePlatformFeatures(): Promise<PlatformFeatureRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_effective_platform_features");
  if (error) throw error;
  return (data || []) as PlatformFeatureRow[];
}

export async function fetchPlatformLaunchConsole(): Promise<PlatformLaunchFeature[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_platform_launch_console");
  if (error) throw error;
  return (data || []) as PlatformLaunchFeature[];
}

export async function fetchPlatformFamilyTargets(): Promise<PlatformFamilyTarget[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_platform_family_targets");
  if (error) throw error;
  return (data || []).map((row: any) => ({ ...row, member_count: Number(row.member_count || 0) })) as PlatformFamilyTarget[];
}

export async function fetchPlatformRolloutAudit(limit = 30): Promise<PlatformRolloutAudit[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_platform_rollout_audit", { p_limit: limit });
  if (error) throw error;
  return (data || []).map((row: any) => ({ ...row, id: Number(row.id) })) as PlatformRolloutAudit[];
}

export async function setPlatformFeatureRollout(
  featureKey: string,
  rolloutState: LaunchState,
  pilotNetworkIds: string[] = [],
  announce = false,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc("set_platform_feature_rollout", {
    p_feature_key: featureKey,
    p_rollout_state: rolloutState,
    p_pilot_network_ids: pilotNetworkIds,
    p_announce: announce,
  });
  if (error) throw error;
}

export async function setPlatformBundleRollout(
  bundleKey: string,
  rolloutState: LaunchState,
  pilotNetworkIds: string[] = [],
  announce = false,
): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase.rpc("set_platform_bundle_rollout", {
    p_bundle_key: bundleKey,
    p_rollout_state: rolloutState,
    p_pilot_network_ids: pilotNetworkIds,
    p_announce: announce,
  });
  if (error) throw error;
  return Number(data || 0);
}

export async function fetchMyFeatureAnnouncements(): Promise<FeatureAnnouncement[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_my_feature_announcements");
  if (error) throw error;
  return (data || []) as FeatureAnnouncement[];
}

export async function markFeatureAnnouncementSeen(featureKey: string, version: number): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc("mark_feature_announcement_seen", {
    p_feature_key: featureKey,
    p_announcement_version: version,
  });
  if (error) throw error;
}

export async function fetchPlatformVerticalLaunchConsole(verticalKind: NetworkVerticalKind): Promise<PlatformLaunchFeature[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_platform_vertical_launch_console", { p_vertical_kind: verticalKind });
  if (error) throw error;
  return (data || []).map((row: any) => ({...row, vertical_kind: verticalKind})) as PlatformLaunchFeature[];
}

export async function setPlatformVerticalBundleRollout(
  verticalKind: NetworkVerticalKind,
  bundleKey: string,
  rolloutState: LaunchState,
  pilotNetworkIds: string[] = [],
  announce = false,
): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase.rpc("set_platform_vertical_bundle_rollout", {
    p_vertical_kind: verticalKind,
    p_bundle_key: bundleKey,
    p_rollout_state: rolloutState,
    p_pilot_network_ids: pilotNetworkIds,
    p_announce: announce,
  });
  if (error) throw error;
  return Number(data || 0);
}

export async function fetchPlatformNetworkTargets(): Promise<PlatformFamilyTarget[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_platform_network_targets");
  if (error) throw error;
  return (data || []).map((row: any) => ({ ...row, member_count: Number(row.member_count || 0) })) as PlatformFamilyTarget[];
}


export async function fetchShowcaseVerticalSettings(): Promise<ShowcaseVerticalSetting[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_showcase_vertical_settings");
  if (error) throw error;
  return (data || []) as ShowcaseVerticalSetting[];
}

export async function fetchPlatformShowcaseVerticalSettings(): Promise<ShowcaseVerticalSetting[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_platform_showcase_vertical_settings");
  if (error) throw error;
  return (data || []) as ShowcaseVerticalSetting[];
}

export async function setPlatformShowcaseVerticalSetting(row: ShowcaseVerticalSetting): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc("set_platform_showcase_vertical_setting", {
    p_vertical_kind: row.vertical_kind,
    p_create_enabled: row.create_enabled,
    p_playground_enabled: row.playground_enabled,
    p_featured: row.featured,
    p_palette_key: row.palette_key,
  });
  if (error) throw error;
}
