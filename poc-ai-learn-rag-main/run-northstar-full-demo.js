require('dotenv').config();
const fs=require('fs'),path=require('path'),crypto=require('crypto'),fetch=require('node-fetch');
const {NetworkCorpusIngestor}=require('./src/bridge/network-corpus-ingest');
const {bootstrapOrganizationKnowledge}=require('./src/bridge/organization-bootstrap');
console.log('process', process, process.env)
const need=k=>{if(!process.env[k])throw new Error(`Missing ${k}`);return process.env[k]};
const URL=need('SUPABASE_URL').replace(/\/$/,''),KEY=need('SUPABASE_ANON_KEY'),EMAIL=need('DEMO_ADMIN_EMAIL'),PASSWORD=need('DEMO_ADMIN_PASSWORD'),NETWORK_ID=need('NETWORK_ID');
const CORPUS_ID=process.env.CORPUS_ID||'northstar-org-demo';
const KIT=path.resolve(process.env.DEMO_KIT_DIR||'../G9.1-Northstar-Org');
const CONFLICT=String(process.env.INCLUDE_CONFLICT||'false').toLowerCase()==='true';
async function jf(url,opt={}){const r=await fetch(url,opt),t=await r.text();let b;try{b=t?JSON.parse(t):null}catch{b=t}if(!r.ok)throw new Error(`${r.status}: ${typeof b==='string'?b:JSON.stringify(b)}`);return b}
async function login(){return jf(`${URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:EMAIL,password:PASSWORD})})}
const hdr=t=>({apikey:KEY,Authorization:`Bearer ${t}`,'Content-Type':'application/json'});
async function rpc(t,n,p={}){return jf(`${URL}/rest/v1/rpc/${n}`,{method:'POST',headers:hdr(t),body:JSON.stringify(p)})}
async function sel(t,table,q){return jf(`${URL}/rest/v1/${table}?${q}`,{headers:hdr(t)})}
const norm=s=>String(s||'').trim().toLowerCase(),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function load(){let dirs=[path.join(KIT,'02-knowledge-sources','phase-1')];if(CONFLICT)dirs.push(path.join(KIT,'02-knowledge-sources','phase-2-conflict'));return dirs.flatMap(d=>fs.readdirSync(d).filter(f=>f.endsWith('.md')).sort().map(file=>{let text=fs.readFileSync(path.join(d,file),'utf8');return {file,text,title:(text.match(/^#\s+(.+)$/m)||[])[1]||file,updated:(text.match(/(?:Updated|Reviewed|Decision date|Incident date|Draft date):\s*(\d{4}-\d{2}-\d{2})/i)||[])[1]||'2026-08-01'}}))}
function resolve(a,map){a=JSON.parse(JSON.stringify(a));let sl=a.subject?.label,ol=a.object?.label||a.object?.value,s=map.get(norm(sl)),o=map.get(norm(ol));if(a.predicate==='skill'){if(!s)return {skip:`Unresolved skill subject: ${sl}`};a.subject.entityId=s;a.object.value=a.object.value||a.object.label;return {value:a}}if(a.predicate==='owns'||a.predicate==='depends_on'){if(!s||!o)return {skip:`Unresolved ${a.predicate}: ${sl} -> ${ol} (subject=${!!s}, object=${!!o})`};a.subject.entityId=s;a.object.entityId=o;return {value:a}}if(a.predicate==='architectural_decision')return {value:a};return {skip:`Unsupported predicate: ${a.predicate}`}}
(async()=>{
 console.log('1/7 login');let au=await login(),t=au.access_token;
 console.log('2/7 load live entities');let er=await rpc(t,'get_network_affiliated_entities',{}),map=new Map(er.map(x=>[norm(x.entity_label),String(x.entity_id)]));console.log('entities',map.size);
 let docs=load(),ctx={networkId:NETWORK_ID,corpusId:CORPUS_ID,userId:au.user.id,authorizationRefs:['org-wide-demo'],allowedSections:['organization-demo']};
 console.log('3/7 local corpus ingest');let ing=new NetworkCorpusIngestor();console.log(await ing.ingest(ctx,docs.map((d,i)=>({text:d.text,section:'organization-demo',title:d.title,chunkIndex:i,meta:{sourceId:d.file,pageId:d.file,url:`demo://${d.file}`,updatedAt:d.updated}}))));
 console.log('4/7 persist evidence');let ev=[];
 for(const d of docs){let chunkId=`${d.file}:0`,saved=await rpc(t,'submit_organization_knowledge_evidence',{p_source:{type:'upload',externalId:d.file,title:d.title,uri:`demo://${d.file}`,visibility:'network',authorizationRefs:['org-wide-demo'],sourceUpdatedAt:`${d.updated}T00:00:00Z`,contentHash:hash(d.text),metadata:{demo:'northstar'}},p_records:[{documentExternalId:d.file,chunkId,title:d.title,uri:`demo://${d.file}`,section:'organization-demo',breadcrumb:[d.title],contentHash:hash(d.text),excerpt:d.text,sourceUpdatedAt:`${d.updated}T00:00:00Z`,visibility:'network',authorizationRefs:['org-wide-demo'],extractionVersion:'northstar-demo-v1',metadata:{demo:'northstar'}}]});let rec=await sel(t,'network_evidence_records',`source_id=eq.${saved.sourceId}&chunk_id=eq.${encodeURIComponent(chunkId)}&select=id&order=captured_at.desc&limit=1`);if(rec[0])ev.push({id:String(rec[0].id),text:d.text})}
 console.log('5/7 targeted extraction');let ex=await bootstrapOrganizationKnowledge(ev);console.log(ex.summary);
 console.log('6/7 resolve labels');let resolved=[],resolutionSkips=[];for(const a of ex.assertions){const r=resolve(a,map);if(r.value)resolved.push(r.value);else resolutionSkips.push(r.skip)}console.log('resolved',resolved.length,'of',ex.assertions.length);if(resolutionSkips.length){console.log('resolution skips:');resolutionSkips.forEach(x=>console.log('  -',x))}
 console.log('7/7 submit candidates');let n=resolved.length?await rpc(t,'submit_organization_candidate_assertions',{p_assertions:resolved}):0;console.log('submitted',n);
 console.log('DONE -> review Knowledge Discovery Inbox, then ask G9.1-C questions.');
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
