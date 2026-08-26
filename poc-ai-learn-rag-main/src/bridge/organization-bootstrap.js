/** Orchestrates evidence extraction only. Persistence into Network OS remains an explicit adapter/client responsibility. */
const {extractOrganizationAssertions}=require('./organization-extractor');
async function bootstrapOrganizationKnowledge(evidence,options={}){const assertions=await extractOrganizationAssertions(evidence,options);return {assertions,summary:{evidenceScanned:(evidence||[]).length,candidates:assertions.length,kinds:assertions.reduce((a,x)=>(a[x.kind]=(a[x.kind]||0)+1,a),{})}}}
module.exports={bootstrapOrganizationKnowledge};
