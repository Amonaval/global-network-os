import type {IntelligenceAnswer,IntelligenceEvidence} from "../../core/intelligence/contracts";

export type OrganizationQuestionIntent="expertise"|"ownership"|"dependency"|"decision"|"general";
export type OrganizationEvidenceHit={
 id:string;title:string;excerpt:string;uri?:string|null;section?:string|null;sourceUpdatedAt?:string|null;
 predicate?:string|null;subject?:Record<string,unknown>|null;object?:Record<string,unknown>|null;confidence?:number|null;
};
export type GraphAwareReason={kind:"graph"|"evidence"|"verified-assertion";label:string;detail:string;entityId?:string;uri?:string|null;freshness?:"fresh"|"aging"|"stale"|"unknown"};
export type GraphAwareAnswer={
 question:string;intent:OrganizationQuestionIntent;headline:string;answer:string;confidence:"high"|"medium"|"low";
 graphAnswer:IntelligenceAnswer;evidenceHits:OrganizationEvidenceHit[];reasons:GraphAwareReason[];matchedEntityIds:string[];
 synthesis:"deterministic"|"optional-llm";suggestions:string[];
};
export type GraphAwareEvidenceInput={verified:OrganizationEvidenceHit[];documents:OrganizationEvidenceHit[]};
export type GraphAwareEvidenceSummary={evidence:IntelligenceEvidence[];text:string};
