import fs from 'node:fs';
import path from 'node:path';
import {loadQaEnv} from './runtime/env.mjs';

const target=path.resolve(process.env.QA_PHASE5C_ENV_FILE||'.env.qa.release');
if(fs.existsSync(target)){
  console.log(`Phase-5C release env already exists: ${target}`);
  console.log('No file was changed. Fill/verify the disposable project credentials there.');
  process.exit(0);
}
loadQaEnv(path.resolve('.env.qa'));
function deriveProjectRef(raw){try{const u=new URL(raw);const h=u.hostname.toLowerCase();const user=decodeURIComponent(u.username||'').toLowerCase();let m=h.match(/^db\.([a-z0-9-]+)\.supabase\.co$/);if(m)return m[1];m=user.match(/^postgres\.([a-z0-9-]+)$/);return m?m[1]:null}catch{return null}}
let evidence=null;try{evidence=JSON.parse(fs.readFileSync('qa-results/db/PHASE5B-FRESH-MIGRATION-REPLAY.json','utf8'))}catch{}
const freshDb=process.env.QA_FRESH_DATABASE_URL||'';
const ref=(evidence?.projectRef||process.env.QA_FRESH_PROJECT_REF||deriveProjectRef(freshDb)||'').trim().toLowerCase();
const freshUrl=process.env.QA_FRESH_SUPABASE_URL|| (ref?`https://${ref}.supabase.co`:'');
const protectedRef=process.env.QA_STAGING_PROJECT_REF||'';
const content=`# Phase 5C disposable release-candidate environment.\n# Generated locally by qa:phase5c:init. No database/Supabase operation was performed.\nQA_MODE=staging\nQA_ALLOW_MUTATION=true\nQA_RELEASE_ALLOW_MUTATION=true\n# Set exactly YES_DELETE_ME only after manually verifying this is the disposable project used by Phase 5B.\nQA_RELEASE_CONFIRM_DISPOSABLE=\nQA_RELEASE_PROJECT_REF=${ref}\n# Normal protected staging project that Phase 5C must never target.\nQA_RELEASE_PROTECTED_PROJECT_REF=${protectedRef}\n# Legacy mutation guard field must equal the disposable release project ref in this dedicated file.\nQA_STAGING_PROJECT_REF=${ref}\nQA_BASE_URL=http://127.0.0.1:3000\nQA_EXTERNAL_SERVER=false\nQA_RELEASE_ALLOW_REMOTE_RC=false\nNEXT_PUBLIC_SUPABASE_URL=${freshUrl}\n# Obtain these TWO keys from the disposable Phase-5B Supabase project; never copy protected staging keys.\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY=\nQA_DATABASE_URL=${freshDb}\nQA_EMAIL_DOMAIN=example.test\nQA_TEST_PASSWORD=TrustWeave-QA-Only-ChangeMe-123!\nQA_RUN_NAMESPACE=phase5c-release\n`;
fs.writeFileSync(target,content,{flag:'wx'});
console.log(`Phase-5C release env template created: ${target}`);
console.log('Fill NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and QA_RELEASE_CONFIRM_DISPOSABLE.');
console.log('Do not copy keys from your protected staging project.');
