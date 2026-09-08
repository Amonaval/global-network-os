import {test,expect,Page} from '@playwright/test';
import {login} from '../lib/login';
import {seedState} from '../lib/role-client';

const fatal=/Unhandled Runtime Error|Application error|TypeError:|ReferenceError:/i;

async function openSeededNetwork(page:Page,kind:string,id:string){
  const shell=page.getByTestId(`qa-vertical-shell-${kind}`);
  if(await shell.count())return;
  const switcher=page.getByTestId('qa-network-switcher');
  await expect(switcher,`Network switcher should be visible before switching to ${kind}`).toBeVisible({timeout:15_000});
  await switcher.click();
  const target=page.getByTestId(`qa-network-switch-${kind}-${id}`);
  await expect(target,`Seeded ${kind} should be present in the switcher`).toBeVisible({timeout:15_000});
  await target.click();
  await expect(shell).toBeVisible({timeout:20_000});
}

test('Free-tier owner POC: Family admin + Housing Society shell with one login',async({page})=>{
  const s=seedState();
  await login(page,'owner');

  await expect(page.getByTestId('qa-setup-shell'),'Seeded owner unexpectedly landed in setup instead of an active network').toHaveCount(0);
  await openSeededNetwork(page,'family',s.networks.family.id);
  await expect(page.locator('body')).not.toContainText(fatal);
  const admin=page.getByTestId('qa-nav-admin');
  await expect(admin).toBeVisible();
  await admin.click();
  await expect(page.getByTestId('qa-admin-center')).toBeVisible();

  await openSeededNetwork(page,'housing-society',s.networks['housing-society'].id);
  await expect(page.locator('body')).not.toContainText(fatal);
});
