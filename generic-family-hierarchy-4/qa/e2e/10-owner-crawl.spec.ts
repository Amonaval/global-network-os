import {test} from '@playwright/test';import {login} from '../lib/login';import {expertCrawl} from '../lib/crawler';
test('owner expert crawler explores reachable application without fatal errors',async({page},testInfo)=>{test.skip(!process.env.QA_OWNER_EMAIL,'owner QA credentials not configured');await login(page,'owner');await expertCrawl(page,testInfo,{maxActions:80})});
