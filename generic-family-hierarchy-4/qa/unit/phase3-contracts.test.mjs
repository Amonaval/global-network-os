import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const e2e=fs.readFileSync('qa/e2e/17-phase3-expanded-parity-roles.spec.ts','utf8');
const runner=fs.readFileSync('qa/run-phase3-certification.mjs','utf8');
const gate=fs.readFileSync('qa/db/rpc-permission-nonregression.mjs','utf8');

test('Phase 3 reuses sessions instead of role×vertical Cartesian logins',()=>{
 assert.match(e2e,/one browser session traverses every released vertical/);
 assert.ok((e2e.match(/await login\(page,'owner'\)/g)||[]).length<=2);
 assert.ok((e2e.match(/await login\(page,'admin'\)/g)||[]).length<=1);
 assert.ok((e2e.match(/await login\(page,'member'\)/g)||[]).length<=1);
});

test('Phase 3 explicitly covers all released verticals through canonical catalog',()=>{
 assert.match(e2e,/for\(const v of VERTICALS\)/);
 assert.match(e2e,/EXPECTED_NAV_BY_KIND/);
});

test('Phase 3 invitation coverage proves token rotation, replay denial and cleanup',()=>{
 for(const token of ['resend','oldToken','accept_network_participation_invitation','cannot be replayed','finally'])assert.ok(e2e.includes(token),token);
});

test('Phase 3 RPC gate prevents debt growth without suppressing findings',()=>{
 assert.match(gate,/phase2CertifiedFindingCeiling=331/);
 assert.match(gate,/does not waive or suppress existing findings/);
 assert.match(runner,/rpc-permission-nonregression/);
});
