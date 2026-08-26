import fs from "node:fs";
const required=[
 "core/evidence/contracts.ts",
 "capabilities/intelligence-adapter/contracts.ts",
 "capabilities/intelligence-adapter/runtime.ts",
 "supabase/migrations/050_g9_1a_evidence_foundation.sql"
];
for(const file of required){
 if(!fs.existsSync(file)) throw new Error(`G9.1-A missing ${file}`);
}
const migration=fs.readFileSync(required[3],"utf8");
for(const token of ["network_knowledge_sources","network_evidence_records","network_candidate_assertions","network_assertion_decisions","enable row level security"]){
 if(!migration.includes(token)) throw new Error(`G9.1-A migration missing ${token}`);
}
console.log("G9.1-A evidence foundation gate passed.");
