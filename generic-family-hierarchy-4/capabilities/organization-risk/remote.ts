import {supabase} from "../../lib/supabase";
import type {GraphAwareAnswer} from "../graph-aware-intelligence/contracts";
import type {OrganizationKnowledgeRiskBackend} from "./contracts";
function required(){if(!supabase)throw new Error("Supabase is not configured.");return supabase;}
export async function recordOrganizationIntelligenceQuery(question:string,answer:GraphAwareAnswer){
 const {error}=await required().rpc("record_organization_intelligence_query",{p_question:question,p_intent:answer.intent,p_confidence:answer.confidence,p_evidence_count:answer.evidenceHits.length,p_matched_entity_ids:answer.matchedEntityIds});if(error)throw error;
}
export async function fetchOrganizationKnowledgeRiskBackend():Promise<OrganizationKnowledgeRiskBackend>{
 const {data,error}=await required().rpc("get_organization_knowledge_risk_signals");if(error)throw error;const d=(data||{}) as any;return {unansweredQuestions:Array.isArray(d.unansweredQuestions)?d.unansweredQuestions:[],staleEvidenceCount:Number(d.staleEvidenceCount||0),conflictedAssertionCount:Number(d.conflictedAssertionCount||0),verifiedAssertionCount:Number(d.verifiedAssertionCount||0),evidenceCount:Number(d.evidenceCount||0)};
}
