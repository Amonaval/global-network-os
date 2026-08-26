export type EvidenceVisibility="network"|"restricted";

export type KnowledgeSourceType="confluence"|"url"|"upload"|"portal"|"code"|"other";

export type KnowledgeSource={
 id:string;
 networkId:string;
 type:KnowledgeSourceType;
 externalId?:string|null;
 title:string;
 uri?:string|null;
 connectorId?:string|null;
 visibility:EvidenceVisibility;
 authorizationRefs:string[];
 contentHash?:string|null;
 createdAt:string;
 lastObservedAt:string;
 sourceUpdatedAt?:string|null;
 metadata?:Record<string,unknown>;
};

export type EvidenceRecord={
 id:string;
 networkId:string;
 sourceId:string;
 documentExternalId?:string|null;
 chunkId:string;
 title?:string|null;
 uri?:string|null;
 section?:string|null;
 breadcrumb?:string[];
 contentHash:string;
 excerpt?:string|null;
 sourceUpdatedAt?:string|null;
 capturedAt:string;
 visibility:EvidenceVisibility;
 authorizationRefs:string[];
 extractionVersion?:string|null;
 metadata?:Record<string,unknown>;
};

export type CandidateAssertionStatus="candidate"|"verified"|"rejected"|"superseded"|"conflicted";
export type CandidateAssertionPredicate="skill"|"owns"|"depends_on"|"reports_to"|"works_with"|"participates_in"|string;
export type AssertionEndpoint={entityId?:string;candidateKey?:string;value?:string;label?:string};

export type CandidateAssertion={
 id:string;
 networkId:string;
 subject:AssertionEndpoint;
 predicate:CandidateAssertionPredicate;
 object:AssertionEndpoint;
 evidenceIds:string[];
 confidence:number;
 extractionMethod:string;
 extractorVersion?:string|null;
 status:CandidateAssertionStatus;
 createdAt:string;
 reviewedBy?:string|null;
 reviewedAt?:string|null;
 supersedesAssertionId?:string|null;
 metadata?:Record<string,unknown>;
};

export type AssertionDecisionAction="accept"|"reject"|"merge"|"supersede";
export type AssertionDecision={
 id:string;
 networkId:string;
 assertionId:string;
 action:AssertionDecisionAction;
 actorUserId:string;
 reason?:string|null;
 createdAt:string;
};

export function clampEvidenceConfidence(value:number){
 return Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
}
