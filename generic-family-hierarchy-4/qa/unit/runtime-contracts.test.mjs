import test from 'node:test';import assert from 'node:assert/strict';
import {VERTICALS} from '../runtime/catalog.mjs';
import {mutationAllowed} from '../runtime/env.mjs';
test('released QA vertical catalog contains exactly 9 unique verticals',()=>{assert.equal(VERTICALS.length,9);assert.equal(new Set(VERTICALS.map(v=>v.kind)).size,9)});
test('mutation guard requires staging plus explicit allow flag',()=>{const a=process.env.QA_MODE,b=process.env.QA_ALLOW_MUTATION;process.env.QA_MODE='readonly';process.env.QA_ALLOW_MUTATION='true';assert.equal(mutationAllowed(),false);process.env.QA_MODE='staging';process.env.QA_ALLOW_MUTATION='false';assert.equal(mutationAllowed(),false);process.env.QA_ALLOW_MUTATION='true';assert.equal(mutationAllowed(),true);if(a===undefined)delete process.env.QA_MODE;else process.env.QA_MODE=a;if(b===undefined)delete process.env.QA_ALLOW_MUTATION;else process.env.QA_ALLOW_MUTATION=b});

const EXPECTED_SEED_ENTITY_KINDS={family:'person','housing-society':'unit','family-association':'family',association:'household',alumni:'alumni',organization:'person','business-trust':'organization',franchise:'location',professional:'person'};
test('QA seed entity kinds match released runtime contracts',()=>{for(const v of VERTICALS)assert.equal(v.entityKind,EXPECTED_SEED_ENTITY_KINDS[v.kind],`${v.kind} seed entity kind drift`) });
