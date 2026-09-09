import {test,expect,type Page} from '@playwright/test';
import {login} from '../lib/login';
import {activate,authenticatedClient,seedState} from '../lib/role-client';

const fatal=/application error|unhandled runtime error|internal server error|typeerror:|referenceerror:/i;
async function healthy(page:Page,kind:string){await expect(page.getByTestId(`qa-vertical-shell-${kind}`)).toBeVisible({timeout:20_000});await expect(page.locator('body')).not.toContainText(fatal)}
async function setNetwork(client:any,id:string){const {error}=await client.rpc('set_active_network',{p_network_id:id});expect(error).toBeNull()}

async function ownerOpen(page:Page,kind:string){const s=seedState();await activate('owner',s.networks[kind].id);await login(page,'owner');await healthy(page,kind);return s}

test.describe.serial('Phase-4D vertical-specific workflow and business-rule certification',()=>{
  test('Family remains kinship/tree-first rather than inheriting productized explorer semantics',async({page})=>{
    const s=await ownerOpen(page,'family');await expect(page.getByTestId('qa-nav-tree')).toBeVisible();await expect(page.getByTestId('qa-nav-explorer')).toHaveCount(0);await page.getByTestId('qa-nav-tree').click();await expect(page.locator('body')).toContainText(s.networks.family.name);await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Housing Society is unit/resident-centric and exposes official property operations only through its society admin surface',async({page})=>{
    await ownerOpen(page,'housing-society');await page.getByTestId('qa-nav-directory').click();await expect(page.getByTestId('qa-hs-directory-controls')).toBeVisible();await expect(page.getByTestId('qa-fca-directory-controls')).toHaveCount(0);await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-hs-core-admin')).toBeVisible({timeout:20_000});await expect(page.getByTestId('qa-fca-admin-panel')).toHaveCount(0);await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Family Association keeps Family/Representative/Member directory modes and annual community administration distinct',async({page})=>{
    await ownerOpen(page,'family-association');await page.getByTestId('qa-nav-directory').click();await expect(page.getByTestId('qa-fca-directory-controls')).toBeVisible();for(const mode of ['all','families','representatives','members'])await expect(page.getByTestId(`qa-fca-directory-mode-${mode}`)).toBeVisible();await expect(page.getByTestId('qa-hs-directory-controls')).toHaveCount(0);await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-fca-admin-panel')).toBeVisible({timeout:20_000});await expect(page.getByTestId('qa-hs-core-admin')).toHaveCount(0);await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('generic Association remains household-centric and does not inherit Family Association operating controls',async({page})=>{
    const s=await ownerOpen(page,'association');await page.getByTestId('qa-nav-directory').click();await expect(page.getByTestId('qa-fca-directory-controls')).toHaveCount(0);await expect(page.getByTestId('qa-hs-directory-controls')).toHaveCount(0);await expect(page.locator('.entity-kind-pill').filter({hasText:'household'}).first()).toBeVisible({timeout:20_000});await expect(page.locator('body')).toContainText(s.networks.association.marker);await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-fca-admin-panel')).toHaveCount(0);await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Alumni retains cohort/program directory semantics and no Family tree navigation',async({page})=>{
    await ownerOpen(page,'alumni');await expect(page.getByTestId('qa-nav-tree')).toHaveCount(0);await page.getByTestId('qa-nav-directory').click();await expect(page.getByTestId('qa-alumni-directory')).toBeVisible({timeout:20_000});await expect(page.getByTestId('qa-alumni-batch-filter')).toBeVisible();await expect(page.getByTestId('qa-alumni-program-filter')).toBeVisible();await expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Organization, Business Trust, Franchise and Professional expose different governed relationship vocabularies',async({page})=>{
    const s=seedState(),owner=await authenticatedClient('owner');
    const cases:[string,string[]][]=[
      ['organization',['Reports to','Works with','Owns','Depends on']],
      ['business-trust',['Recommends','Verified by','Supplies to','Worked with']],
      ['franchise',['Owns','Operates','Manages','Supports']],
      ['professional',['Worked with','Referred by','Collaborates with','Mentors']]
    ];
    await setNetwork(owner.client,s.networks.organization.id);await login(page,'owner');
    for(const [kind,expected] of cases){await setNetwork(owner.client,s.networks[kind].id);await page.reload({waitUntil:'commit'});await healthy(page,kind);await page.getByTestId('qa-nav-connections').click();await expect(page.getByTestId('qa-relationship-explorer')).toBeVisible();const select=page.getByTestId('qa-relationship-type-select');await expect(select).toBeVisible();const labels=await select.locator('option').allTextContents();expect(labels,`${kind} relationship vocabulary`).toEqual(expected)}
  });

  test('member role never receives Housing Society or Family Association vertical admin operating panels',async({page})=>{
    const s=seedState(),member=await authenticatedClient('member');await setNetwork(member.client,s.networks['housing-society'].id);await login(page,'member');await healthy(page,'housing-society');await expect(page.getByTestId('qa-nav-admin')).toHaveCount(0);await expect(page.getByTestId('qa-hs-core-admin')).toHaveCount(0);await setNetwork(member.client,s.networks['family-association'].id);await page.reload({waitUntil:'commit'});await healthy(page,'family-association');await expect(page.getByTestId('qa-nav-admin')).toHaveCount(0);await expect(page.getByTestId('qa-fca-admin-panel')).toHaveCount(0);
  });
});
