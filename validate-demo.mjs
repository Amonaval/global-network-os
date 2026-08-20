import fs from 'node:fs';
const s=fs.readFileSync('./lib/demo-data.ts','utf8');
const membersPart=s.split('export const demoRelationships')[0];
const relPart=s.split('export const demoRelationships')[1];
const members=[...membersPart.matchAll(/"id": "(m\d+)"/g)].map(x=>x[1]);
const gens=[...membersPart.matchAll(/"generation_level": (\d+)/g)].map(x=>+x[1]);
const rels=[...relPart.matchAll(/"id": "(r\d+)"/g)].map(x=>x[1]);
const fail=[];
if(members.length!==150) fail.push(`Expected 150 members, found ${members.length}`);
if(Math.min(...gens)!==1||Math.max(...gens)!==6) fail.push(`Expected generations 1-6, found ${Math.min(...gens)}-${Math.max(...gens)}`);
if(!relPart.includes('"relationship_type": "spouse"')) fail.push('No spouse relationships found');
if(!relPart.includes('"relationship_type": "parent"')) fail.push('No parent relationships found');
if(!membersPart.includes('"date_of_death": "')) fail.push('No deceased sample records found');
console.log(`Members: ${members.length}`); console.log(`Relationships: ${rels.length}`); console.log(`Generations: ${Math.min(...gens)}-${Math.max(...gens)}`); console.log(`Spouse relationships: ${(relPart.match(/"relationship_type": "spouse"/g)||[]).length}`); console.log(`Parent relationships: ${(relPart.match(/"relationship_type": "parent"/g)||[]).length}`); console.log(`Deceased records: ${(membersPart.match(/"date_of_death": "202/g)||[]).length}`);
if(fail.length){console.error('\nVALIDATION FAILED');fail.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('\nVALIDATION PASSED');
