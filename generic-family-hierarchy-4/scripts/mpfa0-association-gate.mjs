import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
let failures=0;
const ok=(label,condition)=>{if(condition)console.log(`PASS ${label}`);else{console.error(`FAIL ${label}`);failures++}};
const contracts=read('core/verticals/contracts.ts'),registry=read('app-shell/vertical-registry.ts'),runtime=read('app-shell/vertical-runtime.ts'),config=read('templates/productized/config.ts'),template=read('templates/association/definition.ts'),setup=read('components/SetupScreen.tsx'),migration=read('supabase/migrations/078_mpfa0_community_association_vertical.sql'),outcome=read('components/shared/NetworkOutcomeHome.tsx'),intelligenceContracts=read('core/intelligence/contracts.ts'),intelligenceEngine=read('core/intelligence/engine.ts'),intelligenceUi=read('components/shared/NetworkIntelligenceCenter.tsx'),guideTypes=read('lib/guide-types.ts'),guideContent=read('lib/user-guide-content.ts');
ok('association is a typed vertical',contracts.includes('"association"'));
ok('association vertical is registered',registry.includes('ASSOCIATION_VERTICAL'));
ok('association has active runtime composition',runtime.includes('ASSOCIATION_APP_COMPOSITION'));
ok('association is a productized create kind',config.includes('ProductizedVerticalKind="association"|'));
ok('household is the primary association membership unit',template.includes('primaryEntityKind:"household"'));
ok('association models annual membership',template.includes('membership_year')&&template.includes('membership_status'));
ok('shared community life covers events/memories/media',template.includes('"events"')&&template.includes('"memories"')&&template.includes('"media"'));
ok('setup exposes Community / Association creation',setup.includes('"association"'));
ok('database constraints include association',migration.includes("'family','alumni','association','organization'"));
ok('association creation has family/household semantics',migration.includes("p_vertical_kind='association'")&&migration.includes("v_entity:='Family / Household'"));
ok('association is accepted by shared outcome home',outcome.includes('type Kind="association"|'));
ok('association is accepted by intelligence contract',intelligenceContracts.includes('\"association\"')||intelligenceContracts.includes('\"alumni\"|\"association\"'));
ok('association has deterministic intelligence copy',intelligenceEngine.includes('association:{risk:'));
ok('association has intelligence UI copy',intelligenceUi.includes('association:{title:'));
ok('baseline association features are release-controlled',migration.includes("'association.core.home'")&&migration.includes("'association.shared.community'"));
ok('advanced association features default to TEST',migration.includes("'test'")&&migration.includes("association.advanced.%"));
ok('formal election is not falsely implemented as casual activity',template.includes('Formal elections are a governed extension'));
ok('association guide entries use valid management section',!guideContent.includes('section:"admin"'));
ok('association guide entries use valid guide status',!guideContent.includes('status:"planned"')&&guideContent.includes('association-governance')&&guideContent.includes('status:"future"'));
ok('guide taxonomy retains manage/future contracts',guideTypes.includes('"manage"')&&guideTypes.includes('"future"'));

if(failures){console.error(`\nMPF-A0 source gate failed: ${failures}`);process.exit(1)}
console.log('\nMPF-A0 Community / Association source gate passed.');
