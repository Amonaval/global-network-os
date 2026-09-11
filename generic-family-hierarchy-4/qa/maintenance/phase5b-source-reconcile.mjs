import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const source=path.resolve('supabase/migrations/095_phase3_security_definer_null_authorization_hardening.sql');
const target=path.resolve('supabase/migrations/098_phase3_security_definer_null_authorization_hardening.sql');
const expectedSha256='cfaf41dc73a99e4186d566d1e76e6d7a86081858ded096156f63c0c2d34c6331';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

if(!fs.existsSync(source)&&fs.existsSync(target)){
  console.log('Phase-5B source reconciliation already complete: Phase-3 security hardening is 098.');
  process.exit(0);
}
if(!fs.existsSync(source)){
  console.error('Phase-5B source reconciliation BLOCKED: expected source migration 095_phase3_security_definer_null_authorization_hardening.sql was not found. No files changed.');
  process.exit(1);
}
if(fs.existsSync(target)){
  console.error('Phase-5B source reconciliation BLOCKED: target 098 migration already exists while source 095 also exists. No files changed.');
  process.exit(1);
}
const actual=hash(source);
if(actual!==expectedSha256){
  console.error(`Phase-5B source reconciliation BLOCKED: 095 Phase-3 migration content hash differs from the certified P3-SEC-001 migration. Expected ${expectedSha256}, got ${actual}. No files changed.`);
  process.exit(1);
}
fs.renameSync(source,target);
console.log('Phase-5B source reconciliation PASS: renamed 095_phase3_security_definer_null_authorization_hardening.sql -> 098_phase3_security_definer_null_authorization_hardening.sql.');
console.log('No database/Supabase operation was performed. Versions 096 and 097 remain reserved and must not be reused.');
