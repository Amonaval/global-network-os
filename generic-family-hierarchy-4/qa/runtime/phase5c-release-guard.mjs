import fs from 'node:fs';
import path from 'node:path';
import {loadQaEnv} from './env.mjs';

export function loadAndAssertPhase5cReleaseCandidate(){
  const file=path.resolve(process.env.QA_PHASE5C_ENV_FILE||'.env.qa.release');
  if(!fs.existsSync(file))throw new Error(`Phase-5C setup required: ${file} does not exist. Run npm run qa:phase5c:init, then fill only the disposable project credentials.`);
  process.env.QA_ENV_FILE=file;loadQaEnv(file);
  const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','QA_DATABASE_URL','QA_RELEASE_PROJECT_REF'];
  const missing=required.filter(k=>!process.env[k]);if(missing.length)throw new Error(`Phase-5C setup required: missing ${missing.join(', ')} in ${file}. No database action was performed.`);
  const fail=(m)=>{throw new Error(`Phase-5C release-candidate guard: ${m}`)};
  if(process.env.QA_MODE!=='staging'||process.env.QA_ALLOW_MUTATION!=='true'||process.env.QA_RELEASE_ALLOW_MUTATION!=='true')fail('QA_MODE=staging, QA_ALLOW_MUTATION=true and QA_RELEASE_ALLOW_MUTATION=true are all required.');
  if(process.env.QA_RELEASE_CONFIRM_DISPOSABLE!=='YES_DELETE_ME')fail('QA_RELEASE_CONFIRM_DISPOSABLE=YES_DELETE_ME is required.');
  const ref=process.env.QA_RELEASE_PROJECT_REF.trim().toLowerCase();let u;try{u=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)}catch{fail('NEXT_PUBLIC_SUPABASE_URL is invalid.');}
  const actual=u.hostname.endsWith('.supabase.co')?u.hostname.split('.')[0].toLowerCase():'';if(!actual||actual!==ref)fail(`Supabase project mismatch: expected ${ref}, got ${actual||u.hostname}.`);
  if(process.env.QA_STAGING_PROJECT_REF?.trim().toLowerCase()!==ref)fail('QA_STAGING_PROJECT_REF must equal the disposable release project ref because legacy mutation guards use that field.');
  const protectedRef=process.env.QA_RELEASE_PROTECTED_PROJECT_REF?.trim().toLowerCase();if(protectedRef&&protectedRef===ref)fail('release project equals QA_RELEASE_PROTECTED_PROJECT_REF (normal staging/protected project).');
  if(/prod(uction)?/i.test(ref)||/prod(uction)?/i.test(u.hostname))fail('production-like Supabase project identity rejected.');
  const base=process.env.QA_BASE_URL||'http://127.0.0.1:3000';let b;try{b=new URL(base)}catch{fail('QA_BASE_URL is invalid.');}
  const local=['127.0.0.1','localhost'].includes(b.hostname.toLowerCase());if(!local&&process.env.QA_RELEASE_ALLOW_REMOTE_RC!=='true')fail('remote release URL requires QA_RELEASE_ALLOW_REMOTE_RC=true.');
  if(/prod(uction)?|trustweave/i.test(b.hostname)&&!local)fail('production-like application host rejected.');
  return {envFile:file,projectRef:ref,baseURL:base};
}
