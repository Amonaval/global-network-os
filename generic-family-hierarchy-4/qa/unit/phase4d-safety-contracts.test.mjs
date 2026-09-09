import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const spec=fs.readFileSync('qa/e2e/22-phase4d-vertical-business-rules.spec.ts','utf8');
const runner=fs.readFileSync('qa/run-phase4d-certification.mjs','utf8');
const template=fs.readFileSync('components/TemplateNetworkApp.tsx','utf8');
const relationship=fs.readFileSync('components/shared/NetworkRelationshipExplorer.tsx','utf8');
const alumni=fs.readFileSync('components/AlumniNetworkApp.tsx','utf8');
const fca=fs.readFileSync('components/FamilyAssociationAdminPanel.tsx','utf8');
const housing=fs.readFileSync('components/HousingSocietyCorePanel.tsx','utf8');

test('Phase 4D browser scope is non-destructive and independent from frozen Storage/security work',()=>{
  for(const token of ['SUPABASE_SERVICE_ROLE_KEY','storage.from(','migration-replay.mjs','rls-adversarial.mjs','rpc-permission-audit.mjs','delete_owned_network_permanently','archive_owned_network','/purge','qa/setup/seed.mjs','qa/setup/cleanup.mjs']){
    assert.equal(spec.includes(token)||runner.includes(token),false,`forbidden Phase-4D token: ${token}`);
  }
});

test('Phase 4D browser suite explicitly exercises every released vertical',()=>{
  for(const kind of ['family','housing-society','family-association','association','alumni','organization','business-trust','franchise','professional'])assert.ok(spec.includes(`'${kind}'`)||spec.includes(`\"${kind}\"`),`missing ${kind}`);
});

test('Phase 4D observability hooks expose only existing vertical semantics',()=>{
  assert.ok(template.includes('qa-fca-directory-controls'));assert.ok(template.includes('qa-hs-directory-controls'));
  assert.ok(fca.includes('qa-fca-admin-panel'));assert.ok(housing.includes('qa-hs-core-admin'));
  assert.ok(alumni.includes('qa-alumni-directory')&&alumni.includes('qa-alumni-batch-filter')&&alumni.includes('qa-alumni-program-filter'));
  assert.ok(relationship.includes('qa-relationship-explorer')&&relationship.includes('qa-relationship-type-select'));
});

test('Phase 4D relationship-vocabulary proof is read-only inspection, never relationship mutation',()=>{
  assert.ok(spec.includes("['organization',['Reports to','Works with','Owns','Depends on']]"));
  assert.ok(spec.includes("['business-trust',['Recommends','Verified by','Supplies to','Worked with']]"));
  assert.ok(spec.includes("['franchise',['Owns','Operates','Manages','Supports']]"));
  assert.ok(spec.includes("['professional',['Worked with','Referred by','Collaborates with','Mentors']]"));
  assert.equal(spec.includes('saveGovernedRelationship'),false);assert.equal(spec.includes('deleteNetworkEntityRelationship'),false);
});

test('Phase 4D certification remains headed single-worker and reuses existing deterministic seed',()=>{
  assert.ok(runner.includes('qa:phase4d:local'));assert.ok(runner.includes('22-phase4d-vertical-business-rules.spec.ts'));assert.ok(runner.includes("'--workers=1'"));assert.ok(runner.includes("'--headed'"));
  assert.ok(runner.includes('existing-seed-fixture'));for(const token of ['qa/setup/seed.mjs','qa/setup/cleanup.mjs'])assert.equal(runner.includes(token),false);
});
