import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
const guide=read('lib/user-guide-content.ts');
const portal=read('components/GuidePortal.tsx');
const network=read('components/NetworkApp.tsx');
const checks=[];
const add=(name,ok)=>checks.push([name,!!ok]);

const keys=new Set([...guide.matchAll(/key:\s*"([^"]+)"/g)].map(m=>m[1]));
const related=[...guide.matchAll(/related:\s*\[([^\]]*)\]/g)].flatMap(m=>[...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]));
const missingRelated=[...new Set(related.filter(k=>!keys.has(k)))];
add('all related-guide links resolve',missingRelated.length===0);
add('feedback triage has first-class guide entry',keys.has('feedback-triage')&&guide.includes('Platform Owner only'));
add('guide portal exposes deterministic search',portal.includes('searchGuides(query,visible)')&&portal.includes('Fast, deterministic help'));
add('main views have contextual help',network.includes('<FeatureGuide entry={GUIDE_ENTRIES.find(e=>e.key===guideByView[view])}'));
add('profile drawer contextual help',read('components/ProfileDrawer.tsx').includes('rememberKey="drawer-profile"'));
add('import contextual help',read('components/ImportModal.tsx').includes('rememberKey="modal-import"'));
add('invitation contextual help',read('components/InvitationModal.tsx').includes('rememberKey="modal-invitations"'));
add('relationship contextual help',read('components/RelationshipModal.tsx').includes('rememberKey="modal-relationships"'));
add('playground guide remains no-save',guide.includes('must never write into the authenticated user\'s real family')||guide.includes('never write into the authenticated user'));
add('feedback RPC authenticated only',read('supabase/migrations/041_s2e_guided_family_help_feedback.sql').includes('grant execute on function public.submit_guide_feedback')&&read('supabase/migrations/041_s2e_guided_family_help_feedback.sql').includes('to authenticated'));
add('platform feedback retrieval owner-gated',read('supabase/migrations/041_s2e_guided_family_help_feedback.sql').includes('where public.is_platform_owner()'));
add('S2-E content map not marked merely planned',!read('archive/docs/family-foundation/S2-E-COMPLETE-GUIDE-CONTENT-MAP.md').includes('Status: **PLANNED CONTENT INVENTORY**'));
add('S3 business proof design exists',fs.existsSync('archive/docs/family-foundation/S3-BUSINESS-PROOF-DESIGN.md'));

for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(missingRelated.length) console.log(`Broken related guide keys: ${missingRelated.join(', ')}`);
const passed=checks.filter(x=>x[1]).length;
console.log(`S2-E release closure source gate: ${passed}/${checks.length}`);
if(passed!==checks.length) process.exit(1);
