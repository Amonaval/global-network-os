import test from 'node:test';
import assert from 'node:assert/strict';
import {validateNetwork} from '../../lib/validation';
import {validateGraphRelationship} from '../../core/graph/runtime';
import {HOUSING_SOCIETY_TEMPLATE} from '../../templates/housing-society/definition';
import {FAMILY_ASSOCIATION_TEMPLATE} from '../../templates/family-association/definition';
import {ASSOCIATION_TEMPLATE} from '../../templates/association/definition';
import {ORGANIZATION_TEMPLATE} from '../../templates/organization/definition';
import {BUSINESS_TRUST_TEMPLATE} from '../../templates/business-trust/definition';
import {FRANCHISE_TEMPLATE} from '../../templates/franchise/definition';
import {PROFESSIONAL_TEMPLATE} from '../../templates/professional/definition';
import {ALUMNI_VERTICAL} from '../../verticals/alumni/definition';
import {PRODUCTIZED_NETWORK_CONFIGS} from '../../templates/productized/config';

const relKeys=(x:{relationships:readonly {key:string}[]})=>x.relationships.map(r=>r.key);
const dims=(x:{dimensions:readonly {key:string}[]})=>x.dimensions.map(d=>d.key);
const entity=(kind:string,id:string)=>({entity:{id,networkId:'n',kind,label:id,metadata:{}},affiliations:{}} as any);
const rule=(template:any,key:string)=>template.relationships.find((r:any)=>r.key===key);

// Family is not a productized template: certify its own kinship validator rather than forcing generic graph semantics.
test('Phase 4D Family kinship rules reject self-links, duplicates, generation inversion and parent/child cycles',()=>{
  const members:any[]=[
    {id:'a',full_name:'A',generation_level:1},{id:'b',full_name:'B',generation_level:2},{id:'c',full_name:'C',generation_level:3}
  ];
  const relationships:any[]=[
    {id:'self',person_id:'a',related_person_id:'a',relationship_type:'spouse'},
    {id:'p1',person_id:'a',related_person_id:'b',relationship_type:'parent'},
    {id:'p2',person_id:'a',related_person_id:'b',relationship_type:'parent'},
    {id:'bad-order',person_id:'c',related_person_id:'a',relationship_type:'parent'},
    {id:'cycle',person_id:'b',related_person_id:'a',relationship_type:'parent'}
  ];
  const report=validateNetwork(members,relationships);
  const codes=new Set(report.errors.map(x=>x.code));
  for(const code of ['SELF_RELATIONSHIP','DUPLICATE_RELATIONSHIP','GENERATION_ORDER','RELATIONSHIP_CYCLE'])assert.ok(codes.has(code),`missing Family rule ${code}`);
});

test('Phase 4D Housing Society is unit-centric and keeps ownership, tenancy, residency and household membership distinct',()=>{
  assert.equal(HOUSING_SOCIETY_TEMPLATE.primaryEntityKind,'unit');
  assert.deepEqual(relKeys(HOUSING_SOCIETY_TEMPLATE).slice(0,6),['owned_by','co_owned_by','occupied_by','tenanted_by','member_of_household','resident_of']);
  for(const key of ['building','wing','floor','occupancy_status','resident_type','parking_zone'])assert.ok(dims(HOUSING_SOCIETY_TEMPLATE).includes(key));
  assert.equal(validateGraphRelationship(entity('unit','u'),entity('person','p'),rule(HOUSING_SOCIETY_TEMPLATE,'owned_by')).valid,true);
  assert.equal(validateGraphRelationship(entity('person','p'),entity('unit','u'),rule(HOUSING_SOCIETY_TEMPLATE,'owned_by')).valid,false,'residency/person identity must not be accepted as ownership source');
  assert.match(PRODUCTIZED_NETWORK_CONFIGS['housing-society'].relationshipHelp,/Never infer ownership from residency/i);
});

test('Phase 4D Family Association uses family as the paid membership unit and preserves first-class people/representatives',()=>{
  assert.equal(FAMILY_ASSOCIATION_TEMPLATE.primaryEntityKind,'family');
  for(const key of ['membership_year','membership_status','chapter','area','profession','committee'])assert.ok(dims(FAMILY_ASSOCIATION_TEMPLATE).includes(key));
  assert.deepEqual(relKeys(FAMILY_ASSOCIATION_TEMPLATE).slice(0,5),['represented_by','member_of_family','spouse_of','parent_of','serves_on']);
  assert.equal(validateGraphRelationship(entity('family','f'),entity('person','p'),rule(FAMILY_ASSOCIATION_TEMPLATE,'represented_by')).valid,true);
  assert.equal(validateGraphRelationship(entity('household','h'),entity('person','p'),rule(FAMILY_ASSOCIATION_TEMPLATE,'represented_by')).valid,false);
  assert.match(FAMILY_ASSOCIATION_TEMPLATE.notes.join(' '),/Family is the annual paid membership unit/i);
});

test('Phase 4D generic Association stays household-based and does not collapse into Family Association semantics',()=>{
  assert.equal(ASSOCIATION_TEMPLATE.primaryEntityKind,'household');
  assert.ok(relKeys(ASSOCIATION_TEMPLATE).includes('member_of_household'));
  assert.equal(relKeys(ASSOCIATION_TEMPLATE).includes('member_of_family'),false);
  assert.equal(validateGraphRelationship(entity('household','h'),entity('person','p'),rule(ASSOCIATION_TEMPLATE,'represented_by')).valid,true);
  assert.equal(validateGraphRelationship(entity('family','f'),entity('person','p'),rule(ASSOCIATION_TEMPLATE,'represented_by')).valid,false);
  assert.match(ASSOCIATION_TEMPLATE.notes.join(' '),/Formal elections are a governed extension/i);
});

test('Phase 4D Alumni stays cohort/institutional and does not inherit Family kinship semantics',()=>{
  assert.equal(ALUMNI_VERTICAL.kind,'alumni');
  assert.ok(ALUMNI_VERTICAL.capabilities.includes('domain.institutional-membership'));
  assert.equal(ALUMNI_VERTICAL.legacyNetworkLabels.levelLabel,'Batch Year');
  assert.equal(ALUMNI_VERTICAL.legacyNetworkLabels.peerLabel,'Classmate');
  assert.notEqual(ALUMNI_VERTICAL.legacyNetworkLabels.levelLabel,'Generation');
});

test('Phase 4D Organization relationship vocabulary remains reporting/collaboration/dependency specific',()=>{
  assert.equal(ORGANIZATION_TEMPLATE.primaryEntityKind,'person');
  assert.deepEqual(relKeys(ORGANIZATION_TEMPLATE),['reports_to','works_with','owns','depends_on']);
  assert.deepEqual(dims(ORGANIZATION_TEMPLATE),['region','business_unit','department','team','project','skill']);
});

test('Phase 4D Business Trust relationship vocabulary preserves provenance-oriented trust semantics',()=>{
  assert.equal(BUSINESS_TRUST_TEMPLATE.primaryEntityKind,'organization');
  assert.deepEqual(relKeys(BUSINESS_TRUST_TEMPLATE),['recommends','verified_by','supplies_to','worked_with']);
  assert.ok(dims(BUSINESS_TRUST_TEMPLATE).includes('category'));assert.ok(dims(BUSINESS_TRUST_TEMPLATE).includes('service'));
  assert.match(PRODUCTIZED_NETWORK_CONFIGS['business-trust'].relationshipHelp,/provenance/i);
});

test('Phase 4D Franchise keeps branch/location, geography, ownership and operator semantics separate',()=>{
  assert.equal(FRANCHISE_TEMPLATE.primaryEntityKind,'branch');
  assert.ok(FRANCHISE_TEMPLATE.entityKinds.includes('location'));
  assert.deepEqual(relKeys(FRANCHISE_TEMPLATE),['owns','operates','manages','supports']);
  assert.deepEqual(dims(FRANCHISE_TEMPLATE),['country','state','city','store_type','owner']);
  assert.equal(PRODUCTIZED_NETWORK_CONFIGS.franchise.primaryEntityLabel,'Location');
});

test('Phase 4D Professional network preserves expertise/referral/mentoring rules and regulated-clinical boundary',()=>{
  assert.equal(PROFESSIONAL_TEMPLATE.primaryEntityKind,'person');
  assert.deepEqual(relKeys(PROFESSIONAL_TEMPLATE),['worked_with','referred_by','collaborates_with','mentors']);
  assert.equal(validateGraphRelationship(entity('person','mentor'),entity('person','mentee'),rule(PROFESSIONAL_TEMPLATE,'mentors')).valid,true);
  assert.equal(validateGraphRelationship(entity('organization','org'),entity('person','mentee'),rule(PROFESSIONAL_TEMPLATE,'mentors')).valid,false);
  assert.match(PROFESSIONAL_TEMPLATE.notes.join(' '),/Healthcare patient data and regulated clinical workflows are explicitly out of scope/i);
});
