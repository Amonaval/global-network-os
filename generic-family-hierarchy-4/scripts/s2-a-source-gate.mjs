import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const checks=[
 ['migration 037 exists',fs.existsSync('supabase/migrations/037_s2a_living_family_loop.sql')],
 ['memory reactions table',read('supabase/migrations/037_s2a_living_family_loop.sql').includes('memory_reactions')],
 ['engagement event ledger',read('supabase/migrations/037_s2a_living_family_loop.sql').includes('family_engagement_events')],
 ['reaction RPC',read('supabase/migrations/037_s2a_living_family_loop.sql').includes('set_memory_reaction')],
 ['loop metrics RPC',read('supabase/migrations/037_s2a_living_family_loop.sql').includes('get_living_loop_metrics')],
 ['Family Pulse surface',read('components/FamilyHome.tsx').includes('Worth a moment today')],
 ['Pulse limited to 3',read('components/FamilyHome.tsx').includes('items.slice(0,3)')],
 ['memory reactions UI',read('components/CommunityHub.tsx').includes('memory-reactions')],
 ['memory share tracked',read('components/CommunityHub.tsx').includes("trackFamilyEngagement('memory_share'")],
 ['contribution completion tracked',read('components/ParticipationCenter.tsx').includes('contribution_completed')],
 ['living loop admin scorecard',read('components/ParticipationCenter.tsx').includes('Living family loop')],
 ['demo reactions populated',read('lib/demo-data.ts').includes('reaction_counts')],
 ['mobile pulse layout',read('app/globals.css').includes('.pulse-focus-grid{grid-template-columns:1fr}')],
];
let passed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)passed++;}
console.log(`S2-A source gate: ${passed}/${checks.length}`);if(passed!==checks.length)process.exit(1);
