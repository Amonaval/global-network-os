import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildMigrationRpcIntent} from '../security/rpc-contract.mjs';

const audit=fs.readFileSync('qa/db/rpc-security-closure.mjs','utf8');
const runner=fs.readFileSync('qa/run-phase5a-certification.mjs','utf8');
const contract=buildMigrationRpcIntent();

test('Phase 5A migration intent uses final ACL state and has no final GRANT EXECUTE to PUBLIC',()=>{
  assert.deepEqual(contract.publicUnsafeFunctions,[]);
});

test('Phase 5A every final client-callable RPC has an explicit PUBLIC revoke somewhere in migration history',()=>{
  const bad=contract.functions.filter(x=>x.expectedRoles.length&&!x.explicitPublicRevoke);
  assert.deepEqual(bad.map(x=>x.name),[]);
});

test('Phase 5A SECURITY DEFINER migration definitions pin search_path',()=>{
  const bad=contract.functions.filter(x=>x.securityDefinerDefinitions>x.fixedSearchPathDefinitions);
  assert.deepEqual(bad.map(x=>({name:x.name,securityDefinerDefinitions:x.securityDefinerDefinitions,fixedSearchPathDefinitions:x.fixedSearchPathDefinitions})),[]);
});

test('Phase 5A live audit distinguishes PUBLIC inheritance from explicit client-role ACL grants',()=>{
  assert.match(audit,/anon_explicit_execute/);
  assert.match(audit,/authenticated_explicit_execute/);
  assert.match(audit,/aclexplode\(coalesce\(p\.proacl,'\{\}'::aclitem\[\]\)\)/);
  assert.doesNotMatch(audit,/has_function_privilege\('anon'/);
});

test('Phase 5A live audit is catalog-read-only and strict findings are not advisory',()=>{
  assert.match(audit,/readOnly:true/);
  assert.match(audit,/zero unexpected PUBLIC\/explicit client-role exposure/);
  assert.match(audit,/if\(!reportOnly&&status!==['"]passed['"]\)process\.exit\(1\)/);
  assert.doesNotMatch(audit,/insert\s+into|update\s+public\.|delete\s+from|drop\s+function|alter\s+function/i);
});

test('Phase 5A remediation preview is rollback-protected and never auto-executed',()=>{
  assert.match(audit,/REVIEW ONLY/);
  assert.match(audit,/rollback;/);
  assert.doesNotMatch(runner,/PHASE5A-RPC-REMEDIATION-PREVIEW\.sql/);
});

test('Phase 5A certification requires strict live RPC closure',()=>{
  assert.match(runner,/rpc-security-closure\.mjs/);
  assert.match(runner,/PHASE5A_CERTIFIED/);
  assert.match(runner,/REMEDIATION_REQUIRED/);
});
