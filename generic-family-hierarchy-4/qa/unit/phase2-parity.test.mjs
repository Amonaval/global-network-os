import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';
import {VERTICALS,EXPECTED_NAV_BY_KIND} from '../runtime/catalog.mjs';
const released=['family','housing-society','family-association','association','alumni','organization','business-trust','franchise','professional'];
test('Phase-2 released-kind parity remains exactly nine kinds',()=>{assert.deepEqual(VERTICALS.map(v=>v.kind),released)});
test('Phase-2 every released kind has a non-empty conservative navigation contract',()=>{for(const kind of released)assert.ok(Array.isArray(EXPECTED_NAV_BY_KIND[kind])&&EXPECTED_NAV_BY_KIND[kind].length>0,kind)});
test('Phase-2 membership transport source retains every released kind',()=>{const paths=['lib/network.ts','lib/remote.ts','app-shell/vertical-registry.ts','templates/productized/config.ts'].filter(fs.existsSync);const text=paths.map(p=>fs.readFileSync(p,'utf8')).join('\n');for(const kind of released)assert.match(text,new RegExp(kind.replace('-','\\-')),`missing ${kind}`)});
