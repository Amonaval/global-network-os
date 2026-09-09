import fs from 'node:fs';
const file='qa-results/PHASE2-CERTIFICATION-SUMMARY.json';
if(!fs.existsSync(file)){console.error(`Missing ${file}`);process.exit(1)}
const s=JSON.parse(fs.readFileSync(file,'utf8'));
const requiredFailures=(s.steps||[]).filter(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const advisory=(s.steps||[]).filter(x=>!x.required&&(x.status==='failed'||x.status==='blocked'));
const lines=[
 '# TrustWeave QA Phase-2 Certification Summary','',
 `Status: **${s.status}**`,'',
 '## Certified representative scope','',
 '- Owner/admin regression: Family (retained Phase-1 proof; owner admin accessibility baseline in Phase 2)',
 '- Member deep representative: Organization',
 '- Browser tenant isolation: Tenant A authenticated owner against known Tenant B network ID',
 '- API/lifecycle: disposable Organization network/entity with readback, update, purge and zero-residue proof',
 '- Accessibility: Family owner admin + Organization member directory',
 '- Mobile: Organization member at 390×844, Chromium only',
 '- Parity: cheap contracts across all 9 released vertical kinds','',
 '## Required failures / unresolved product defects','',
 ...(requiredFailures.length?requiredFailures.map(x=>`- ${x.name}: ${x.status}${x.reason?` — ${x.reason}`:''}`):['- None recorded by this run.']), '',
 '## Advisory findings','',
 ...(advisory.length?advisory.map(x=>`- ${x.name}: ${x.status}${x.reason?` — ${x.reason}`:''}`):['- No advisory step failed. RPC findings, when present, remain preserved in the RPC audit evidence.']), '',
 '## Strict-security backlog','',
 '- RPC PUBLIC / anon / authenticated execution findings remain a strict/full-certification blocker and are not waived by Phase 2.',
 '- SECURITY DEFINER functions require explicit review during strict security hardening.','',
 '## Skipped by Phase-2 policy','',
 '- Fresh disposable migration replay',
 '- Stress/load and broad volume tests',
 '- Full role × vertical browser Cartesian matrix',
 '- Firefox/WebKit matrix',
 '- Broad accessibility crawl',
 '- Headless/CI stabilization',''
];
fs.writeFileSync('qa-results/PHASE2-CERTIFICATION-SUMMARY.md',lines.join('\n'));
console.log(`Phase-2 report: ${s.status}`);
