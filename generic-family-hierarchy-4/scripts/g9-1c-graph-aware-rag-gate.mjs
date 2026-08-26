import fs from "node:fs";
const required=["capabilities/graph-aware-intelligence/contracts.ts","capabilities/graph-aware-intelligence/orchestrator.ts","capabilities/graph-aware-intelligence/remote.ts","components/shared/OrganizationGraphAwareIntelligence.tsx","supabase/migrations/052_g9_1c_graph_aware_rag.sql"];
for(const file of required)if(!fs.existsSync(file))throw new Error(`G9.1-C missing ${file}`);
const engine=fs.readFileSync("core/intelligence/engine.ts","utf8");if(engine.includes("graph-aware-intelligence"))throw new Error("G9 deterministic engine must not depend on G9.1-C");
const sql=fs.readFileSync(required[4],"utf8");for(const token of ["current_network_id()","status='verified'","visibility='network'","status='active'","unnest(a.evidence_ids)","grant execute"])if(!sql.includes(token))throw new Error(`G9.1-C SQL missing safety token ${token}`);
const ui=fs.readFileSync(required[3],"utf8");if(!ui.includes("graph truth")||!ui.includes("authorized documentary evidence"))throw new Error("G9.1-C UI contract missing");
console.log("G9.1-C graph-aware RAG gate passed.");
