import type {AssertionEndpoint,CandidateAssertionPredicate,CandidateAssertionStatus} from "../../core/evidence/contracts";

export type OrganizationCandidateKind="expertise"|"ownership"|"dependency"|"decision";
export type OrganizationCandidate={
 id:string;networkId:string;kind:OrganizationCandidateKind;subject:AssertionEndpoint;predicate:CandidateAssertionPredicate;object:AssertionEndpoint;
 evidenceIds:string[];confidence:number;status:CandidateAssertionStatus;extractionMethod:string;extractorVersion?:string|null;
 createdAt:string;reviewedAt?:string|null;reviewedBy?:string|null;metadata:Record<string,unknown>;
};
export type OrganizationCandidateDecision="accept"|"reject";
