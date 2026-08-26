import type {NetworkAffiliatedEntity} from "../../core/network-os/contracts";
import type {NetworkEntityRelationship} from "../template-product/remote";
import type {AssertionEndpoint} from "../../core/evidence/contracts";

const norm=(v:unknown)=>String(v??"").trim().toLowerCase().replace(/\s+/g," ");
export function resolveEndpoint(endpoint:AssertionEndpoint,entities:NetworkAffiliatedEntity[]){
 if(endpoint.entityId)return entities.find(e=>e.entity.id===endpoint.entityId)||null;
 const label=norm(endpoint.label||endpoint.value||endpoint.candidateKey);if(!label)return null;
 const exact=entities.filter(e=>norm(e.entity.label)===label);return exact.length===1?exact[0]:null;
}
export function relationshipConflict(fromId:string,toId:string,predicate:string,relationships:NetworkEntityRelationship[]){
 const same=relationships.find(r=>r.fromEntityId===fromId&&r.toEntityId===toId&&r.relationshipType===predicate);if(same)return "existing" as const;
 if(predicate==="owns"){const owner=relationships.find(r=>r.toEntityId===toId&&r.relationshipType==="owns"&&r.fromEntityId!==fromId);if(owner)return "competing-owner" as const;}
 return null;
}
