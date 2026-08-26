import type {KnowledgeIntelligenceAdapter,KnowledgeRetrievalRequest,KnowledgeRetrievalResult} from "./contracts";
import {assertKnowledgeContext,hasAuthorizedScope} from "./contracts";

export class DisabledKnowledgeIntelligenceAdapter implements KnowledgeIntelligenceAdapter{
 async retrieve(request:KnowledgeRetrievalRequest):Promise<KnowledgeRetrievalResult>{
  assertKnowledgeContext(request.context);
  if(!hasAuthorizedScope(request.context)) return {hits:[],blocked:true,reason:"no-authorized-scope"};
  return {hits:[],blocked:true,reason:"adapter-unavailable"};
 }
}

/**
 * G9.1-A bridge boundary.
 * Network OS depends only on this contract. A Knowledge Hub process/service may
 * implement it without importing its runtime, filesystem or LLM dependencies
 * into the existing Network OS application.
 */
export function createKnowledgeIntelligenceRuntime(adapter?:KnowledgeIntelligenceAdapter){
 return adapter??new DisabledKnowledgeIntelligenceAdapter();
}
