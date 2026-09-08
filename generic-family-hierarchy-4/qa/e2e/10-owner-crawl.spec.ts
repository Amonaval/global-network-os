import {test,expect} from '@playwright/test';
import {login} from '../lib/login';
import {expertCrawl} from '../lib/crawler';
import {activate,seedState} from '../lib/role-client';
import {VERTICALS,expectedCrawlerTestIds} from '../runtime/catalog.mjs';

test.describe.serial('owner expert crawler — all released verticals',()=>{
 for(const vertical of VERTICALS)test(`[crawler:owner] ${vertical.label}`,async({page},testInfo)=>{
  const state=seedState(),network=state.networks[vertical.kind];expect(network).toBeTruthy();
  await activate('owner',network.id);await login(page,'owner');
  await expertCrawl(page,testInfo,{maxActions:Number(process.env.QA_CRAWL_MAX_ACTIONS||35),role:'owner',scope:vertical.kind,expectedTestIds:expectedCrawlerTestIds(vertical.kind,'owner')});
 });
});
