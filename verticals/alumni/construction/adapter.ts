import type {
  ConstructionAdapter,
  ConstructionCommitPlan,
  ConstructionCommitResult,
  ConstructionDashboard,
  ConstructionPreview,
  ConstructionSubmissionResult,
  ConstructionValidationResult,
  MatchDecision,
} from "../../../core/construction/contracts";
import type { AlumniConstructionSubmission } from "./types";

const notReady = (): never => {
  throw new Error("Alumni network construction persistence is not implemented yet.");
};

/**
 * G3 second-consumer skeleton. It proves institutional construction semantics without
 * borrowing Family persistence, kinship relations, generation rules, or Family RPCs.
 */
export const ALUMNI_CONSTRUCTION_ADAPTER: ConstructionAdapter<AlumniConstructionSubmission> = {
  verticalKind: "alumni",
  availability: "skeleton",
  async createSession(): Promise<string> { return notReady(); },
  async createAccess(): Promise<string> { return notReady(); },
  async previewAccess(): Promise<ConstructionPreview> { return notReady(); },
  async submit(): Promise<ConstructionSubmissionResult> { return notReady(); },
  async getDashboard(): Promise<ConstructionDashboard> { return notReady(); },
  async decideMatch(_candidateId: string, _decision: MatchDecision): Promise<void> { return notReady(); },
  async validateAccess(): Promise<ConstructionValidationResult> { return notReady(); },
  async buildCommitPlan(): Promise<ConstructionCommitPlan> { return notReady(); },
  async commitAccess(): Promise<ConstructionCommitResult> { return notReady(); },
  async revokeAccess(): Promise<void> { return notReady(); },
};
