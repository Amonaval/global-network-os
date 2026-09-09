import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const e2e=fs.readFileSync('qa/e2e/18-phase4a-runtime-recovery.spec.ts','utf8');
const runner=fs.readFileSync('qa/run-phase4a-certification.mjs','utf8');

test('Phase 4A remains DB-hardening independent and contains no destructive lifecycle/storage mutations',()=>{
  for(const forbidden of ['SUPABASE_SERVICE_ROLE_KEY','delete_owned_network_permanently','/api/v1/networks/create','/purge','storage.from(','network_participation_invitations'])assert.equal(e2e.includes(forbidden),false,forbidden);
  for(const forbidden of ['rls-adversarial','rpc-permission','migration-replay','qa/setup/seed','qa/setup/cleanup'])assert.equal(runner.includes(forbidden),false,forbidden);
});

test('Phase 4A explicitly proves reload, history, slow-backend, outage-recovery, mobile and accessibility behavior',()=>{
  for(const token of ['page.reload','page.goBack','page.goForward','setTimeout(r,400)','status:503','qa-mobile-nav-directory','seriousOrCritical'])assert.ok(e2e.includes(token),token);
});

test('Phase 4A uses headed Chromium, one worker and the already-seeded fixture instead of generating new data',()=>{
  assert.match(runner,/--project=chromium-desktop/);assert.match(runner,/--workers=1/);assert.match(runner,/--headed/);
  assert.match(runner,/seed-state\.json/);assert.doesNotMatch(runner,/seed\.mjs/);
});

test('Phase 4A failure injection is browser-local and reversible',()=>{
  assert.match(e2e,/page\.route\(pattern/);assert.match(e2e,/page\.unroute\(pattern\)/);
  assert.match(e2e,/QA Phase4A simulated transient outage/);
});

test('Phase 4A mobile shell controls retain accessible names when responsive CSS hides visible copy',()=>{
  const account=fs.readFileSync('components/shared/NetworkAccountMenu.tsx','utf8');
  const switcher=fs.readFileSync('components/shared/NetworkSwitcher.tsx','utf8');
  assert.match(account,/network-account-trigger[^>]+aria-label=/);
  assert.match(switcher,/qa-network-switcher[^>]+aria-label=/);
});
