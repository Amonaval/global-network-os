import {test,expect} from '@playwright/test';import {createClient} from '@supabase/supabase-js';import {assertMutationAllowed} from '../lib/safety';import {authenticatedClient} from '../lib/role-client';
const png=Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,8,215,99,248,207,192,240,31,0,5,0,1,255,137,153,61,29,0,0,0,0,73,69,78,68,174,66,96,130]);
test('controlled staging lifecycle: create → import → media → archive → restore → purge → zero residue',async({request})=>{
 test.skip(process.env.QA_MODE!=='staging'||process.env.QA_ALLOW_MUTATION!=='true','staging mutation suite');assertMutationAllowed();
 const a=await authenticatedClient('owner');const suffix=Date.now(),name=`QA Lifecycle ${suffix}`,headers={authorization:`Bearer ${a.token}`,'idempotency-key':crypto.randomUUID()};
 const create=await request.post('/api/v1/networks/create',{headers,data:{kind:'organization',name,contextValue:'Runtime certification',description:'Disposable lifecycle test'}});expect(create.status()).toBe(201);const cj=await create.json();const id=cj.data?.networkId||cj.data?.id||cj.networkId;expect(id).toBeTruthy();
 let purged=false,mediaPath='';try{
  expect((await a.client.rpc('set_active_network',{p_network_id:id})).error).toBeNull();
  const rows=Array.from({length:10},(_,i)=>({kind:'person',label:`QA Imported ${suffix}-${i}`,metadata:{qa:true,index:i,email:`qa-lifecycle-${suffix}-${i}@example.test`}}));
  const boot=await request.post('/api/v1/institutional/bootstrap',{headers:{...headers,'idempotency-key':crypto.randomUUID()},data:{rows}});expect([200,201]).toContain(boot.status());
  const entityCount=await a.client.from('network_entities').select('id',{count:'exact',head:true}).eq('network_id',id);expect(entityCount.error).toBeNull();expect(entityCount.count||0).toBeGreaterThanOrEqual(10);
  mediaPath=`${id}/community/${a.userId}/qa-purge-${suffix}.png`;const upload=await a.client.storage.from('community-media').upload(mediaPath,png,{contentType:'image/png'});expect(upload.error).toBeNull();
  expect((await a.client.rpc('archive_owned_network',{p_network_id:id,p_confirm_name:name})).error).toBeNull();expect((await a.client.rpc('restore_owned_network',{p_network_id:id})).error).toBeNull();
  const purge=await request.post(`/api/v1/networks/${id}/purge`,{headers:{authorization:`Bearer ${a.token}`},data:{confirmName:name}});expect(purge.status()).toBe(200);const pj=await purge.json();expect(pj.ok).toBeTruthy();expect(pj.data?.deletedStorageObjects||0).toBeGreaterThanOrEqual(1);purged=true;
  const service=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
  for(const table of ['networks','network_memberships','network_entities']){const q=await service.from(table).select('*',{count:'exact',head:true}).eq(table==='networks'?'id':'network_id',id);expect(q.error,table).toBeNull();expect(q.count||0,`${table} residue`).toBe(0)}
  const residue=await service.storage.from('community-media').list(id,{limit:100});expect(residue.error).toBeNull();expect(residue.data||[]).toEqual([]);
 }finally{if(!purged){try{await a.client.storage.from('community-media').remove(mediaPath?[mediaPath]:[])}catch{}try{await a.client.rpc('restore_owned_network',{p_network_id:id})}catch{}try{await request.post(`/api/v1/networks/${id}/purge`,{headers:{authorization:`Bearer ${a.token}`},data:{confirmName:name}})}catch{}}}
});
