import fs from 'node:fs';
import path from 'node:path';
import {loadQaEnv,requiredEnv,writeJson} from '../runtime/env.mjs';
import {executeSql,queryRows,queryScalar,validatePostgresUrl} from './postgres-client.mjs';
import {buildPhase5bInventory} from './phase5b-migration-inventory.mjs';

loadQaEnv();
requiredEnv(['QA_FRESH_DATABASE_URL','QA_FRESH_SUPABASE_URL','QA_FRESH_PROJECT_REF']);
const inventory=buildPhase5bInventory();
const out='qa-results/db/PHASE5B-FRESH-MIGRATION-REPLAY.json';
const result={generatedAt:new Date().toISOString(),status:'blocked',sourceFingerprint:inventory.sourceFingerprint,inventoryStatus:inventory.status,projectRef:null,checkpoint:null,rerunFrom:null,phases:[],postReplay:null,safety:{database:'disposable-only',dropsOrReset:'none',normalStagingMutation:'forbidden'}};
function finish(status,reason){result.status=status;if(reason)result.reason=reason;writeJson(out,result);console.log(`Phase-5B fresh migration replay ${status.toUpperCase()}${reason?`: ${reason}`:''}`);if(status!=='passed')process.exit(1)}
if(inventory.status!=='passed')finish('blocked','Migration source inventory is not certifiable; resolve inventory blockers first.');
if(process.env.QA_DB_ALLOW_FRESH_REPLAY!=='true'||process.env.QA_FRESH_CONFIRM_DISPOSABLE!=='YES_DELETE_ME')finish('blocked','Set QA_DB_ALLOW_FRESH_REPLAY=true and QA_FRESH_CONFIRM_DISPOSABLE=YES_DELETE_ME only for a disposable empty project.');
const db=process.env.QA_FRESH_DATABASE_URL;validatePostgresUrl(db,'QA_FRESH_DATABASE_URL');
if(process.env.QA_DATABASE_URL&&db===process.env.QA_DATABASE_URL)finish('blocked','QA_FRESH_DATABASE_URL must not equal QA_DATABASE_URL.');
const projectRef=process.env.QA_FRESH_PROJECT_REF.trim().toLowerCase();result.projectRef=projectRef;
if(process.env.QA_STAGING_PROJECT_REF&&projectRef===process.env.QA_STAGING_PROJECT_REF.trim().toLowerCase())finish('blocked','Fresh project ref must differ from QA_STAGING_PROJECT_REF.');
let publicUrl;try{publicUrl=new URL(process.env.QA_FRESH_SUPABASE_URL)}catch{finish('blocked','QA_FRESH_SUPABASE_URL must be a valid URL.');}
if(!publicUrl.hostname.endsWith('.supabase.co')||publicUrl.hostname.split('.')[0].toLowerCase()!==projectRef)finish('blocked','QA_FRESH_SUPABASE_URL does not match QA_FRESH_PROJECT_REF.');
if(/prod(uction)?/i.test(projectRef)||/prod(uction)?/i.test(publicUrl.hostname))finish('blocked','Production-like project identity rejected.');
const empty=await queryScalar(db,"select case when to_regclass('public.networks') is null and to_regclass('public.profiles') is null then 'empty' else 'not-empty' end");
if(empty!=='empty')finish('blocked','Disposable database is not empty. Phase 5B never drops/resets an existing schema.');
const checkpoint=Math.max(1,Math.min(inventory.latestAccepted-1,Number(process.env.QA_PHASE5B_CHECKPOINT||80)));
const rerunFrom=Math.max(1,Math.min(inventory.latestAccepted,Number(process.env.QA_PHASE5B_RERUN_FROM||90)));
result.checkpoint=checkpoint;result.rerunFrom=rerunFrom;
async function applyPhase(label,entries){const phase={label,status:'passed',migrations:[]};for(const entry of entries){const started=Date.now();try{await executeSql(db,fs.readFileSync(path.join('supabase/migrations',entry.name),'utf8'));phase.migrations.push({file:entry.name,number:entry.number,sha256:entry.sha256,status:'passed',durationMs:Date.now()-started});}catch(error){phase.status='failed';phase.migrations.push({file:entry.name,number:entry.number,sha256:entry.sha256,status:'failed',durationMs:Date.now()-started,error:String(error?.stack||error)});break}}result.phases.push(phase);return phase.status==='passed'}
const before=inventory.accepted.filter(x=>x.number<=checkpoint),after=inventory.accepted.filter(x=>x.number>checkpoint),rerun=inventory.accepted.filter(x=>x.number>=rerunFrom);
if(!(await applyPhase(`fresh-001-${String(checkpoint).padStart(3,'0')}`,before)))finish('failed','Fresh replay failed before checkpoint.');
const checkpointProbe=await queryRows(db,"select to_regclass('public.networks')::text networks,to_regclass('public.profiles')::text profiles,to_regclass('public.network_memberships')::text memberships");
result.checkpointProbe=checkpointProbe[0]||{};
if(!(await applyPhase(`upgrade-${String(checkpoint+1).padStart(3,'0')}-${String(inventory.latestAccepted).padStart(3,'0')}`,after)))finish('failed','Checkpoint-to-latest upgrade failed.');
if(!(await applyPhase(`rerun-${String(rerunFrom).padStart(3,'0')}-${String(inventory.latestAccepted).padStart(3,'0')}`,rerun)))finish('failed','Latest migration suffix is not rerunnable.');
const core=await queryRows(db,`select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('profiles','networks','network_memberships','network_entities','network_relationships') order by c.relname`);
const functionCount=Number(await queryScalar(db,"select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'"));
const schemaCreate=await queryRows(db,"select has_schema_privilege('anon','public','CREATE') anon_create,has_schema_privilege('authenticated','public','CREATE') authenticated_create");
const buckets=await queryRows(db,"select id,public,file_size_limit from storage.buckets where id in ('profile-photos','community-media') order by id").catch(()=>[]);
const missingCore=['profiles','networks','network_memberships','network_entities','network_relationships'].filter(name=>!core.some(x=>x.relname===name));
const rlsOff=core.filter(x=>!x.relrowsecurity).map(x=>x.relname);
const postBlockers=[];if(missingCore.length)postBlockers.push(`Missing core tables: ${missingCore.join(', ')}`);if(rlsOff.length)postBlockers.push(`Core tables without RLS: ${rlsOff.join(', ')}`);if(schemaCreate[0]?.anon_create||schemaCreate[0]?.authenticated_create)postBlockers.push('anon/authenticated retain CREATE on public schema');if(functionCount<1)postBlockers.push('No public RPC functions found after replay');
result.postReplay={coreTables:core,functionCount,schemaCreate:schemaCreate[0]||{},buckets,blockers:postBlockers,status:postBlockers.length?'failed':'passed'};
finish(postBlockers.length?'failed':'passed',postBlockers.length?postBlockers.join('; '):null);
