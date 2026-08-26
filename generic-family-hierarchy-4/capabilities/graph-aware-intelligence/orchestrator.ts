import type {IntelligenceAnswer,IntelligenceDataset,IntelligenceEvidence} from "../../core/intelligence/contracts";
import {askNetwork,searchNetwork,suggestedQuestions} from "../../core/intelligence/engine";
import type {GraphAwareAnswer,GraphAwareEvidenceInput,GraphAwareReason,OrganizationEvidenceHit,OrganizationQuestionIntent} from "./contracts";

const norm=(v:unknown)=>String(v??"").trim().toLowerCase();
const words=(q:string)=>norm(q).split(/[^a-z0-9@.+-]+/).filter(x=>x.length>1&&!new Set(["who","what","why","which","does","did","the","this","that","best","owns","owner","know","knows","understand","depends","depend","choose","chosen","approach","system"]).has(x));
export function classifyOrganizationQuestion(question:string):OrganizationQuestionIntent{
 const q=norm(question);
 if(/\b(why|decision|choose|chosen|reason|rationale)\b/.test(q))return "decision";
 if(/\b(own|owner|owns|responsible|accountable)\b/.test(q))return "ownership";
 if(/\b(depend|depends|dependency|impact|downstream)\b/.test(q))return "dependency";
 if(/\b(know|knows|expert|expertise|understand|skill|backup|replace)\b/.test(q))return "expertise";
 return "general";
}
function hitText(h:OrganizationEvidenceHit){return `${h.title} ${h.excerpt} ${h.predicate||""} ${JSON.stringify(h.subject||{})} ${JSON.stringify(h.object||{})}`.toLowerCase()}
function rankHits(question:string,hits:OrganizationEvidenceHit[]){const qs=words(question);return [...hits].map(h=>({h,score:qs.reduce((n,w)=>n+(hitText(h).includes(w)?1:0),0)+(h.confidence||0)})).filter(x=>x.score>0||!qs.length).sort((a,b)=>b.score-a.score).map(x=>x.h)}
function freshness(date?:string|null):GraphAwareReason["freshness"]{if(!date)return "unknown";const age=Date.now()-new Date(date).getTime();if(!Number.isFinite(age))return "unknown";const days=age/86400000;return days<=90?"fresh":days<=365?"aging":"stale"}
function endpointLabel(v?:Record<string,unknown>|null){return String(v?.label||v?.value||v?.candidateKey||v?.entityId||"").trim()}
function reasonForHit(h:OrganizationEvidenceHit):GraphAwareReason{return {kind:h.predicate?"verified-assertion":"evidence",label:h.title||h.predicate||"Knowledge evidence",detail:h.predicate?`${endpointLabel(h.subject)} ${h.predicate} ${endpointLabel(h.object)}`.trim():h.excerpt,uri:h.uri,freshness:freshness(h.sourceUpdatedAt)}}
function graphReasons(answer:IntelligenceAnswer):GraphAwareReason[]{return answer.evidence.slice(0,5).map(e=>({kind:"graph",label:e.label,detail:e.detail,entityId:e.entityId,freshness:"unknown"}))}
function entityName(dataset:IntelligenceDataset,id:string){return dataset.entities.find(e=>e.entity.id===id)?.entity.label||id}
function targetEntity(dataset:IntelligenceDataset,question:string){const qs=words(question);if(!qs.length)return searchNetwork(dataset,question)[0]?.entity||null;return dataset.entities.map(e=>({e,score:qs.reduce((n,w)=>n+(norm(e.entity.label).includes(w)?3:0)+(Object.values(e.affiliations).flat().some(v=>norm(v).includes(w))?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score)[0]?.e||searchNetwork(dataset,question)[0]?.entity||null}
function structuralGraphAnswer(dataset:IntelligenceDataset,question:string,intent:OrganizationQuestionIntent,dimensionKeys:readonly string[]):IntelligenceAnswer{
 const fallback=askNetwork("organization",dataset,question,dimensionKeys),target=targetEntity(dataset,question);if(!target)return fallback;const tid=target.entity.id,name=target.entity.label;
 if(intent==="ownership"){
  const owners=dataset.relationships.filter(r=>r.relationshipType==="owns"&&r.toEntityId===tid);if(!owners.length)return {...fallback,headline:`No verified owner for ${name}`,answer:`${name} was identified, but no verified owns relationship is present. Documentary evidence may still provide a candidate or historical owner.`,matchedEntityIds:[tid],evidence:[{kind:"entity",label:name,detail:"Target entity",entityId:tid}]};
  const evidence:IntelligenceEvidence[]=owners.flatMap(r=>[{kind:"relationship" as const,label:r.label||"owns",detail:`${entityName(dataset,r.fromEntityId)} owns ${name}`,relationshipId:r.id},{kind:"entity" as const,label:entityName(dataset,r.fromEntityId),detail:"Verified owner",entityId:r.fromEntityId}]);return {question,headline:`Verified owner${owners.length>1?"s":""} for ${name}`,answer:owners.map(r=>entityName(dataset,r.fromEntityId)).join(", "),confidence:"high",evidence,suggestions:suggestedQuestions("organization"),matchedEntityIds:[tid,...owners.map(r=>r.fromEntityId)]};
 }
 if(intent==="dependency"){
  const downstream=dataset.relationships.filter(r=>r.relationshipType==="depends_on"&&r.toEntityId===tid),upstream=dataset.relationships.filter(r=>r.relationshipType==="depends_on"&&r.fromEntityId===tid);const evidence:IntelligenceEvidence[]=[...downstream.map(r=>({kind:"relationship" as const,label:r.label||"depends_on",detail:`${entityName(dataset,r.fromEntityId)} depends on ${name}`,relationshipId:r.id})),...upstream.map(r=>({kind:"relationship" as const,label:r.label||"depends_on",detail:`${name} depends on ${entityName(dataset,r.toEntityId)}`,relationshipId:r.id}))];return {question,headline:evidence.length?`Verified dependencies around ${name}`:`No verified dependencies for ${name}`,answer:evidence.length?[downstream.length?`Depends on ${name}: ${downstream.map(r=>entityName(dataset,r.fromEntityId)).join(", ")}`:"",upstream.length?`${name} depends on: ${upstream.map(r=>entityName(dataset,r.toEntityId)).join(", ")}`:""].filter(Boolean).join(". "):`${name} was identified, but no verified depends_on relationship is present.`,confidence:evidence.length?"high":"medium",evidence:evidence.length?evidence:[{kind:"entity",label:name,detail:"Target entity",entityId:tid}],suggestions:suggestedQuestions("organization"),matchedEntityIds:[tid,...downstream.map(r=>r.fromEntityId),...upstream.map(r=>r.toEntityId)]};
 }
 if(intent==="expertise"){
  const qs=words(question),experts=dataset.entities.map(e=>({e,score:(e.affiliations.skill||[]).reduce((n,s)=>n+qs.reduce((m,w)=>m+(norm(s).includes(w)?2:0),0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);if(experts.length){const evidence:IntelligenceEvidence[]=experts.slice(0,6).map(x=>({kind:"affiliation",label:x.e.entity.label,detail:`Skills: ${(x.e.affiliations.skill||[]).join(", ")}`,entityId:x.e.entity.id}));return {question,headline:`${experts.length} verified expertise match${experts.length===1?"":"es"}`,answer:experts.slice(0,6).map(x=>x.e.entity.label).join(", "),confidence:experts.length>=2?"high":"medium",evidence,suggestions:suggestedQuestions("organization"),matchedEntityIds:experts.slice(0,6).map(x=>x.e.entity.id)}}
 }
 return fallback;
}
function answerText(intent:OrganizationQuestionIntent,graph:IntelligenceAnswer,hits:OrganizationEvidenceHit[]){const top=hits.slice(0,3);if(!top.length)return graph.answer;if(intent==="decision")return top.map(x=>x.excerpt||x.title).join(" ");const prefix=graph.answer?`${graph.answer}${graph.answer.endsWith(".")?"":"."} `:"";return `${prefix}Supporting evidence: ${top.map(x=>x.title).join(", ")}.`;}
export function answerOrganizationQuestion(dataset:IntelligenceDataset,question:string,evidence:GraphAwareEvidenceInput,dimensionKeys:readonly string[]=[]):GraphAwareAnswer{
 const intent=classifyOrganizationQuestion(question),graph=structuralGraphAnswer(dataset,question,intent,dimensionKeys);
 const verified=rankHits(question,evidence.verified).filter(h=>intent==="general"||!h.predicate||intent==="expertise"&&h.predicate==="skill"||intent==="ownership"&&h.predicate==="owns"||intent==="dependency"&&h.predicate==="depends_on"||intent==="decision"&&h.predicate==="architectural_decision");
 const documents=rankHits(question,evidence.documents),hits=[...verified,...documents.filter(d=>!verified.some(v=>v.id===d.id))].slice(0,8),reasons=[...graphReasons(graph),...hits.slice(0,5).map(reasonForHit)];
 const confidence:GraphAwareAnswer["confidence"]=verified.length>=1&&graph.evidence.length>=1?"high":hits.length>=2||graph.confidence==="high"?"medium":reasons.length?"medium":"low";
 return {question,intent,headline:hits.length?`${graph.headline} · evidence enriched`:graph.headline,answer:answerText(intent,graph,hits),confidence,graphAnswer:graph,evidenceHits:hits,reasons,matchedEntityIds:[...new Set(graph.matchedEntityIds)],synthesis:"deterministic",suggestions:["Who knows this system best?","Who owns this system?","What depends on this system?","Why did we choose this approach?"]};
}
