import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=m=>{console.error(`G6 two-vertical hardening gate: FAIL — ${m}`);process.exitCode=1};
const stripComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
const required=[
  'components/shared/NetworkTopbar.tsx','components/shared/NetworkSwitcher.tsx','components/shared/NetworkUi.tsx',
  'components/AlumniNetworkApp.tsx','components/NetworkApp.tsx','components/FounderLaunchConsole.tsx',
  'verticals/alumni/data/remote.ts','verticals/alumni/features/catalog.ts','verticals/alumni/runtime/composition.ts',
  'capabilities/launch-runtime/remote.ts','lib/remote.ts','app/globals.css',
  'supabase/migrations/045_g5_alumni_network_v1.sql','supabase/migrations/046_g6_two_vertical_hardening.sql',
  'scripts/g6-accepted-g5-baseline.txt','scripts/g6-protected-family-foundations.json','scripts/g1-4-remote-compatibility-exports.json'
];
for(const f of required)if(!fs.existsSync(path.join(root,f)))fail(`missing ${f}`);

const alumni=read('components/AlumniNetworkApp.tsx');
const app=read('components/NetworkApp.tsx');
const founder=read('components/FounderLaunchConsole.tsx');
const css=read('app/globals.css');
const alumniRemote=read('verticals/alumni/data/remote.ts');
const launchRemote=read('capabilities/launch-runtime/remote.ts');
const migration=read('supabase/migrations/046_g6_two_vertical_hardening.sql');
const facade=read('lib/remote.ts');

// Accepted G5 baseline is append-only through G6.
const baseline=read('scripts/g6-accepted-g5-baseline.txt').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const missing=baseline.filter(f=>!fs.existsSync(path.join(root,f)));
if(missing.length)fail(`accepted G5 files deleted: ${missing.join(', ')}`);

// Protect the Family domain foundations while shared chrome evolves.
const protectedHashes=JSON.parse(read('scripts/g6-protected-family-foundations.json'));
for(const [file,expected] of Object.entries(protectedHashes)){
  if(!fs.existsSync(path.join(root,file))){fail(`protected Family foundation missing: ${file}`);continue;}
  const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
  if(actual!==expected)fail(`protected Family foundation changed during G6: ${file}`);
}

// Historical facade remains source-compatible.
function exportedNames(source){
 const names=new Set();
 for(const pattern of [/^export\s+type\s+([A-Za-z_$][\w$]*)/gm,/^export\s+interface\s+([A-Za-z_$][\w$]*)/gm,/^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm,/^export\s+(?:const|let|var|class|enum)\s+([A-Za-z_$][\w$]*)/gm]) for(const m of source.matchAll(pattern)) names.add(m[1]);
 for(const m of source.matchAll(/export\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["'][^"']+["'];?/g)) for(const item of m[1].split(',')){const token=item.replace(/\/\*[\s\S]*?\*\//g,'').trim();if(!token)continue;const alias=token.split(/\s+as\s+/);names.add((alias[1]||alias[0]).trim());}
 return names;
}
const historical=JSON.parse(read('scripts/g1-4-remote-compatibility-exports.json'));
const current=exportedNames(facade);
const missingExports=historical.filter(x=>!current.has(x));
if(missingExports.length)fail(`historical lib/remote.ts exports missing: ${missingExports.join(', ')}`);

// Shared UX must be proven by both verticals, not Alumni-only decoration.
for(const marker of ['NetworkTopbar','network-topbar','network-title'])if(!read('components/shared/NetworkTopbar.tsx').includes(marker))fail(`shared topbar missing ${marker}`);
if(!app.includes('import NetworkTopbar from "./shared/NetworkTopbar"')||!app.includes('<NetworkTopbar'))fail('Family shell does not consume shared NetworkTopbar');
if(!alumni.includes('import NetworkTopbar from "./shared/NetworkTopbar"')||!alumni.includes('<NetworkTopbar'))fail('Alumni shell does not consume shared NetworkTopbar');
for(const marker of ['NetworkSwitcher','NetworkMetric','NetworkSectionHead','NetworkEmpty','InitialsAvatar'])if(!alumni.includes(marker))fail(`Alumni polished shell missing shared primitive ${marker}`);
const sharedSwitcher=read('components/shared/NetworkSwitcher.tsx');
if(!sharedSwitcher.includes('fetchMyNetworkMemberships')||sharedSwitcher.includes('fetchMyNetworks('))fail('shared NetworkSwitcher must use the neutral network membership contract');
for(const marker of ['.network-metric-grid','.alumni-hero','.alumni-dashboard-grid','.alumni-profile-grid','.alumni-mobile-nav'])if(!css.includes(marker))fail(`G6 UX CSS missing ${marker}`);

// Preserve the G5 dispatch hotfix: Family runtime can never evaluate Alumni keys.
const handoff=app.indexOf('if(network && activeVerticalKind==="alumni" && !setupNeeded) return <AlumniNetworkApp');
const familyFeatureEval=app.indexOf('const hasFeature=');
if(handoff<0||familyFeatureEval<0||handoff>familyFeatureEval)fail('Alumni handoff no longer precedes Family feature evaluation');
if(!app.includes('activeVerticalKind==="family"&&isFeatureAvailable'))fail('Family feature runtime defensive vertical guard missing');

// Alumni now evaluates its own feature catalog/runtime and composition.
for(const marker of ['createFeatureRuntime(ALUMNI_FEATURE_CATALOG)','getVerticalAppComposition("alumni")','fetchEffectivePlatformFeatures','fetchPlaygroundFeatures'])if(!alumni.includes(marker))fail(`Alumni runtime composition missing ${marker}`);
for(const marker of ['fetchAlumniNetworkOverview','fetchAlumniConnections','connectAlumniProfile'])if(!alumni.includes(marker)||!alumniRemote.includes(`function ${marker}`))fail(`Alumni product hardening missing ${marker}`);

// Alumni implementation cannot reach back into Family/Kinship persistence.
const alumniSources=['components/AlumniNetworkApp.tsx','verticals/alumni/data/remote.ts','verticals/alumni/identity/claiming-adapter.ts','verticals/alumni/participation/adapter.ts','verticals/alumni/construction/adapter.ts','verticals/alumni/features/catalog.ts','verticals/alumni/runtime/composition.ts','verticals/alumni/definition.ts'].map(read).map(stripComments).join('\n').toLowerCase();
for(const forbidden of ['family_members','family_relationships','create_family_intake','commit_family_intake','verticals/family','relationship_type:"parent"','relationship_type:"spouse"'])if(alumniSources.includes(forbidden))fail(`Alumni implementation leaked Family/Kinship semantic: ${forbidden}`);

// Launch Control must be vertical-scoped, especially same-named core/admin bundles.
for(const marker of ['getVerticalAppComposition(verticalKind)','fetchPlatformVerticalLaunchConsole(verticalKind)','setPlatformVerticalBundleRollout(verticalKind','targets.filter(target=>!target.vertical_kind||target.vertical_kind===verticalKind)'])if(!founder.includes(marker))fail(`vertical-aware Launch Control missing ${marker}`);
if(founder.includes('setPlatformBundleRollout('))fail('Founder Launch Control still uses unscoped bundle rollout');
for(const marker of ['fetchPlatformVerticalLaunchConsole','setPlatformVerticalBundleRollout','fetchPlatformNetworkTargets'])if(!launchRemote.includes(`function ${marker}`)||!facade.includes(marker))fail(`launch runtime/facade missing ${marker}`);

// Database hardening: feature catalog scope, tenant integrity, network identity, and connections.
for(const marker of [
  'platform_feature_flags add column if not exists vertical_kind',
  "('alumni.core.home','core','released'",
  "('alumni.core.directory','discover','released'",
  'get_platform_vertical_launch_console',
  'set_platform_vertical_bundle_rollout',
  'where vertical_kind=p_vertical_kind and bundle_key=p_bundle_key',
  'get_platform_network_targets',
  'create table if not exists public.alumni_network_settings',
  'get_alumni_network_overview',
  'uq_alumni_profiles_id_network',
  'fk_alumni_connections_person_network',
  'fk_alumni_connections_related_network',
  'fk_alumni_invitation_profile_network',
  'create_alumni_connection',
  'get_my_alumni_connections',
  'revoke all on table public.alumni_network_settings from anon,authenticated'
]) if(!migration.includes(marker)) fail(`G6 migration missing ${marker}`);
for(const key of ['alumni.core.home','alumni.core.directory','alumni.core.cohorts','alumni.core.connections','alumni.admin.import','alumni.admin.manage']){
  if(!migration.includes(key))fail(`Alumni backend feature registry missing ${key}`);
}

// Only the intended next migration may be introduced in this release.
const migrations=fs.readdirSync(path.join(root,'supabase/migrations')).filter(x=>x.endsWith('.sql')).sort();
const post045=migrations.filter(x=>(/^04[6-9]_/.test(x)||/^[1-9][0-9]{2,}_/.test(x))&&x!=='046_g6_two_vertical_hardening.sql');
if(post045.length)fail(`unexpected post-G5 migrations in G6: ${post045.join(', ')}`);

if(!process.exitCode)console.log(`G6 two-vertical hardening gate: PASS — ${historical.length} historical remote exports, ${baseline.length} accepted G5 files, and ${Object.keys(protectedHashes).length} Family foundations preserved`);
