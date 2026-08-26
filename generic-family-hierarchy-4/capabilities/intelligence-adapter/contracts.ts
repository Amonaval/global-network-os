import type {EvidenceRecord} from "../../core/evidence/contracts";

export type IntelligencePrincipal={
 userId:string;
 networkId:string;
 membershipRole?:string|null;
 authorizationRefs:string[];
};

export type KnowledgeCorpusContext={
 networkId:string;
 corpusId:string;
 principal:IntelligencePrincipal;
 allowedSections?:string[];
};

export type KnowledgeRetrievalRequest={
 question:string;
 context:KnowledgeCorpusContext;
 topK?:number;
};

export type KnowledgeEvidenceHit={
 evidence:EvidenceRecord;
 text:string;
 score:number;
 semanticScore?:number;
};

export type KnowledgeRetrievalResult={
 hits:KnowledgeEvidenceHit[];
 blocked:boolean;
 reason?:"no-authorized-scope"|"no-evidence"|"adapter-unavailable";
};

export interface KnowledgeIntelligenceAdapter{
 retrieve(request:KnowledgeRetrievalRequest):Promise<KnowledgeRetrievalResult>;
}

export function assertKnowledgeContext(context:KnowledgeCorpusContext){
 if(!context.networkId) throw new Error("networkId is required");
 if(!context.corpusId) throw new Error("corpusId is required");
 if(!context.principal?.userId) throw new Error("authenticated principal is required");
 if(context.principal.networkId!==context.networkId) throw new Error("principal/network mismatch");
}

export function hasAuthorizedScope(context:KnowledgeCorpusContext){
 return context.principal.authorizationRefs.length>0;
}
