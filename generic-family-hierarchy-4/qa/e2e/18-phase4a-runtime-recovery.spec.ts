import {test,expect,type Page} from '@playwright/test';
import {login} from '../lib/login';
import {activate,seedState} from '../lib/role-client';

const rawLeak=/Unhandled Runtime Error|Application error|SQLSTATE|postgres(?:ql)? error|stack trace|TypeError:|ReferenceError:/i;
const fatalConsole=/Unhandled Runtime Error|Application error|TypeError:|ReferenceError:/i;

function watchFatalRuntime(page:Page){
  const issues:string[]=[];
  page.on('pageerror',e=>issues.push(`pageerror: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error'&&fatalConsole.test(m.text()))issues.push(`console: ${m.text()}`)});
  return issues;
}

async function expectHealthyShell(page:Page,kind:string){
  await expect(page.getByTestId(`qa-vertical-shell-${kind}`),`${kind} shell should recover`).toBeVisible({timeout:30_000});
  await expect(page.locator('body')).not.toContainText(rawLeak);
}

async function axe(page:Page){
  const dynamicImport=new Function('m','return import(m)');
  let mod:any;try{mod=await dynamicImport('@axe-core/playwright')}catch{throw new Error('Accessibility engine missing. Run npm run qa:setup.');}
  const AxeBuilder=mod.default;
  return new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
}
function seriousOrCritical(result:any){return result.violations.filter((x:any)=>['serious','critical'].includes(x.impact));}

test.describe.serial('Phase-4A runtime robustness, recovery and failure handling',()=>{
  test('Family owner session recovers after admin navigation + full reload',async({page})=>{
    const s=seedState();const issues=watchFatalRuntime(page);
    await activate('owner',s.networks.family.id);await login(page,'owner');
    await expectHealthyShell(page,'family');
    await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-admin-center')).toBeVisible();
    await page.reload({waitUntil:'commit'});
    await expectHealthyShell(page,'family');
    await expect(page.getByTestId('qa-nav-admin')).toBeVisible();
    expect(issues,'reload must not produce fatal browser runtime errors').toEqual([]);
  });

  test('Organization member can recover directory/search after reload without admin leakage',async({page})=>{
    const s=seedState();const issues=watchFatalRuntime(page);
    await activate('member',s.networks.organization.id);await login(page,'member');
    await page.getByTestId('qa-nav-directory').click();
    const search=page.locator('.product-filter input');await expect(search).toBeVisible();await search.fill(s.networks.organization.marker);
    await expect(page.locator('body')).toContainText(s.networks.organization.marker);
    await page.reload({waitUntil:'commit'});
    await expectHealthyShell(page,'organization');
    await expect(page.getByTestId('qa-nav-admin')).toHaveCount(0);
    await page.getByTestId('qa-nav-directory').click();
    await expect(page.locator('body')).toContainText(s.networks.organization.marker);
    expect(issues,'member reload must not produce fatal browser runtime errors').toEqual([]);
  });

  test('authenticated query-string entry + browser back/forward preserve the session and shell',async({page})=>{
    const s=seedState();const issues=watchFatalRuntime(page);
    await activate('member',s.networks.organization.id);await login(page,'member');
    await page.goto('/?qaRecovery=one',{waitUntil:'commit'});await expectHealthyShell(page,'organization');
    await page.goto('/?qaRecovery=two',{waitUntil:'commit'});await expectHealthyShell(page,'organization');
    await page.goBack({waitUntil:'commit'});await expect(page).toHaveURL(/qaRecovery=one/);await expectHealthyShell(page,'organization');
    await page.goForward({waitUntil:'commit'});await expect(page).toHaveURL(/qaRecovery=two/);await expectHealthyShell(page,'organization');
    await expect(page.getByTestId('qa-auth-dialog')).toHaveCount(0);
    expect(issues,'history recovery must not produce fatal browser runtime errors').toEqual([]);
  });

  test('slow REST responses delay but do not crash an authenticated Professional shell',async({page})=>{
    const s=seedState();const issues=watchFatalRuntime(page);
    await activate('member',s.networks.professional.id);
    const pattern=/\/rest\/v1\//;
    const slowRest=async(route:any)=>{await new Promise(r=>setTimeout(r,400));await route.fallback()};
    await page.route(pattern,slowRest);
    await login(page,'member');await expectHealthyShell(page,'professional');
    // Let any already-intercepted delayed requests finish before removing this exact handler.
    await page.waitForTimeout(500);
    await page.unroute(pattern,slowRest);
    expect(issues,'slow backend must not produce fatal browser runtime errors').toEqual([]);
  });

  test('transient REST outage is contained and a clean reload recovers without re-login',async({page})=>{
    const s=seedState();const issues=watchFatalRuntime(page);
    await activate('member',s.networks.professional.id);await login(page,'member');await expectHealthyShell(page,'professional');
    const pattern=/\/rest\/v1\//;
    await page.route(pattern,async route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'QA Phase4A simulated transient outage'})}));
    await page.reload({waitUntil:'commit'});await page.waitForTimeout(1200);
    await expect(page.locator('body')).not.toContainText(rawLeak);
    await page.unroute(pattern);
    await page.reload({waitUntil:'commit'});await expectHealthyShell(page,'professional');
    await expect(page.getByTestId('qa-auth-dialog')).toHaveCount(0);
    expect(issues,'transient outage/recovery must not produce fatal JS runtime errors').toEqual([]);
  });

  test('mobile Organization member recovers after reload with usable navigation and no horizontal breakage',async({page})=>{
    const s=seedState();const issues=watchFatalRuntime(page);await page.setViewportSize({width:390,height:844});
    await activate('member',s.networks.organization.id);await login(page,'member');await expectHealthyShell(page,'organization');
    await page.getByTestId('qa-mobile-nav-directory').click();await expect(page.locator('body')).toContainText(s.networks.organization.marker);
    await page.reload({waitUntil:'commit'});await expectHealthyShell(page,'organization');
    await expect(page.getByTestId('qa-mobile-nav-directory')).toBeVisible();await page.getByTestId('qa-mobile-nav-directory').click();
    const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(dims.scroll-dims.client,'390px recovery shell must not introduce horizontal overflow').toBeLessThanOrEqual(12);
    expect(issues,'mobile reload must not produce fatal browser runtime errors').toEqual([]);
  });

  test('post-recovery mobile Organization directory has no serious/critical axe findings',async({page})=>{
    const s=seedState();await page.setViewportSize({width:390,height:844});
    await activate('member',s.networks.organization.id);await login(page,'member');
    await page.reload({waitUntil:'commit'});await expectHealthyShell(page,'organization');
    await page.getByTestId('qa-mobile-nav-directory').click();await expect(page.locator('body')).toContainText(s.networks.organization.marker);
    const result=await axe(page);expect(seriousOrCritical(result),JSON.stringify(result.violations,null,2)).toEqual([]);
  });
});
