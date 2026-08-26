import {supabase} from "../../lib/supabase";
import type {GraphAwareEvidenceInput,OrganizationEvidenceHit} from "./contracts";
function required(){if(!supabase)throw new Error("Supabase is not configured.");return supabase;}
const STOP=new Set(["who","what","why","which","does","did","the","this","that","best","owns","owner","know","knows","understand","depends","depend","choose","chosen","approach","system"]);
export function evidenceSearchQuery(question:string){return question.toLowerCase().split(/[^a-z0-9@.+-]+/).filter(x=>x.length>1&&!STOP.has(x)).slice(0,8).join(" ")||question.trim();}
function map(r:any):OrganizationEvidenceHit{return {id:String(r.id),title:String(r.title||r.predicate||"Knowledge evidence"),excerpt:String(r.excerpt||r.summary||""),uri:r.uri||null,section:r.section||null,sourceUpdatedAt:r.source_updated_at||r.created_at||null,predicate:r.predicate||null,subject:r.subject||null,object:r.object||null,confidence:r.confidence==null?null:Number(r.confidence)}}
export async function fetchOrganizationGraphAwareEvidence(question:string,limit=12):Promise<GraphAwareEvidenceInput>{const {data,error}=await required().rpc("get_organization_graph_aware_evidence",{p_query:evidenceSearchQuery(question),p_limit:limit});if(error)throw error;const rows=(data||[]).map(map);return {verified:rows.filter((r:any)=>!!r.predicate),documents:rows.filter((r:any)=>!r.predicate)};}
