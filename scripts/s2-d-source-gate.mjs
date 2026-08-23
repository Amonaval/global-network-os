import fs from 'node:fs';
const checks=[
 ['migration 040 exists','supabase/migrations/040_s2d_quiet_family_digest_return_engine.sql','family_digest_state'],
 ['digest preferences','supabase/migrations/040_s2d_quiet_family_digest_return_engine.sql','save_my_digest_preferences'],
 ['digest read RPC','supabase/migrations/040_s2d_quiet_family_digest_return_engine.sql','get_my_family_digest'],
 ['digest open metric','supabase/migrations/040_s2d_quiet_family_digest_return_engine.sql','digest_return'],
 ['digest share metric','supabase/migrations/040_s2d_quiet_family_digest_return_engine.sql','digest_share'],
 ['remote digest client','lib/remote.ts','fetchMyFamilyDigest'],
 ['remote digest prefs','lib/remote.ts','preferred_weekday'],
 ['home digest component','components/FamilyDigest.tsx','Quiet family digest'],
 ['digest special days','components/FamilyDigest.tsx','Coming up'],
 ['digest memories','components/FamilyDigest.tsx','New memories'],
 ['digest contributions','components/FamilyDigest.tsx','One small way to help'],
 ['digest introductions','components/FamilyDigest.tsx','Trusted introductions'],
 ['privacy-safe sharing','components/FamilyDigest.tsx','Private details stay in the app'],
 ['playground read only','components/FamilyHome.tsx','readOnly={readOnly}'],
 ['quiet preference UI','components/CommunityHub.tsx','Quiet family digest'],
 ['admin retention metrics','components/ParticipationCenter.tsx','Digest returns'],
 ['mission doc','S2-D-QUIET-FAMILY-DIGEST-RETURN-ENGINE.md','Discover → Feel → Contribute → Share → Return'],
];
let pass=0;for(const [name,file,needle] of checks){const ok=fs.existsSync(file)&&fs.readFileSync(file,'utf8').includes(needle);console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`S2-D source gate: ${pass}/${checks.length}`);if(pass!==checks.length)process.exit(1);
