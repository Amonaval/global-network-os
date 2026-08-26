import type {IntelligenceDataset} from "../../core/intelligence/contracts";

export type KnowledgeRiskSeverity="attention"|"watch"|"healthy";
export type OrganizationRiskSignal={
 id:string;kind:"key_person"|"ownership_gap"|"dependency_criticality"|"question_gap"|"stale_knowledge"|"conflict";
 severity:KnowledgeRiskSeverity;title:string;summary:string;score:number;entityIds:string[];evidence:string[];action:string;
};
export type OrganizationKnowledgeRiskBackend={
 unansweredQuestions:{question:string;count:number;lastAskedAt:string;intent:string}[];
 staleEvidenceCount:number;conflictedAssertionCount:number;verifiedAssertionCount:number;evidenceCount:number;
};
export type OrganizationRiskReport={score:number;status:KnowledgeRiskSeverity;signals:OrganizationRiskSignal[];backend:OrganizationKnowledgeRiskBackend};
export type OrganizationRiskInput={dataset:IntelligenceDataset;backend:OrganizationKnowledgeRiskBackend};
