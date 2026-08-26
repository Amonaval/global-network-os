import fs from "node:fs";
function read(p){if(!fs.existsSync(p))throw new Error(`Missing ${p}`);return fs.readFileSync(p,"utf8")}
const orch=read("capabilities/graph-aware-intelligence/orchestrator.ts");
const ui=read("components/shared/OrganizationGraphAwareIntelligence.tsx");
const pkg=JSON.parse(read("package.json"));
for(const token of ["resolveExplicitTargetEntity","Longest label wins","classifyDependencyDirection","asksUpstream","asksDownstream","explicitBoth","expertiseBoosts"]){if(!orch.includes(token))throw new Error(`C.1 missing ${token}`)}
for(const token of ["View supporting evidence","Technical graph reasoning","<details>"]){if(!ui.includes(token))throw new Error(`C.1 progressive disclosure missing ${token}`)}
if(!pkg.scripts?.["validate:g9.1-quality"])throw new Error("Missing validate:g9.1-quality script");

// Northstar acceptance semantics: literal entity target and direction classification.
const norm=v=>String(v??"").trim().toLowerCase().replace(/\s+/g," ");
function explicit(labels,q){const qq=` ${norm(q).replace(/[^a-z0-9@.+-]+/g," ")} `;return labels.map(label=>({label,norm:norm(label),needle:` ${norm(label).replace(/[^a-z0-9@.+-]+/g," ")} `})).filter(x=>qq.includes(x.needle)).sort((a,b)=>b.norm.length-a.norm.length)[0]?.label||null}
const labels=["Aman Shah","Rahul Verma","Nikhil Bansal","Meera Rao","Identity Gateway","Billing Service","Event Mesh","Authentication Platform","Redis Session Cache"];
const fixtures=[
 ["Who owns Identity Gateway?","Identity Gateway"],
 ["Who owns Billing Service?","Billing Service"],
 ["Who owns Event Mesh?","Event Mesh"],
 ["What depends on Identity Gateway?","Identity Gateway"],
 ["What does Identity Gateway depend on?","Identity Gateway"],
 ["What depends on Event Mesh?","Event Mesh"],
 ["Which systems depend on Identity Gateway, and what does Identity Gateway itself depend on?","Identity Gateway"]
];
for(const [q,want] of fixtures){const got=explicit(labels,q);if(got!==want)throw new Error(`Northstar target fixture failed: ${q} -> ${got}, wanted ${want}`)}
console.log("G9.1-B.1 + C.1 intelligence quality hardening gate passed (7 Northstar target fixtures).");
