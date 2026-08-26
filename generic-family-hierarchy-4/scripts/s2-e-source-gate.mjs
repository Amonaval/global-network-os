import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const files={app:read('components/NetworkApp.tsx'),portal:read('components/GuidePortal.tsx'),feature:read('components/FeatureGuide.tsx'),feedback:read('components/GuideFeedback.tsx'),registry:read('lib/user-guide-content.ts'),remote:read('lib/remote.ts'),migration:read('supabase/migrations/041_s2e_guided_family_help_feedback.sql'),founder:read('components/FounderLaunchConsole.tsx'),css:read('app/globals.css')};
const checks=[
 ['Explore & Guide navigation',files.app.includes('Explore & Guide')],
 ['central guide registry',files.registry.includes('GUIDE_ENTRIES')&&files.registry.includes('searchGuides')],
 ['contextual FeatureGuide',files.app.includes('<FeatureGuide')&&files.feature.includes('What can I do here?')],
 ['standalone GuidePortal',files.app.includes('<GuidePortal')&&files.portal.includes('What brings you here?')],
 ['goal-oriented help',files.portal.includes('What do you want to do?')&&files.registry.includes('GUIDE_GOALS')],
 ['10 persona journeys',(files.registry.match(/title:"/g)||[]).length>=10&&files.registry.includes('Family historian')&&files.registry.includes('Relative living abroad')],
 ['privacy trust center',files.registry.includes('Privacy & Trust Center')&&files.registry.includes('Does community membership automatically make me searchable?')],
 ['guide feature/role metadata',files.registry.includes('audiences:')&&files.registry.includes('featureKey:')&&files.registry.includes('status:"live_verify"')],
 ['playground no-save guide actions',files.app.includes('tryGuideInPlayground')&&files.registry.includes('key:"playground"')],
 ['feedback persistence migration',files.migration.includes('create table if not exists public.guide_feedback')&&files.migration.includes('submit_guide_feedback')],
 ['feedback safe metadata only',!files.migration.includes('memory_story')&&!files.migration.includes('phone')&&files.migration.includes('experience_mode')],
 ['platform owner feedback triage',files.founder.includes('Family feedback intelligence')&&files.remote.includes('updatePlatformGuideFeedbackStatus')],
 ['roadmap interest signals persist',files.portal.includes('future_interest')&&files.portal.includes("not a roadmap commitment")],
 ['mobile responsive 390',files.css.includes('@media(max-width:390px)')],
 ['guide module breadth',['guided-excel','marriage-discovery','trusted-families','introductions','family-lobby','leave-family','platform-launch-control'].every(k=>files.registry.includes(`key:"${k}"`))],
];
let pass=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`S2-E source gate: ${pass}/${checks.length}`);if(pass!==checks.length)process.exit(1);
