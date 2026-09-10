# QA Current Status — Fresh Session Handover

Date: 2026-09-09

## Operating mode
- Feature development paused for QA/hardening.
- Supabase Free Tier: resource conservation is mandatory.
- Default command: `npm run qa:certify` = compact Free-Tier POC.
- Full future command: `npm run qa:certify:full`.
- One worker, tiny deterministic data, session reuse, no stress/large-volume work by default.

## Latest confirmed local results
- `npm run qa:seed`: PASS — 9 released verticals + isolated Tenant B.
- `npm run qa:unit`: PASS after final import/workbook contract fixes.
- Database integrity: PASS (7 checks).
- RPC POC: PASS (12 checks; only 2 authenticated sessions).
- RLS POC: PASS (7 checks; owner + tenantB).
- Browser POC: PASS — Family admin + Housing Society shell using one login.
- RPC permission audit: 331 advisory findings out of 386 public functions; not resolved.

## Formal closure still pending
`npm run qa:certify` must be rerun once after the final unit-contract patch. Expected terminal status:

POC report: POC_CERTIFIED
TrustWeave free-tier POC certification: POC_CERTIFIED

If it does not certify, inspect `qa-results/poc-certification-run.json` and the failing local/runtime layer; do not blindly rerun Supabase-heavy checks.

## Dependency requirement
`package.json` must retain:
- `@playwright/test`: `^1.55.0`
- `tsx`: `^4.23.13`

`tsx` is required because `qa:unit` executes TypeScript tests through `tsx --test`.

## Supabase project separation
Main existing working STAGING project supplies:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- QA_STAGING_PROJECT_REF
- QA_DATABASE_URL

Optional separate disposable project supplies only:
- QA_FRESH_DATABASE_URL

Fresh replay may stay disabled during POC with `QA_DB_ALLOW_FRESH_REPLAY=false`.

## Do not regress these fixes
- `.env.qa` is authoritative over inherited shell QA flags.
- Mutating QA requires `QA_MODE=staging` and `QA_ALLOW_MUTATION=true`.
- Hosted Supabase mutation requires exact `QA_STAGING_PROJECT_REF` match.
- No local/system `psql` requirement; DB QA uses Node `pg`.
- Seed entity kinds are capability/vertical aware.
- QA metadata must not invent an affiliation dimension named `qa`.
- Membership transport must preserve all 9 released vertical kinds.
- Auth automation must open the landing sign-in dialog and use stable test IDs.
- POC RPC privilege findings are advisory evidence; full certification remains strict.

## Handover packaging note
The final consolidated ZIP persists `tsx` in `package.json`. Because the inherited baseline lockfile predates this final persistence, run `npm install` once after extracting the handover ZIP to synchronize `package-lock.json`; do not use `npm ci` for that first dependency sync.

## 2026-09-09 Phase-1 certification hardening patch

A repeated certification-policy defect was corrected after runtime evidence showed the known RPC privilege backlog still printing `FAIL` during compact POC certification. `qa:certify` now invokes the permission audit explicitly in advisory mode while preserving every finding and its strict failure disposition; `qa:certify:full` invokes the same audit explicitly in strict mode. No RPC finding was removed, waived, or globally suppressed.

The initial Playwright login navigation was also hardened: readiness no longer depends on the browser's full `load` event. It waits for navigation commit and then proves the real sign-in/authenticated application state through stable QA test IDs. One worker and single-login POC behavior remain unchanged.

Formal Phase-1 closure is achieved locally with `npm run qa:certify` ending in `POC_CERTIFIED`.

## Phase-1 headless investigation outcome

- The temporary `data-qa-app-ready` / `qa-app-loading` instrumentation and bootstrap-wait login experiment were diagnostic only and did not resolve the local headless Chromium behavior.
- Those experimental product/harness changes were reverted from the clean baseline after headed Chromium proved stable.
- The retained browser hardening is limited to navigation-on-commit plus stable QA test IDs and the headed Chromium certification command.
- Headless execution remains a separate later CI/runtime-hardening item; it does not block the Free-Tier local POC.

## Phase-1 browser runtime decision

Compact local Free-Tier POC certification runs its single Chromium journey in headed mode. The identical test is proven stable headed on the current Windows/Next.js development runtime; headless hydration stability is tracked separately for later CI/production hardening. See `QA-PHASE1-HEADED-POC-DECISION.md`.

## 2026-09-10 — Phase-2 implementation started

Phase 2 now has a dedicated representative capability profile without altering the certified Phase-1 runner. `qa/e2e/16-phase2-representative-capabilities.spec.ts` adds Organization member proof, browser-authenticated Tenant-A→Tenant-B denial, compact API/lifecycle mutation with cleanup, two axe baselines and one 390×844 Chromium mobile smoke. `qa/unit/phase2-parity.test.mjs` adds cheap released-kind parity. `qa/run-phase2-certification.mjs` reuses the deterministic seed and compact DB/RPC/RLS foundation; RPC privilege findings remain advisory in this profile and preserved for strict certification.

## 2026-09-10 — Phase-2 accessibility defect P2-A11Y-001

The representative Family owner/admin axe gate found a serious WCAG 2 AA `color-contrast` violation in the Family Admin Center. Root cause was a family of muted text colors below 4.5:1 on white/light surfaces, not an axe false positive. The shared admin-center CSS was corrected for member/simple-row secondary text, setting descriptions, storage captions, and settings-readout labels. The existing Phase-2 axe serious/critical assertion remains unchanged and is the regression gate; no violation was waived or filtered.


## 2026-09-10 — Phase-2 accessibility follow-up P2-A11Y-002

The Family owner/admin axe gate exposed two remaining source-level issues after the first contrast hardening: the sidebar generation count measured 4.46:1 against its light surface (just below WCAG AA 4.5:1), and the member-experience preview `<select>` had no programmatic accessible name. The generation-count color is now explicitly darkened to a >4.5:1 light-theme value, and the existing visible preview label is bound to the select with `htmlFor`/`id`. The axe serious/critical gate remains unchanged; no rule is excluded or waived.

## 2026-09-10 — Phase-2 formally certified

Local execution completed with:

- `Phase-2 report: PHASE2_CERTIFIED`
- `TrustWeave Phase-2 representative certification: PHASE2_CERTIFIED`

Phase-2 closure includes representative owner/admin/member behavior, browser tenant isolation, governed API/lifecycle proof, representative accessibility, mobile Chromium smoke, nine-kind parity contracts, and regression coverage for defects found during the mission.

## 2026-09-10 — Phase-3 implementation started

Phase 3 expands from representative proof to broad platform parity while retaining Free-Tier discipline. It adds reused-session owner/admin/member traversal across all 9 released verticals, selected Housing Society + Family Association depth, a governed invitee invitation lifecycle, cross-tenant mutation denial, full adversarial RLS as a required gate, and an RPC permission non-regression ceiling anchored to the Phase-2-certified 386-function / 331-finding inventory. Existing RPC findings remain preserved and are not waived; strict remediation is still deferred.

### P3-SEC-001 — SECURITY DEFINER NULL authorization bypass (fixed, migration 095)

Phase-3 cross-tenant invitation testing found that `create_network_participation_invitation` could authorize a non-member against a known foreign network UUID. The function selected membership role into a scalar and used `actor NOT IN ('owner','admin')`; when no membership row existed, `actor` was NULL, PostgreSQL three-valued logic made the predicate NULL rather than TRUE, and the PL/pgSQL IF did not execute. This allowed the subsequent SECURITY DEFINER insert to run.

Fix: migration `095_phase3_security_definer_null_authorization_hardening.sql` explicitly rejects NULL role lookups and applies the same defensive correction to the other SECURITY DEFINER role-changing functions with equivalent NULL-unsafe comparisons. Regression coverage exists both at the direct RPC isolation layer and the HTTP browser/API layer, including zero-persisted-row proof. The API assertion remains strict at 401/403/404.

### P3-STORAGE-001 — Supabase Storage investigation attempt (not accepted as closure)
- Classification remains open; the initial `22023` symptom was later resolved to an authorization message rather than proven size-metadata failure.
- Migration `096_phase3_storage_metadata_compatibility.sql` was applied experimentally to staging but did **not** resolve the required adversarial upload check. It also introduced a 1 MB bucket hard ceiling that must be reviewed in a later controlled database-hardening session.
- Migration `097_phase3_storage_path_scoped_authorization.sql` was also applied experimentally to staging and did **not** resolve the observed runtime denial.
- Neither 096 nor 097 is accepted as a certified baseline migration while P3-STORAGE-002 remains open. Do not rerun or extend them during Phase 4A. Staging database drift from these manual experiments must be reconciled deliberately later.

## 2026-09-10 — Phase-3 closure remains blocked by P3-STORAGE-002

Phase-3 local/browser capability work is green, but formal Phase-3 certification remains blocked by one adversarial Storage/RLS check: a valid Tenant-B upload still receives the legacy `Media can only be uploaded to your active family.` denial. Investigation is intentionally frozen to avoid further churn on the sensitive Supabase project. Migrations 096/097 must not be rerun or extended during Phase 4A. The known 1 MB bucket hard ceiling introduced by 096 is recorded for later controlled review. Phase 4A does not waive or reclassify this blocker.

## 2026-09-10 — Phase-4A Runtime Robustness, Recovery & Failure Handling implemented

Phase 4A is an independent, DB-hardening-safe certification profile. It adds authenticated reload/session recovery for Family owner and Organization member, query-string and browser history recovery, delayed-backend tolerance, browser-local simulated REST 503 containment + recovery, 390×844 mobile reload/navigation/overflow proof, and a post-recovery mobile axe serious/critical gate. Failure injection is implemented only with Playwright route interception and is removed within the test.

The Phase-4A runner intentionally does not execute migrations, RLS/RPC audits, Storage mutations, network lifecycle create/delete/purge, seed, or cleanup. It reuses the existing deterministic seed fixture and performs only ordinary authenticated application access plus minimal active-network context switching needed for deterministic representative coverage.

Commands:
- `npm run qa:phase4a:local`
- `npm run qa:phase4a:browser`
- `npm run qa:certify:phase4a`

Expected closure status: `PHASE4A_CERTIFIED`. This status is independent of the still-open Phase-3 Storage/RLS blocker.
## 2026-09-10 — Phase-4A accessibility defect P4A-A11Y-001

The post-recovery 390×844 Organization axe gate found a critical `button-name` violation. Responsive CSS intentionally hides the visible copy inside shared top-bar controls on mobile, which can leave their buttons visually icon-only. `NetworkAccountMenu` and `NetworkSwitcher` now provide explicit programmatic `aria-label` names independent of visible responsive text. The axe serious/critical gate remains unchanged; no accessibility finding is filtered or waived.
## 2026-09-10 — Phase-4A harness defect P4A-QA-001

The slow-REST robustness test intermittently raised `Route is already handled!` because a delayed `route.continue()` could race with route teardown while outstanding REST requests were still pending. This was a QA harness defect, not a product/runtime failure. The test now uses a named cooperative `route.fallback()` handler, waits for delayed requests to drain, and unregisters only that handler. Product assertions remain unchanged.


## 2026-09-10 — Phase-4A formally certified

`npm run qa:certify:phase4a` completed with `PHASE4A_CERTIFIED`. Runtime robustness, reload/session recovery, simulated REST failure containment, mobile recovery and post-recovery accessibility are formally closed for the Phase-4A profile.

## 2026-09-10 — Phase-4B implementation started

QA Phase 4B is **Data Integrity, Import/Export & Recovery Certification**. It is intentionally independent of the unresolved Phase-3 Storage/RLS blocker and performs no migrations, Storage mutation, security audits, destructive network lifecycle or import commit mutation.

Phase-4B coverage includes:
- deterministic guided workbook generation and parser round-trip across exactly the nine released verticals;
- missing required sheet and required column rejection across all nine verticals;
- unknown-sheet warning behavior without invalidating otherwise valid data;
- Family owner JSON/CSV portable snapshot verification;
- Organization logical backup contract and manifest-only media verification;
- malformed workbook browser review with commit blocked and zero governed-data change;
- valid workbook browser review interruption/reload proving uncommitted review is client-staged and leaves governed data unchanged.

Commands:
- `npm run qa:phase4b:local`
- `npm run qa:phase4b:browser`
- `npm run qa:certify:phase4b`

Phase-3 `P3-STORAGE-002` remains open. Experimental migrations 096/097 are not part of the accepted certified source baseline and are not evaluated or modified by Phase 4B.

## 2026-09-10 — Phase-4B harness corrections P4B-QA-001

The first Phase-4B browser run exposed three test-harness assumptions rather than product data-loss defects. Family JSON export stores the real tenant UUID in `network.network_id` while the legacy settings row can retain `network.id = "network"`; the assertion now validates the canonical tenant identity. The malformed XLSX fixture now creates the Playwright output directory before `XLSX.writeFile`. The valid Organization recovery proof no longer depends on a browser download before testing staged-import recovery; it creates a canonical workbook with the production `createImportWorkbook(getImportSchema("organization"))` builder, then verifies browser review, commit readiness, reload clearing and unchanged governed data. No product code, database migration, Storage or import commit mutation was added.


## 2026-09-10 — Phase-4B import review diagnostic P4B-QA-002

Both malformed and canonical Organization workbook browser tests attach the file successfully but no review surface appears. `GuidedWorkbookImport` already catches file-read/parser exceptions and renders a notice, so Phase-4B now exposes that existing notice via `qa-guided-import-message` and fails with the exact product-side read/parser message when review is absent. This is observability only: no import behavior, parser rule, commit behavior, or Supabase state is changed, and the review/commit assertions remain strict.

## 2026-09-10 — Phase-4B harness defect P4B-QA-003

The import diagnostic proved both malformed and canonical Organization XLSX uploads failed before parsing with the browser-side message `A requested file or directory could not be found at the time an operation was processed.` The common failure is the Playwright filesystem-backed upload fixture, not the Organization parser contract. Phase-4B now serializes XLSX workbooks to in-memory buffers and attaches them with `setInputFiles({ name, mimeType, buffer })`, eliminating transient filesystem-path lifetime from the browser import proof. Review, commit-block/readiness, reload recovery, and zero-governed-data-change assertions remain unchanged. No product, Supabase, Storage, SQL or import-commit behavior was modified.

## 2026-09-10 — Phase-4B formally certified

`npm run qa:certify:phase4b` completed with `PHASE4B_CERTIFIED`. Deterministic import/export contracts, Family portable snapshots, Organization logical backup semantics, malformed-workbook containment, client-staged review recovery and zero-governed-data-change proofs are formally closed for the Phase-4B profile.

## 2026-09-10 — Phase-4C Governance, Permissions & Destructive-Action Safety implemented

Phase 4C adds application-level governance certification without reopening the Phase-3 Storage/RLS investigation. It introduces explicit QA observability for Family and productized lifecycle/member controls, owner/admin/member UI-boundary proofs, backend role/invitation/destructive negative checks, stale-session permission revocation, exact-name/confirmation protection, and duplicate-submit prevention.

Safety policy:
- no Supabase migrations;
- no Storage mutation;
- no service-role client;
- no permanent purge/delete execution;
- no QA seed or cleanup;
- one narrowly scoped Organization admin-role downgrade requires explicit staging mutation mode and is restored to `admin` in `finally`;
- member-removal duplicate-submit proof is intercepted in-browser and never mutates the database;
- Phase-3 `P3-STORAGE-002` remains open and is neither evaluated nor waived by Phase 4C.

Commands:
- `npm run qa:phase4c:local`
- `npm run qa:phase4c:browser`
- `npm run qa:certify:phase4c`

Expected closure status: `PHASE4C_CERTIFIED`.

## 2026-09-10 — Phase-4D implementation started

Phase 4D moves QA from shared-platform correctness into **vertical-specific workflow and business-rule certification**. It intentionally does not reopen the unresolved Phase-3 Storage/RLS investigation and introduces no Supabase migrations, Storage mutation, destructive lifecycle execution, service-role access, seed or cleanup.

Certified target distinctions:
- Family remains kinship/tree-first and retains strict self-link, duplicate, generation-order and parent/child-cycle validation.
- Housing Society remains unit-centric; ownership, tenancy, household membership and residency are separate concepts, with dedicated society directory/admin operating surfaces.
- Family Association uses `family` as the annual paid membership unit and keeps representatives/members plus annual operating administration distinct from generic Association.
- Association stays household-centric and does not silently inherit Family Association-specific controls.
- Alumni remains institutional/cohort-oriented with batch/program directory semantics rather than Family generations/kinship.
- Organization, Business Trust, Franchise and Professional each retain their own governed relationship vocabulary rather than collapsing into a generic edge model.
- Professional explicitly keeps regulated clinical/patient workflows outside the released scope.

Phase-4D browser tests are read-only with respect to governed network/domain data. They reuse the existing deterministic seed and only switch the user's active-network context between already-seeded networks. New `data-testid` attributes are observability-only and do not change product behavior.

Commands:
- `npm run qa:phase4d:local`
- `npm run qa:phase4d:browser`
- `npm run qa:certify:phase4d`

Expected closure status: `PHASE4D_CERTIFIED`.

## 2026-09-10 — Phase-5A Security Contract & RPC Closure implemented

Phase 5A promotes RPC exposure from the earlier advisory/non-regression posture into a strict production-readiness contract. The implementation is deliberately read-only against the live QA database: it queries PostgreSQL catalogs for public-schema function inventory, ACL exposure, SECURITY DEFINER ownership/search-path configuration, and public-schema CREATE privileges. It does **not** execute migrations, GRANT/REVOKE, RLS/Storage changes, or application-data mutations.

The Phase-5A contract derives intended client roles from migration history and reconciles that intent with the live database. It blocks unexpected PUBLIC/anon execution, missing intended client grants, internal/helper RPC exposure, unclassified live RPCs, SECURITY DEFINER functions without fixed `search_path`, unsafe SECURITY DEFINER ownership, and live overload ambiguity. Findings are P0/P1 and are never downgraded to advisory.

Evidence generated by `qa:phase5a:audit`:
- `qa-results/security/PHASE5A-RPC-MIGRATION-INTENT.json`
- `qa-results/security/PHASE5A-RPC-SECURITY-AUDIT.json`
- `qa-results/security/PHASE5A-RPC-SECURITY-AUDIT.md`
- `qa-results/security/PHASE5A-RPC-REMEDIATION-PREVIEW.sql`

The remediation SQL is review-only, wrapped in `BEGIN` / `ROLLBACK`, and is never executed automatically. This is intentionally the first Phase-5A step because the historical ~331 unexpected RPC privilege findings require evidence-driven batching rather than a blanket ACL rewrite on the sensitive Supabase project.

Commands:
- `npm run qa:phase5a:local`
- `npm run qa:phase5a:audit`
- `npm run qa:certify:phase5a`

Expected first-run outcome may be `REMEDIATION_REQUIRED`; `PHASE5A_CERTIFIED` is only possible after strict P0/P1 closure. Phase-3 `P3-STORAGE-002` and experimental staging migrations 096/097 remain separate and are not modified by Phase 5A.

## 2026-09-10 — Phase-5B Fresh Database Migration & Upgrade Certification implemented

Phase 5B implements the production migration-chain gate without mutating the normal QA/staging project. Source inventory blocks duplicate/gapped migration versions and explicitly quarantines the unresolved experimental Phase-3 storage migrations `096_phase3_storage_metadata_compatibility.sql` and `097_phase3_storage_path_scoped_authorization.sql` until they are deliberately reconciled. A one-time replay command requires an explicitly confirmed disposable empty Supabase project, proves fresh `001 → checkpoint`, checkpoint → latest upgrade, configured latest-suffix rerun safety, and core post-replay RLS/schema-privilege integrity. It never drops or resets an existing schema.

The final `qa:certify:phase5b` command does **not** replay migrations again. It consumes replay evidence and requires its SHA-256 migration-source fingerprint to match the current source, avoiding repeated destructive/free-tier work.

Commands:
- `npm run qa:phase5b:local`
- `npm run qa:phase5b:inventory`
- `npm run qa:phase5b:replay` — once, disposable project only
- `npm run qa:certify:phase5b` — evidence-only closure

Expected closure status: `PHASE5B_CERTIFIED`.

## 2026-09-10 — Phase-5C Production Release Certification implemented

Phase 5C is the final evidence-composition and release-candidate runtime gate. It is designed to run only after Phase 5A strict security closure and Phase 5B fresh migration certification. The mutating runtime command uses a dedicated `.env.qa.release` configuration and refuses to target the normal/protected staging project, a production-like project, or an environment that has not been explicitly confirmed disposable.

The Phase-5C runtime reuses the Phase-5B disposable project and requires the project reference to match Phase-5B replay evidence. It seeds deterministic QA identities/networks once, reruns strict RPC security on that release candidate, executes the adversarial RLS matrix, verifies health/anonymous denial, owner/admin/member and cross-tenant boundaries, invitation expiry/revoke/resend/replay behavior, private signed-media authorization, logical backup semantics, and the full disposable create/import/media/archive/restore/purge/zero-residue lifecycle. Fixture networks are cleaned in `finally`-style runner closure.

The final `qa:certify:phase5c` command is evidence-only: it requires Phase 4A/4B/4C/4D, Phase 5A, Phase 5B and current Phase-5C runtime evidence, but it does not rerun seed, migration replay or destructive lifecycle.

Commands:
- `npm run qa:phase5c:local`
- `npm run qa:phase5c:runtime` — explicit disposable release project only
- `npm run qa:certify:phase5c` — evidence-only finalizer

Expected final status: `TrustWeave Production Certification: PRODUCTION_CERTIFIED`.
