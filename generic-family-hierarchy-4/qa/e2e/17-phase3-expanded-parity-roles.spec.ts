import {test,expect,type Page} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {login} from '../lib/login';
import {authenticatedClient,seedState} from '../lib/role-client';
import {VERTICALS,EXPECTED_NAV_BY_KIND} from '../runtime/catalog.mjs';
import {assertMutationAllowed} from '../lib/safety';

const fatal=/Unhandled Runtime Error|Application error|TypeError:|ReferenceError:|column reference .* ambiguous/i;

async function setActive(client:any,networkId:string){
  const {error}=await client.rpc('set_active_network',{p_network_id:networkId});
  expect(error,`set_active_network ${networkId}`).toBeNull();
}

async function reloadInto(page:Page,kind:string,name:string){
  await page.reload({waitUntil:'commit'});
  await expect(page.getByTestId(`qa-vertical-shell-${kind}`),`${kind} shell`).toBeVisible({timeout:20_000});
  await expect(page.locator('body')).toContainText(name);
  await expect(page.locator('body')).not.toContainText(fatal);
}

async function governedDirectoryHas(client:any,label:string){
  const {data,error}=await client.rpc('get_network_affiliated_entities');
  expect(error).toBeNull();
  expect((data||[]).some((x:any)=>x.entity_label===label),`directory marker ${label}`).toBeTruthy();
}

test.describe.serial('Phase-3 expanded platform parity and role certification',()=>{
  test('owner: one browser session traverses every released vertical and must-exist surfaces',async({page})=>{
    const s=seedState();
    const owner=await authenticatedClient('owner');
    await setActive(owner.client,s.networks.family.id);
    await login(page,'owner');

    for(const v of VERTICALS){
      await setActive(owner.client,s.networks[v.kind].id);
      await reloadInto(page,v.kind,s.networks[v.kind].name);
      await expect(page.getByTestId('qa-nav-admin')).toBeVisible();
      for(const id of EXPECTED_NAV_BY_KIND[v.kind]){
        const nav=page.getByTestId(`qa-nav-${id}`).first();
        await expect(nav,`${v.kind}/${id}`).toBeVisible();
      }
    }
  });

  test('admin: one browser session traverses every released vertical with governed admin access',async({page})=>{
    const s=seedState();
    const admin=await authenticatedClient('admin');
    await setActive(admin.client,s.networks.family.id);
    await login(page,'admin');

    for(const v of VERTICALS){
      await setActive(admin.client,s.networks[v.kind].id);
      await reloadInto(page,v.kind,s.networks[v.kind].name);
      const adminNav=page.getByTestId('qa-nav-admin');
      await expect(adminNav,`${v.kind} admin nav`).toBeVisible();
    }
  });

  test('member: one browser session traverses every released vertical without admin leakage',async({page})=>{
    const s=seedState();
    const member=await authenticatedClient('member');
    await setActive(member.client,s.networks.family.id);
    await login(page,'member');

    for(const v of VERTICALS){
      await setActive(member.client,s.networks[v.kind].id);
      await reloadInto(page,v.kind,s.networks[v.kind].name);
      await expect(page.getByTestId('qa-nav-admin'),`${v.kind} member admin nav`).toHaveCount(0);
      if(v.kind!=='family')await governedDirectoryHas(member.client,s.networks[v.kind].marker);
    }
  });

  test('selected distinct vertical depth: Housing Society and Family Association remain usable for owner',async({page})=>{
    const s=seedState();
    const owner=await authenticatedClient('owner');
    await setActive(owner.client,s.networks['housing-society'].id);
    await login(page,'owner');

    for(const kind of ['housing-society','family-association'] as const){
      await setActive(owner.client,s.networks[kind].id);
      await reloadInto(page,kind,s.networks[kind].name);
      const directory=page.getByTestId('qa-nav-directory').first();
      await expect(directory).toBeVisible();await directory.click();
      await expect(page.locator('body')).toContainText(s.networks[kind].marker);
      await expect(page.locator('body')).not.toContainText(fatal);
      const guide=page.getByTestId('qa-nav-guide').first();await expect(guide).toBeVisible();
    }
  });

  test('invitation lifecycle: owner create/resend → invitee accept → member access → cleanup',async({request,page})=>{
    test.skip(process.env.QA_MODE!=='staging'||process.env.QA_ALLOW_MUTATION!=='true','staging mutation suite');
    assertMutationAllowed();
    const s=seedState(),family=s.networks.family;
    const owner=await authenticatedClient('owner');
    const invitee=await authenticatedClient('invitee');
    const service=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
    const email=s.users.invitee.email;

    await service.from('network_memberships').delete().eq('network_id',family.id).eq('user_id',s.users.invitee.id);
    await service.from('network_participation_invitations').delete().eq('network_id',family.id).eq('email',email);
    await service.from('profiles').update({active_network_id:null}).eq('id',s.users.invitee.id);

    try{
      // Use governed RPCs here rather than the HTTP invitation route so this certification
      // does not trigger Supabase Auth email delivery/rate-limit consumption on Free Tier.
      const create=await owner.client.rpc('create_network_participation_invitation',{p_network_id:family.id,p_email:email,p_target_ref:null,p_target_kind:null,p_invited_role:'member',p_expires_days:14});
      expect(create.error).toBeNull();expect(create.data?.id).toBeTruthy();expect(create.data?.token).toBeTruthy();
      const invitationId=create.data!.id,oldToken=create.data!.token;

      const resend=await owner.client.rpc('resend_network_participation_invitation',{p_network_id:family.id,p_invitation_id:invitationId});
      expect(resend.error).toBeNull();expect(resend.data?.token).toBeTruthy();expect(resend.data!.token).not.toBe(oldToken);
      const resentToken=resend.data!.token;

      const oldTry=await invitee.client.rpc('accept_network_participation_invitation',{p_token:oldToken});
      expect(oldTry.error,'superseded invitation token must fail').toBeTruthy();
      const accept=await invitee.client.rpc('accept_network_participation_invitation',{p_token:resentToken});
      expect(accept.error).toBeNull();expect(String(accept.data)).toBe(family.id);

      const replay=await invitee.client.rpc('accept_network_participation_invitation',{p_token:resentToken});
      expect(replay.error,'accepted token cannot be replayed').toBeTruthy();

      await setActive(invitee.client,family.id);
      await login(page,'invitee');
      await expect(page.getByTestId('qa-vertical-shell-family')).toBeVisible();
      await expect(page.getByTestId('qa-nav-admin')).toHaveCount(0);
    }finally{
      await service.from('network_memberships').delete().eq('network_id',family.id).eq('user_id',s.users.invitee.id);
      await service.from('network_participation_invitations').delete().eq('network_id',family.id).eq('email',email);
      await service.from('profiles').update({active_network_id:null}).eq('id',s.users.invitee.id);
    }
  });

  test('cross-tenant mutation denial: Tenant-A owner cannot create invitation in Tenant-B network',async({request})=>{
    const s=seedState();const owner=await authenticatedClient('owner');
    const r=await request.post(`/api/v1/networks/${s.tenantB.id}/invitations`,{headers:{authorization:`Bearer ${owner.token}`},data:{action:'create',email:s.users.invitee.email}});
    expect([401,403,404]).toContain(r.status());
    let body:any=null;try{body=await r.json()}catch{}
    expect(body?.ok).not.toBe(true);
    expect(JSON.stringify(body||{})).not.toContain(s.tenantB.name);
  });
});
