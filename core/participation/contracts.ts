import type { VerticalIdentityRef } from "../identity/contracts";
import type { NetworkVerticalKind } from "../verticals/contracts";

export type InvitationDeliveryChannel = "link" | "email" | "whatsapp" | "sms" | "print" | "other";
export type InvitationStatus = "active" | "accepted" | "expired" | "revoked";

export type InvitationCreateRequest = {
  identity: VerticalIdentityRef;
  channel: InvitationDeliveryChannel;
  recipientHint?: string;
};

export type InvitationCreateResult = {
  invitationId: string;
  identity: VerticalIdentityRef;
  token: string;
};

export type NetworkInvitationSummary = {
  id: string;
  identity: VerticalIdentityRef;
  displayName: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  firstOpenedAt?: string;
  lastSentAt?: string;
  deliveryChannel: InvitationDeliveryChannel;
  recipientHint?: string;
  resendOf?: string;
};

export type InvitationPreview = {
  displayName: string;
  status: InvitationStatus;
  expiresAt: string;
};

export type ContributionPromptStatus = "open" | "accepted" | "dismissed" | "resolved";
export type ContributionPromptAction = "accepted" | "dismissed" | "resolved";

export type GovernedContributionPrompt = {
  id: string;
  signature: string;
  identity?: VerticalIdentityRef;
  kind: string;
  title: string;
  detail?: string;
  actionPayload: Record<string, unknown>;
  priority: number;
  status: ContributionPromptStatus;
  actedAt?: string;
  createdAt: string;
};

export type ParticipationMetricsSnapshot = {
  invitationsCreated: number;
  invitationsOpened: number;
  invitationsAccepted: number;
  identitiesClaimed: number;
  claimableIdentities: number;
  contributions: number;
  activatedParticipants: number;
  publicViews: number;
  shares: number;
  returningParticipants: number;
  openPrompts: number;
  resolvedPrompts: number;
  eventResponses: number;
  adminActions: number;
};

export type PublicParticipationEvent = {
  eventType: string;
  identity?: VerticalIdentityRef;
  channel?: string;
};

export type ParticipationCapabilityAvailability = "ready" | "skeleton";

export interface ParticipationAdapter {
  readonly verticalKind: NetworkVerticalKind;
  readonly availability: ParticipationCapabilityAvailability;
  createInvitations(items: InvitationCreateRequest[], expiresDays?: number): Promise<InvitationCreateResult[]>;
  listInvitations(): Promise<NetworkInvitationSummary[]>;
  revokeInvitation(invitationId: string): Promise<void>;
  resendInvitation(invitationId: string, expiresDays?: number): Promise<string>;
  previewInvitation(token: string): Promise<InvitationPreview | null>;
  acceptInvitation(token: string): Promise<VerticalIdentityRef | null>;
  listContributionPrompts(status?: ContributionPromptStatus): Promise<GovernedContributionPrompt[]>;
  actOnContributionPrompt(promptId: string, action: ContributionPromptAction): Promise<void>;
  getMetrics(): Promise<ParticipationMetricsSnapshot | null>;
  trackPublicParticipation(event: PublicParticipationEvent): Promise<void>;
}
