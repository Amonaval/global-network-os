import type {
  ContributionPromptAction,
  ContributionPromptStatus,
  InvitationDeliveryChannel,
  InvitationStatus,
} from "../../../core/participation/contracts";

/** Historical Family invitation transport shape. */
export type MemberInvitation = {
  id: string;
  member_id: string;
  member_name: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
  first_opened_at?: string;
  last_sent_at?: string;
  delivery_channel: InvitationDeliveryChannel;
  recipient_hint?: string;
  resend_of?: string;
};

/** Historical Family contribution-suggestion shape. */
export type ContributionSuggestion = {
  id: string;
  signature: string;
  member_id?: string;
  kind: "missing_field" | "orphan" | "possible_duplicate" | "incomplete_relationship";
  title: string;
  detail?: string;
  action_payload: Record<string, unknown>;
  priority: number;
  status: ContributionPromptStatus;
  acted_at?: string;
  created_at: string;
};

/** Historical Family participation metrics shape. */
export type ParticipationMetrics = {
  invitations_created: number;
  invitations_opened: number;
  invitations_accepted: number;
  claimed_profiles: number;
  claimable_profiles: number;
  contributions: number;
  activated_members: number;
  public_views: number;
  shares: number;
  returning_members: number;
  open_suggestions: number;
  resolved_suggestions: number;
  event_responses: number;
  admin_actions: number;
};

export type FamilyContributionAction = ContributionPromptAction;
