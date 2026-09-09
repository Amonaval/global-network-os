import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {VERTICALS} from '../runtime/catalog.mjs';
import {mutationAllowed} from '../runtime/env.mjs';
import {normalizeCommandError} from '../../server/shared/errors.ts';
test('released QA vertical catalog contains exactly 9 unique verticals',()=>{assert.equal(VERTICALS.length,9);assert.equal(new Set(VERTICALS.map(v=>v.kind)).size,9)});
test('mutation guard requires staging plus explicit allow flag',()=>{const a=process.env.QA_MODE,b=process.env.QA_ALLOW_MUTATION;process.env.QA_MODE='readonly';process.env.QA_ALLOW_MUTATION='true';assert.equal(mutationAllowed(),false);process.env.QA_MODE='staging';process.env.QA_ALLOW_MUTATION='false';assert.equal(mutationAllowed(),false);process.env.QA_ALLOW_MUTATION='true';assert.equal(mutationAllowed(),true);if(a===undefined)delete process.env.QA_MODE;else process.env.QA_MODE=a;if(b===undefined)delete process.env.QA_ALLOW_MUTATION;else process.env.QA_ALLOW_MUTATION=b});

test('network membership transport preserves every released vertical kind',()=>{
 const source=fs.readFileSync('capabilities/network-context/remote.ts','utf8');
 for(const {kind} of VERTICALS)assert.match(source,new RegExp(`[\"']${kind}[\"']`),`network-context transport must recognize ${kind}`);
 assert.match(source,/NETWORK_VERTICAL_KINDS\.includes\(value as NetworkVerticalKind\)/);
});

test('POC RPC privilege audit is explicitly advisory while full certification is strict',()=>{
 const poc=fs.readFileSync('qa/run-poc-certification.mjs','utf8');
 const full=fs.readFileSync('qa/run-certification.mjs','utf8');
 const audit=fs.readFileSync('qa/db/rpc-permission-audit.mjs','utf8');
 assert.match(poc,/rpc-permission-audit\.mjs','--advisory'/);
 assert.match(full,/rpc-permission-audit\.mjs','--strict'/);
 assert.match(audit,/configuredPolicy=.*'strict'/);
 assert.match(audit,/status=findings\.length\?\(policy==='advisory'\?'advisory':'failed'\):'passed'/);
 assert.match(audit,/if\(findings\.length&&policy==='strict'\)process\.exit\(1\)/);
});

test('Playwright login waits for application state instead of the browser load event',()=>{
 const login=fs.readFileSync('qa/lib/login.ts','utf8');
 assert.match(login,/page\.goto\('\/',\{waitUntil:'commit',timeout:45_000\}\)/);
 assert.match(login,/login should reach an authenticated app state/);
});


test('API error normalization preserves Supabase/PostgREST authorization semantics',()=>{
 const forbidden=normalizeCommandError({code:'42501',message:'Network administrator access required.',details:null,hint:null});
 assert.equal(forbidden.status,403);
 assert.equal(forbidden.code,'FORBIDDEN');
 const missing=normalizeCommandError({code:'P0002',message:'Network not found.',details:null,hint:null});
 assert.equal(missing.status,404);
 assert.equal(missing.code,'NOT_FOUND');
 const generic=normalizeCommandError({code:'P1234',message:'Unexpected database failure.'});
 assert.equal(generic.status,400);
 assert.equal(generic.code,'P1234');
});
