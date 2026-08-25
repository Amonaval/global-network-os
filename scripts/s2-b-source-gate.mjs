import fs from 'node:fs';
const files={
 migration:fs.readFileSync('supabase/migrations/038_s2b_community_umbrella_discovery.sql','utf8'),
 component:fs.readFileSync('components/CommunityNetwork.tsx','utf8'),
 remote:fs.readFileSync('lib/remote.ts','utf8'),
 app:fs.readFileSync('components/NetworkApp.tsx','utf8'),
 features:fs.readFileSync('verticals/family/features/catalog.ts','utf8'),
 docs:fs.readFileSync('S2-B-COMMUNITY-UMBRELLA-DISCOVERY.md','utf8'),
};
const checks=[
 ['community hierarchy table',/community_spaces/.test(files.migration)],
 ['family link governance',/community_family_links/.test(files.migration)&&/review_community_link/.test(files.migration)],
 ['opt-in snapshots',/community_profile_cards/.test(files.migration)&&/publish_my_community_profile/.test(files.migration)],
 ['self publication guard',/You can publish only your own community profile/.test(files.migration)],
 ['marriage consent guard',/must first opt in with a marriage community profile/.test(files.migration)],
 ['community posts',/community_posts/.test(files.migration)&&/publish_community_post/.test(files.migration)],
 ['no direct authenticated table grants',/revoke all on public\.community_spaces,public\.community_family_links,public\.community_profile_cards,public\.community_posts from anon,authenticated/.test(files.migration)],
 ['community UI',/Community network/.test(files.component)&&/Private family by default/.test(files.component)],
 ['category discovery',/Marriage/.test(files.component)&&/Services/.test(files.component)&&/Speaker/.test(files.component)],
 ['community highlights not ratings',/Community highlight/.test(files.component)&&/never ranked as “top”/.test(files.component)],
 ['network app navigation',/"umbrella"/.test(files.app)&&/CommunityNetwork/.test(files.app)],
 ['feature registry reused',/key:"connect\.community"/.test(files.features)&&/Opt-in discovery/.test(files.features)],
 ['remote API',/searchCommunityProfiles/.test(files.remote)&&/requestFamilyCommunityLink/.test(files.remote)],
 ['future relationship path guarded',/never infer kinship/.test(files.docs)],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`S2-B ${pass}/${checks.length}`); if(pass!==checks.length)process.exit(1);
