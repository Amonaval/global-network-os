import {test,expect,type Page} from '@playwright/test';
import {login} from '../lib/login';
import {activate,authenticatedClient,seedState} from '../lib/role-client';
import {assertMutationAllowed} from '../lib/safety';

const fatal=/application error|unhandled runtime error|internal server error|typeerror:|referenceerror:/i;

async function setActive(client:any,networkId:string){
  const {error}=await client.rpc('set_active_network',{p_network_id:networkId});
  expect(error,`set_active_network ${networkId}`).toBeNull();
}

function expectDbCode(error:any,codes:string[],label:string){
  expect(error,`${label}: expected governed rejection`).toBeTruthy();
  expect(codes,`${label}: ${error?.message||'missing error message'}`).toContain(String(error?.code||''));
}

async function assertNetworkStillActive(client:any,networkId:string){
  const {data,error}=await client.rpc('get_my_networks');expect(error).toBeNull();
  expect((data||[]).some((x:any)=>String(x.network_id)===networkId),`network ${networkId} must remain active`).toBeTruthy();
}

test.describe.serial('Phase-4C governance, permissions and destructive-action safety certification',()=>{
  test('Family destructive controls require owner + exact name and confirmation cancellation performs zero mutation',async({page})=>{
    const s=seedState(),family=s.networks.family;const owner=await authenticatedClient('owner');await setActive(owner.client,family.id);await login(page,'owner');
    await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-admin-center')).toBeVisible();await page.getByTestId('qa-admin-tab-danger').click();
    const input=page.getByTestId('qa-admin-danger-confirm'),archive=page.getByTestId('qa-admin-archive'),del=page.getByTestId('qa-admin-delete');
    await expect(archive).toBeDisabled();await expect(del).toBeDisabled();await input.fill(`${family.name} wrong`);await expect(archive).toBeDisabled();await expect(del).toBeDisabled();await input.fill(family.name);await expect(archive).toBeEnabled();await expect(del).toBeEnabled();
    let archiveCalls=0,purgeCalls=0;page.on('request',r=>{if(r.url().includes('/rest/v1/rpc/archive_owned_network'))archiveCalls++;if(r.url().includes(`/api/v1/networks/${family.id}/purge`))purgeCalls++});
    page.once('dialog',d=>d.dismiss());await archive.click();page.once('dialog',d=>d.dismiss());await del.click();await page.waitForTimeout(200);
    expect(archiveCalls,'cancelled Family archive must not reach RPC').toBe(0);expect(purgeCalls,'cancelled Family delete must not reach purge API').toBe(0);await assertNetworkStillActive(owner.client,family.id);await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Family admin can enter danger zone but can never enable owner-only archive/delete controls',async({page})=>{
    const s=seedState(),family=s.networks.family;await activate('admin',family.id);await login(page,'admin');await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-admin-center')).toBeVisible();await page.getByTestId('qa-admin-tab-danger').click();
    await page.getByTestId('qa-admin-danger-confirm').fill(family.name);await expect(page.getByTestId('qa-admin-archive')).toBeDisabled();await expect(page.getByTestId('qa-admin-delete')).toBeDisabled();await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Organization owner sees role-management plus exact-name guarded destructive controls',async({page})=>{
    const s=seedState(),org=s.networks.organization;await activate('owner',org.id);await login(page,'owner');await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-product-lifecycle')).toBeVisible();
    const confirm=page.getByTestId('qa-product-lifecycle-confirm');await confirm.fill(`${org.name} wrong`);await expect(page.getByTestId('qa-product-archive')).toBeDisabled();await expect(page.getByTestId('qa-product-delete')).toBeDisabled();await confirm.fill(org.name);await expect(page.getByTestId('qa-product-archive')).toBeEnabled();await expect(page.getByTestId('qa-product-delete')).toBeEnabled();await expect(page.getByTestId(`qa-product-member-role-${s.users.admin.id}`)).toBeVisible();await expect(page.getByTestId(`qa-product-member-role-${s.users.member.id}`)).toBeVisible();await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Organization admin gets scoped governance but no owner-only role/archive/delete controls',async({page})=>{
    const s=seedState(),org=s.networks.organization;await activate('admin',org.id);await login(page,'admin');await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-product-lifecycle')).toBeVisible();await expect(page.getByTestId('qa-product-leave')).toBeVisible();await expect(page.getByTestId('qa-product-archive')).toHaveCount(0);await expect(page.getByTestId('qa-product-delete')).toHaveCount(0);await expect(page.getByTestId(`qa-product-member-role-${s.users.member.id}`)).toHaveCount(0);await expect(page.getByTestId(`qa-product-member-remove-${s.users.member.id}`)).toBeVisible();await expect(page.getByTestId(`qa-product-member-remove-${s.users.owner.id}`)).toHaveCount(0);await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Organization member receives no admin governance surface',async({page})=>{
    const s=seedState(),org=s.networks.organization;await activate('member',org.id);await login(page,'member');await expect(page.getByTestId('qa-nav-admin')).toHaveCount(0);await expect(page.getByTestId('qa-product-lifecycle')).toHaveCount(0);await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('governed RPC boundaries reject unauthorized role, invitation and destructive requests without changing network state',async()=>{
    const s=seedState(),org=s.networks.organization;const owner=await authenticatedClient('owner'),admin=await authenticatedClient('admin'),member=await authenticatedClient('member');await setActive(owner.client,org.id);await setActive(admin.client,org.id);await setActive(member.client,org.id);
    expectDbCode((await member.client.rpc('set_productized_network_member_role',{p_user_id:s.users.admin.id,p_role:'member'})).error,['42501'],'member role change');
    expectDbCode((await admin.client.rpc('set_productized_network_member_role',{p_user_id:s.users.member.id,p_role:'admin'})).error,['42501'],'admin role change');
    expectDbCode((await owner.client.rpc('set_productized_network_member_role',{p_user_id:s.users.owner.id,p_role:'member'})).error,['42501'],'owner self-demotion');
    expectDbCode((await owner.client.rpc('set_productized_network_member_role',{p_user_id:s.users.member.id,p_role:'viewer'})).error,['22023'],'invalid role');
    const unique=`phase4c-${Date.now()}@example.test`;
    expectDbCode((await member.client.rpc('create_network_participation_invitation',{p_network_id:org.id,p_email:unique,p_target_ref:null,p_target_kind:null,p_invited_role:'member',p_expires_days:14})).error,['42501'],'member invitation');
    expectDbCode((await admin.client.rpc('create_network_participation_invitation',{p_network_id:org.id,p_email:unique,p_target_ref:null,p_target_kind:null,p_invited_role:'admin',p_expires_days:14})).error,['42501'],'admin inviting admin');
    expectDbCode((await owner.client.rpc('archive_owned_network',{p_network_id:org.id,p_confirm_name:`${org.name} wrong`})).error,['22023'],'archive wrong name');
    expectDbCode((await owner.client.rpc('delete_owned_network_permanently',{p_network_id:org.id,p_confirm_name:`${org.name} wrong`})).error,['22023'],'delete wrong name');
    expectDbCode((await admin.client.rpc('archive_owned_network',{p_network_id:org.id,p_confirm_name:org.name})).error,['42501'],'admin archive');
    expectDbCode((await admin.client.rpc('delete_owned_network_permanently',{p_network_id:org.id,p_confirm_name:org.name})).error,['42501'],'admin permanent delete');
    await assertNetworkStillActive(owner.client,org.id);
  });

  test('stale admin session loses backend authority immediately and UI authority after reload; owner restoration is deterministic',async({page})=>{
    test.skip(process.env.QA_MODE!=='staging'||process.env.QA_ALLOW_MUTATION!=='true','staging mutation safety gate');assertMutationAllowed();
    const s=seedState(),org=s.networks.organization;const owner=await authenticatedClient('owner'),admin=await authenticatedClient('admin');await setActive(owner.client,org.id);await setActive(admin.client,org.id);
    const restore=async()=>{const r=await owner.client.rpc('set_productized_network_member_role',{p_user_id:s.users.admin.id,p_role:'admin'});expect(r.error,'restore seeded Organization admin role').toBeNull()};
    await restore();await login(page,'admin');await expect(page.getByTestId('qa-nav-admin')).toBeVisible();
    try{
      const demote=await owner.client.rpc('set_productized_network_member_role',{p_user_id:s.users.admin.id,p_role:'member'});expect(demote.error).toBeNull();
      expectDbCode((await admin.client.rpc('remove_productized_network_member',{p_user_id:s.users.member.id})).error,['42501'],'stale admin backend mutation');
      await page.reload({waitUntil:'commit'});await expect(page.getByTestId('qa-vertical-shell-organization')).toBeVisible({timeout:20_000});await expect(page.getByTestId('qa-nav-admin')).toHaveCount(0);
      await restore();await page.reload({waitUntil:'commit'});await expect(page.getByTestId('qa-vertical-shell-organization')).toBeVisible({timeout:20_000});await expect(page.getByTestId('qa-nav-admin')).toBeVisible();
    }finally{await restore()}
  });

  test('member-removal action disables while pending and emits only one governed mutation request',async({page})=>{
    const s=seedState(),org=s.networks.organization;const owner=await authenticatedClient('owner');await setActive(owner.client,org.id);await login(page,'owner');await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-product-lifecycle')).toBeVisible();
    const row=page.getByTestId(`qa-product-member-${s.users.member.id}`),remove=page.getByTestId(`qa-product-member-remove-${s.users.member.id}`);await expect(row).toBeVisible();await expect(remove).toBeVisible();
    let calls=0;const pattern='**/rest/v1/rpc/remove_productized_network_member';await page.route(pattern,async route=>{calls++;await new Promise(r=>setTimeout(r,500));await route.fulfill({status:200,contentType:'application/json',body:'null'})});
    page.once('dialog',d=>d.accept());await remove.click();await expect.poll(()=>calls,{timeout:2_000}).toBe(1);await expect(remove).toBeDisabled();await page.waitForTimeout(650);expect(calls).toBe(1);await page.unroute(pattern);await expect(row).toBeVisible();await expect(remove).toBeEnabled();
    const members=await owner.client.rpc('get_productized_network_memberships');expect(members.error).toBeNull();expect((members.data||[]).some((x:any)=>String(x.user_id)===s.users.member.id&&x.status==='active'),'synthetic removal must leave seeded member untouched').toBeTruthy();
  });
});
