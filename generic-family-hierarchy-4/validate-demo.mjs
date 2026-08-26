import fs from "node:fs";
const s=fs.readFileSync("./lib/demo-data.ts","utf8");
const membersPart=s.split("export const demoRelationships")[0];
const relPart=s.split("export const demoRelationships")[1]||"";
const members=[...membersPart.matchAll(/"id"\s*:\s*"(m\d+)"/g)].map(x=>x[1]);
const gens=[...membersPart.matchAll(/"generation_level"\s*:\s*(\d+)/g)].map(x=>+x[1]);
const rels=[...relPart.matchAll(/"id"\s*:\s*"(r\d+)"/g)].map(x=>x[1]);
const fail=[];
if(members.length!==60) fail.push(`Expected 60 members, found ${members.length}`);
if(Math.min(...gens)!==1||Math.max(...gens)!==5) fail.push(`Expected generations 1-5, found ${Math.min(...gens)}-${Math.max(...gens)}`);
if(!/"relationship_type"\s*:\s*"spouse"/.test(relPart)) fail.push("No spouse relationships found");
if(!/"relationship_type"\s*:\s*"parent"/.test(relPart)) fail.push("No parent relationships found");
if(!/"date_of_death"\s*:\s*"/.test(membersPart)) fail.push("No deceased sample records found");
console.log(`Members: ${members.length}`);console.log(`Relationships: ${rels.length}`);console.log(`Generations: ${Math.min(...gens)}-${Math.max(...gens)}`);
if(fail.length){console.error("\nVALIDATION FAILED");fail.forEach(x=>console.error("- "+x));process.exit(1)}
console.log("\nVALIDATION PASSED");
