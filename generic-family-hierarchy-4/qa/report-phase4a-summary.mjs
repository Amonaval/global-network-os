import fs from 'node:fs';
const file='qa-results/PHASE4A-CERTIFICATION-SUMMARY.json';
if(!fs.existsSync(file)){console.error(`Missing ${file}`);process.exit(1)}
const s=JSON.parse(fs.readFileSync(file,'utf8'));
const failures=(s.steps||[]).filter(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const lines=['# TrustWeave QA Phase-4A Runtime Robustness Certification','',`Status: **${s.status}**`,'','## Certified scope','',
'- Family owner: authenticated admin navigation → full reload → authenticated shell recovery',
'- Organization member: directory/search → full reload → governed member recovery with no admin leakage',
'- Authenticated query-string entry plus browser back/forward session recovery',
'- Professional member: delayed REST responses without shell crash',
'- Professional member: simulated transient REST 503 containment followed by clean reload recovery without re-login',
'- 390×844 Organization member: reload, mobile navigation and horizontal-overflow recovery smoke',
'- Post-recovery mobile Organization directory: axe serious/critical accessibility gate','',
'## Safety / independence policy','',
'- No Supabase migration execution',
'- No RLS or RPC permission/security audit execution',
'- No storage mutation',
'- No network create/delete/purge lifecycle',
'- No QA seed or cleanup; existing deterministic fixture is reused',
'- Phase-3 P3-STORAGE-002 remains open and does not get waived by this independent phase','',
'## Required failures','',...(failures.length?failures.map(x=>`- ${x.name}: ${x.status}${x.reason?` — ${x.reason}`:''}`):['- None.']),'',
'## Still deferred','',
'- Phase-3 Storage/RLS blocker resolution and 096/097 side-effect review',
'- Strict RPC privilege remediation',
'- Disposable clean migration replay / upgrade-path certification',
'- CI/headless stabilization and Firefox/WebKit matrix',
'- Volume, performance, stress and load testing'];
fs.writeFileSync('qa-results/PHASE4A-CERTIFICATION-SUMMARY.md',lines.join('\n')+'\n');
console.log(`Phase-4A report: ${s.status}`);
