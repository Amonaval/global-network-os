/** G9.1-A additive adapter: separate corpus retrieval; no graph mutation or existing API changes. */
const path=require('path'); const {JSONVectorStore}=require('../vectorstore/store'); const {getEmbedder}=require('../ingestion/embedder');
const {createNetworkContext,assertAuthorizedContext}=require('./network-context');
const safePart=v=>String(v).replace(/[^a-z0-9_-]/gi,'_');
class NetworkKnowledgeAdapter{
 constructor(options={}){this.baseDataDir=options.baseDataDir||process.env.NETWORK_CORPUS_DIR||path.resolve(process.cwd(),'./data/network-corpora');this.embedder=options.embedder||getEmbedder();}
 corpusDir(c){return path.join(this.baseDataDir,safePart(c.networkId),safePart(c.corpusId));}
 async retrieve(question,rawContext,options={}){
  const c=assertAuthorizedContext(createNetworkContext(rawContext));
  if(!c.allowedSections.length)return {hits:[],blocked:true,reason:'no-authorized-scope',context:publicContext(c)};
  const store=new JSONVectorStore(path.join(this.corpusDir(c),'vectors.json')); const queryVec=await this.embedder.embedOne(question); store.setQuery(question);
  const rows=store.search(queryVec,options.topK||6,{sections:c.allowedSections});
  const hits=rows.map((row,index)=>({rank:index+1,score:row.score,semanticScore:row.semScore,text:row.text,evidence:{networkId:c.networkId,corpusId:c.corpusId,chunkId:row.meta?.chunkId||row.meta?.id||`${safePart(row.meta?.section||'default')}:${index}`,sourceExternalId:row.meta?.pageId||row.meta?.sourceId||null,title:row.meta?.title||null,uri:row.meta?.url||null,section:row.meta?.section||null,breadcrumb:row.meta?.breadcrumb||row.meta?.nearHeading||null,sourceUpdatedAt:row.meta?.updatedAt||null,authorizationRefs:c.authorizationRefs}}));
  return {hits,blocked:hits.length===0,reason:hits.length?null:'no-evidence',context:publicContext(c)};
 }
}
function publicContext(c){return {networkId:c.networkId,corpusId:c.corpusId,userId:c.userId,allowedSections:c.allowedSections,authorizationRefCount:c.authorizationRefs.length};}
module.exports={NetworkKnowledgeAdapter};
