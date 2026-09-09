import fs from 'node:fs';
const file='qa-results/PHASE3-CERTIFICATION-SUMMARY.json';
if(!fs.existsSync(file)){console.error(`Missing ${file}`);process.exit(1)}
const s=JSON.parse(fs.readFileSync(file,'utf8'));
const requiredFailures=(s.steps||[]).filter(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const advisory=(s.steps||[]).filter(x=>!x.required&&(x.status==='failed'||x.status==='blocked'));
const lines=['# TrustWeave QA Phase-3 Certification Summary','',`Status: **${s.status}**`,'','## Expanded certified scope','',
 '- All 9 released verticals: owner shell + must-exist navigation parity in one reused browser session',
 '- All 9 released verticals: admin shell parity with governed admin navigation in one reused browser session',
 '- All 9 released verticals: member shell/directory parity with no admin leakage in one reused browser session',
 '- Selected distinct depth: Housing Society + Family Association',
 '- Invitation lifecycle: create, resend/token rotation, stale-token denial, accept, replay denial, member entry, cleanup',
 '- Tenant isolation: retained Phase-2 read denial + Phase-3 cross-tenant invitation mutation denial',
 '- Full RLS adversarial runtime suite promoted into this phase',
 '- RPC privilege backlog: preserved and capped against the Phase-2 certified 331-finding ceiling','',
 '## Required failures / unresolved defects','',...(requiredFailures.length?requiredFailures.map(x=>`- ${x.name}: ${x.status}${x.reason?` — ${x.reason}`:''}`):['- None recorded by this run.']),'',
 '## Advisory findings','',...(advisory.length?advisory.map(x=>`- ${x.name}: ${x.status}${x.reason?` — ${x.reason}`:''}`):['- No advisory step failed. Existing RPC findings remain preserved in evidence.']),'',
 '## Still deferred after Phase 3','',
 '- Clean disposable migration replay / upgrade-path certification',
 '- Strict RPC remediation to zero unexpected execute findings',
 '- CI/headless stabilization',
 '- Firefox/WebKit and broader device matrix',
 '- Broad accessibility crawl beyond representative screens',
 '- Performance, resilience volume, stress and load testing',''];
fs.writeFileSync('qa-results/PHASE3-CERTIFICATION-SUMMARY.md',lines.join('\n'));
console.log(`Phase-3 report: ${s.status}`);
