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
import { supabase } from "../../../lib/supabase";
import type {
  FamilyConstructionSubmission,
  FamilyIntakeDashboard,
  FamilyIntakePreview,
  IntakePersonInput,
  IntakeRelationshipInput,
} from "./types";

const emptyFamilyDashboard = (): FamilyIntakeDashboard => ({
  sessions: [], branches: [], people: [], candidates: [], conflicts: [],
  metrics: {links_opened: 0, submissions: 0, people_reported: 0, branches_committed: 0},
});

// Historical S3-A1 Family API. RPC names/security behavior remain unchanged.
export async function createFamilyIntakeSession(title="Build our family together"){
  if(!supabase)throw new Error("Shared mode is required.");
  const {data,error}=await supabase.rpc("create_family_intake_session",{p_title:title});if(error)throw error;return String(data);
}
export async function createFamilyIntakeLink(sessionId:string,representativeLabel="",days=30){
  if(!supabase)throw new Error("Shared mode is required.");
  const {data,error}=await supabase.rpc("create_family_intake_link",{p_session_id:sessionId,p_representative_label:representativeLabel||null,p_days:days});if(error)throw error;return String(data);
}
export async function fetchFamilyIntakePreview(token:string):Promise<FamilyIntakePreview>{
  if(!supabase)throw new Error("This contribution form needs the shared Family Network service.");
  const {data,error}=await supabase.rpc("get_family_intake_preview",{p_token:token});if(error)throw error;return data as FamilyIntakePreview;
}
export async function submitFamilyIntake(token:string,people:IntakePersonInput[],relationships:IntakeRelationshipInput[]){
  if(!supabase)throw new Error("This contribution form needs the shared Family Network service.");
  const {data,error}=await supabase.rpc("submit_family_intake",{p_token:token,p_people:people,p_relationships:relationships});if(error)throw error;
  return data as {people_reported:number;relationships_reported:number;message:string};
}
export async function fetchFamilyIntakeDashboard():Promise<FamilyIntakeDashboard>{
  if(!supabase)return emptyFamilyDashboard();
  const {data,error}=await supabase.rpc("get_family_intake_admin_dashboard");if(error)throw error;return data as FamilyIntakeDashboard;
}
export async function decideFamilyIntakeMatch(candidateId:string,decision:MatchDecision){
  if(!supabase)return;
  const {error}=await supabase.rpc("decide_family_intake_match",{p_candidate_id:candidateId,p_decision:decision});if(error)throw error;
}
export async function commitFamilyIntakeBranch(accessId:string){
  if(!supabase)throw new Error("Shared mode is required.");
  const {data,error}=await supabase.rpc("commit_family_intake_branch",{p_access_id:accessId});if(error)throw error;
  return data as {created_people:number;matched_people:number;relationships:number};
}
export async function revokeFamilyIntakeLink(accessId:string){
  if(!supabase)return;
  const {error}=await supabase.rpc("revoke_family_intake_link",{p_access_id:accessId});if(error)throw error;
}

function toConstructionPreview(row: FamilyIntakePreview): ConstructionPreview {
  return {
    networkName: row.family_name,
    title: row.title,
    sourceLabel: row.representative_label,
    status: row.status,
    alreadySubmitted: row.already_submitted,
    expiresAt: row.expires_at,
  };
}

function toConstructionDashboard(row: FamilyIntakeDashboard): ConstructionDashboard {
  const branchById = new Map(row.branches.map(branch => [branch.id, branch]));
  return {
    sessions: row.sessions.map(session => ({
      id: session.id, title: session.title, status: session.status, createdAt: session.created_at,
      accessCount: Number(session.access_count || 0), submittedCount: Number(session.submitted_count || 0), committedCount: Number(session.committed_count || 0),
    })),
    accesses: row.branches.map(branch => ({
      id: branch.id, sessionId: branch.session_id, label: branch.representative_label, status: branch.status,
      expiresAt: branch.expires_at, submittedAt: branch.submitted_at, entityCount: Number(branch.people_count || 0), edgeCount: Number(branch.relationship_count || 0),
      provenance: {source: {kind: "shared_link", sourceId: branch.id, label: branch.representative_label}, sessionId: branch.session_id, accessId: branch.id},
    })),
    entities: row.people.map(person => {
      const branch = branchById.get(person.access_id);
      return {
        id: person.id,
        accessId: person.access_id,
        displayName: person.full_name,
        status: person.status,
        canonicalEntityId: person.matched_member_id,
        matchConfidence: person.match_confidence,
        attributes: {
          birthYear: person.birth_year ?? null,
          gender: person.gender ?? null,
          city: person.city ?? null,
          roleFromAnchor: person.role_from_anchor ?? null,
          generationOffset: person.generation_offset,
        },
        provenance: {source: {kind: "shared_link", sourceId: person.access_id, label: branch?.representative_label}, sessionId: branch?.session_id, accessId: person.access_id},
      };
    }),
    // Migration 043 keeps staged relationship/decision rows server-side; no compatibility RPC exposes them yet.
    // The shared contract models them for future adapters without changing current Family transport.
    edges: [],
    candidates: row.candidates.map(candidate => ({
      id: candidate.id,
      stagedEntityId: candidate.staged_person_id,
      candidate: candidate.candidate_member_id
        ? {kind: "canonical" as const, id: candidate.candidate_member_id}
        : {kind: "staged" as const, id: candidate.candidate_staged_person_id || candidate.id},
      candidateDisplayName: candidate.candidate_name,
      score: Number(candidate.score || 0), confidenceBand: candidate.confidence_band, status: candidate.status, reasons: candidate.reasons || {},
    })),
    decisions: [],
    conflicts: row.conflicts.map(conflict => ({
      id: conflict.id, stagedEntityId: conflict.staged_person_id, canonicalEntityId: conflict.member_id, field: conflict.field_name,
      existingValue: conflict.existing_value, reportedValue: conflict.reported_value, status: conflict.status,
    })),
    metrics: {
      accessesOpened: Number(row.metrics.links_opened || 0), submissions: Number(row.metrics.submissions || 0),
      entitiesReported: Number(row.metrics.people_reported || 0), commits: Number(row.metrics.branches_committed || 0),
    },
  };
}

async function validateFamilyAccess(accessId: string): Promise<ConstructionValidationResult> {
  const dashboard = await fetchFamilyIntakeDashboard();
  const branchPeople = dashboard.people.filter(person => person.access_id === accessId);
  const personIds = new Set(branchPeople.map(person => person.id));
  const ambiguous = branchPeople.filter(person => person.status === "ambiguous" && !person.matched_member_id);
  const unresolved = dashboard.candidates.filter(candidate => personIds.has(candidate.staged_person_id) && candidate.score >= 65 && (candidate.status === "open" || candidate.status === "unsure"));
  const issues = [
    ...ambiguous.map(person => ({code: "identity.ambiguous", severity: "error" as const, message: `Resolve the identity match for ${person.full_name} before commit.`, entityId: person.id})),
    ...unresolved.map(candidate => ({code: "match.unresolved", severity: "error" as const, message: `Resolve the medium/high confidence match for ${candidate.candidate_name} before commit.`, entityId: candidate.staged_person_id})),
  ];
  return {valid: issues.length === 0, blockingIssues: issues.length, issues};
}

async function buildFamilyCommitPlan(accessId: string): Promise<ConstructionCommitPlan> {
  const dashboard = await fetchFamilyIntakeDashboard();
  const branch = dashboard.branches.find(item => item.id === accessId);
  const people = dashboard.people.filter(person => person.access_id === accessId);
  const validation = await validateFamilyAccess(accessId);
  return {
    accessId,
    createEntityCount: people.filter(person => !person.matched_member_id).length,
    reuseEntityCount: people.filter(person => !!person.matched_member_id).length,
    edgeCount: Number(branch?.relationship_count || 0),
    validation,
  };
}

export const FAMILY_CONSTRUCTION_ADAPTER: ConstructionAdapter<FamilyConstructionSubmission> = {
  verticalKind: "family",
  availability: "ready",
  createSession: createFamilyIntakeSession,
  createAccess: createFamilyIntakeLink,
  async previewAccess(token): Promise<ConstructionPreview> { return toConstructionPreview(await fetchFamilyIntakePreview(token)); },
  async submit(token, submission): Promise<ConstructionSubmissionResult> {
    const result = await submitFamilyIntake(token, submission.people, submission.relationships);
    return {entitiesReported: result.people_reported, edgesReported: result.relationships_reported, message: result.message};
  },
  async getDashboard(): Promise<ConstructionDashboard> { return toConstructionDashboard(await fetchFamilyIntakeDashboard()); },
  decideMatch: decideFamilyIntakeMatch,
  validateAccess: validateFamilyAccess,
  buildCommitPlan: buildFamilyCommitPlan,
  async commitAccess(accessId): Promise<ConstructionCommitResult> {
    const result = await commitFamilyIntakeBranch(accessId);
    return {createdEntities: result.created_people, matchedEntities: result.matched_people, createdEdges: result.relationships};
  },
  revokeAccess: revokeFamilyIntakeLink,
};
