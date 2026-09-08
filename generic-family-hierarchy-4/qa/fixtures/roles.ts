import {test as base,expect,type Page} from '@playwright/test';import {login} from '../lib/login';import {seedState} from '../lib/role-client';
type Fixtures={ownerPage:Page;adminPage:Page;memberPage:Page;qaSeed:any};
export const test=base.extend<Fixtures>({
 qaSeed:async({},use:(value:any)=>Promise<void>)=>{await use(seedState())},
 ownerPage:async({browser},use)=>{const p=await browser.newPage();await login(p,'owner');await use(p);await p.close()},
 adminPage:async({browser},use)=>{const p=await browser.newPage();await login(p,'admin');await use(p);await p.close()},
 memberPage:async({browser},use)=>{const p=await browser.newPage();await login(p,'member');await use(p);await p.close()}
});
export {expect};
