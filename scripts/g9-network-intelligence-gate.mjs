import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
const failures=[];const fail=m=>failures.push(m);
const required=['core/intelligence/contracts.ts','core/intelligence/engine.ts','components/shared/NetworkIntelligenceCenter.tsx','supabase/migrations/049_g9_network_intelligence.sql','G9-NETWORK-INTELLIGENCE-LAYER.md','G9-RUNTIME-VERIFICATION-CHECKLIST.md'];
for(const f of required)if(!exists(f))fail(`missing ${f}`);
const contracts=read('core/intelligence/contracts.ts'),engine=read('core/intelligence/engine.ts'),ui=read('components/shared/NetworkIntelligenceCenter.tsx'),migration=read('supabase/migrations/049_g9_network_intelligence.sql');
for(const marker of ['IntelligenceEvidence','IntelligenceInsight','IntelligenceAnswer','IntelligenceHealth','IntelligenceDataset'])if(!contracts.includes(marker))fail(`intelligence contracts missing ${marker}`);
for(const marker of ['searchNetwork','shortestPath','analyzeHealth','buildInsights','suggestedQuestions','askNetwork'])if(!engine.includes(`function ${marker}`))fail(`deterministic engine missing ${marker}`);
for(const forbidden of ['supabase','fetch(','openai','anthropic','gemini','chat.completions','responses.create'])if(engine.toLowerCase().includes(forbidden))fail(`deterministic intelligence engine must not access external/LLM path: ${forbidden}`);
for(const marker of ['Ask Network','Why this answer','confidence','Tenant isolated · permission aware · provenance visible · deterministic first','intelligence-question-chips','intelligence-insight-grid'])if(!ui.includes(marker))fail(`Intelligence UI missing ${marker}`);
const productApp=read('components/TemplateNetworkApp.tsx'),alumniApp=read('components/AlumniNetworkApp.tsx'),familyApp=read('components/NetworkApp.tsx');
for(const [name,src] of [['productized',productApp],['alumni',alumniApp],['family',familyApp]])if(!src.includes('NetworkIntelligenceCenter'))fail(`${name} app missing NetworkIntelligenceCenter`);
for(const [kind,file,key] of [
 ['family','verticals/family/features/catalog.ts','intelligence.network'],
 ['alumni','verticals/alumni/features/catalog.ts','alumni.shared.intelligence'],
 ['organization','capabilities/template-product/features.ts','shared.intelligence'],
 ['business-trust','capabilities/template-product/features.ts','shared.intelligence'],
 ['franchise','capabilities/template-product/features.ts','shared.intelligence'],
]){const src=read(file);if(!src.includes(key))fail(`${kind} intelligence feature missing ${key}`);}
for(const file of ['verticals/family/runtime/composition.ts','verticals/alumni/runtime/composition.ts','capabilities/template-product/composition.ts']){const src=read(file);if(!src.includes('viewId:"intelligence"'))fail(`${file} missing Intelligence navigation surface`);if(!src.includes('key:"intelligence"'))fail(`${file} missing Launch Control intelligence bundle`);}
for(const file of ['verticals/family/definition.ts','verticals/alumni/definition.ts','verticals/organization/definition.ts','verticals/business-trust/definition.ts','verticals/franchise/definition.ts'])if(!read(file).includes('network.intelligence'))fail(`${file} missing network.intelligence capability`);
for(const key of ['intelligence.network','alumni.shared.intelligence','organization.shared.intelligence','business-trust.shared.intelligence','franchise.shared.intelligence']){if(!migration.includes(`'${key}'`))fail(`migration 049 missing ${key}`);}
if((migration.match(/'test'/g)||[]).length<5)fail('G9 intelligence features must start in Test for real networks');
if((migration.match(/,true\)/g)||[]).length<5)fail('G9 intelligence must be enabled in all five Playgrounds');
const familyGuide=read('lib/user-guide-content.ts');if(!familyGuide.includes('key:"family-intelligence"'))fail('Family central Guide missing G9 intelligence entry');
for(const src of [productApp,alumniApp])if(!src.includes('g9-guide-card'))fail('Product Guide missing contextual G9 Intelligence coverage');
const css=read('app/globals.css');for(const marker of ['.network-intelligence-center','.ask-network-card','.intelligence-insight-grid','.intelligence-evidence'])if(!css.includes(marker))fail(`G9 CSS missing ${marker}`);
const tsFiles=['core/intelligence/contracts.ts','core/intelligence/engine.ts','components/shared/NetworkIntelligenceCenter.tsx','components/TemplateNetworkApp.tsx','components/AlumniNetworkApp.tsx','components/NetworkApp.tsx','capabilities/template-product/features.ts','capabilities/template-product/composition.ts','verticals/family/features/catalog.ts','verticals/family/runtime/composition.ts','verticals/alumni/features/catalog.ts','verticals/alumni/runtime/composition.ts','core/verticals/contracts.ts'];
for(const f of tsFiles){const result=ts.transpileModule(read(f),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true,fileName:f});const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);if(errors.length)fail(`TypeScript transpile failed for ${f}: ${errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; ')}`)}
if(failures.length){for(const f of failures)console.error(`G9 network intelligence gate: FAIL — ${f}`);process.exit(1)}
console.log('G9 network intelligence gate: PASS — deterministic search, paths, health, missing-link detection, evidence-backed Ask Network, five-vertical adapters and Launch Control registration verified.');
