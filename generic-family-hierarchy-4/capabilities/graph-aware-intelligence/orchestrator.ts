import type {IntelligenceAnswer,IntelligenceDataset,IntelligenceEvidence} from "../../core/intelligence/contracts";
import {askNetwork,searchNetwork,suggestedQuestions} from "../../core/intelligence/engine";
import type {GraphAwareAnswer,GraphAwareEvidenceInput,GraphAwareReason,OrganizationEvidenceHit,OrganizationQuestionIntent} from "./contracts";

const STOP=new Set(["who","what","why","which","does","did","the","this","that","best","owns","owner","know","knows","understand","depends","depend","choose","chosen","approach","system","systems","on","of","for","and","itself"]);
const norm=(v:unknown)=>String(v??"").trim().toLowerCase().replace(/\s+/g," ");
const words=(q:string)=>norm(q).split(/[^a-z0-9@.+-]+/).filter(x=>x.length>1&&!STOP.has(x));

export function classifyOrganizationQuestion(question:string):OrganizationQuestionIntent{
 const q=norm(question);
 if(/\b(why|decision|choose|chosen|reason|rationale)\b/.test(q))return "decision";
 if(/\b(own|owner|owns|responsible|accountable)\b/.test(q))return "ownership";
 if(/\b(depend|depends|dependency|impact|downstream|upstream)\b/.test(q))return "dependency";
 if(/\b(know|knows|expert|expertise|understand|skill|backup|replace)\b/.test(q))return "expertise";
 return "general";
}

export type DependencyDirection="downstream"|"upstream"|"both";
export function classifyDependencyDirection(question:string):DependencyDirection{
 const q=norm(question);
 const asksUpstream=/\bwhat\s+(?:does|do)\b.*\bdepend(?:s)?\s+on\b/.test(q)||/\bwhat\s+are\b.*\bdependencies\b/.test(q)||/\bupstream\b/.test(q);
 const asksDownstream=/\bwhat\s+depends\s+on\b/.test(q)||/\bwhich\s+(?:systems?|services?)\s+depend\s+on\b/.test(q)||/\bdownstream\b/.test(q);
 const explicitBoth=/\band\s+what\s+(?:does|do)\b.*\bdepend(?:s)?\s+on\b/.test(q)||/\bboth\b/.test(q);
 if(explicitBoth||(asksUpstream&&asksDownstream))return "both";
 if(asksUpstream)return "upstream";
 return "downstream";
}

function hitText(h:OrganizationEvidenceHit){return `${h.title} ${h.excerpt} ${h.predicate||""} ${JSON.stringify(h.subject||{})} ${JSON.stringify(h.object||{})}`.toLowerCase()}
function rankHits(question:string,hits:OrganizationEvidenceHit[]){const qs=words(question);return [...hits].map(h=>({h,score:qs.reduce((n,w)=>n+(hitText(h).includes(w)?1:0),0)+(h.confidence||0)})).filter(x=>x.score>0||!qs.length).sort((a,b)=>b.score-a.score).map(x=>x.h)}
function freshness(date?:string|null):GraphAwareReason["freshness"]{if(!date)return "unknown";const age=Date.now()-new Date(date).getTime();if(!Number.isFinite(age))return "unknown";const days=age/86400000;return days<=90?"fresh":days<=365?"aging":"stale"}
function endpointLabel(v?:Record<string,unknown>|null){return String(v?.label||v?.value||v?.candidateKey||v?.entityId||"").trim()}
function reasonForHit(h:OrganizationEvidenceHit):GraphAwareReason{return {kind:h.predicate?"verified-assertion":"evidence",label:h.title||h.predicate||"Knowledge evidence",detail:h.predicate?`${endpointLabel(h.subject)} ${h.predicate} ${endpointLabel(h.object)}`.trim():h.excerpt,uri:h.uri,freshness:freshness(h.sourceUpdatedAt)}}
function graphReasons(answer:IntelligenceAnswer):GraphAwareReason[]{return answer.evidence.slice(0,5).map(e=>({kind:"graph",label:e.label,detail:e.detail,entityId:e.entityId,freshness:"unknown"}))}
function entityName(dataset:IntelligenceDataset,id:string){return dataset.entities.find(e=>e.entity.id===id)?.entity.label||id}

/**
 * Resolve the entity explicitly named by the user before any fuzzy scoring.
 * Longest label wins so "Identity Gateway" beats a shorter overlapping label.
 * This prevents evidence/affiliation-rich people from replacing the literal query subject.
 */
export function resolveExplicitTargetEntity(dataset:IntelligenceDataset,question:string){
 const q=` ${norm(question).replace(/[^a-z0-9@.+-]+/g," ")} `;
 const explicit=dataset.entities
  .map(e=>({e,label:norm(e.entity.label),needle:` ${norm(e.entity.label).replace(/[^a-z0-9@.+-]+/g," ")} `}))
  .filter(x=>x.label.length>=2&&q.includes(x.needle))
  .sort((a,b)=>b.label.length-a.label.length);
 if(explicit.length)return explicit[0].e;
 const qs=words(question);if(!qs.length)return searchNetwork(dataset,question)[0]?.entity||null;
 return dataset.entities.map(e=>({e,score:qs.reduce((n,w)=>n+(norm(e.entity.label).includes(w)?4:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score)[0]?.e||searchNetwork(dataset,question)[0]?.entity||null;
}

function expertiseBoosts(hits:OrganizationEvidenceHit[]){
 const boosts=new Map<string,number>();
 for(const h of hits){
  if(h.predicate!=="skill")continue;
  const subject=norm(endpointLabel(h.subject));if(!subject)continue;
  boosts.set(subject,(boosts.get(subject)||0)+1+(h.confidence||0));
 }
 return boosts;
}

function structuralGraphAnswer(dataset:IntelligenceDataset,question:string,intent:OrganizationQuestionIntent,dimensionKeys:readonly string[],verifiedHits:OrganizationEvidenceHit[]):IntelligenceAnswer{
 const fallback=askNetwork("organization",dataset,question,dimensionKeys),target=resolveExplicitTargetEntity(dataset,question);
 if(intent==="expertise"){
  const qs=words(question),boost=expertiseBoosts(verifiedHits);
  const experts=dataset.entities.map(e=>{const skills=e.affiliations.skill||[];const tokenMatches=skills.reduce((n,s)=>n+qs.reduce((m,w)=>m+(norm(s).includes(w)?2:0),0),0);const matchedTerms=new Set(qs.filter(w=>skills.some(s=>norm(s).includes(w)))).size;return {e,score:tokenMatches+matchedTerms*2+(boost.get(norm(e.entity.label))||0)};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.e.entity.label.localeCompare(b.e.entity.label));
  if(experts.length){const evidence:IntelligenceEvidence[]=experts.slice(0,6).map((x,i)=>({kind:"affiliation",label:x.e.entity.label,detail:`#${i+1} · Skills: ${(x.e.affiliations.skill||[]).join(", ")}`,entityId:x.e.entity.id}));return {question,headline:`${experts.length} verified expertise match${experts.length===1?"":"es"}`,answer:experts.slice(0,6).map(x=>x.e.entity.label).join(", "),confidence:experts.length>=2?"high":"medium",evidence,suggestions:suggestedQuestions("organization"),matchedEntityIds:experts.slice(0,6).map(x=>x.e.entity.id)}}
  return fallback;
 }
 if(!target)return fallback;const tid=target.entity.id,name=target.entity.label;
 if(intent==="ownership"){
  const owners=dataset.relationships.filter(r=>r.relationshipType==="owns"&&r.toEntityId===tid);if(!owners.length)return {...fallback,headline:`No verified owner for ${name}`,answer:`${name} was identified, but no verified owns relationship is present. Documentary evidence may still provide a candidate or historical owner.`,matchedEntityIds:[tid],evidence:[{kind:"entity",label:name,detail:"Explicit query target",entityId:tid}]};
  const evidence:IntelligenceEvidence[]=owners.flatMap(r=>[{kind:"relationship" as const,label:r.label||"owns",detail:`${entityName(dataset,r.fromEntityId)} owns ${name}`,relationshipId:r.id},{kind:"entity" as const,label:entityName(dataset,r.fromEntityId),detail:"Verified owner",entityId:r.fromEntityId}]);return {question,headline:`Verified owner${owners.length>1?"s":""} for ${name}`,answer:owners.map(r=>entityName(dataset,r.fromEntityId)).join(", "),confidence:"high",evidence,suggestions:suggestedQuestions("organization"),matchedEntityIds:[tid,...owners.map(r=>r.fromEntityId)]};
 }
 if(intent==="dependency"){
  const direction=classifyDependencyDirection(question),downstream=dataset.relationships.filter(r=>r.relationshipType==="depends_on"&&r.toEntityId===tid),upstream=dataset.relationships.filter(r=>r.relationshipType==="depends_on"&&r.fromEntityId===tid);
  const selected=direction==="downstream"?downstream:direction==="upstream"?upstream:[...downstream,...upstream];
  const evidence:IntelligenceEvidence[]=selected.map(r=>r.toEntityId===tid?({kind:"relationship" as const,label:r.label||"depends_on",detail:`${entityName(dataset,r.fromEntityId)} depends on ${name}`,relationshipId:r.id}):({kind:"relationship" as const,label:r.label||"depends_on",detail:`${name} depends on ${entityName(dataset,r.toEntityId)}`,relationshipId:r.id}));
  let answer="";
  if(direction==="downstream")answer=downstream.length?downstream.map(r=>entityName(dataset,r.fromEntityId)).join(", "):`No verified systems currently depend on ${name}.`;
  else if(direction==="upstream")answer=upstream.length?upstream.map(r=>entityName(dataset,r.toEntityId)).join(", "):`${name} has no verified upstream dependencies.`;
  else answer=[downstream.length?`Depends on ${name}: ${downstream.map(r=>entityName(dataset,r.fromEntityId)).join(", ")}`:`Nothing verified as depending on ${name}`,upstream.length?`${name} depends on: ${upstream.map(r=>entityName(dataset,r.toEntityId)).join(", ")}`:`No verified upstream dependencies for ${name}`].join(". ");
  return {question,headline:evidence.length?`${direction==="both"?"Verified dependencies around":direction==="upstream"?"Verified upstream dependencies for":"Verified dependents of"} ${name}`:`No verified ${direction==="upstream"?"upstream ":""}dependencies for ${name}`,answer,confidence:evidence.length?"high":"medium",evidence:evidence.length?evidence:[{kind:"entity",label:name,detail:"Explicit query target",entityId:tid}],suggestions:suggestedQuestions("organization"),matchedEntityIds:[tid,...selected.flatMap(r=>[r.fromEntityId,r.toEntityId])]};
 }
 return fallback;
}

function answerText(intent:OrganizationQuestionIntent,graph:IntelligenceAnswer,hits:OrganizationEvidenceHit[]){const top=hits.slice(0,2);if(!top.length)return graph.answer;if(intent==="decision")return top.map(x=>x.excerpt||x.title).join(" ");return graph.answer;}
export function answerOrganizationQuestion(dataset:IntelligenceDataset,question:string,evidence:GraphAwareEvidenceInput,dimensionKeys:readonly string[]=[]):GraphAwareAnswer{
 const intent=classifyOrganizationQuestion(question);
 const verified=rankHits(question,evidence.verified).filter(h=>intent==="general"||!h.predicate||intent==="expertise"&&h.predicate==="skill"||intent==="ownership"&&h.predicate==="owns"||intent==="dependency"&&h.predicate==="depends_on"||intent==="decision"&&h.predicate==="architectural_decision");
 const graph=structuralGraphAnswer(dataset,question,intent,dimensionKeys,verified);
 const documents=rankHits(question,evidence.documents),hits=[...verified,...documents.filter(d=>!verified.some(v=>v.id===d.id))].slice(0,8),reasons=[...graphReasons(graph),...hits.slice(0,5).map(reasonForHit)];
 const confidence:GraphAwareAnswer["confidence"]=verified.length>=1&&graph.evidence.length>=1?"high":hits.length>=2||graph.confidence==="high"?"medium":reasons.length?"medium":"low";
 return {question,intent,headline:hits.length?`${graph.headline} · evidence enriched`:graph.headline,answer:answerText(intent,graph,hits),confidence,graphAnswer:graph,evidenceHits:hits,reasons,matchedEntityIds:[...new Set(graph.matchedEntityIds)],synthesis:"deterministic",suggestions:["Who knows this system best?","Who owns this system?","What depends on this system?","Why did we choose this approach?"]};
}
