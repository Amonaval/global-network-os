import type {
  ConstructionAdapter,
  ConstructionCommitPlan,
  ConstructionCommitResult,
  ConstructionDashboard,
  ConstructionPreview,
  ConstructionSubmissionResult,
  ConstructionValidationResult,
  MatchDecision,
} from "../../core/construction/contracts";

function unavailable(verticalKind: string): never {
  throw new Error(`${verticalKind} network construction is not available yet.`);
}

export function createNetworkConstructionRuntime<TSubmission>(adapter: ConstructionAdapter<TSubmission>) {
  const ensureReady = () => {
    if (adapter.availability !== "ready") unavailable(adapter.verticalKind);
  };
  return {
    verticalKind: adapter.verticalKind,
    availability: adapter.availability,
    async createSession(title?: string): Promise<string> { ensureReady(); return adapter.createSession(title); },
    async createAccess(sessionId: string, label?: string, days?: number): Promise<string> { ensureReady(); return adapter.createAccess(sessionId, label, days); },
    async previewAccess(token: string): Promise<ConstructionPreview> { ensureReady(); return adapter.previewAccess(token); },
    async submit(token: string, submission: TSubmission): Promise<ConstructionSubmissionResult> { ensureReady(); return adapter.submit(token, submission); },
    async getDashboard(): Promise<ConstructionDashboard> { ensureReady(); return adapter.getDashboard(); },
    async decideMatch(candidateId: string, decision: MatchDecision): Promise<void> { ensureReady(); return adapter.decideMatch(candidateId, decision); },
    async validateAccess(accessId: string): Promise<ConstructionValidationResult> { ensureReady(); return adapter.validateAccess(accessId); },
    async buildCommitPlan(accessId: string): Promise<ConstructionCommitPlan> { ensureReady(); return adapter.buildCommitPlan(accessId); },
    async commitAccess(accessId: string): Promise<ConstructionCommitResult> { ensureReady(); return adapter.commitAccess(accessId); },
    async revokeAccess(accessId: string): Promise<void> { ensureReady(); return adapter.revokeAccess(accessId); },
  };
}
