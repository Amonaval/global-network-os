import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const source=fs.readFileSync(new URL('../core/intelligence/engine.ts',import.meta.url),'utf8');
const out=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
const sandbox={module,exports:module.exports,require,console,Set,Map,Object,Array,Math,String};
vm.runInNewContext(out,sandbox,{filename:'engine.js'});
const {searchNetwork,shortestPath,analyzeHealth,askNetwork}=module.exports;
const entity=(id,label,affiliations,metadata={})=>({entity:{id,networkId:'n1',kind:'person',label,metadata},affiliations});
const rel=(id,a,b,al,bl,type='works_with')=>({id,fromEntityId:a,toEntityId:b,fromLabel:al,toLabel:bl,relationshipType:type,label:type.replaceAll('_',' ')});
const org={entities:[
 entity('a','Asha Rao',{team:['Identity'],skill:['Authentication','OAuth'],city:['Pune'],product:['Identity Platform']},{role:'Principal Engineer'}),
 entity('b','Rahul Shah',{team:['Platform'],skill:['Kubernetes','Authentication'],city:['Pune'],product:['Identity Platform']},{role:'Staff Engineer'}),
 entity('c','Meera Iyer',{team:['Payments'],skill:['Payments'],city:['Mumbai'],product:['Checkout']},{role:'Engineering Manager'}),
 entity('d','Dev Patil',{team:['Platform'],skill:['Kubernetes'],city:['Pune'],product:['Runtime']},{role:'Engineer'}),
 entity('e','Nina Bose',{team:['Support'],skill:['Customer Support'],city:['Bengaluru'],product:['Checkout']},{role:'Support Lead'})
],relationships:[rel('r1','a','b','Asha Rao','Rahul Shah'),rel('r2','b','d','Rahul Shah','Dev Patil'),rel('r3','c','e','Meera Iyer','Nina Bose')],activities:[]};
const franchise={entities:[
 entity('s1','Kharadi Store',{city:['Pune'],region:['West'],format:['Mall'],topic:['Weekend staffing']},{role:'Store'}),
 entity('s2','Andheri Store',{city:['Mumbai'],region:['West'],format:['Mall'],topic:['Weekend staffing','Training']},{role:'Store'}),
 entity('s3','Koramangala Store',{city:['Bengaluru'],region:['South'],format:['High street'],topic:['Delivery']},{role:'Store'})
],relationships:[rel('fr1','s1','s2','Kharadi Store','Andheri Store','supported_by')],activities:[{id:'a1',networkId:'n1',type:'memory',title:'Andheri weekend staffing playbook',body:'Shift bidding and cross-training reduced weekend gaps.'}]};
const trust={entities:[
 entity('t1','Naval Foods',{city:['Pune'],category:['Food'],service:['Buyer']}),
 entity('t2','ABC Packaging',{city:['Pune'],category:['Packaging'],service:['Cartons']}),
 entity('t3','Sharma Industries',{city:['Pune'],category:['Manufacturing'],service:['Referral']})
],relationships:[rel('tr1','t1','t3','Naval Foods','Sharma Industries','trusts'),rel('tr2','t3','t2','Sharma Industries','ABC Packaging','recommends')],activities:[]};
const tests=[];
const assert=(ok,name,detail='')=>{tests.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`)};
assert(searchNetwork(org,'authentication').length===2,'search finds expertise');
assert(shortestPath('a','d',org.relationships).join('>')==='a>b>d','shortest path resolves known chain');
const health=analyzeHealth(org,['team','skill','city','product']);
assert(health.completeness===100,'health completeness','expected 100');
assert(health.isolatedEntityIds.length===0,'health sees no isolated entities');
const orgAnswer=askNetwork('organization',org,'Who understands authentication best?',['team','skill','city','product']);
assert(orgAnswer.matchedEntityIds.includes('a')&&orgAnswer.matchedEntityIds.includes('b'),'organization answer finds authentication experts');
const franchiseAnswer=askNetwork('franchise',franchise,'Which location can help with weekend staffing?',['city','region','format','topic']);
assert(franchiseAnswer.matchedEntityIds.includes('s1')&&franchiseAnswer.matchedEntityIds.includes('s2'),'franchise answer finds relevant locations');
const trustAnswer=askNetwork('business-trust',trust,'Who can introduce me to packaging supplier?',['city','category','service']);
assert(trustAnswer.answer.includes('Naval Foods')||trustAnswer.answer.includes('ABC Packaging')||trustAnswer.answer.includes('Sharma Industries'),'trust answer returns path evidence',trustAnswer.answer);
console.log(`G9 runtime smoke: PASS — ${tests.length}/${tests.length} deterministic behavior checks passed.`);
for(const t of tests) console.log(`PASS ${t.name}`);
