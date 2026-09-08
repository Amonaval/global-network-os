import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {VERTICALS} from '../runtime/catalog.mjs';
import {mutationAllowed} from '../runtime/env.mjs';
test('released QA vertical catalog contains exactly 9 unique verticals',()=>{assert.equal(VERTICALS.length,9);assert.equal(new Set(VERTICALS.map(v=>v.kind)).size,9)});
test('mutation guard requires staging plus explicit allow flag',()=>{const a=process.env.QA_MODE,b=process.env.QA_ALLOW_MUTATION;process.env.QA_MODE='readonly';process.env.QA_ALLOW_MUTATION='true';assert.equal(mutationAllowed(),false);process.env.QA_MODE='staging';process.env.QA_ALLOW_MUTATION='false';assert.equal(mutationAllowed(),false);process.env.QA_ALLOW_MUTATION='true';assert.equal(mutationAllowed(),true);if(a===undefined)delete process.env.QA_MODE;else process.env.QA_MODE=a;if(b===undefined)delete process.env.QA_ALLOW_MUTATION;else process.env.QA_ALLOW_MUTATION=b});

test('network membership transport preserves every released vertical kind',()=>{
 const source=fs.readFileSync('capabilities/network-context/remote.ts','utf8');
 for(const {kind} of VERTICALS)assert.match(source,new RegExp(`[\"']${kind}[\"']`),`network-context transport must recognize ${kind}`);
 assert.match(source,/NETWORK_VERTICAL_KINDS\.includes\(value as NetworkVerticalKind\)/);
});
