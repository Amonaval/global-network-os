import fs from 'node:fs';const file='qa-results/PHASE4D-CERTIFICATION-SUMMARY.json';if(!fs.existsSync(file)){console.error(`Missing ${file}`);process.exit(1)}const s=JSON.parse(fs.readFileSync(file,'utf8'));const failures=(s.steps||[]).filter(x=>x.required&&(x.status==='failed'||x.status==='blocked'));
const lines=['# TrustWeave QA Phase-4D Vertical-Specific Workflow & Business-Rule Certification','',`Status: **${s.status}**`,'','## Certified scope','',
'- Family: kinship/tree-first UX plus self-link, duplicate, generation-order and parent/child-cycle rejection contracts',
'- Housing Society: unit is the operating object; ownership, tenancy, household membership and residency stay distinct; society-specific directory/admin controls remain isolated',
'- Family Association: family is the annual membership unit; representative/member modes and annual operating administration remain distinct from generic Association',
'- Association: household-centric membership stays separate from Family Association semantics',
'- Alumni: cohort/program/batch semantics remain institutional and do not inherit Family kinship navigation',
'- Organization: reports-to, works-with, owns and depends-on relationship vocabulary',
'- Business Trust: recommends, verified-by, supplies-to and worked-with trust/provenance vocabulary',
'- Franchise: owns, operates, manages and supports operational relationship vocabulary',
'- Professional: worked-with, referred-by, collaborates-with and mentors semantics; regulated clinical/patient workflows remain explicitly out of scope','',
'## Safety / independence policy','','- No Supabase migration execution','- No Storage mutation','- No service-role client','- No archive/purge/permanent-delete execution','- No QA seed or cleanup','- Existing deterministic fixture is reused; only active-network context is switched','- Phase-3 Storage/RLS blocker remains open and is not waived by Phase 4D','',
'## Required failures','',...(failures.length?failures.map(x=>`- ${x.name}: ${x.status}${x.reason?` — ${x.reason}`:''}`):['- None.']),'','## Still deferred','',
'- Phase-3 Storage/RLS blocker and staging drift reconciliation','- Strict RPC privilege remediation','- Clean migration replay / upgrade-path certification','- Disposable-environment destructive lifecycle certification','- Large-data/load/stress and broad cross-browser matrices','- Election-grade voting, payment/accounting and regulated clinical workflows that are explicitly outside currently released vertical contracts'];fs.writeFileSync('qa-results/PHASE4D-CERTIFICATION-SUMMARY.md',lines.join('\n')+'\n');console.log(`Phase-4D report: ${s.status}`);
