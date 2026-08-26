/** G9.1-B.1 extraction orchestration with visible coverage diagnostics. Persistence remains explicit. */
const {extractOrganizationAssertions}=require('./organization-extractor');
async function bootstrapOrganizationKnowledge(evidence,options={}){
 const result=await extractOrganizationAssertions(evidence,options),assertions=result.assertions;
 return {assertions,summary:{evidenceScanned:(evidence||[]).length,rawCandidates:result.diagnostics.rawCandidates,candidates:assertions.length,filtered:result.diagnostics.filtered,kinds:assertions.reduce((a,x)=>(a[x.kind]=(a[x.kind]||0)+1,a),{}),skipped:result.diagnostics.skipped}};
}
module.exports={bootstrapOrganizationKnowledge};
