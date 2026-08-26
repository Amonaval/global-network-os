import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const fail=m=>{console.error(`G4 vertical runtime gate: FAIL — ${m}`);process.exitCode=1};
const required=[
  "core/verticals/app-composition.ts",
  "app-shell/vertical-runtime.ts",
  "verticals/family/runtime/composition.ts",
  "verticals/alumni/runtime/composition.ts",
  "app-shell/vertical-registry.ts",
  "app-shell/vertical-capabilities.ts",
  "verticals/family/features/catalog.ts",
  "verticals/alumni/features/catalog.ts",
  "components/NetworkApp.tsx",
  "components/FounderLaunchConsole.tsx",
  "scripts/g1-4-remote-compatibility-exports.json",
  "scripts/g4-accepted-source-baseline.txt",
];
for(const f of required) if(!fs.existsSync(path.join(root,f))) fail(`missing ${f}`);

const core=read("core/verticals/app-composition.ts");
const runtime=read("app-shell/vertical-runtime.ts");
const family=read("verticals/family/runtime/composition.ts");
const alumni=read("verticals/alumni/runtime/composition.ts");
const familyCatalog=read("verticals/family/features/catalog.ts");
const alumniCatalog=read("verticals/alumni/features/catalog.ts");
const app=read("components/NetworkApp.tsx");
const founder=read("components/FounderLaunchConsole.tsx");
const facade=read("lib/remote.ts");
const g2Identity=read("core/identity/contracts.ts");
const g2Participation=read("core/participation/contracts.ts");
const g3Construction=read("core/construction/contracts.ts");
const g3FamilyAdapter=read("verticals/family/construction/adapter.ts");
const stripComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,"").replace(/(^|[^:])\/\/.*$/gm,"$1");

if(/from\s+["'](?:\.\.\/)+verticals\//.test(stripComments(core))) fail("core app-composition contract imports a vertical implementation");
for(const marker of ["VerticalSurfaceDescriptor","VerticalGuideComposition","VerticalPlaygroundComposition","VerticalLaunchComposition","VerticalWhatsNewComposition","VerticalAppComposition"]) if(!core.includes(marker)) fail(`composition contract missing ${marker}`);
for(const marker of ["FAMILY_APP_COMPOSITION","ALUMNI_APP_COMPOSITION","getVerticalCapabilityRuntime","featureCatalogId !== definition.featureCatalog.catalogId","getRenderableVerticalRuntime"]) if(!runtime.includes(marker)) fail(`app-shell runtime missing ${marker}`);
if(!runtime.includes('throw new Error(`Vertical ${kind} is not user-visible yet.`)')) fail("skeleton verticals do not fail closed");

const expectedNav=[
  ["home","core.home"],["tree","core.family"],["community","remember.memories"],["directory","core.directory"],
  ["timeline","remember.history"],["map","connect.places"],["umbrella","connect.community"],["participation","contribute.help_family"],
];
let cursor=0;
for(const [view,key] of expectedNav){const token=`{viewId:"${view}",featureKey:"${key}"`;const next=family.indexOf(token,cursor);if(next<0) fail(`Family primary navigation changed/missing ${view} → ${key}`);else cursor=next+token.length;}
for(const marker of [
  'featureCatalogId: "family"','registryId:"family-guide"','preferredViewerIdentityId:"m37"','name:"Sample Family Playground"','name:"Sample Family"',
  'playgroundExcludedBundles:["admin"]','"core.family":"tree"','"advanced.relationships":"tree"','"contribute.help_family":"participation"',
]) if(!family.includes(marker)) fail(`Family app composition lost compatibility marker ${marker}`);
const familyFeatureKeys=new Set([...familyCatalog.matchAll(/\{key:"([^"]+)"/g)].map(m=>m[1]));
for(const m of family.matchAll(/featureKey:"([^"]+)"/g)) if(!familyFeatureKeys.has(m[1])) fail(`Family surface references unknown feature ${m[1]}`);

const alumniCode=stripComments(alumni);
if(!alumni.includes('renderStatus:"skeleton"')&&!alumni.includes('renderStatus:"active"')) fail('Alumni render status is not explicit');
if(alumni.includes('renderStatus:"skeleton"')){for(const marker of ['primaryNavigation:[]','mobileMoreNavigation:[]','playground:{enabled:false']) if(!alumni.includes(marker)) fail(`Alumni skeleton composition missing ${marker}`);}else{for(const marker of ['alumni.core.home','alumni.core.directory','alumni.core.cohorts','playground:{enabled:true']) if(!alumni.includes(marker)) fail(`Active Alumni composition missing ${marker}`);}
for(const forbidden of ["core.family","remember.memories","contribute.help_family","Family","family tree","m37"]) if(alumniCode.includes(forbidden)) fail(`Alumni composition inherited Family-only surface/content: ${forbidden}`);
if(!alumniCatalog.includes('catalogId: "alumni"')) fail("Alumni feature catalog registration regressed");

for(const marker of [
  'getRenderableVerticalRuntime(activeVerticalKind)',
  'appComposition.primaryNavigation',
  'appComposition.mobileMoreNavigation',
  'appComposition.guide.guideByView',
  'appComposition.guide.actionToView',
  'appComposition.playground.publicNetworkSettings',
  'appComposition.whatsNew.featureToView',
  'localizedSurfaceLabel(surface,appLocale)',
]) if(!app.includes(marker)) fail(`NetworkApp is not composition-driven for ${marker}`);
if(app.includes('const guideByView:Partial<Record<View,string>>={home:')) fail("NetworkApp still hardcodes the Family guide/view registry");
if(app.includes('["home", language === "hi"')) fail("NetworkApp still hardcodes the Family primary navigation array");
if(!(founder.includes('getVerticalAppComposition("family")')||founder.includes('getVerticalAppComposition(verticalKind)'))) fail('Launch Control no longer resolves vertical composition');
for(const marker of ['LAUNCH_COMPOSITION.bundles','LAUNCH_COMPOSITION.playgroundExcludedBundles','LAUNCH_COMPOSITION.dayOneDescription']) if(!founder.includes(marker)) fail(`Launch Control is not composition-driven for ${marker}`);

for(const marker of ["IdentityClaimAdapter","VerticalIdentityRef"]) if(!g2Identity.includes(marker)) fail(`G2 identity contract regressed: ${marker}`);
for(const marker of ["ParticipationAdapter","NetworkInvitationSummary"]) if(!g2Participation.includes(marker)) fail(`G2 participation contract regressed: ${marker}`);
for(const marker of ["ConstructionAdapter","ConstructionCommitResult"]) if(!g3Construction.includes(marker)) fail(`G3 construction contract regressed: ${marker}`);
if(!g3FamilyAdapter.includes("FAMILY_CONSTRUCTION_ADAPTER")) fail("G3 Family construction adapter regressed");

function exportedNames(source){
 const names=new Set();
 for(const pattern of [/^export\s+type\s+([A-Za-z_$][\w$]*)/gm,/^export\s+interface\s+([A-Za-z_$][\w$]*)/gm,/^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm,/^export\s+(?:const|let|var|class|enum)\s+([A-Za-z_$][\w$]*)/gm]) for(const m of source.matchAll(pattern)) names.add(m[1]);
 for(const m of source.matchAll(/export\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["'][^"']+["'];?/g)) for(const item of m[1].split(",")){const token=item.replace(/\/\*[\s\S]*?\*\//g,"").trim();if(!token)continue;const alias=token.split(/\s+as\s+/);names.add((alias[1]||alias[0]).trim());}
 return names;
}
const baselineExports=JSON.parse(read("scripts/g1-4-remote-compatibility-exports.json"));
const currentExports=exportedNames(facade);
const missingExports=baselineExports.filter(name=>!currentExports.has(name));
if(missingExports.length) fail(`historical lib/remote.ts exports missing: ${missingExports.join(", ")}`);

const accepted=read("scripts/g4-accepted-source-baseline.txt").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const missingFiles=accepted.filter(f=>!fs.existsSync(path.join(root,f)));
if(missingFiles.length) fail(`accepted G3 files deleted: ${missingFiles.join(", ")}`);

const migrations=fs.readdirSync(path.join(root,"supabase/migrations")).filter(x=>x.endsWith(".sql")).sort();
if(!migrations.includes('044_g1_3_feature_catalog_integrity.sql')) fail('accepted migration baseline through 044 is incomplete');
// Later additive migrations are validated by later G-gates.

if(!process.exitCode) console.log(`G4 vertical runtime gate: PASS — ${baselineExports.length} historical remote exports and ${accepted.length} accepted G3 files preserved`);
