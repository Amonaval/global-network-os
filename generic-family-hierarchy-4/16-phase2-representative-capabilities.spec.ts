import {test,expect,type Page} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {login} from '../lib/login';
import {activate,authenticatedClient,seedState} from '../lib/role-client';
import {assertMutationAllowed} from '../lib/safety';

const fatal=/Unhandled Runtime Error|Application error|TypeError:|ReferenceError:/i;

async function browserAccessToken(page:Page){
  return await page.evaluate(()=>{
    const find=(value:any):string|undefined=>{
      if(!value)return undefined;
      if(typeof value==='object'){
        if(typeof value.access_token==='string')return value.access_token;
        for(const v of Object.values(value)){const t=find(v);if(t)return t;}
      }
      return undefined;
    };
    for(let i=0;i<localStorage.length;i++){
      const raw=localStorage.getItem(localStorage.key(i)!);if(!raw)continue;
      try{const token=find(JSON.parse(raw));if(token)return token}catch{}
    }
    return undefined;
  });
}

async function axe(page:Page){
  const dynamicImport=new Function('m','return import(m)');
  let mod:any;try{mod=await dynamicImport('@axe-core/playwright')}catch{throw new Error('Accessibility engine missing. Run npm run qa:setup.');}
  const AxeBuilder=mod.default;
  return new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
}

function seriousOrCritical(result:any){return result.violations.filter((x:any)=>['serious','critical'].includes(x.impact));}

test.describe.serial('Phase-2 representative capability certification',()=>{
  test('member journey: Organization directory is usable and admin controls are absent',async({page})=>{
    const s=seedState();
    await activate('member',s.networks.organization.id);
    await login(page,'member');
    await expect(page.getByTestId('qa-vertical-shell-organization')).toBeVisible();
    await expect(page.getByTestId('qa-nav-admin')).toHaveCount(0);
    await page.getByTestId('qa-nav-directory').click();
    await expect(page.locator('body')).toContainText(s.networks.organization.marker);
    await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('browser authorization: Tenant-A authenticated browser cannot export known Tenant-B network',async({page})=>{
    const s=seedState();
    await activate('owner',s.networks.family.id);
    await login(page,'owner');
    const token=await browserAccessToken(page);
    expect(token,'Authenticated browser must expose its own Supabase access token to the test harness').toBeTruthy();
    const result=await page.evaluate(async({networkId,token})=>{
      const r=await fetch(`/api/v1/networks/${networkId}/export`,{headers:{authorization:`Bearer ${token}`}});
      let body:any=null;try{body=await r.json()}catch{}
      return {status:r.status,body};
    },{networkId:s.tenantB.id,token:token!});
    expect([401,403,404]).toContain(result.status);
    expect(result.body?.ok).not.toBe(true);
    expect(JSON.stringify(result.body||{})).not.toContain(s.tenantB.name);
  });

  test('API + lifecycle: create → readback → bootstrap → update → delete/purge → cleanup proof',async({request})=>{
    test.skip(process.env.QA_MODE!=='staging'||process.env.QA_ALLOW_MUTATION!=='true','staging mutation suite');
    assertMutationAllowed();
    const a=await authenticatedClient('owner');
    const suffix=Date.now();
    const networkName=`QA Phase2 Lifecycle ${suffix}`;
    const label=`QA Phase2 Person ${suffix}`;
    const headers={authorization:`Bearer ${a.token}`,'idempotency-key':crypto.randomUUID()};
    const create=await request.post('/api/v1/networks/create',{headers,data:{kind:'organization',name:networkName,contextValue:'Phase-2 representative certification',description:'Disposable compact lifecycle'}});
    expect(create.status()).toBe(201);
    const created=await create.json();
    const networkId=created.data?.networkId||created.data?.id||created.networkId;
    expect(networkId).toBeTruthy();
    let purged=false;
    try{
      const readback=await request.get(`/api/v1/networks/${networkId}/export`,{headers:{authorization:`Bearer ${a.token}`}});
      expect(readback.status()).toBe(200);
      expect(JSON.stringify(await readback.json())).toContain(networkName);

      const active=await a.client.rpc('set_active_network',{p_network_id:networkId});
      expect(active.error).toBeNull();
      const boot=await request.post('/api/v1/institutional/bootstrap',{headers:{...headers,'idempotency-key':crypto.randomUUID()},data:{rows:[{kind:'person',label,metadata:{qaPurpose:'phase2-lifecycle',state:'created'}}]}});
      expect([200,201]).toContain(boot.status());

      const inserted=await a.client.rpc('get_network_affiliated_entities');
      expect(inserted.error).toBeNull();
      const insertedEntity=(inserted.data||[]).find((e:any)=>e.entity_label===label);
      expect(insertedEntity,'Governed directory read must expose the newly bootstrapped entity').toBeTruthy();
      expect(insertedEntity?.metadata?.state).toBe('created');

      const updatedLabel=`${label} Updated`;
      const updated=await a.client.rpc('upsert_productized_network_entity',{p_entity_id:insertedEntity!.entity_id,p_kind:'person',p_label:updatedLabel,p_metadata:{qaPurpose:'phase2-lifecycle',state:'updated'},p_affiliations:{},p_visibility:'members'});
      expect(updated.error).toBeNull();
      const verifyUpdate=await a.client.rpc('get_network_affiliated_entities');
      expect(verifyUpdate.error).toBeNull();
      const updatedEntity=(verifyUpdate.data||[]).find((e:any)=>e.entity_id===insertedEntity!.entity_id);
      expect(updatedEntity,'Governed directory read must expose the updated entity').toBeTruthy();
      expect(updatedEntity?.entity_label).toBe(updatedLabel);
      expect(updatedEntity?.metadata?.state).toBe('updated');

      // Phase-2 lifecycle deletion uses the governed DB contract directly. The HTTP /purge
      // endpoint additionally requires SUPABASE_SERVICE_ROLE_KEY in the running Next.js
      // server because it certifies Storage cleanup; that server-only configuration belongs
      // to a later production/strict purge certification, not this compact browser profile.
      const deleted=await a.client.rpc('delete_owned_network_permanently',{p_network_id:networkId,p_confirm_name:networkName});
      expect(deleted.error).toBeNull();purged=true;
      const service=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
      for(const table of ['networks','network_memberships','network_entities']){
        const q=await service.from(table).select('*',{count:'exact',head:true}).eq(table==='networks'?'id':'network_id',networkId);
        expect(q.error,table).toBeNull();expect(q.count||0,`${table} residue`).toBe(0);
      }
    }finally{
      if(!purged){try{await a.client.rpc('delete_owned_network_permanently',{p_network_id:networkId,p_confirm_name:networkName})}catch{}}
      try{await a.client.rpc('set_active_network',{p_network_id:seedState().networks.family.id})}catch{}
    }
  });

  test('accessibility baseline: Family owner admin has no serious/critical axe findings',async({page})=>{
    const s=seedState();await activate('owner',s.networks.family.id);await login(page,'owner');
    await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-admin-center')).toBeVisible();
    const result=await axe(page);expect(seriousOrCritical(result),JSON.stringify(result.violations,null,2)).toEqual([]);
  });

  test('accessibility baseline: Organization member directory has no serious/critical axe findings',async({page})=>{
    const s=seedState();await activate('member',s.networks.organization.id);await login(page,'member');
    await page.getByTestId('qa-nav-directory').click();await expect(page.locator('body')).toContainText(s.networks.organization.marker);
    const result=await axe(page);expect(seriousOrCritical(result),JSON.stringify(result.violations,null,2)).toEqual([]);
  });

  test('mobile smoke: Organization member navigation/content/action survive 390x844',async({page})=>{
    const s=seedState();await page.setViewportSize({width:390,height:844});await activate('member',s.networks.organization.id);await login(page,'member');
    await expect(page.getByTestId('qa-vertical-shell-organization')).toBeVisible();
    await page.getByTestId('qa-mobile-nav-directory').click();
    await expect(page.locator('body')).toContainText(s.networks.organization.marker);
    const search=page.locator('.product-filter input');await expect(search).toBeVisible();await search.fill(s.networks.organization.marker);
    await expect(page.locator('body')).toContainText(s.networks.organization.marker);
    const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(dims.scroll-dims.client).toBeLessThanOrEqual(12);await expect(page.locator('body')).not.toContainText(fatal);
  });
});
