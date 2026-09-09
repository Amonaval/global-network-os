import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {IMPORT_SCHEMA_REGISTRY} from '../../core/import/registry';
import {createImportWorkbook} from '../../core/import/workbook';
import {parseImportWorkbook} from '../../core/import/parser';
import {getImportWorkbookSheetNames} from '../../core/import/sheet-names';
import {NETWORK_BACKUP_FORMAT,NETWORK_BACKUP_VERSION,isNetworkBackup,type NetworkBackup} from '../../core/export/contracts';
import {createBackupWorkbook} from '../../core/export/workbook';
import {VERTICALS} from '../runtime/catalog.mjs';

const toArrayBuffer=(wb:XLSX.WorkBook)=>{
  const bytes=XLSX.write(wb,{type:'array',bookType:'xlsx'}) as ArrayBuffer|Uint8Array;
  if(bytes instanceof ArrayBuffer)return bytes.slice(0);
  return bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer;
};
const semantic=(wb:XLSX.WorkBook)=>({
  sheets:[...wb.SheetNames],
  rows:Object.fromEntries(wb.SheetNames.map(name=>[name,XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,defval:'',raw:false})]))
});

test('Phase 4B import/export data contracts cover exactly the nine released verticals',()=>{
  assert.deepEqual(Object.keys(IMPORT_SCHEMA_REGISTRY).sort(),VERTICALS.map(v=>v.kind).sort());
});

test('Phase 4B generated workbooks are semantically deterministic for all released verticals',()=>{
  for(const [kind,schema] of Object.entries(IMPORT_SCHEMA_REGISTRY)){
    const a=semantic(createImportWorkbook(schema));
    const b=semantic(createImportWorkbook(schema));
    assert.deepEqual(a,b,`${kind} workbook generation drifted between identical runs`);
  }
});

test('Phase 4B every generated workbook round-trips through the real parser without rejection',async()=>{
  for(const [kind,schema] of Object.entries(IMPORT_SCHEMA_REGISTRY)){
    const review=await parseImportWorkbook(toArrayBuffer(createImportWorkbook(schema)),`${kind}.xlsx`,schema);
    assert.equal(review.canCommit,true,`${kind}: ${review.issues.map(i=>`${i.code}:${i.message}`).join(' | ')}`);
    assert.equal(review.rejectedRows,0,`${kind} generated sample has rejected rows`);
    assert.ok(review.validRows+review.warningRows>0,`${kind} generated sample has no importable rows`);
  }
});

test('Phase 4B every vertical rejects a workbook missing a required sheet',async()=>{
  for(const [kind,schema] of Object.entries(IMPORT_SCHEMA_REGISTRY)){
    const required=schema.sheets.find(s=>s.required);assert.ok(required,`${kind} needs a required import sheet`);
    const wb=createImportWorkbook(schema);
    const names=getImportWorkbookSheetNames(schema);
    const generated=names.get(required!.key)!;
    delete wb.Sheets[generated];wb.SheetNames=wb.SheetNames.filter(n=>n!==generated);
    const review=await parseImportWorkbook(toArrayBuffer(wb),`${kind}-missing-sheet.xlsx`,schema);
    assert.equal(review.canCommit,false,`${kind} accepted workbook missing ${required!.name}`);
    assert.ok(review.issues.some(i=>i.code==='MISSING_SHEET'&&i.sheet===required!.name),`${kind} did not report MISSING_SHEET`);
  }
});

test('Phase 4B every vertical rejects a required-sheet workbook missing a required column',async()=>{
  for(const [kind,schema] of Object.entries(IMPORT_SCHEMA_REGISTRY)){
    const sheet=schema.sheets.find(s=>s.required&&s.columns.some(c=>c.required));assert.ok(sheet,`${kind} needs a required column`);
    const requiredCol=sheet!.columns.find(c=>c.required)!;
    const wb=createImportWorkbook(schema);const generated=getImportWorkbookSheetNames(schema).get(sheet!.key)!;
    const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(wb.Sheets[generated],{defval:'',raw:true});
    for(const row of rows)delete row[requiredCol.label];
    wb.Sheets[generated]=XLSX.utils.json_to_sheet(rows);
    const review=await parseImportWorkbook(toArrayBuffer(wb),`${kind}-missing-column.xlsx`,schema);
    assert.equal(review.canCommit,false,`${kind} accepted workbook missing ${requiredCol.label}`);
    assert.ok(review.issues.some(i=>i.code==='MISSING_COLUMN'&&i.column===requiredCol.label),`${kind} did not report MISSING_COLUMN`);
  }
});

test('Phase 4B unknown workbook sheets are non-destructive warnings while valid data remains importable',async()=>{
  for(const [kind,schema] of Object.entries(IMPORT_SCHEMA_REGISTRY)){
    const wb=createImportWorkbook(schema);XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Ignored'],['value']]),'QA Unknown Sheet');
    const review=await parseImportWorkbook(toArrayBuffer(wb),`${kind}-unknown-sheet.xlsx`,schema);
    assert.equal(review.canCommit,true,`${kind} unknown sheet should not invalidate otherwise valid workbook`);
    assert.ok(review.issues.some(i=>i.code==='UNKNOWN_SHEET'&&i.severity==='warning'),`${kind} did not report UNKNOWN_SHEET warning`);
  }
});

test('Phase 4B family parser simultaneously rejects duplicate IDs, invalid email and unresolved references',async()=>{
  const schema=IMPORT_SCHEMA_REGISTRY.family;const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([
    {'Person ID':'P001','Full Name':'One','Email':'not-an-email'},
    {'Person ID':'P001','Full Name':'Two','Email':'two@example.test'}
  ]),'Family Members');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([
    {'Person ID':'P001','Related Person ID':'P404','Relationship':'Spouse'}
  ]),'Relationships');
  const review=await parseImportWorkbook(toArrayBuffer(wb),'phase4b-invalid-family.xlsx',schema);const codes=new Set(review.issues.map(i=>i.code));
  assert.equal(review.canCommit,false);assert.ok(codes.has('DUPLICATE_STABLE_ID'));assert.ok(codes.has('INVALID_VALUE'));assert.ok(codes.has('UNRESOLVED_REFERENCE'));
});

test('Phase 4B logical backup/workbook preserve manifest-only media and never embed media bytes',()=>{
  const backup:NetworkBackup={format:NETWORK_BACKUP_FORMAT,version:NETWORK_BACKUP_VERSION,schemaVersion:'phase4b',exportedAt:'2026-09-10T00:00:00.000Z',networkId:'00000000-0000-0000-0000-000000000001',network:{name:'Phase 4B Network'},datasets:{members:[{id:'1',name:'A'}],relationships:[{id:'r1'}],empty:[]},excludedSecurityDatasets:['tokens','sessions'],restore:{fullAutomaticRestore:false,guidedWorkbookReimport:true,reason:'Guided recovery'},media:{strategy:'manifest',buckets:{'community-media':['network/community/u/a.png'],'profile-photos':['network/profiles/u/a.png']},objectCount:2,contentIncluded:false,limitations:['bytes excluded']}};
  assert.equal(isNetworkBackup(backup),true);assert.equal(backup.media.contentIncluded,false);assert.equal(backup.media.strategy,'manifest');
  const wb=createBackupWorkbook(backup);assert.ok(wb.SheetNames.includes('README'));assert.ok(wb.SheetNames.includes('Media Manifest'));assert.equal(wb.SheetNames.includes('empty'),false);
  const all=JSON.stringify(semantic(wb));assert.equal(all.includes('data:image/'),false);assert.equal(all.includes('base64'),false);
});
