import fs from "node:fs";
const must=["capabilities/organization-knowledge/contracts.ts","capabilities/organization-knowledge/reconcile.ts","capabilities/organization-knowledge/remote.ts","components/shared/OrganizationKnowledgeDiscoveryInbox.tsx","supabase/migrations/051_g9_1b_organization_knowledge_bootstrap.sql"];
for(const f of must)if(!fs.existsSync(f))throw new Error(`G9.1-B missing ${f}`);
const sql=fs.readFileSync(must[4],"utf8");for(const t of ["submit_organization_knowledge_evidence","submit_organization_candidate_assertions","get_organization_knowledge_candidates","review_organization_knowledge_candidate","public.is_network_admin","architectural_decision","g7_set_entity_affiliation","network_entity_relationships"])if(!sql.includes(t))throw new Error(`G9.1-B migration missing ${t}`);
const app=fs.readFileSync("components/TemplateNetworkApp.tsx","utf8");if(!app.includes('kind==="organization"&&<OrganizationKnowledgeDiscoveryInbox/>'))throw new Error("Organization-only discovery inbox hook missing");
console.log("G9.1-B Organization Knowledge Bootstrap gate passed.");
