import fs from 'node:fs';
const app=fs.readFileSync('./components/NetworkApp.tsx','utf8');
const switcher=fs.readFileSync('./components/FamilySwitcher.tsx','utf8');
const founder=fs.readFileSync('./components/FounderLaunchConsole.tsx','utf8');
const familyComposition=fs.existsSync('./verticals/family/runtime/composition.ts')?fs.readFileSync('./verticals/family/runtime/composition.ts','utf8'):'';
const remote=fs.readFileSync('./lib/remote.ts','utf8');
const migration=fs.readFileSync('./supabase/migrations/036_s1_family_access_playground_hardening.sql','utf8');
const seed=fs.readFileSync('./supabase/seed-demo.sql','utf8');
const checks=[
 ['local state persists memories',app.includes('saveState({ members, relationships, submissions, lifeEvents, memories })')],
 ['family switcher visible to authenticated simple users',app.includes('auth && <FamilySwitcher')],
 ['desktop sign out no longer experience-gated',app.includes('isSupabaseConfigured && auth && (')],
 ['mobile create/join/switch escape exists',app.includes('Create, join or switch family')],
 ['mobile leave family exists',app.includes('Leave this family')],
 ['switcher create/join action exists',switcher.includes('Create or join another family')],
 ['family lobby action exists',switcher.includes('Family lobby / choose fresh')],
 ['safe owner leave/archive RPC exists',migration.includes('leave_current_family')&&migration.includes("actor_role='owner' and active_accounts=1")],
 ['ownerless family guard exists',migration.includes('only Owner of a populated family')],
 ['playground independent feature table exists',migration.includes('platform_playground_features')],
 ['anonymous playground feature reader exists',migration.includes('grant execute on function public.get_playground_features() to anon,authenticated')],
 ['launch control has playground panel',founder.includes('Playground feature visibility')||familyComposition.includes('Playground feature visibility')],
 ['playground uses explorer experience',app.includes('demoPreview ? "explorer"')],
 ['playground feature map independent',app.includes('demoPreview?playgroundFeatures:platformFeatures')],
 ['remote family lobby functions exist',remote.includes('enterFamilyLobby')&&remote.includes('leaveCurrentFamily')],
 ['showcase seed is 60-member source', (seed.match(/insert into public\.family_members/g)||[]).length===60],
 ['showcase seed includes life events', (seed.match(/insert into public\.member_life_events/g)||[]).length>=50],
 ['showcase seed includes memories', (seed.match(/insert into public\.memories/g)||[]).length>=10],
 ['showcase seed includes contribution prompts',seed.includes('contribution_suggestions')],
 ['showcase seed includes groups and events',seed.includes('Pune family circle')&&seed.includes('Five-generation family reunion')],
 ['60-person workbook packaged',fs.existsSync('./public/sample-data-60.xlsx')]
];
let fail=0;for(const [name,ok] of checks){console.log(ok?'PASS':'FAIL',name);if(!ok)fail++;}
if(fail){console.error(`${fail}/${checks.length} S1 hardening checks failed.`);process.exit(1)}
console.log(`${checks.length}/${checks.length} S1 hardening checks passed.`);
