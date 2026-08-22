import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[
 ['migration 028 exists',fs.existsSync(path.join(root,'supabase/migrations/028_v1_alpha_release_certification.sql'))],
 ['multi-owner RPC',read('supabase/migrations/028_v1_alpha_release_certification.sql').includes('add_platform_owner_by_email')],
 ['last-owner protection',read('supabase/migrations/028_v1_alpha_release_certification.sql').includes('At least one platform owner must remain')],
 ['safe Day-1 preset',read('supabase/migrations/028_v1_alpha_release_certification.sql').includes('apply_alpha_day1_launch_preset')],
 ['forgot password action',read('components/AuthPanel.tsx').includes('Forgot password?')],
 ['password reset request',read('lib/auth.ts').includes('resetPasswordForEmail')],
 ['password recovery event',read('components/NetworkApp.tsx').includes('PASSWORD_RECOVERY')],
 ['new password action',read('lib/auth.ts').includes('updateUser({password})')],
 ['confirmation resend',read('components/AuthPanel.tsx').includes('Resend confirmation email')],
 ['platform owner UI',read('components/FounderLaunchConsole.tsx').includes('Who can control launches')],
 ['V1 release document',fs.existsSync(path.join(root,'V1-FAMILY-ALPHA-RELEASE-CERTIFICATION.md'))],
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`);if(!ok)failed++;}
if(failed){console.error(`\n${failed} V1 source gate(s) failed.`);process.exit(1)}
console.log('\nV1 source gate passed. Runtime/Supabase/device certification is still required.');
