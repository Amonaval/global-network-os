import fs from 'node:fs';
import path from 'node:path';
import {assertMutationAllowed,loadQaEnv,writeJson} from '../runtime/env.mjs';
import {executeSql,queryScalar,validatePostgresUrl} from './postgres-client.mjs';

loadQaEnv();
assertMutationAllowed();

const migrations=fs.readdirSync('supabase/migrations')
  .filter(x=>/^\d+_.*\.sql$/.test(x))
  .sort((a,b)=>Number(a.match(/^\d+/)?.[0])-Number(b.match(/^\d+/)?.[0])||a.localeCompare(b));
const numberOf=(name)=>Number(name.match(/^\d+/)?.[0]||0);
const latest=Math.max(...migrations.map(numberOf));
const checkpoint=Math.max(1,Math.min(latest-1,Number(process.env.QA_DB_UPGRADE_CHECKPOINT||80)));
const rerunFrom=Math.max(1,Math.min(latest,Number(process.env.QA_DB_RERUN_FROM||90)));

function safeDb(url,label,{fresh=false}={}){
  if(!url)return null;
  const u=validatePostgresUrl(url,label);
  const host=u.hostname.toLowerCase();
  if(/(^|[.-])prod(uction)?([.-]|$)/.test(host))throw new Error(`Refusing production-like DB host: ${host}`);
  const expected=process.env.QA_STAGING_PROJECT_REF?.trim().toLowerCase();
  // Direct Supabase hosts contain the project ref. Pooler hosts commonly do not, so the
  // staging project ref guard is enforced separately through NEXT_PUBLIC_SUPABASE_URL.
  if(host.endsWith('.supabase.co')&&!host.includes('pooler.supabase.com')){
    if(!expected)throw new Error('QA_STAGING_PROJECT_REF is required for hosted Supabase migration replay');
    if(!host.includes(expected))throw new Error(`Database host does not match QA_STAGING_PROJECT_REF ${expected}: ${host}`);
  }
  if(fresh && url===process.env.QA_DATABASE_URL)throw new Error('QA_FRESH_DATABASE_URL must not equal QA_DATABASE_URL');
  return url;
}
async function apply(url,name){
  const file=path.join('supabase/migrations',name);
  const sql=fs.readFileSync(file,'utf8');
  try{
    await executeSql(url,sql);
    return {file:name,number:numberOf(name),status:'passed'};
  }catch(error){
    return {file:name,number:numberOf(name),status:'failed',error:String(error?.stack||error)};
  }
}
async function phase(url,names,label){
  const result={label,status:'passed',migrations:[]};
  for(const name of names){const row=await apply(url,name);result.migrations.push(row);if(row.status==='failed'){result.status='failed';break}}
  return result;
}

const upgrade=safeDb(process.env.QA_DATABASE_URL,'QA_DATABASE_URL');
const fresh=safeDb(process.env.QA_FRESH_DATABASE_URL,'QA_FRESH_DATABASE_URL',{fresh:true});
const results={generatedAt:new Date().toISOString(),driver:'node-pg',latestMigration:latest,checkpoint,rerunFrom,
  upgrade:{status:'blocked',reason:'QA_DATABASE_URL not set',phases:[]},
  fresh:{status:'blocked',reason:'QA_FRESH_DATABASE_URL not set',phases:[]}};

if(upgrade){
  const p=await phase(upgrade,migrations.filter(x=>numberOf(x)>=rerunFrom),`staging-rerun-${rerunFrom}-${latest}`);
  results.upgrade={status:p.status,phases:[p]};
}

if(fresh){
  if(process.env.QA_DB_ALLOW_FRESH_REPLAY!=='true'){
    results.fresh={status:'blocked',reason:'Set QA_DB_ALLOW_FRESH_REPLAY=true for a disposable empty QA DB',phases:[]};
  }else{
    const hasAppSchema=await queryScalar(fresh,"select case when to_regclass('public.networks') is null then 'empty' else 'not-empty' end");
    if(hasAppSchema!=='empty'){
      results.fresh={status:'blocked',reason:'QA_FRESH_DATABASE_URL is not empty: public.networks already exists. Point it at a disposable empty QA database.',phases:[]};
    }else{
      const phases=[];
      phases.push(await phase(fresh,migrations.filter(x=>numberOf(x)<=checkpoint),`fresh-to-checkpoint-${checkpoint}`));
      if(phases.at(-1).status==='passed')phases.push(await phase(fresh,migrations.filter(x=>numberOf(x)>checkpoint),`historical-upgrade-${checkpoint+1}-${latest}`));
      if(phases.at(-1).status==='passed')phases.push(await phase(fresh,migrations.filter(x=>numberOf(x)>=rerunFrom),`post-upgrade-rerun-${rerunFrom}-${latest}`));
      results.fresh={status:phases.every(p=>p.status==='passed')?'passed':'failed',phases};
    }
  }
}

writeJson('qa-results/db/migration-replay.json',results);
console.log(`Migration replay (Node pg): staging=${results.upgrade.status}; fresh/checkpoint=${results.fresh.status}; checkpoint=${checkpoint}; rerunFrom=${rerunFrom}`);
if(results.upgrade.status==='failed'||results.fresh.status==='failed')process.exit(1);
