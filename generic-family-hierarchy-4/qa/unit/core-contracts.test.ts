import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {IMPORT_SCHEMA_KINDS,IMPORT_SCHEMA_REGISTRY,getImportSchema} from '../../core/import/registry';
import {getImportWorkbookSheetNames} from '../../core/import/sheet-names';
import {createImportWorkbook} from '../../core/import/workbook';
import {parseImportWorkbook} from '../../core/import/parser';
import {QUICK_START_REGISTRY} from '../../core/activation/quick-start';
import {evaluateNetworkHealth} from '../../core/readiness/network-health';
import {validateGraphRelationship,buildGovernedEdge,graphAdjacency} from '../../core/graph/runtime';
import {NETWORK_BACKUP_FORMAT,NETWORK_BACKUP_VERSION,isNetworkBackup,type NetworkBackup} from '../../core/export/contracts';
import {createBackupWorkbook} from '../../core/export/workbook';
import {CommandError,normalizeCommandError} from '../../server/shared/errors';
import {booleanValue,objectBody,optionalText,text} from '../../server/shared/validation';
import {VERTICALS} from '../runtime/catalog.mjs';

const expectedKinds=VERTICALS.map(v=>v.kind).sort();
const toArrayBuffer=(wb:XLSX.WorkBook)=>{
  const bytes=XLSX.write(wb,{type:'array',bookType:'xlsx'}) as ArrayBuffer|Uint8Array;
  if(bytes instanceof ArrayBuffer)return bytes.slice(0);
  return bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer;
};

test('Q1 vertical registries cover exactly the same nine released kinds',()=>{
  assert.deepEqual([...IMPORT_SCHEMA_KINDS].sort(),expectedKinds);
  assert.deepEqual(Object.keys(QUICK_START_REGISTRY).sort(),expectedKinds);
  for(const kind of expectedKinds){
    assert.equal(getImportSchema(kind as any).verticalKind,kind);
    assert.equal(QUICK_START_REGISTRY[kind as keyof typeof QUICK_START_REGISTRY].kind,kind);
  }
});

test('Q1 import schemas are deterministic, Excel-safe and internally unique',()=>{
  for(const schema of Object.values(IMPORT_SCHEMA_REGISTRY)){
    assert.ok(schema.version.trim());
    assert.ok(schema.sheets.length>=1,`${schema.verticalKind} has sheets`);
    const keys=schema.sheets.map(s=>s.key.toLowerCase());
    assert.equal(new Set(keys).size,keys.length,`${schema.verticalKind} unique sheet keys`);
    const names=[...getImportWorkbookSheetNames(schema).values()];
    assert.equal(new Set(names.map(n=>n.toLowerCase())).size,names.length,`${schema.verticalKind} safe sheet names unique`);
    for(const name of names){assert.ok(name.length<=31,`${schema.verticalKind}/${name} <=31 chars`);assert.equal(/[:\\/?*\[\]]/.test(name),false,`${name} contains no illegal Excel chars`)}
    for(const sheet of schema.sheets){
      const columnKeys=sheet.columns.map(c=>c.key.toLowerCase());
      assert.equal(new Set(columnKeys).size,columnKeys.length,`${schema.verticalKind}/${sheet.key} unique columns`);
      for(const col of sheet.columns.filter(c=>c.required))assert.ok(col.target!=='ignore',`${schema.verticalKind}/${sheet.key}/${col.key} required column has target`);
      for(const ref of sheet.columns.filter(c=>c.type==='reference')){const targets=ref.referenceSheets?.length?[...ref.referenceSheets]:ref.referenceSheet?[ref.referenceSheet]:[];assert.ok(targets.length>0,`${schema.verticalKind}/${sheet.key}/${ref.key} declares reference target(s)`);for(const target of targets)assert.ok(schema.sheets.some(s=>s.name===target),`${schema.verticalKind}/${sheet.key}/${ref.key} points to real sheet ${target}`)}
    }
  }
});

test('Q1 generated guided workbooks round-trip through the real parser for all verticals',async()=>{
  for(const schema of Object.values(IMPORT_SCHEMA_REGISTRY)){
    const wb=createImportWorkbook(schema);
    assert.ok(wb.SheetNames.includes('README'));
    assert.ok(wb.SheetNames.includes('Column Guide'));
    const review=await parseImportWorkbook(toArrayBuffer(wb),`${schema.verticalKind}.xlsx`,schema);
    assert.equal(review.canCommit,true,`${schema.verticalKind}: ${review.issues.map(i=>`${i.code}:${i.message}`).join(' | ')}`);
    assert.equal(review.rejectedRows,0,`${schema.verticalKind} has no rejected sample rows`);
    assert.ok(review.validRows+review.warningRows>0,`${schema.verticalKind} has importable sample rows`);
  }
});

test('Q1 family import parser rejects duplicate IDs, bad email and unresolved references',async()=>{
  const schema=IMPORT_SCHEMA_REGISTRY.family;
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([
    {'Person ID':'P001','Full Name':'One','Email':'bad-email'},
    {'Person ID':'P001','Full Name':'Two','Email':'two@example.test'}
  ]),'Family Members');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([
    {'Person ID':'P001','Related Person ID':'P404','Relationship':'Spouse'}
  ]),'Relationships');
  const review=await parseImportWorkbook(toArrayBuffer(wb),'invalid-family.xlsx',schema);
  assert.equal(review.canCommit,false);
  const codes=new Set(review.issues.map(i=>i.code));
  assert.ok(codes.has('DUPLICATE_STABLE_ID'));
  assert.ok(codes.has('INVALID_VALUE'));
  assert.ok(codes.has('UNRESOLVED_REFERENCE'));
  assert.ok(review.rejectedRows>=2);
});

test('Q1 every quick-start definition has unique executable steps and an import path',()=>{
  const allowedRoles=new Set(['owner','admin','member']);
  for(const [kind,definition] of Object.entries(QUICK_START_REGISTRY)){
    assert.ok(definition.title.trim()&&definition.description.trim());
    assert.ok(definition.steps.length>=3,`${kind} has meaningful activation depth`);
    assert.equal(new Set(definition.steps.map(s=>s.id)).size,definition.steps.length,`${kind} unique step IDs`);
    assert.ok(definition.steps.some(s=>s.action==='import'),`${kind} includes guided import`);
    for(const step of definition.steps){
      assert.ok(step.actionLabel.trim());assert.ok(step.title.trim());assert.ok(step.description.trim());
      assert.ok(allowedRoles.has(step.minimumRole));
      if(step.completeWhen)assert.ok(step.completeWhen.atLeast>0,`${kind}/${step.id} completion threshold positive`);
    }
  }
});

test('Q1 network health readiness does not mark attention states ready except admin redundancy',()=>{
  const healthy=evaluateNetworkHealth({activeMembers:10,totalProfiles:10,claimedProfiles:10,profileCompletion:100,structureCount:2,pendingWork:0,importIssues:0,activeAdmins:2,storageUsagePercent:10,activeCapabilities:4},0);
  assert.equal(healthy.score,100);assert.equal(healthy.ready,true);
  const importBroken=evaluateNetworkHealth({activeMembers:10,totalProfiles:10,claimedProfiles:10,profileCompletion:100,structureCount:2,pendingWork:0,importIssues:1,activeAdmins:2,storageUsagePercent:10,activeCapabilities:4},0);
  assert.equal(importBroken.ready,false);
  const singleAdmin=evaluateNetworkHealth({activeMembers:10,totalProfiles:10,claimedProfiles:10,profileCompletion:100,structureCount:2,pendingWork:0,importIssues:0,activeAdmins:1,storageUsagePercent:10,activeCapabilities:4},0);
  assert.ok(singleAdmin.score>=70);assert.equal(singleAdmin.ready,true,'single-admin warning alone may remain launch-ready by design');
});

test('Q1 graph relationship validation enforces missing endpoints, self edge and kind constraints',()=>{
  const person=(id:string)=>({entity:{id,kind:'person',label:id},affiliations:{}} as any);
  const org=(id:string)=>({entity:{id,kind:'organization',label:id},affiliations:{}} as any);
  const rule={key:'member_of',label:'Member of',direction:'directed' as const,fromKinds:['person'],toKinds:['organization'],allowSelf:false};
  assert.equal(validateGraphRelationship(person('p1'),org('o1'),rule).valid,true);
  assert.equal(validateGraphRelationship(undefined,org('o1'),rule).valid,false);
  assert.equal(validateGraphRelationship(org('o2'),org('o1'),rule).valid,false);
  assert.equal(validateGraphRelationship(person('same'),person('same'),rule).valid,false);
  assert.equal(validateGraphRelationship(person('p1'),org('o1'),undefined).valid,false);
  const edge=buildGovernedEdge('a','b','knows',{source:'evidence',status:'confirmed',confidence:7});
  assert.equal(edge.metadata.governance.confidence,1,'confidence is clamped');
  const adjacency=graphAdjacency([{fromEntityId:'a',toEntityId:'b'},{fromEntityId:'b',toEntityId:'c'}]);
  assert.deepEqual([...adjacency.get('b')!].sort(),['a','c']);
});

test('Q1 backup contract and workbook preserve manifest-only media semantics',()=>{
  const backup:NetworkBackup={format:NETWORK_BACKUP_FORMAT,version:NETWORK_BACKUP_VERSION,schemaVersion:'qa',exportedAt:'2026-09-08T00:00:00.000Z',networkId:'00000000-0000-0000-0000-000000000001',network:{name:'QA / Network'},datasets:{members:[{id:'1',name:'A'}],empty:[]},excludedSecurityDatasets:['tokens'],restore:{fullAutomaticRestore:false,guidedWorkbookReimport:true,reason:'QA'},media:{strategy:'manifest',buckets:{'community-media':['n/a.png']},objectCount:1,contentIncluded:false,limitations:['content excluded']}};
  assert.equal(isNetworkBackup(backup),true);
  assert.equal(isNetworkBackup({...backup,format:'wrong'}),false);
  const wb=createBackupWorkbook(backup);
  assert.ok(wb.SheetNames.includes('README'));
  assert.ok(wb.SheetNames.includes('members'));
  assert.ok(wb.SheetNames.includes('Media Manifest'));
  assert.equal(wb.SheetNames.includes('empty'),false);
  for(const name of wb.SheetNames){assert.ok(name.length<=31);assert.equal(/[:\\/?*\[\]]/.test(name),false)}
});

test('Q1 API validation/error normalization preserves stable status classes',()=>{
  assert.deepEqual(objectBody({a:1}),{a:1});
  assert.throws(()=>objectBody([]),CommandError);
  assert.equal(text(' x ','field'), 'x');
  assert.throws(()=>text('','field'),CommandError);
  assert.equal(optionalText('   '),undefined);
  assert.equal(booleanValue(true,'enabled'),true);
  assert.throws(()=>booleanValue('true','enabled'),CommandError);
  assert.equal(normalizeCommandError(new CommandError('X','x',409)).status,409);
  assert.equal(normalizeCommandError(new Error('JWT session missing')).status,401);
  assert.equal(normalizeCommandError(new Error('RLS policy denied')).status,403);
  assert.equal(normalizeCommandError(new Error('other')).status,400);
});
