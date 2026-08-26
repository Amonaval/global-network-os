/** Additive Network OS bridge context. Existing Knowledge Hub callers are unchanged. */
function createNetworkContext(input = {}) {
  const networkId=String(input.networkId||'').trim(), corpusId=String(input.corpusId||'').trim(), userId=String(input.userId||'').trim();
  const authorizationRefs=Array.isArray(input.authorizationRefs)?[...new Set(input.authorizationRefs.map(String).filter(Boolean))]:[];
  const allowedSections=Array.isArray(input.allowedSections)?[...new Set(input.allowedSections.map(String).filter(Boolean))]:[];
  if(!networkId) throw new Error('networkId is required'); if(!corpusId) throw new Error('corpusId is required'); if(!userId) throw new Error('authenticated userId is required');
  return Object.freeze({networkId,corpusId,userId,authorizationRefs,allowedSections});
}
function assertAuthorizedContext(context){
  if(!context||!context.networkId||!context.corpusId||!context.userId) throw new Error('invalid network knowledge context');
  if(!context.authorizationRefs.length){const err=new Error('no authorized knowledge scope');err.code='NO_AUTHORIZED_SCOPE';throw err;} return context;
}
module.exports={createNetworkContext,assertAuthorizedContext};
