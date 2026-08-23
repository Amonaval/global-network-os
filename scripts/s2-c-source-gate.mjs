import fs from 'node:fs';
const checks=[
 ['migration 039 exists','supabase/migrations/039_s2c_trusted_introductions.sql','community_trust_edges'],
 ['intro table','supabase/migrations/039_s2c_trusted_introductions.sql','community_introduction_requests'],
 ['trust request RPC','supabase/migrations/039_s2c_trusted_introductions.sql','request_family_trust_connection'],
 ['two-family review RPC','supabase/migrations/039_s2c_trusted_introductions.sql','review_family_trust_connection'],
 ['revoke RPC','supabase/migrations/039_s2c_trusted_introductions.sql','revoke_family_trust_connection'],
 ['path RPC','supabase/migrations/039_s2c_trusted_introductions.sql','get_trusted_connection_path'],
 ['intro request RPC','supabase/migrations/039_s2c_trusted_introductions.sql','request_community_introduction'],
 ['intro response RPC','supabase/migrations/039_s2c_trusted_introductions.sql','respond_to_community_introduction'],
 ['remote path client','lib/remote.ts','fetchTrustedConnectionPath'],
 ['remote intro client','lib/remote.ts','requestCommunityIntroduction'],
 ['UI trusted families','components/CommunityNetwork.tsx','Trusted family connections'],
 ['UI explainable path','components/CommunityNetwork.tsx','trusted-path'],
 ['UI introduction tab','components/CommunityNetwork.tsx','Introductions'],
 ['playground simulated path','components/CommunityNetwork.tsx','Rathi Family","Somani Family'],
 ['privacy wording','components/CommunityNetwork.tsx','Direct contact stays private'],
 ['mission doc','S2-C-TRUSTED-INTRODUCTIONS-CONNECTION-PATHS.md','family-level'],
];
let pass=0;for(const [name,file,needle] of checks){const ok=fs.existsSync(file)&&fs.readFileSync(file,'utf8').includes(needle);console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`S2-C source gate: ${pass}/${checks.length}`);if(pass!==checks.length)process.exit(1);
