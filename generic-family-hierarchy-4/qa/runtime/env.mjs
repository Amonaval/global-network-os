import fs from 'node:fs';
import path from 'node:path';
function loadEnvFile(file,{overrideExisting=false,overrideBlank=false}={}){
 if(!fs.existsSync(file))return;
 for(const raw of fs.readFileSync(file,'utf8').split(/\r?\n/)){
  const line=raw.trim(); if(!line||line.startsWith('#'))continue;
  const i=line.indexOf('='); if(i<1)continue;
  const key=line.slice(0,i).trim(); let value=line.slice(i+1).trim();
  if((value.startsWith('\"')&&value.endsWith('\"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
  if(overrideExisting||process.env[key]===undefined||(overrideBlank&&!process.env[key]))process.env[key]=value;
 }
}
export function loadQaEnv(file=path.resolve('.env.qa')){
 const resolved=path.resolve(file);
 loadEnvFile(resolved,{overrideExisting:true});
 loadEnvFile(path.resolve('qa-results/fixtures/generated.env'),{overrideBlank:true});
 process.env.QA_ENV_FILE=resolved;
 return resolved;
}

export function requiredEnv(names){const missing=names.filter(n=>!process.env[n]);if(missing.length)throw new Error(`Missing QA environment fields: ${missing.join(', ')}`)}
export function qaMode(){return process.env.QA_MODE||'readonly'}
export function isStaging(){return qaMode()==='staging'}
export function mutationAllowed(){return isStaging()&&process.env.QA_ALLOW_MUTATION==='true'}
export function assertMutationAllowed(){
 if(!mutationAllowed())throw new Error(`Mutating QA is blocked. Resolved QA_MODE=${JSON.stringify(process.env.QA_MODE||'readonly')} QA_ALLOW_MUTATION=${JSON.stringify(process.env.QA_ALLOW_MUTATION||'')} from ${process.env.QA_ENV_FILE||path.resolve('.env.qa')}. Set QA_MODE=staging and QA_ALLOW_MUTATION=true in that file.`);
 const base=process.env.QA_BASE_URL||'';
 let baseHost='';try{baseHost=new URL(base).hostname.toLowerCase()}catch{}
 if(/(^|[.-])prod(uction)?([.-]|$)/i.test(baseHost)||/(^|\.)trustweave\.(app|com)$/i.test(baseHost))throw new Error(`Hard production guard blocked mutation against ${baseHost||base}`);
 const supabase=process.env.NEXT_PUBLIC_SUPABASE_URL||'';let supabaseHost='';try{supabaseHost=new URL(supabase).hostname.toLowerCase()}catch{}
 if(/(^|[.-])prod(uction)?([.-]|$)/i.test(supabaseHost))throw new Error(`Hard production guard blocked mutation against Supabase URL ${supabaseHost}`);
 if(supabaseHost.endsWith('.supabase.co')){const actualRef=supabaseHost.split('.')[0];const expected=process.env.QA_STAGING_PROJECT_REF?.trim().toLowerCase();if(!expected)throw new Error('Mutating hosted Supabase QA requires QA_STAGING_PROJECT_REF so the runner can verify the intended staging project.');if(actualRef!==expected)throw new Error(`Supabase staging project mismatch: expected ${expected}, got ${actualRef}`)}
}

export function resultDir(...parts){return path.join('qa-results',...parts)}
export function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n')}
export function appendNdjson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.appendFileSync(file,JSON.stringify(value)+'\n')}
