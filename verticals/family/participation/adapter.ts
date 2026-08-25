import type {
  ContributionPromptAction,
  ContributionPromptStatus,
  GovernedContributionPrompt,
  InvitationCreateRequest,
  InvitationCreateResult,
  InvitationPreview,
  NetworkInvitationSummary,
  ParticipationAdapter,
  ParticipationMetricsSnapshot,
  PublicParticipationEvent,
} from "../../../core/participation/contracts";
import { supabase } from "../../../lib/supabase";
import { FAMILY_IDENTITY_SUBJECT_TYPE, familyIdentityRef } from "../identity/claiming-adapter";
import type { ContributionSuggestion, MemberInvitation, ParticipationMetrics } from "./types";

const strongToken = () => {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, x => x.toString(16).padStart(2, "0")).join("");
};

function ensureFamilyIdentityRequest(item: InvitationCreateRequest): string {
  if (item.identity.verticalKind !== "family" || item.identity.subjectType !== FAMILY_IDENTITY_SUBJECT_TYPE) {
    throw new Error("Family invitations can target only Family profile identities.");
  }
  return item.identity.subjectId;
}

/** Historical single-invitation API. */
export async function createInvitation(memberId: string, expiresDays: number): Promise<string> {
  if (!supabase) throw new Error("Shared mode is required.");
  const token = globalThis.crypto?.randomUUID?.().replaceAll("-", "") + Math.random().toString(36).slice(2, 18);
  const {error} = await supabase.rpc("create_member_invitation", {
    p_member_id: memberId,
    p_token: token,
    p_expires_days: expiresDays,
  });
  if (error) throw error;
  return token;
}

async function acceptFamilyInvitationRaw(token: string): Promise<string | null> {
  if (!supabase) throw new Error("Shared mode is required.");
  const {data, error} = await supabase.rpc("accept_member_invitation", {p_token: token});
  if (error) throw error;
  return data ? String(data) : null;
}

/** Historical API intentionally discards the returned Family member id. */
export async function acceptInvitation(token: string) {
  await acceptFamilyInvitationRaw(token);
}

export async function createBulkInvitations(
  items: {member_id: string; channel: string; recipient_hint?: string}[],
  expiresDays = 7,
) {
  if (!supabase) throw new Error("Shared mode is required.");
  const payload = items.map(item => ({...item, token: strongToken()}));
  const {data, error} = await supabase.rpc("create_bulk_member_invitations", {p_items: payload, p_expires_days: expiresDays});
  if (error) throw error;
  return (data || []) as {invitation_id: string; member_id: string; token: string}[];
}

export async function fetchInvitations(): Promise<MemberInvitation[]> {
  if (!supabase) return [];
  const {data, error} = await supabase.rpc("get_member_invitations");
  if (error) throw error;
  return (data || []) as MemberInvitation[];
}

export async function revokeInvitation(id: string) {
  if (!supabase) return;
  const {error} = await supabase.rpc("revoke_member_invitation", {p_invitation_id: id});
  if (error) throw error;
}

export async function resendInvitation(id: string, days = 7) {
  if (!supabase) throw new Error("Shared mode is required.");
  const token = strongToken();
  const {error} = await supabase.rpc("resend_member_invitation", {p_invitation_id: id, p_token: token, p_expires_days: days});
  if (error) throw error;
  return token;
}

export async function fetchInvitationPreview(token: string) {
  if (!supabase) return null;
  const {data, error} = await supabase.rpc("get_invitation_preview", {p_token: token});
  if (error) throw error;
  return (data || [])[0] || null;
}

export async function fetchContributionSuggestions(status = "open"): Promise<ContributionSuggestion[]> {
  if (!supabase) return [];
  const refreshed = await supabase.rpc("refresh_contribution_suggestions");
  if (refreshed.error) throw refreshed.error;
  const {data, error} = await supabase.rpc("get_contribution_suggestions", {p_status: status});
  if (error) throw error;
  return (data || []) as ContributionSuggestion[];
}

export async function actOnContributionSuggestion(id: string, action: "accepted" | "dismissed" | "resolved") {
  if (!supabase) return;
  const {error} = await supabase.rpc("act_on_contribution_suggestion", {p_suggestion_id: id, p_action: action});
  if (error) throw error;
}

export async function fetchParticipationMetrics(): Promise<ParticipationMetrics | null> {
  if (!supabase) return null;
  const {data, error} = await supabase.rpc("get_participation_metrics");
  if (error) throw error;
  return data as ParticipationMetrics;
}

export async function trackPublicParticipation(eventType: string, memberId?: string, channel?: string) {
  if (!supabase) return;
  let session = localStorage.getItem("network-public-session");
  if (!session) {
    session = strongToken();
    localStorage.setItem("network-public-session", session);
  }
  await supabase.rpc("track_public_participation", {
    p_event_type: eventType,
    p_public_member_id: memberId || null,
    p_channel: channel || null,
    p_session_token: session,
  });
}

function toNetworkInvitation(row: MemberInvitation): NetworkInvitationSummary {
  return {
    id: row.id,
    identity: familyIdentityRef(row.member_id),
    displayName: row.member_name,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    firstOpenedAt: row.first_opened_at,
    lastSentAt: row.last_sent_at,
    deliveryChannel: row.delivery_channel,
    recipientHint: row.recipient_hint,
    resendOf: row.resend_of,
  };
}

function toContributionPrompt(row: ContributionSuggestion): GovernedContributionPrompt {
  return {
    id: row.id,
    signature: row.signature,
    identity: row.member_id ? familyIdentityRef(row.member_id) : undefined,
    kind: row.kind,
    title: row.title,
    detail: row.detail,
    actionPayload: row.action_payload,
    priority: row.priority,
    status: row.status,
    actedAt: row.acted_at,
    createdAt: row.created_at,
  };
}

function toMetrics(row: ParticipationMetrics): ParticipationMetricsSnapshot {
  return {
    invitationsCreated: Number(row.invitations_created || 0),
    invitationsOpened: Number(row.invitations_opened || 0),
    invitationsAccepted: Number(row.invitations_accepted || 0),
    identitiesClaimed: Number(row.claimed_profiles || 0),
    claimableIdentities: Number(row.claimable_profiles || 0),
    contributions: Number(row.contributions || 0),
    activatedParticipants: Number(row.activated_members || 0),
    publicViews: Number(row.public_views || 0),
    shares: Number(row.shares || 0),
    returningParticipants: Number(row.returning_members || 0),
    openPrompts: Number(row.open_suggestions || 0),
    resolvedPrompts: Number(row.resolved_suggestions || 0),
    eventResponses: Number(row.event_responses || 0),
    adminActions: Number(row.admin_actions || 0),
  };
}

export const FAMILY_PARTICIPATION_ADAPTER: ParticipationAdapter = {
  verticalKind: "family",
  availability: "ready",
  async createInvitations(items: InvitationCreateRequest[], expiresDays = 7): Promise<InvitationCreateResult[]> {
    const legacy = items.map(item => ({
      member_id: ensureFamilyIdentityRequest(item),
      channel: item.channel,
      recipient_hint: item.recipientHint,
    }));
    return (await createBulkInvitations(legacy, expiresDays)).map(row => ({
      invitationId: row.invitation_id,
      identity: familyIdentityRef(row.member_id),
      token: row.token,
    }));
  },
  async listInvitations() {
    return (await fetchInvitations()).map(toNetworkInvitation);
  },
  revokeInvitation,
  resendInvitation,
  async previewInvitation(token: string): Promise<InvitationPreview | null> {
    const row = await fetchInvitationPreview(token) as {member_name?: string; status?: string; expires_at?: string} | null;
    if (!row) return null;
    return {
      displayName: row.member_name || "Member",
      status: (row.status || "expired") as InvitationPreview["status"],
      expiresAt: row.expires_at || "",
    };
  },
  async acceptInvitation(token: string) {
    const memberId = await acceptFamilyInvitationRaw(token);
    return memberId ? familyIdentityRef(memberId) : null;
  },
  async listContributionPrompts(status: ContributionPromptStatus = "open") {
    return (await fetchContributionSuggestions(status)).map(toContributionPrompt);
  },
  actOnContributionPrompt(promptId: string, action: ContributionPromptAction) {
    return actOnContributionSuggestion(promptId, action);
  },
  async getMetrics() {
    const row = await fetchParticipationMetrics();
    return row ? toMetrics(row) : null;
  },
  async trackPublicParticipation(event: PublicParticipationEvent) {
    const memberId = event.identity
      ? ensureFamilyIdentityRequest({identity: event.identity, channel: "link"})
      : undefined;
    await trackPublicParticipation(event.eventType, memberId, event.channel);
  },
};
