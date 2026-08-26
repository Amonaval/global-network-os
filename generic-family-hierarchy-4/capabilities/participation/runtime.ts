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
} from "../../core/participation/contracts";
import type { VerticalIdentityRef } from "../../core/identity/contracts";

export type ParticipationRuntime = {
  readonly adapter: ParticipationAdapter;
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
};

export function createParticipationRuntime(adapter: ParticipationAdapter): ParticipationRuntime {
  return {
    adapter,
    createInvitations: (items, expiresDays) => adapter.createInvitations(items, expiresDays),
    listInvitations: () => adapter.listInvitations(),
    revokeInvitation: invitationId => adapter.revokeInvitation(invitationId),
    resendInvitation: (invitationId, expiresDays) => adapter.resendInvitation(invitationId, expiresDays),
    previewInvitation: token => adapter.previewInvitation(token),
    acceptInvitation: token => adapter.acceptInvitation(token),
    listContributionPrompts: status => adapter.listContributionPrompts(status),
    actOnContributionPrompt: (promptId, action) => adapter.actOnContributionPrompt(promptId, action),
    getMetrics: () => adapter.getMetrics(),
    trackPublicParticipation: event => adapter.trackPublicParticipation(event),
  };
}
