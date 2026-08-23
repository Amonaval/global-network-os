import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const checks=[
 ['031 migration exists',fs.existsSync('supabase/migrations/031_cr2_frictionless_alpha_onboarding.sql')],
 ['founder creation policy',read('supabase/migrations/031_cr2_frictionless_alpha_onboarding.sql').includes('set_family_creation_policy')],
 ['family join code backend',read('supabase/migrations/031_cr2_frictionless_alpha_onboarding.sql').includes('join_family_by_code')],
 ['verified email claim backend',read('supabase/migrations/031_cr2_frictionless_alpha_onboarding.sql').includes('claim_profile_by_verified_email')],
 ['no-family entry choices',read('components/SetupScreen.tsx').includes('Join my family')&&read('components/SetupScreen.tsx').includes('Explore a sample family')&&read('components/SetupScreen.tsx').includes('Create my family')],
 ['Excel prominent',read('components/SetupScreen.tsx').includes('Upload guided Excel')||read('components/SetupScreen.tsx').includes('Upload Excel or CSV')],
 ['demo stays read-only-labelled',read('components/NetworkApp.tsx').includes('Sample family · read-only')],
 ['family code invite UI',read('components/InvitationModal.tsx').includes('Share the Family Code')],
 ['founder auto approval toggle',read('components/FounderLaunchConsole.tsx').includes('Alpha auto-approval ON')],
 ['quick help updated',read('components/NetworkApp.tsx').includes('Quick start · Family help')],
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`);if(!ok)failed++;}
if(failed){console.error(`\n${failed} CR2 source gate(s) failed.`);process.exit(1)}
console.log(`\n${checks.length}/${checks.length} CR2 source checks passed.`);
