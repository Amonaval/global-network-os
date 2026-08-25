import { supabase } from "../../lib/supabase";

export type PlatformOwnerRow = {
  user_id: string;
  email: string | null;
  created_at: string;
  is_me: boolean;
};

export type PlatformOwnerAuditRow = {
  id: string;
  actor_email: string | null;
  target_email: string | null;
  action: "added" | "removed";
  created_at: string;
};

export async function fetchPlatformOwners(): Promise<PlatformOwnerRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_platform_owners");
  if (error) throw error;
  return (data || []) as PlatformOwnerRow[];
}

export async function addPlatformOwnerByEmail(email: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc("add_platform_owner_by_email", { p_email: email.trim() });
  if (error) throw error;
}

export async function removePlatformOwner(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc("remove_platform_owner", { p_user_id: userId });
  if (error) throw error;
}

export async function fetchPlatformOwnerAudit(limit = 20): Promise<PlatformOwnerAuditRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_platform_owner_audit", { p_limit: limit });
  if (error) throw error;
  return (data || []) as PlatformOwnerAuditRow[];
}
