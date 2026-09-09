import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const spec=fs.readFileSync('qa/e2e/21-phase4c-governance-permissions-destructive.spec.ts','utf8');
const family=fs.readFileSync('components/FamilyAdminCenter.tsx','utf8');
const product=fs.readFileSync('components/TemplateNetworkApp.tsx','utf8');
const lobby=fs.readFileSync('components/MyNetworksHome.tsx','utf8');
const sec=fs.readFileSync('supabase/migrations/095_phase3_security_definer_null_authorization_hardening.sql','utf8');
const lifecycle=fs.readFileSync('supabase/migrations/091_xp01_runtime_closure.sql','utf8');
const runner=fs.readFileSync('qa/run-phase4c-certification.mjs','utf8');

test('Phase 4C contains no service-role, Storage, migration or destructive purge execution',()=>{
  for(const token of ['SUPABASE_SERVICE_ROLE_KEY','storage.from(','migration-replay.mjs','rls-adversarial.mjs','rpc-permission-audit.mjs','70-destructive-lifecycle-import.spec.ts'])assert.equal(spec.includes(token)||runner.includes(token),false,`forbidden Phase-4C token: ${token}`);
  assert.equal(/request\.post\([^\n]*\/purge/.test(spec),false,'Phase 4C must not execute purge API');
});

test('Family destructive UI requires owner role, exact name and explicit confirmation',()=>{
  assert.ok(family.includes('data-testid="qa-admin-danger-confirm"'));
  assert.ok(family.includes('network.membership_role!=="owner"||deleteConfirm!==network.name||busy'));
  assert.ok(family.includes('confirm(`Archive ${network.name}?'));
  assert.ok(family.includes('confirm(`Permanently delete ${network.name}?'));
});

test('Productized destructive UI exposes owner-only archive/delete and exact-name guard',()=>{
  assert.ok(product.includes('data-testid="qa-product-lifecycle-confirm"'));
  assert.ok(product.includes('auth?.membership_role==="owner"'));
  assert.ok(product.includes('disabled={lifecycleConfirm!==network.name}'));
  assert.ok(product.includes('data-testid="qa-product-archive"'));
  assert.ok(product.includes('data-testid="qa-product-delete"'));
});

test('Productized member governance preserves owner-only role changes and scoped admin removal',()=>{
  assert.ok(product.includes('data-testid={`qa-product-member-role-${m.userId}`}'));
  assert.ok(product.includes('auth?.membership_role==="owner"&&m.role!=="owner"'));
  assert.ok(product.includes('auth?.membership_role==="admin"&&m.role==="member"'));
  assert.ok(product.includes('data-testid={`qa-product-member-remove-${m.userId}`}'));
});

test('SECURITY DEFINER governance rejects null/non-owner role escalation and protects owner removal',()=>{
  assert.match(sec,/actor_role is null or actor_role<>'owner'/);
  assert.match(sec,/if p_user_id=auth\.uid\(\) then raise exception 'The owner role cannot be changed here\.'/);
  assert.match(sec,/target_role is null or target_role='owner'/);
  assert.match(sec,/if target_role='admin' and actor_role<>'owner'/);
  assert.match(sec,/if p_invited_role='admin' and actor<>'owner'/);
});

test('permanent deletion finalizer requires owner, exact-name confirmation and zero Storage residue before relational deletion',()=>{
  assert.match(lifecycle,/nm\.role='owner'/);
  assert.match(lifecycle,/Network name confirmation does not match\./);
  assert.match(lifecycle,/storageResidue/);
  assert.match(lifecycle,/Network storage must be purged through the Supabase Storage API before relational deletion/);
});

test('Phase 4C stale-permission mutation is narrowly scoped and deterministically restored in finally',()=>{
  assert.ok(spec.includes("assertMutationAllowed()"),'reversible mutation must retain staging mutation guard');
  assert.ok(spec.includes("QA_MODE!=='staging'||process.env.QA_ALLOW_MUTATION!=='true'"),'reversible mutation must skip outside explicit staging mode');
  assert.ok(spec.includes("p_user_id:s.users.admin.id,p_role:'member'"),'stale-role revocation proof missing');
  assert.ok(spec.includes("p_user_id:s.users.admin.id,p_role:'admin'"),'admin restoration missing');
  assert.match(spec,/finally\{await restore\(\)\}/,'reversible seeded role mutation must restore in finally');
  assert.ok(spec.includes("remove_productized_network_member"),'stale backend authorization proof missing');
});

test('Phase 4C double-submit proof uses synthetic browser interception and leaves seeded membership untouched',()=>{
  assert.ok(spec.includes("**/rest/v1/rpc/remove_productized_network_member"));
  assert.ok(spec.includes("route.fulfill({status:200"));
  assert.ok(spec.includes("expect(calls).toBe(1)"));
  assert.ok(spec.includes("synthetic removal must leave seeded member untouched"));
});

test('Phase 4C certification runner is headed single-worker and reuses existing seed without seed/cleanup',()=>{
  assert.ok(runner.includes('qa:phase4c:local'));assert.ok(runner.includes('21-phase4c-governance-permissions-destructive.spec.ts'));assert.ok(runner.includes("'--workers=1'"));assert.ok(runner.includes("'--headed'"));
  assert.ok(runner.includes("QA_MODE==='staging'&&process.env.QA_ALLOW_MUTATION==='true'"),'certification must block unless explicit staging mutation mode is enabled');
  for(const token of ['qa/setup/seed.mjs','qa/setup/cleanup.mjs'])assert.equal(runner.includes(token),false,`runner must not invoke ${token}`);
});
