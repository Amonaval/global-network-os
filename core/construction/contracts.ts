import type { NetworkVerticalKind } from "../verticals/contracts";

export type ConstructionAvailability = "ready" | "skeleton";
export type ConstructionSourceKind = "shared_link" | "manual" | "csv" | "xlsx" | "api" | "other";
export type ConstructionSessionStatus = "draft" | "collecting" | "review" | "closed" | string;
export type ConstructionAccessStatus = "active" | "submitted" | "committed" | "revoked" | "expired" | string;
export type StagedEntityStatus = "staged" | "matched" | "new" | "ambiguous" | "committed" | "rejected" | string;
export type StagedEdgeStatus = "staged" | "committed" | "rejected" | string;
export type MatchConfidenceBand = "high" | "medium" | "low";
export type MatchCandidateStatus = "open" | "accepted" | "rejected" | "unsure";
export type MatchDecision = "same" | "different" | "not_sure";
export type MatchDecisionSource = "automatic" | "operator" | "system" | string;

export type ConstructionSource = {
  kind: ConstructionSourceKind;
  sourceId?: string;
  label?: string | null;
  metadata?: Record<string, unknown>;
};

export type ConstructionProvenance = {
  source: ConstructionSource;
  sessionId?: string;
  accessId?: string;
  recordedAt?: string;
  actorId?: string | null;
};

export type ConstructionEntityInput = {
  clientRef: string;
  displayName: string;
  attributes?: Record<string, unknown>;
};

export type ConstructionEdgeInput = {
  fromRef: string;
  toRef: string;
  relationKind: string;
  attributes?: Record<string, unknown>;
};

export type ConstructionSubmission<TEntity extends ConstructionEntityInput = ConstructionEntityInput, TEdge extends ConstructionEdgeInput = ConstructionEdgeInput> = {
  entities: TEntity[];
  edges: TEdge[];
};

export type ConstructionPreview = {
  networkName: string;
  title: string;
  sourceLabel?: string | null;
  status: ConstructionAccessStatus;
  alreadySubmitted: boolean;
  expiresAt: string;
};

export type ConstructionSessionSummary = {
  id: string;
  title: string;
  status: ConstructionSessionStatus;
  createdAt: string;
  accessCount: number;
  submittedCount: number;
  committedCount: number;
};

export type ConstructionAccessSummary = {
  id: string;
  sessionId: string;
  label?: string | null;
  status: ConstructionAccessStatus;
  expiresAt: string;
  submittedAt?: string | null;
  entityCount: number;
  edgeCount: number;
  provenance: ConstructionProvenance;
};

export type StagedEntitySummary = {
  id: string;
  accessId: string;
  displayName: string;
  status: StagedEntityStatus;
  canonicalEntityId?: string | null;
  matchConfidence?: number | null;
  attributes: Record<string, unknown>;
  provenance: ConstructionProvenance;
};


export type StagedEdgeSummary = {
  id: string;
  accessId: string;
  fromStagedEntityId: string;
  toStagedEntityId: string;
  relationKind: string;
  status: StagedEdgeStatus;
  canonicalEdgeId?: string | null;
  attributes: Record<string, unknown>;
  provenance: ConstructionProvenance;
};

export type MatchDecisionRecord = {
  id?: string;
  candidateId?: string | null;
  stagedEntityId: string;
  decision: MatchDecision;
  source: MatchDecisionSource;
  reason?: string | null;
  decidedAt?: string;
  decidedBy?: string | null;
};

export type MatchCandidateSummary = {
  id: string;
  stagedEntityId: string;
  candidate: {kind: "canonical" | "staged"; id: string};
  candidateDisplayName: string;
  score: number;
  confidenceBand: MatchConfidenceBand;
  status: MatchCandidateStatus;
  reasons: Record<string, unknown>;
};

export type ConstructionConflictSummary = {
  id: string;
  stagedEntityId: string;
  canonicalEntityId: string;
  field: string;
  existingValue?: string | null;
  reportedValue?: string | null;
  status: string;
};

export type ConstructionMetrics = {
  accessesOpened: number;
  submissions: number;
  entitiesReported: number;
  commits: number;
};

export type ConstructionDashboard = {
  sessions: ConstructionSessionSummary[];
  accesses: ConstructionAccessSummary[];
  entities: StagedEntitySummary[];
  edges: StagedEdgeSummary[];
  candidates: MatchCandidateSummary[];
  decisions: MatchDecisionRecord[];
  conflicts: ConstructionConflictSummary[];
  metrics: ConstructionMetrics;
};

export type ConstructionSubmissionResult = {
  entitiesReported: number;
  edgesReported: number;
  message: string;
};

export type ConstructionValidationIssue = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  entityId?: string;
  edgeId?: string;
};

export type ConstructionValidationResult = {
  valid: boolean;
  blockingIssues: number;
  issues: ConstructionValidationIssue[];
};

export type ConstructionCommitPlan = {
  accessId: string;
  createEntityCount: number;
  reuseEntityCount: number;
  edgeCount: number;
  validation: ConstructionValidationResult;
};

export type ConstructionCommitResult = {
  createdEntities: number;
  matchedEntities: number;
  createdEdges: number;
};

export interface ConstructionAdapter<TSubmission = ConstructionSubmission> {
  verticalKind: NetworkVerticalKind;
  availability: ConstructionAvailability;
  createSession(title?: string): Promise<string>;
  createAccess(sessionId: string, label?: string, days?: number): Promise<string>;
  previewAccess(token: string): Promise<ConstructionPreview>;
  submit(token: string, submission: TSubmission): Promise<ConstructionSubmissionResult>;
  getDashboard(): Promise<ConstructionDashboard>;
  decideMatch(candidateId: string, decision: MatchDecision): Promise<void>;
  validateAccess(accessId: string): Promise<ConstructionValidationResult>;
  buildCommitPlan(accessId: string): Promise<ConstructionCommitPlan>;
  commitAccess(accessId: string): Promise<ConstructionCommitResult>;
  revokeAccess(accessId: string): Promise<void>;
}
