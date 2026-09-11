import fs from 'node:fs';
import path from 'node:path';

const AUDIT='qa-results/security/PHASE5A-RPC-SECURITY-AUDIT.json';
const OUT='qa-results/security/PHASE5A-BATCH1-CONTRACT-REVIEW.md';

const targets=[
  ['a5_storage_guard','trigger_only','high','Storage trigger function; direct client EXECUTE should not be required.'],
  ['fca_seed_network_defaults_trigger','trigger_only','high','Trigger function; should execute through trigger wiring, not PostgREST RPC.'],
  ['handle_new_user','trigger_only','high','Auth/new-user trigger function; direct client EXECUTE should not be required.'],
  ['validate_family_relationship','trigger_only','high','Relationship validation trigger; direct client EXECUTE should not be required.'],
  ['validate_profile_submission_media','trigger_only','high','Validation trigger/helper; treat as trigger-only pending source confirmation.'],
  ['a4_safe_external_url','internal_helper','medium','Pure/helper-style function; likely called by other database logic, not a public application RPC.'],
  ['a5_storage_account','internal_helper','medium','Storage accounting helper; likely internal/trigger support.'],
  ['audit_platform_feature_rollout','internal_privileged','medium','Platform audit helper; likely platform-owner/internal, not broad authenticated access.'],
  ['clear_family_lobby_on_activation','internal_helper','medium','Lifecycle helper; likely invoked by activation workflow/trigger.'],
  ['fca_seed_defaults','internal_helper','medium','Seed/default helper; likely invoked internally during FCA setup.'],
  ['generate_family_join_code','internal_helper','medium','Code-generation helper; public workflow should normally use governed wrapper RPCs.'],
  ['invitation_status','internal_helper','medium','Status helper; likely used by invitation RPCs rather than called directly.'],
  ['is_admin','internal_helper','medium','Authorization helper; should normally be consumed inside governed database functions/RLS.'],
  ['m6b_bridge_capabilities','internal_helper','medium','Capability transformation/helper; likely not a direct client contract.'],
  ['normalize_intake_name','internal_helper','medium','Deterministic normalization helper.'],
  ['reconcile_network_media_usage','internal_privileged','medium','Administrative reconciliation helper; should not be broad client RPC.'],
  ['score_intake_person','internal_helper','medium','Deterministic scoring helper; likely invoked by intake workflows.'],
  ['slugify_family_name','internal_helper','medium','Deterministic slug helper.'],
  ['storage_path_network_id','internal_helper','medium','Storage path parsing helper; normally used inside policies/guards.'],
  ['xp6_log_contribution_review','internal_helper','medium','Audit/log helper; likely invoked by governed review workflow.'],
  ['get_network_quick_start_state','authenticated_application','medium','Looks like a user-facing read contract; authenticate rather than expose to anon/PUBLIC.'],
  ['save_network_quick_start_state','authenticated_application','medium','Looks like a user-facing write contract; authenticate rather than expose to anon/PUBLIC.'],
];

const overloads=[
  ['save_network_settings','authenticated_application','medium','Two live overloads require signature-level contract before grants are changed.'],
  ['submit_profile_change','authenticated_application','medium','Two live overloads require signature-level contract before grants are changed.'],
];

if(!fs.existsSync(AUDIT)){
  console.error(`Phase-5A Batch-1 contract review BLOCKED: missing ${AUDIT}. Run npm run qa:phase5a:audit first.`);
  process.exit(2);
}
const audit=JSON.parse(fs.readFileSync(AUDIT,'utf8'));
const findings=audit.findings||[];
const unclassified=[...new Set(findings.filter(f=>f.code==='UNCLASSIFIED_RPC').map(f=>f.function))].sort();
const overloaded=[...new Set(findings.filter(f=>f.code==='RPC_OVERLOAD_REQUIRES_SIGNATURE_CONTRACT').map(f=>f.function))].sort();
const targetNames=targets.map(x=>x[0]).sort();
const overloadNames=overloads.map(x=>x[0]).sort();
const missingTargets=unclassified.filter(x=>!targetNames.includes(x));
const staleTargets=targetNames.filter(x=>!unclassified.includes(x));
const missingOverloads=overloaded.filter(x=>!overloadNames.includes(x));
const staleOverloads=overloadNames.filter(x=>!overloaded.includes(x));

const status=(missingTargets.length||staleTargets.length||missingOverloads.length||staleOverloads.length)?'REVIEW_DRIFT':'READY_FOR_SOURCE_REVIEW';
const lines=[
  '# TrustWeave Phase-5A — Batch 1 RPC Contract Review','',
  `Status: **${status}**`,'',
  'This step is **read-only/local**. It does not connect to Supabase, execute SQL, change grants, alter migrations, or modify data.','',
  `Source audit: ${audit.functionCount||'?'} live functions; ${audit.affectedFunctionSignatureCount||'?'} affected signatures; P0 ${audit.findingCounts?.P0??'?'}; P1 ${audit.findingCounts?.P1??'?'}.`,'',
  '## Goal','',
  'Resolve contract ambiguity before any permission change. Batch 1 intentionally separates high-confidence trigger-only functions from helpers and likely application RPCs. Medium-confidence classifications are **candidates**, not approved database changes.','',
  '## Unclassified RPC review','',
  '| RPC | Candidate class | Confidence | Reason |','|---|---|---|---|',
  ...targets.map(([name,klass,confidence,reason])=>`| \`${name}\` | ${klass} | ${confidence} | ${reason} |`),
  '','## Overload review','',
  '| RPC name | Candidate class | Confidence | Reason |','|---|---|---|---|',
  ...overloads.map(([name,klass,confidence,reason])=>`| \`${name}\` | ${klass} | ${confidence} | ${reason} |`),
  '','## Batch-1A safe candidates','',
  'The first actual permission patch should initially contain only **high-confidence trigger-only functions**, after confirming their trigger wiring in source/live catalog:','',
  ...targets.filter(x=>x[2]==='high').map(x=>`- \`${x[0]}\``),
  '','No broad anon revoke and no authenticated-role change belongs in Batch 1A.','',
  '## Drift check','',
  `- Audit unclassified functions: ${unclassified.length}`,
  `- Review manifest functions: ${targets.length}`,
  `- Audit overload names: ${overloaded.length}`,
  `- Review manifest overload names: ${overloads.length}`,
  `- Missing review targets: ${missingTargets.length?missingTargets.join(', '):'none'}`,
  `- Stale review targets: ${staleTargets.length?staleTargets.join(', '):'none'}`,
  `- Missing overload targets: ${missingOverloads.length?missingOverloads.join(', '):'none'}`,
  `- Stale overload targets: ${staleOverloads.length?staleOverloads.join(', '):'none'}`,
  '','## Next gate','',
  'Before generating SQL, inspect the source/live trigger wiring for the five high-confidence trigger-only functions. Only then create a tiny Batch-1A migration, apply it to the disposable QA project first, rerun Phase-5A audit + regression, and finally promote the exact same migration to main/staging if green.',''
];
fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT,lines.join('\n'));
console.log(`Phase-5A Batch-1 contract review ${status} (${targets.length} unclassified targets; ${overloads.length} overload names; zero DB writes)`);
console.log(`Evidence: ${OUT}`);
if(status!=='READY_FOR_SOURCE_REVIEW')process.exit(1);
