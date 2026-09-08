import {test,expect} from '@playwright/test';
import {login} from '../lib/login';
import {expertCrawl} from '../lib/crawler';
import {activate,seedState} from '../lib/role-client';
import {VERTICALS,expectedCrawlerTestIds} from '../runtime/catalog.mjs';

test.describe.serial('member expert crawler — all released verticals',()=>{
 for(const vertical of VERTICALS)test(`[crawler:member] ${vertical.label}`,async({page},testInfo)=>{
  const state=seedState(),network=state.networks[vertical.kind];expect(network).toBeTruthy();
  await activate('member',network.id);await login(page,'member');
  await expertCrawl(page,testInfo,{maxActions:Number(process.env.QA_CRAWL_MAX_ACTIONS||30),role:'member',scope:vertical.kind,expectedTestIds:expectedCrawlerTestIds(vertical.kind,'member')});
 });
});
