/** G9.1-B.1 targeted organization extractor. Existing Knowledge Hub flows are unchanged. */
const { askLlm } = require('../rag/llm');
const VERSION='g9.1-b.1-1';
const COMMON=`Output JSON only as {"assertions":[...]}. Each assertion: {"kind":"...","subject":{"label":"..."},"predicate":"...","object":{"label":"...","value":"..."},"confidence":0..1,"quote":"short supporting fragment"}. Never infer unstated facts. Names and systems must appear explicitly in the evidence. Return empty assertions when evidence is insufficient.`;
const STRUCTURAL=`Extract ONLY explicit organizational ownership and technical dependency facts. ownership/owns means explicit current responsibility, technical ownership, accountability, or a team explicitly owning day-to-day delivery. dependency/depends_on means an explicit runtime, data, service, platform or workflow dependency. Do not convert "being prepared for future ownership" into current ownership. ${COMMON}`;
const KNOWLEDGE=`Extract ONLY explicit expertise and architectural decision facts. expertise/skill requires explicit expertise, deepest knowledge, strongest hands-on knowledge, designated specialist/reviewer, or clearly demonstrated technical knowledge. decision/architectural_decision requires a recorded choice together with its reason/rationale/trade-off. ${COMMON}`;
function parse(raw){try{return JSON.parse(String(raw).replace(/```json|```/g,'').trim())}catch(_){const s=String(raw),a=s.indexOf('{'),b=s.lastIndexOf('}');if(a>=0&&b>a){try{return JSON.parse(s.slice(a,b+1))}catch(_){}}return {assertions:[]}}}
function sanitize(a,evidenceId){const allowed={expertise:'skill',ownership:'owns',dependency:'depends_on',decision:'architectural_decision'};if(!a||allowed[a.kind]!==a.predicate)return {skip:'unsupported-kind-or-predicate'};const confidence=Math.max(0,Math.min(1,Number(a.confidence)||0));if(confidence<0.5)return {skip:'below-confidence-threshold'};const subject=String(a.subject?.label||'').trim(),object=String(a.object?.label||a.object?.value||'').trim();if(!subject||!object)return {skip:'missing-endpoint'};return {row:{kind:a.kind,subject:a.subject||{},predicate:a.predicate,object:a.object||{},confidence,evidenceIds:[evidenceId],extractionMethod:'organization-targeted-llm',extractorVersion:VERSION,metadata:{supportingQuote:String(a.quote||'').slice(0,300)}}}}
function key(a){return [a.kind,String(a.subject?.label||'').trim().toLowerCase(),a.predicate,String(a.object?.label||a.object?.value||'').trim().toLowerCase(),a.evidenceIds?.[0]].join('|')}
async function runPass(system,text,maxTokens){const raw=await askLlm(system,text,{maxTokens});return parse(raw).assertions||[]}
async function extractOrganizationAssertions(evidence,{maxChars=6500,maxTokens=1500}={}){
 const out=[],skipped=[];let rawCandidates=0;
 for(const item of evidence||[]){
  if(!item?.id||!item?.text){skipped.push({evidenceId:item?.id||null,reason:'missing-evidence'});continue}
  const text=String(item.text).slice(0,maxChars);
  const batches=[await runPass(STRUCTURAL,text,maxTokens),await runPass(KNOWLEDGE,text,maxTokens)];
  for(const assertions of batches)for(const a of assertions){rawCandidates++;const s=sanitize(a,item.id);if(s.row)out.push(s.row);else skipped.push({evidenceId:item.id,reason:s.skip,kind:a?.kind||null,subject:a?.subject?.label||null,object:a?.object?.label||a?.object?.value||null})}
 }
 const deduped=[];const seen=new Set();for(const row of out){const k=key(row);if(seen.has(k))continue;seen.add(k);deduped.push(row)}
 return {assertions:deduped,diagnostics:{rawCandidates,accepted:deduped.length,filtered:skipped.length,skipped}};
}
module.exports={extractOrganizationAssertions,VERSION};
