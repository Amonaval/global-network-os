import fs from "node:fs";
const req=["capabilities/organization-risk/contracts.ts","capabilities/organization-risk/engine.ts","capabilities/organization-risk/remote.ts","components/shared/OrganizationKnowledgeRiskPanel.tsx","supabase/migrations/053_g9_1d_organization_knowledge_risk_loop.sql"];
for(const f of req)if(!fs.existsSync(f))throw new Error(`G9.1-D missing ${f}`);
const sql=fs.readFileSync(req[4],"utf8"),ui=fs.readFileSync("components/shared/OrganizationGraphAwareIntelligence.tsx","utf8"),engine=fs.readFileSync(req[1],"utf8");
for(const x of ["organization_intelligence_query_signals","record_organization_intelligence_query","get_organization_knowledge_risk_signals","Network admin access required","No direct client policies"])if(!sql.includes(x))throw new Error(`G9.1-D SQL guard missing ${x}`);
for(const x of ["key_person","ownership_gap","dependency_criticality","question_gap","stale_knowledge","conflict"])if(!engine.includes(x))throw new Error(`G9.1-D risk class missing ${x}`);
if(!ui.includes("recordOrganizationIntelligenceQuery")||!ui.includes("OrganizationKnowledgeRiskPanel"))throw new Error("G9.1-D UI integration missing");
if(fs.readFileSync("core/intelligence/engine.ts","utf8").includes("organization-risk"))throw new Error("G9 deterministic engine must remain decoupled from G9.1-D");
console.log("G9.1-D Organizational Knowledge Risk Loop gate passed.");
