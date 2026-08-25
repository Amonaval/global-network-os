import type { ParticipationAdapter } from "../../../core/participation/contracts";

const unavailable = () => new Error("Alumni participation is not available until Alumni profile storage, invitation persistence and RLS are implemented.");

/** Explicit second-consumer skeleton; never proxies Family member invitation/contribution RPCs. */
export const ALUMNI_PARTICIPATION_ADAPTER: ParticipationAdapter = {
  verticalKind: "alumni",
  availability: "skeleton",
  async createInvitations() { throw unavailable(); },
  async listInvitations() { return []; },
  async revokeInvitation() { throw unavailable(); },
  async resendInvitation() { throw unavailable(); },
  async previewInvitation() { return null; },
  async acceptInvitation() { throw unavailable(); },
  async listContributionPrompts() { return []; },
  async actOnContributionPrompt() { throw unavailable(); },
  async getMetrics() { return null; },
  async trackPublicParticipation() { return; },
};
