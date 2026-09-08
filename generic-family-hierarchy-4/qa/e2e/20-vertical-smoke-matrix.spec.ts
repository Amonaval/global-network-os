import {test,expect} from '@playwright/test';
import {VERTICALS} from '../runtime/catalog.mjs';
import {login} from '../lib/login';import {activate,seedState} from '../lib/role-client';
const roles=['owner','admin','member'] as const;
const fatal=/Unhandled Runtime Error|Application error|column reference .* ambiguous|TypeError:|ReferenceError:/i;
test.describe('all released vertical × role runtime smoke matrix',()=>{
 for(const v of VERTICALS)for(const role of roles)test(`${v.label} [vertical:${v.kind}] [role:${role}] opens deterministic shell`,async({page})=>{
  const s=seedState(),n=s.networks[v.kind];expect(n,`seed fixture ${v.kind}`).toBeTruthy();await activate(role,n.id);await login(page,role);
  await expect(page.getByTestId(`qa-vertical-shell-${v.kind}`)).toBeVisible({timeout:20_000});await expect(page.locator('body')).toContainText(n.name);await expect(page.locator('body')).not.toContainText(fatal);
  const admin=page.getByTestId('qa-nav-admin');if(role==='member')await expect(admin).toHaveCount(0);else await expect(admin).toBeVisible();
 });
});
