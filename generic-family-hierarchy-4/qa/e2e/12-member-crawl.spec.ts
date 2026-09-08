import {test} from '@playwright/test';import {login} from '../lib/login';import {expertCrawl} from '../lib/crawler';
test('member expert crawler explores reachable application without fatal errors',async({page},testInfo)=>{test.skip(!process.env.QA_MEMBER_EMAIL,'member QA credentials not configured');await login(page,'member');await expertCrawl(page,testInfo,{maxActions:60})});
