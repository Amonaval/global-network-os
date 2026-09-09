import fs from 'node:fs';const file='qa-results/PHASE4B-CERTIFICATION-SUMMARY.json';if(!fs.existsSync(file)){console.error(`Missing ${file}`);process.exit(1)}const s=JSON.parse(fs.readFileSync(file,'utf8'));const failures=(s.steps||[]).filter(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const lines=['# TrustWeave QA Phase-4B Data Integrity, Import/Export & Recovery Certification','',`Status: **${s.status}**`,'','## Certified scope','',
'- All nine released verticals: deterministic generated guided workbooks and parser round-trip',
'- All nine released verticals: required-sheet and required-column rejection',
'- All nine released verticals: unknown-sheet warning without corrupting valid importability',
'- Family owner: downloadable JSON and CSV snapshots parse successfully and contain seeded family data',
'- Organization owner: logical API backup satisfies TrustWeave backup contract and manifest-only media semantics',
'- Organization owner: malformed workbook review blocks commit and leaves governed data unchanged',
'- Organization owner: valid workbook review remains client-staged; reload discards uncommitted review and leaves data unchanged','',
'## Safety / independence policy','',
'- No Supabase migration execution','- No RLS/RPC permission/security audit execution','- No Storage mutation','- No network create/archive/delete/purge lifecycle','- No import commit mutation','- No QA seed or cleanup; existing deterministic fixture is reused','- Phase-3 Storage/RLS blocker remains open and is not waived by Phase 4B','',
'## Required failures','',...(failures.length?failures.map(x=>`- ${x.name}: ${x.status}${x.reason?` — ${x.reason}`:''}`):['- None.']),'',
'## Still deferred','',
'- Actual governed import commit/rollback on disposable staging data','- Full automated restore execution (current product contract is guided workbook re-import)','- Phase-3 Storage/RLS blocker and staging migration drift reconciliation','- Strict RPC privilege remediation','- Disposable clean migration replay / upgrade-path certification','- Volume, performance, stress and load testing'];fs.writeFileSync('qa-results/PHASE4B-CERTIFICATION-SUMMARY.md',lines.join('\n')+'\n');console.log(`Phase-4B report: ${s.status}`);
