import fs from 'node:fs';
import path from 'node:path';

const read=(p)=>fs.readFileSync(path.resolve(p),'utf8');
const migration=read('supabase/migrations/050_g9_1a_evidence_foundation.sql');
const adapterContracts=read('capabilities/intelligence-adapter/contracts.ts');
const adapterRuntime=read('capabilities/intelligence-adapter/runtime.ts');
const evidenceContracts=read('core/evidence/contracts.ts');

const requiredTables=[
 'network_knowledge_sources',
 'network_evidence_records',
 'network_candidate_assertions',
 'network_assertion_decisions'
];
for(const table of requiredTables){
 if(!migration.includes(`create table if not exists public.${table}`)) throw new Error(`Missing table ${table}`);
 if(!migration.includes(`alter table public.${table} enable row level security`)) throw new Error(`RLS not enabled for ${table}`);
}

const activeChecks=(migration.match(/nm\.status='active'/g)||[]).length;
if(activeChecks<4) throw new Error(`Expected active-membership checks for all four G9.1-A read policies; found ${activeChecks}`);

if(!/network_knowledge_sources\.visibility='network'/.test(migration)) throw new Error('Restricted knowledge sources are not excluded from member SELECT');
if(!/network_evidence_records\.visibility='network'/.test(migration)) throw new Error('Restricted evidence is not excluded from member SELECT');

const policyTail=migration.slice(migration.indexOf('-- Reuse the existing membership table'));
if(/create policy[\s\S]{0,180}\b(for\s+(insert|update|delete|all)|with check)\b/i.test(policyTail)) {
 throw new Error('G9.1-A must not open direct client write policies');
}

for(const token of ['networkId:string','corpusId:string','principal:IntelligencePrincipal','authorizationRefs:string[]']){
 if(!adapterContracts.includes(token)) throw new Error(`Adapter contract missing ${token}`);
}
for(const token of ['principal/network mismatch','no-authorized-scope']){
 if(!adapterContracts.includes(token) && !adapterRuntime.includes(token)) throw new Error(`Adapter boundary missing ${token}`);
}
for(const token of ['CandidateAssertionStatus','EvidenceRecord','AssertionDecision']){
 if(!evidenceContracts.includes(token)) throw new Error(`Evidence contract missing ${token}`);
}

// Decoupling guard: G9 deterministic engine must not import the bridge/evidence layer.
const protectedFiles=['core/intelligence/engine.ts','core/intelligence/contracts.ts','app-shell/network-os-runtime.ts'];
for(const file of protectedFiles){
 const txt=read(file);
 if(/intelligence-adapter|core\/evidence|KnowledgeIntelligenceAdapter/.test(txt)) throw new Error(`${file} was coupled to G9.1-A bridge`);
}

console.log('G9.1-A runtime/database verification gate: PASS — tenant-active RLS, restricted-evidence isolation, closed writes, explicit adapter context, evidence lifecycle and G9 decoupling verified.');
