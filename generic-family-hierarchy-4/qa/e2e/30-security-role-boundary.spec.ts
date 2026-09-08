import {test,expect} from '@playwright/test';import {login} from '../lib/login';
test('ordinary member does not get owner-only destructive controls',async({page})=>{test.skip(!process.env.QA_MEMBER_EMAIL,'member QA credentials not configured');await login(page,'member');await expect(page.getByRole('button',{name:/permanent.*delete|hard delete/i})).toHaveCount(0)});
