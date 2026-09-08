import {test} from '@playwright/test';import {login} from '../lib/login';import {expertCrawl} from '../lib/crawler';
test('admin expert crawler explores reachable application without fatal errors',async({page},testInfo)=>{test.skip(!process.env.QA_ADMIN_EMAIL,'admin QA credentials not configured');await login(page,'admin');await expertCrawl(page,testInfo,{maxActions:60})});
