import {test,expect,type Page} from '@playwright/test';
import {login} from '../lib/login';
import {seedState} from '../lib/role-client';

const fatal=/Unhandled Runtime Error|Application error|TypeError:|ReferenceError:/i;

async function healthy(page:Page){await expect(page.locator('body')).not.toContainText(fatal)}

async function openMyNetworks(page:Page){
  const lobby=page.getByTestId('qa-my-networks');
  if(await lobby.count()){await expect(lobby).toBeVisible();return;}
  const menu=page.getByTestId('qa-account-menu');
  await expect(menu,'Account menu should expose My Networks from every real network').toBeVisible({timeout:15_000});
  await menu.click();
  const networks=page.getByTestId('qa-account-menu-networks');
  await expect(networks,'My Networks account action should remain available').toBeVisible({timeout:10_000});
  await networks.click();
  await expect(lobby).toBeVisible({timeout:20_000});
}

async function openMembership(page:Page,kind:string,id:string){
  await openMyNetworks(page);
  const card=page.getByTestId(`qa-network-${kind}-${id}`);
  await expect(card,`Existing ${kind} membership must never be hidden by showcase settings`).toBeVisible({timeout:15_000});
  await card.click();
  await expect(page.getByTestId(`qa-vertical-shell-${kind}`)).toBeVisible({timeout:25_000});
  await healthy(page);
}

test('Showcase certification: non-owner admin keeps all memberships and opens the three flagship verticals',async({page})=>{
  const s=seedState();
  await login(page,'admin');
  await openMyNetworks(page);
  for(const kind of ['family','family-association','housing-society'] as const){
    await expect(page.getByTestId(`qa-network-${kind}-${s.networks[kind].id}`)).toBeVisible();
  }
  await openMembership(page,'family',s.networks.family.id);
  await openMembership(page,'family-association',s.networks['family-association'].id);
  await expect(page.getByTestId('qa-fca-flagship-home')).toBeVisible({timeout:20_000});
  await openMembership(page,'housing-society',s.networks['housing-society'].id);
  await expect(page.getByTestId('qa-hs-flagship-home')).toBeVisible({timeout:20_000});
});

test('Showcase certification: Playground back returns an authenticated user to My Networks',async({page})=>{
  await login(page,'admin');
  await openMyNetworks(page);
  const playground=page.getByTestId('qa-showcase-playground-family-association');
  await expect(playground).toBeVisible({timeout:15_000});
  await playground.click();
  await expect(page.getByTestId('qa-fca-flagship-home')).toBeVisible({timeout:20_000});
  await page.getByTestId('qa-account-menu').click();
  await expect(page.getByTestId('qa-account-menu-back')).toBeVisible();
  await page.getByTestId('qa-account-menu-back').click();
  await expect(page.getByTestId('qa-my-networks')).toBeVisible({timeout:20_000});
  await healthy(page);
});

test('Showcase certification: mobile create flow keeps Choose how to start reachable without creating data',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await login(page,'admin');
  await openMyNetworks(page);
  await page.getByTestId('qa-add-network').first().click();
  await expect(page.getByTestId('qa-setup-shell')).toBeVisible({timeout:15_000});
  await page.getByTestId('qa-entry-create-family').click();
  await page.getByTestId('qa-family-name').fill('QA mobile visibility check');
  const cta=page.getByTestId('qa-choose-how-start');
  await expect(cta).toBeVisible();
  const box=await cta.boundingBox();
  expect(box,'Choose how to start must have a rendered box').not.toBeNull();
  expect((box?.y||0)+(box?.height||0)).toBeLessThanOrEqual(846);
  await healthy(page);
});

test('Showcase certification: five appearance themes remain switchable',async({page})=>{
  await login(page,'admin');
  for(const theme of ['light','warm','modern','aurora','dark'] as const){
    const button=page.getByTestId(`qa-theme-${theme}`).first();
    await expect(button).toBeVisible();
    await button.click();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.theme)).toBe(theme);
  }
  await healthy(page);
});

test('Showcase certification: sign-in popup can be dismissed with Escape',async({page})=>{
  await page.goto('/',{waitUntil:'commit'});
  await expect(page.getByTestId('qa-open-auth')).toBeVisible({timeout:15_000});
  await page.getByTestId('qa-open-auth').click();
  await expect(page.getByTestId('qa-auth-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('qa-auth-dialog')).toHaveCount(0);
});
