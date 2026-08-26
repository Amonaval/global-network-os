import {supabase} from "../../lib/supabase";
import type {OrganizationCandidate,OrganizationCandidateDecision} from "./contracts";
function required(){if(!supabase)throw new Error("Supabase is not configured.");return supabase;}
export async function fetchOrganizationKnowledgeCandidates(status:"candidate"|"conflicted"|"verified"|"rejected"|null="candidate"){
 const {data,error}=await required().rpc("get_organization_knowledge_candidates",{p_status:status});if(error)throw error;
 return (data||[]).map((r:any)=>({id:String(r.id),networkId:String(r.network_id),kind:r.kind,subject:r.subject||{},predicate:r.predicate,object:r.object||{},evidenceIds:r.evidence_ids||[],confidence:Number(r.confidence||0),status:r.status,extractionMethod:r.extraction_method,extractorVersion:r.extractor_version||null,createdAt:r.created_at,reviewedAt:r.reviewed_at||null,reviewedBy:r.reviewed_by||null,metadata:r.metadata||{}})) as OrganizationCandidate[];
}
export async function reviewOrganizationKnowledgeCandidate(id:string,action:OrganizationCandidateDecision,reason=""){
 const {data,error}=await required().rpc("review_organization_knowledge_candidate",{p_assertion_id:id,p_action:action,p_reason:reason});if(error)throw error;return data;
}
