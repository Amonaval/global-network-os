import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
const failures=[];const fail=m=>failures.push(m);

const required=[
 'components/TemplateNetworkApp.tsx','components/ThemeProvider.tsx','components/ThemeSwitcher.tsx','components/shared/NetworkPulse.tsx','capabilities/template-product/remote.ts','capabilities/template-product/features.ts','capabilities/template-product/composition.ts','templates/productized/config.ts',
 'verticals/organization/definition.ts','verticals/organization/features/catalog.ts','verticals/organization/runtime/composition.ts',
 'verticals/business-trust/definition.ts','verticals/business-trust/features/catalog.ts','verticals/business-trust/runtime/composition.ts',
 'verticals/franchise/definition.ts','verticals/franchise/features/catalog.ts','verticals/franchise/runtime/composition.ts',
 'supabase/migrations/048_g8_productized_verticals.sql','scripts/g8-accepted-g7-baseline.txt','scripts/g8-protected-existing-vertical-foundations.json'
];
for(const f of required)if(!exists(f))fail(`missing ${f}`);

// G7 accepted source is append-only through G8.
const baseline=read('scripts/g8-accepted-g7-baseline.txt').split(/\r?\n/).filter(Boolean);const missing=baseline.filter(f=>!exists(f));if(missing.length)fail(`accepted G7 files deleted: ${missing.join(', ')}`);

// Historical remote compatibility is release critical.
const historical=JSON.parse(read('scripts/g1-4-remote-compatibility-exports.json')),facade=read('lib/remote.ts');
for(const name of historical){const re=new RegExp(`export(?:\\s+type|\\s+interface|\\s+(?:async\\s+)?function|\\s+(?:const|let|var|class|enum))\\s+${name}\\b|export\\s+(?:type\\s+)?\\{[^}]*\\b${name}\\b`,'m');if(!re.test(facade))fail(`historical remote export missing: ${name}`)}

// Family + Alumni product foundations must not be silently rewritten while new verticals ship.
const protectedHashes=JSON.parse(read('scripts/g8-protected-existing-vertical-foundations.json'));
const normalizeProtectedAlumniShowcase=source=>source
 .replace(/\{\/\* G8\.6_ALUMNI_BEGIN \*\/\}[\s\S]*?\{\/\* G8\.6_ALUMNI_END \*\/\}/g,'')
 .replace(/\n?\/\* G8\.6_ALUMNI_BEGIN \*\/[\s\S]*?\/\* G8\.6_ALUMNI_END \*\//g,'')
 .replace(/\n\s+\n(\s+\{tab==="(?:explorer|community)")/g,'\n$1')
 .replace(/const (?:sample|alumniSeed):AlumniProfile\[\]=\[.*?const sampleGroups:NetworkGroup\[\]=\[.*?\];/s,'/* ALUMNI_SHOWCASE_DATA */')
 .replace(/\{demo&&<section className="whats-new-card alumni-showcase-whats-new">.*?<\/section>\}/s,'')
 .replace(/\{demo&&<section className="card guide-showcase-proof">.*?<\/section>\}/s,'');
const protectedAlumniCoreHash='5c96e7e6072cabd01b7dd2e3976b646f4345a805f07e0def8fb2a79414dd85bf';
for(const [file,expected] of Object.entries(protectedHashes)){if(!exists(file)){fail(`protected existing vertical file missing: ${file}`);continue;}const source=fs.readFileSync(path.join(root,file));if(file==='components/AlumniNetworkApp.tsx'){const actual=crypto.createHash('sha256').update(normalizeProtectedAlumniShowcase(source.toString('utf8'))).digest('hex');if(actual!==protectedAlumniCoreHash)fail(`protected Alumni runtime core changed outside authorized showcase regions: ${file}`);continue;}const actual=crypto.createHash('sha256').update(source).digest('hex');if(actual!==expected)fail(`protected Family/Alumni foundation changed in G8: ${file}`)}

const kinds=['organization','business-trust','franchise'];
const registry=read('app-shell/vertical-registry.ts'),runtime=read('app-shell/vertical-runtime.ts'),contracts=read('core/verticals/contracts.ts');
for(const kind of kinds){if(!contracts.includes(`"${kind}"`)&&!contracts.includes(`'${kind}'`))fail(`NetworkVerticalKind missing ${kind}`);if(!registry.includes(kind==='business-trust'?'BUSINESS_TRUST_VERTICAL':kind==='organization'?'ORGANIZATION_VERTICAL':'FRANCHISE_VERTICAL'))fail(`vertical registry missing ${kind}`);if(!runtime.includes(kind==='business-trust'?'BUSINESS_TRUST_APP_COMPOSITION':kind==='organization'?'ORGANIZATION_APP_COMPOSITION':'FRANCHISE_APP_COMPOSITION'))fail(`vertical runtime missing ${kind}`)}

// Released templates are active and internally coherent.
for(const kind of kinds){const tpl=read(`templates/${kind}/definition.ts`),v=read(`verticals/${kind}/definition.ts`),catalog=read(`verticals/${kind}/features/catalog.ts`),comp=read(`verticals/${kind}/runtime/composition.ts`);if(!tpl.includes('status:"active"'))fail(`${kind} template is not active`);if(!v.includes('status:"active"'))fail(`${kind} vertical is not active`);for(const suffix of ['core.home','shared.explorer','core.directory','shared.community','shared.places','core.connections','shared.contribute','admin.manage','admin.import']){const key=`${kind}.${suffix}`;if(!catalog.includes(kind==='business-trust'?'createProductizedFeatureCatalog': 'createProductizedFeatureCatalog')&&!read('capabilities/template-product/features.ts').includes(suffix))fail(`${kind} feature catalog missing factory coverage ${suffix}`);if(!read('capabilities/template-product/composition.ts').includes(suffix))fail(`${kind} composition factory missing ${suffix}`)}
 // Every projection level must be a declared dimension.
 const dimKeys=[...tpl.matchAll(/\{key:"([^"]+)",label:/g)].map(m=>m[1]);const projectionBlocks=[...tpl.matchAll(/levels:\[([^\]]+)\]/g)].map(m=>[...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]));for(const levels of projectionBlocks)for(const level of levels)if(!dimKeys.includes(level))fail(`${kind} projection uses undeclared dimension ${level}`);
}

// Productized reusable implementation must not import deployed Family/Alumni implementations.
const productSources=['components/TemplateNetworkApp.tsx','components/ThemeProvider.tsx','components/ThemeSwitcher.tsx','components/shared/NetworkPulse.tsx','capabilities/template-product/remote.ts','capabilities/template-product/features.ts','capabilities/template-product/composition.ts','templates/productized/config.ts',...kinds.flatMap(k=>[`verticals/${k}/definition.ts`,`verticals/${k}/features/catalog.ts`,`verticals/${k}/runtime/composition.ts`,`templates/${k}/definition.ts`])].map(read).join('\n').toLowerCase();
for(const forbidden of ['verticals/family','verticals/alumni','family_members','family_relationships','alumni_profiles','create_family_intake','commit_family_intake'])if(productSources.includes(forbidden))fail(`G8 productized runtime leaked existing vertical semantic: ${forbidden}`);

// Main shell must hand off all productized verticals before Family feature evaluation.
const app=read('components/NetworkApp.tsx');const productHandoff=app.indexOf('isProductizedVerticalKind(activeVerticalKind) && !setupNeeded'),familyEval=app.indexOf('const hasFeature=');if(productHandoff<0||familyEval<0||productHandoff>familyEval)fail('G8 productized handoff does not precede Family feature evaluation');for(const marker of ['<TemplateNetworkApp','onCreateProductized','onExploreProductizedDemo','onJoinProductizedCode','createTemplateNetwork','joinProductizedNetworkByCode'])if(!app.includes(marker))fail(`NetworkApp product flow missing ${marker}`);

const setup=read('components/SetupScreen.tsx');for(const marker of ['"organization","business-trust","franchise"','Create another kind of trusted network','Try sample','Have a Network OS join code?','path==="productized"'])if(!setup.includes(marker))fail(`Setup flow missing ${marker}`);
const founder=read('components/FounderLaunchConsole.tsx');for(const kind of ['"family"','"alumni"','"organization"','"business-trust"','"franchise"'])if(!founder.includes(kind))fail(`Launch Control active vertical selector missing ${kind}`);if(founder.includes('setPlatformBundleRollout('))fail('Launch Control regressed to unscoped bundle rollout');
if(!founder.includes('const PLAYGROUND_EXCLUDED_BUNDLES=LAUNCH_COMPOSITION.playgroundExcludedBundles as readonly string[]'))fail('Launch Control must widen playgroundExcludedBundles before includes() to avoid never inference');
if(founder.includes('LAUNCH_COMPOSITION.playgroundExcludedBundles.includes(f.bundle)'))fail('Launch Control directly calls includes() on literal-inferred playgroundExcludedBundles and may regress to never');

// Migration 048 must be additive, tenant-safe, and support released product workflows.
const migration=read('supabase/migrations/048_g8_productized_verticals.sql');
for(const marker of [
 "vertical_kind in ('family','alumni','organization','business-trust','franchise')",
 'create table if not exists public.productized_network_settings','create table if not exists public.network_entity_relationships','create table if not exists public.network_join_codes','create table if not exists public.network_contributions',
 'fk_network_entity_relationship_from_tenant','fk_network_entity_relationship_to_tenant','fk_network_contribution_entity_tenant',
 'revoke all on public.productized_network_settings from anon,authenticated','revoke all on public.network_entity_relationships from anon,authenticated','revoke all on public.network_join_codes from anon,authenticated','revoke all on public.network_contributions from anon,authenticated',
 'create_productized_network','upsert_productized_network_entity','import_productized_network_entities','create_productized_network_relationship','get_or_create_network_join_code','join_productized_network_by_code','submit_productized_network_contribution','review_productized_network_contribution',
 'get_my_claimable_productized_entities','claim_productized_network_entity_by_verified_email','g8_set_entity_affiliations','jsonb_array_elements(p_values)',
 'get_productized_network_memberships','set_productized_network_member_role','remove_productized_network_member',
 "if actor_role<>'owner' then raise exception 'Only the network owner can change admin roles.'",
 "if target_role='admin' and actor_role<>'owner' then raise exception 'Only the owner can remove an admin.'",
 'update public.network_entities set owner_user_id=null,updated_at=now() where network_id=nid and owner_user_id=p_user_id',
 'update public.profiles set active_network_id=null,updated_at=now() where id=p_user_id and active_network_id=nid',
 "raise exception 'Your account is already linked to another entity in this network.'",
 "raise exception 'You can edit only your claimed entity.'",
 'get_effective_platform_features','where f.vertical_kind=coalesce','get_platform_vertical_launch_console','set_platform_vertical_bundle_rollout'
])if(!migration.includes(marker))fail(`migration 048 missing ${marker}`);
for(const helper of ['g8_productized_vertical(text)','g8_allowed_entity_kind(text,text)','g8_allowed_relationship(text,text)','g8_seed_productized_structure(uuid,text)','g8_set_entity_affiliations(uuid,uuid,text,jsonb)'])if(!migration.includes(`revoke all on function public.${helper} from public`))fail(`internal SECURITY DEFINER helper not revoked: ${helper}`);
for(const kind of kinds)for(const suffix of ['core.home','shared.explorer','core.directory','shared.community','shared.places','core.connections','shared.contribute','admin.manage','admin.import'])if(!migration.includes(`${kind}.${suffix}`))fail(`backend feature catalog missing ${kind}.${suffix}`);
if((migration.match(/'\{\}'::uuid\[\]/g)||[]).length<3)fail('feature seeds must explicitly cast empty pilot arrays to uuid[]');
// G8 certification hotfix guards.
if(!read('components/AlumniNetworkApp.tsx').includes('readonly VerticalSurfaceDescriptor[]'))fail('Alumni navigation surfaces must widen to VerticalSurfaceDescriptor so optional adminOnly is type-safe');
if(migration.includes('e.label,m.created_at'))fail('migration 048 references nonexistent network_memberships.created_at; use joined_at');
if(!migration.includes('e.label,m.joined_at'))fail('migration 048 membership listing must return network_memberships.joined_at');


// Multiple affiliations are a binding G8 product capability.
const templateApp=read('components/TemplateNetworkApp.tsx');if(!templateApp.includes('v.split(",").map(x=>x.trim()).filter(Boolean)'))fail('entity editor does not preserve multiple affiliation values');if(!templateApp.includes('new globalThis.Map<string,number>()'))fail('Places aggregation must use explicit native globalThis.Map');
for(const marker of ['NetworkProjectionExplorer','NetworkActivityHub','fetchClaimableProductizedEntities','claimProductizedEntity','createNetworkEntityRelationship','submitNetworkContribution','importNetworkEntities','fetchProductizedNetworkMembers','setProductizedNetworkMemberRole','removeProductizedNetworkMember','item.entity.ownerUserId===auth?.id'])if(!templateApp.includes(marker))fail(`TemplateNetworkApp missing released workflow ${marker}`);
const productRemote=read('capabilities/template-product/remote.ts');for(const marker of ['get_productized_network_memberships','set_productized_network_member_role','remove_productized_network_member'])if(!productRemote.includes(marker))fail(`productized remote missing membership workflow ${marker}`);
if(/import\s*\{[^}]*\bMap\b[^}]*\}\s*from\s*["']lucide-react["']/.test(templateApp)&&templateApp.includes('new Map<'))fail('TemplateNetworkApp shadows native Map with Lucide Map icon');


// G8 product experience completion: responsive shell, five Playgrounds and app-wide themes.
const topbar=read('components/shared/NetworkTopbar.tsx'),layout=read('app/layout.tsx'),themeProvider=read('components/ThemeProvider.tsx'),themeSwitcher=read('components/ThemeSwitcher.tsx');
for(const marker of ['ThemeProvider','data-theme="light"'])if(!layout.includes(marker))fail(`root theme wiring missing ${marker}`);
for(const marker of ['light','dark','aurora','network-os-theme'])if(!themeProvider.includes(marker))fail(`theme provider missing ${marker}`);
if(!topbar.includes('<ThemeSwitcher compact/>'))fail('shared NetworkTopbar must expose app-wide theme control');
if(!setup.includes('Explore every released network product first'))fail('setup missing unified Playground gallery');
for(const marker of ['onExploreDemo','onExploreAlumniDemo','onExploreProductizedDemo'])if(!setup.includes(marker))fail(`Playground gallery missing ${marker}`);
if(!templateApp.includes('className={`nav-btn ${tab===s.viewId?"active":""}`}'))fail('productized sidebar must use shared nav-btn styling');
if(!templateApp.includes('<NetworkPulse'))fail('productized Home missing shared Network Pulse');

// Domain vocabularies are not generic placeholders.
const org=read('templates/organization/definition.ts'),trust=read('templates/business-trust/definition.ts'),franchise=read('templates/franchise/definition.ts');for(const m of ['reports_to','works_with','depends_on','skill','project'])if(!org.includes(m))fail(`Organization semantics missing ${m}`);for(const m of ['recommends','verified_by','supplies_to','service','category'])if(!trust.includes(m))fail(`Business Trust semantics missing ${m}`);for(const m of ['owns','operates','manages','supports','country','state','city','owner'])if(!franchise.includes(m))fail(`Franchise semantics missing ${m}`);

// Transpile the G8 change surface for syntax/JSX regressions.
const tsFiles=['components/NetworkApp.tsx','components/SetupScreen.tsx','components/TemplateNetworkApp.tsx','components/FounderLaunchConsole.tsx','components/shared/NetworkSwitcher.tsx','components/shared/NetworkProjectionExplorer.tsx','components/shared/NetworkActivityHub.tsx','components/shared/NetworkPulse.tsx','components/ThemeProvider.tsx','components/ThemeSwitcher.tsx','core/verticals/contracts.ts','app-shell/vertical-registry.ts','app-shell/vertical-runtime.ts','app-shell/vertical-capabilities.ts','capabilities/template-product/remote.ts','capabilities/template-product/features.ts','capabilities/template-product/composition.ts','templates/productized/config.ts',...kinds.flatMap(k=>[`verticals/${k}/definition.ts`,`verticals/${k}/features/catalog.ts`,`verticals/${k}/runtime/composition.ts`,`templates/${k}/definition.ts`])];
for(const f of tsFiles){const result=ts.transpileModule(read(f),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext},reportDiagnostics:true,fileName:f});const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);if(errors.length)fail(`TypeScript transpile failed for ${f}: ${errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; ')}`)}

const css=read('app/globals.css');for(const marker of ['.product-network-app','.product-network-shell','.product-hero','.product-directory-grid','.productized-create-grid','.product-mobile-nav','.product-claim-card','.vertical-launch-options','.theme-switcher','.playground-gallery','.product-side-brand','.network-pulse-card'])if(!css.includes(marker))fail(`G8 product UX CSS missing ${marker}`);let braces=0;for(const c of css){if(c==='{')braces++;else if(c==='}')braces--;}if(braces!==0)fail(`CSS brace integrity failed: ${braces}`);

if(failures.length){for(const f of failures)console.error(`G8 productized verticals gate: FAIL — ${f}`);process.exit(1)}
console.log(`G8 productized verticals gate: PASS — ${historical.length} historical remote exports, ${baseline.length} accepted G7 files, ${Object.keys(protectedHashes).length} protected Family/Alumni foundations, and 3 released product verticals preserved`);
