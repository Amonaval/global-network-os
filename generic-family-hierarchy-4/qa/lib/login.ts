import {expect,type Page} from '@playwright/test';
const keys={owner:['QA_OWNER_EMAIL','QA_OWNER_PASSWORD'],admin:['QA_ADMIN_EMAIL','QA_ADMIN_PASSWORD'],member:['QA_MEMBER_EMAIL','QA_MEMBER_PASSWORD'],invitee:['QA_INVITEE_EMAIL','QA_INVITEE_PASSWORD']} as const;
export async function login(page:Page,role:keyof typeof keys){
 const [ek,pk]=keys[role],email=process.env[ek],password=process.env[pk];
 if(!email||!password)throw new Error(`Missing ${ek}/${pk} in .env.qa`);
 await page.goto('/',{waitUntil:'commit',timeout:45_000});
 let emailBox=page.getByTestId('qa-auth-email');
 if(!(await emailBox.count())){
 const openAuth=page.getByTestId('qa-open-auth');
   await expect(openAuth,`QA ${role} should reach the sign-in landing page`).toBeVisible({timeout:15_000});
   await openAuth.click();
   await expect(page.getByTestId('qa-auth-dialog')).toBeVisible({timeout:10_000});
 }
 emailBox=page.getByTestId('qa-auth-email');
 await emailBox.fill(email);
 await page.getByTestId('qa-auth-password').fill(password);
 await page.getByTestId('qa-auth-submit').click();
 await expect(page.locator('body')).not.toContainText(/invalid login|invalid credentials|did not match/i,{timeout:15_000});
 const postAuth=page.locator('[data-testid^="qa-vertical-shell-"], [data-testid="qa-my-networks"], [data-testid="qa-setup-shell"]');
 await expect(postAuth.first(),`QA ${role} login should reach an authenticated app state`).toBeVisible({timeout:30_000});
}
