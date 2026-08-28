# G9 VALIDATION UPDATE

- `core/intelligence/contracts.ts` + `engine.ts`: strict standalone TypeScript check PASS.
- G9 changed TS/TSX surface: TypeScript transpile/syntax checks PASS.
- `npm run validate:g8`: PASS with historical Family/Alumni protection preserved through explicit G9 normalization only.
- `npm run validate:g8-6c`: PASS through the full G8.5/G8.6 chain.
- `npm run validate:g9`: new final gate.
- Production Next build still requires dependency-installed workspace (`npm ci`).

---

# P3 validation checklist

## Fresh local installation
1. Remove old localStorage if testing an older build.
2. Start the app.
3. Confirm the setup screen appears.
4. Confirm no demo/random data appears automatically.
5. Enter a network name and choose Start Empty.
6. Confirm the header uses that exact network name.
7. Import a CSV containing non-UUID IDs such as `s1787065934735` and parent/spouse references to those IDs.
8. Confirm import succeeds and relationships render.
9. Confirm browser storage contains generated UUIDs, not `s178...` IDs as database IDs.

## Shared Supabase
1. Run migrations 001 → 004 in Supabase SQL Editor.
2. Create the first user.
3. Confirm the first user is `admin`.
4. Sign in.
5. Confirm setup screen appears if `network_settings` is empty.
6. Choose Empty, Demo, or Import.
7. Confirm all members and relationships are shared from Supabase.
8. Open a second browser/session and verify the same data is visible.
9. Test profile submission and admin approval.
10. Test relationship add/remove.

## Production
```bash
npm install
npm run build
```
Then deploy to Vercel and configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production, Preview and Development as required.

# P4.1 validation checklist

## Integrity
1. Load the fixed 150-member demo.
2. Confirm Administration → Data Integrity reports zero blocking errors.
3. Confirm the three existing mixed-generation spouse records appear only as warnings.
4. Try adding a member as their own parent; it must be rejected.
5. Try adding a parent relationship that reverses an existing ancestry path; it must be rejected.
6. Try adding a duplicate spouse in the opposite direction; it must be rejected/merged by database uniqueness.

## Import validation
1. Import a file with a missing name; import must be blocked.
2. Import a duplicate source ID; import must be blocked.
3. Import a source ID that collides with an existing UUID but a different person; import must be blocked.
4. Import a possible duplicate name + DOB; import should show a warning, not silently create a merge.
5. Import an existing relationship; import should warn that it will be upserted, not delete anything.
6. Import a parent/child cycle; import must be blocked before writes.

## Privacy
1. Sign in as a normal member.
2. Confirm the application can show the hierarchy but phone/email are unavailable.
3. In Supabase, verify direct `select` access to `family_members` from the browser authenticated role is revoked.
4. Confirm `get_visible_family_members()` returns null phone/email for a member.
5. Sign in as admin and confirm phone/email are available in the profile drawer.

## Governance
1. Submit a profile.
2. Confirm one profile submission and one pending change request are created.
3. Confirm an audit event is created.
4. Approve/reject the submission and confirm the linked change request moves to the same status.
5. Confirm Administration shows recent change requests and audit events.

## Build
Run locally with dependencies installed:

```bash
npm install
npm run build
```

The current source review environment did not have project dependencies installed; `npm install` exceeded the available execution window, so a full Next.js production build could not be completed here.

# V1 Family Alpha release certification

Use `V1-FAMILY-ALPHA-RELEASE-CERTIFICATION.md` as the binding release gate.

Local source sanity:

```bash
npm run validate:v1
```

Before the first real-family pilot, additionally verify in the deployed Supabase/Vercel environment:

1. migrations `001 → 028` on a clean database;
2. existing database upgrade through 028;
3. signup → confirmation/resend → sign in;
4. forgot password → email reset link → new password → sign in;
5. invitation → identity confirmation → claim → Simple Home/Family/Me;
6. Member vs Family Admin vs Platform Owner permission matrix;
7. multiple Launch Control owners by email and final-owner protection;
8. Hidden/Test/Pilot/Released behavior across at least two families;
9. cross-family RLS/private-media isolation;
10. Android/iOS + narrow-screen + slow-network core journey;
11. real novice-user no-coaching gate.

## S1-C cumulative validation — 2026-08-23

Source gates passed on the cumulative S1-A/B + S1-C baseline:
- `validate:s1-ab` 13/13
- `validate:cr1` 12/12
- `validate:cr2` 10/10
- `validate:cr2.1` 9/9
- `validate:cr2.2` 10/10
- `validate:cr2.3` 12/12
- `validate:v1` PASS
- `validate:d1` PASS (35 migrations)
- `validate:s1-c` 18/18

Changed TypeScript/TSX files also pass TypeScript `transpileModule` syntax parsing.

Full `tsc --noEmit` / `next build` remains unverified in this environment because dependency restoration timed out and required type packages were unavailable. Do not treat source/syntax gates as production certification.

## S1 Update Candidate validation
- `node scripts/s1-hardening-source-gate.mjs` → 21/21 PASS.
- `node validate-demo.mjs` → 60 members / 142 relationships / generations 1–5 PASS.
- Changed TS/TSX files pass TypeScript `transpileModule` syntax diagnostics.
- Full `npm run build` is still environment-blocked here because dependency restoration timed out and local `node_modules/.bin/next` is absent. The original reported `State.memories` type mismatch itself is fixed in source.
- Deployed behavior verification remains required before S1 can be marked VERIFIED.

## S1-D interaction/privacy validation — 2026-08-23

Source gate: `npm run validate:s1-d` → **17/17 PASS**.

Live verification required:
- open each ordinary popup and activate only the backdrop; verify it closes without saving;
- interact inside each popup; verify it remains open;
- verify blocking sign-in/password recovery is not accidentally dismissible into an unusable state;
- as Family Owner/admin, compare Public visitor / Family member / Family admin profile privacy previews using records with different profile/contact/event/memory visibility;
- verify a normal member cannot access the admin-only preview selector;
- repeat modal and preview checks at 360/390/430 widths.

S1 remains LIVE VERIFY; this source gate does not replace deployed behaviour QA.

## S2-A validation — 2026-08-23

Run `npm run validate:s2-a` after migration 037 is present. Live verify: Family Pulse relevance, memory reaction add/change/remove, Playground reaction no-save behavior, memory sharing, contribution completion tracking, admin 30-day Living Loop scorecard, tenant isolation, and mobile Home/memory behavior at 360/390/430px.

## S2-B residual live validation
Run migration 038, create/link at least two test families under one city community, approve the links, opt in one profile in each family, and prove cross-family search returns only the published snapshot. Verify direct family profile/tree/contact access remains denied. Test marriage consent guard, unpublish, service post, Platform Owner highlighting, and 360/390/430 mobile behavior.

## S2-C validation
Source gate: `node scripts/s2-c-source-gate.mjs` → **16/16 PASS**.

Still requires deployed multi-family behavior testing after migration 039:
1. Family A requests trust with Family B; only B Owner/admin can approve.
2. Accepted A↔B edge creates a one-hop path; declined/revoked edge does not.
3. With accepted B↔C, Family A gets A→B→C and no invented person-level relation wording.
4. Normal member cannot create/revoke family trust edges.
5. Introduction request persists against an opt-in community card; target owner can accept/decline and requester can cancel while pending.
6. Private phone/email/tree data remain unavailable across families.
7. Playground demonstrates paths and introduction lifecycle without writes.
8. 360/390/430 mobile tabs, path badges, trust actions and introduction modal remain usable.

## S2-D validation
Source gate: `npm run validate:s2-d`.

Live verify must cover: digest content after real family changes, category preferences, weekly/monthly/off semantics, 360/390/430px expansion, native share + clipboard fallback, no Playground writes, introduction privacy, and Family Owner digest-return metrics. External scheduled delivery is not certified by the S2-D source gate.

## Planned S2-E behavior gate
When S2-E is implemented, validate anonymous Playground, fresh auth/no-family, new creator, member, Family Owner, co-admin, Platform Owner, hidden-feature user and older/non-technical 360/390/430 mobile personas. Verify guide discoverability/comprehension, accurate role/feature filtering, guide search by user goal, Open Feature routing, contextual collapse/expand, Privacy & Trust accuracy, Playground no-save examples, feedback persistence/recovery and absence of stale/aspirational claims. Source/build checks alone are insufficient.

## S2-E validation — 2026-08-24

Source validation completed:
- `node scripts/s2-e-source-gate.mjs` → **15/15 PASS**.
- Existing regression source gates rerun after S2-E changes:
  - S1 hardening → **21/21 PASS**
  - S2-A → **13/13 PASS**
  - S2-B → **14/14 PASS**
  - S2-C → **16/16 PASS**
  - S2-D → **17/17 PASS**

Production build status: **LIVE VERIFY**. The uploaded source ZIP did not include installed project dependencies. `npm run build` initially returned `next: not found`; a dependency installation attempt did not complete inside the command execution window. Do not treat this workspace as a dependency-complete production-build certification.

Required deployed behavior matrix remains: anonymous Playground; fresh auth/no-family; fresh creator; normal member; Family Owner; co-admin; Platform Owner; hidden/disabled feature user; older/non-technical user; goal-search user. Verify Guide discoverability/comprehension, role/feature filtering, search, all Open Feature routes, Playground no-save routing, contextual collapse memory, feedback success/failure recovery, privacy/RLS accuracy and 360/390/430 layouts.

## S2-E Release Closure validation — 2026-08-24

Source-level closure:
- `npm run validate:s2-e` → 15/15 PASS.
- `npm run validate:s2-e-closure` → 13/13 PASS.
- Structured guide related-link integrity → PASS.
- Contextual nested-guide presence for Profile / Import / Invitations / Relationship management → PASS.
- TypeScript syntax transpilation for all closure-modified TS/TSX files → PASS.
- Existing S2-A/B/C/D gates remained passing before closure changes; cumulative gates should be rerun before delivery.

Still **LIVE VERIFY**:
- Supabase migration 041 deployment/idempotency.
- authenticated feedback submit/read/status/aggregate RPC behavior.
- deployed anonymous/member/admin/co-admin/Platform Owner privacy matrix.
- 360/390/430 real-browser behavior.
- Playground no-save behavior against a real authenticated session.
- dependency-complete `npm run build`.
- full S2-E persona/feature-visibility behavior matrix.

## S3-A pilot-freeze validation

Before pilot use after applying migration 042, verify:
1. Simple real-family member sees Home, Family, Find Family, Profile, Special Days and Explore & Guide; richer features appear only after the member chooses higher experience levels where applicable.
2. Connected/Explorer real-family members can reach Memories, Family Pulse, Quiet Digest, Family History, Contributions and Relationship Explorer as intended.
3. Community, Places, Trusted Introductions, Public Profiles and Print/QR are not released to ordinary families by default.
4. Pilot-targeted families alone can see Gatherings and Share-with-family when pilot IDs are configured.
5. Playground shows the broad member-facing demo set while Public Profiles and Print/QR remain hidden by default.
6. Changing a Playground toggle never changes real-family rollout and vice versa.
7. Trusted-introduction controls disappear when `connect.trusted_introductions` is disabled even if Community itself is visible.
8. Playground remains no-save.

Real-user feedback during the pause becomes the primary behavioral validation stream. Capture blockers, repeated confusion, missing recovery, privacy concerns and first-value moments.

## S3-A1 Distributed Family Intake validation — 2026-08-25

Source checks:
- `npm run validate:s3-a1` → **14/14 PASS**.
- New/modified TS/TSX syntax transpilation → **PASS**.
- Dependency-complete Next production build → **LIVE VERIFY**. The canonical ZIP had no installed dependencies; `npm run build` returned `next: not found`, and a dependency-install attempt did not complete inside the execution window.

Required staging/live checks after applying `043_s3a1_distributed_family_intake.sql`:
1. Platform Owner or Pilot-targeted Family Owner can create an intake; ordinary non-pilot families cannot.
2. Generate at least 3 representative links under the same session and submit all 3 successfully even while earlier branches are already in review.
3. Anonymous contribution link reveals only family name/intake label and never members, tree, phone/email, other submissions or network identifiers.
4. Revoke one link, expire one link and attempt a second submission on a one-use link; all must fail safely.
5. Submit exact-name+DOB duplicate, exact-name+birth-year/context duplicate, repeated-name ambiguous case and unrelated same-name case. Verify deterministic score/reasons and that uncertain identities never auto-merge.
6. Verify Same / Different / Not sure. Medium/high Open or Not sure candidates must block canonical commit.
7. Commit a clean branch. Verify canonical members/relationships appear in the existing app without changing unrelated features.
8. Commit against an existing matched member with a conflicting DOB/city/gender. Verify canonical value is retained and `family_intake_conflicts` records the contradiction.
9. Submit two branches sharing a likely person and verify cross-branch candidate review can connect them without silently merging.
10. Force an invalid generation/cycle relationship and verify the commit rolls back rather than partially corrupting the tree.
11. Prove Family A token/submission cannot read or mutate Family B staging/canonical data.
12. Verify 360/390/430 widths: form fields, repeat relatives, progress, sticky actions, review list, Owner match controls and modal scrolling.
13. Verify metrics: link opens, submissions, people reported and branches committed change as expected without exposing private content.
14. Re-run existing onboarding/Launch Control/Family Admin smoke tests to ensure S3-A1 remains additive.

Pilot evidence gate: measure representative link-open → submit conversion, people/relationships per completed branch, Owner reconciliation burden, time from family creation to useful connected graph, duplicate/conflict rate, wider-family invitation readiness and second-contributor activation.


## Mission closure validation rule — 2026-08-25

For major user-facing missions, validation is no longer only a code/source gate. Closure review must separately record:

1. implementation/source/build/regression evidence;
2. deployed/RLS/browser/mobile evidence where required;
3. contextual + central Guide coverage;
4. Playground coverage or justified N/A;
5. Launch Control key/default/role behavior;
6. What's New visibility;
7. roadmap/status/codebase traceability;
8. **Where to see this in the product**.

These closure checks do not convert unverified runtime behavior into VERIFIED. A valid intermediate state is **IMPLEMENTED / UX CLOSURE COMPLETE / LIVE VERIFY REQUIRED**.

### S3-A1 current closure validation
- IMPLEMENT: PASS in source.
- VALIDATE source gate: PASS 14/14.
- GUIDE: PENDING.
- PLAYGROUND: PENDING.
- LAUNCH CONTROL: source key/default PASS; UI/help closure PENDING.
- WHAT'S NEW: PENDING.
- ROADMAP/STATUS: PASS for implementation checkpoint; must refresh after closure patch.
- LIVE VERIFY: PENDING.

---

# G2 — Shared Identity, Claiming & Participation Foundation validation

Date: 2026-08-25

G2 is an architecture extraction release with no intended Family UX, RPC, RLS or database-schema behavior change.

Automated validation completed:
- complete historical source/regression gate suite through G1.4: PASS;
- `validate:g2`: PASS;
- all 147 historical `lib/remote.ts` facade exports preserved;
- Family claiming and participation callers remain compatible with the facade;
- Family adapters retain the existing verified-email, invitation, governed-contribution and participation RPC names;
- Alumni identity/participation adapters contain no Family persistence/RPC reuse;
- shared identity/participation runtime does not import Family/Alumni implementations;
- focused TypeScript 5.8.3 no-emit compilation for the G2 architecture layer: PASS;
- G2 gate JavaScript syntax check: PASS;
- no G2 Supabase migration added.

During extraction the new compatibility gate detected that the first participation move had accidentally included adjacent Family community group/event exports. Those functions were restored unchanged before release, demonstrating the value of the historical export snapshot gate.

Full Next.js production build is **not certified in this workspace** because the dependency install did not complete before the execution timeout. This is recorded as an environment limitation, not a build pass or a confirmed application failure.

Runtime verification is intentionally short; see `G2-RUNTIME-VERIFICATION-CHECKLIST.md`.


# G3 — Network Construction Engine Extraction validation

Date: 2026-08-25

G3 is an architecture extraction release with no intended Family UX, RPC, RLS or database-schema behavior change.

Automated validation completed:
- complete historical source/regression gate suite through G2: PASS;
- `validate:g3`: PASS;
- all 147 historical `lib/remote.ts` facade exports preserved;
- all 234 accepted G2 baseline files still present;
- all eight historical S3-A1 Family intake RPCs now owned by the Family construction adapter and absent as direct implementations from `lib/remote.ts`;
- existing S3-A1 contributor/Admin callers remain on compatibility paths;
- Core/shared construction code contains no Family/Alumni implementation dependency or Family/Kinship persistence vocabulary;
- Alumni construction skeleton contains no Family table/RPC/kinship reuse;
- G2 identity/participation contracts remain intact;
- focused strict TypeScript 5.8.3 no-emit compilation for the G3 architecture layer: PASS;
- focused executable construction-runtime delegation + skeleton-blocking assertion: PASS;
- no G3 Supabase migration added.

Full Next.js production build is **not certified in this workspace** because installed dependencies are absent. This is an environment limitation, not a build PASS or a confirmed application failure.

Runtime verification is intentionally short; see `G3-RUNTIME-VERIFICATION-CHECKLIST.md`.

## G4 validation — Vertical Runtime & App Composition — 2026-08-25

Source/regression result: PASS through D1/V1/CR1/CR2/S1/S2/S3-A1/G1.1/G1.2/G1.3/G1.4/G2/G3/G4.

G4-specific checks:
- Family navigation order + feature keys preserved;
- Family Guide/Playground/Launch/What's New registrations present;
- Family composition references only existing Family feature keys/capabilities;
- Alumni composition has no Family surfaces and is not renderable while skeleton;
- 147 historical remote facade exports preserved;
- 260 accepted G3 files preserved;
- G2 identity/participation and G3 construction architecture markers preserved;
- no post-044 migration added;
- focused TypeScript 5.8.3 composition compile PASS;
- changed app-shell/TSX syntax transpilation PASS;
- executable Family/Alumni composition assertion PASS.

Full `next build` is not certified in this workspace because application dependencies are not installed.

## G5 post-certification vertical dispatch hotfix

- Runtime issue reproduced from user smoke test: opening Alumni could evaluate `alumni.core.home` through the Family feature compatibility facade and throw `Unknown feature key`.
- Fixed by dispatching active Alumni networks before Family feature evaluation and guarding Family `hasFeature` by active vertical.
- `core/features/runtime.ts` strict unknown-key behavior intentionally retained.
- Complete automated source/regression chain D1 → G5: **PASS** after the fix.
- Focused TypeScript 5.8.3 transpile of `components/NetworkApp.tsx`: **PASS**.


## G6 certification — 2026-08-25

Automated source certification completed after the final G6 hardening changes:

- every historical validation script from D1 through G5: PASS;
- `npm run validate:g6`: PASS;
- G6 gate preserves 147 historical `lib/remote.ts` exports;
- G6 gate preserves all 280 accepted G5 files;
- 7 protected Family foundations match the certified G5 SHA-256 snapshot;
- changed G6 TS/TSX files transpile successfully under TypeScript 5.8.3;
- CSS brace integrity check: PASS;
- historical G6 gate confirms migration 046 remains present; later additive migrations are owned by later G-gates.

Full `next build` is not certified in this artifact workspace because dependencies are not installed. CI/Vercel build remains required after applying the release. Deployed manual smoke is intentionally limited to `G6-RUNTIME-VERIFICATION-CHECKLIST.md`.

## G7 — Generic Network OS validation — 2026-08-25

G7 adds migration 047 and therefore requires deployed Supabase smoke after source certification.

G7-specific automated gate validates:
- accepted G6 files are not deleted;
- all 147 historical `lib/remote.ts` exports remain available;
- seven protected Family foundations remain SHA-256 identical;
- generic Core/capability code does not import Family/Alumni implementations or persistence vocabulary;
- future template definitions do not import deployed vertical implementations;
- generic entity/dimension/affiliation/projection/activity/group persistence exists;
- generic tables are direct-access closed and internal SECURITY DEFINER helpers are not public application APIs;
- Alumni G7 feature keys exist in catalog, composition and migration registry;
- the real projection runtime executes the dual MET acceptance test without entity duplication;
- changed G7 TypeScript/TSX files pass TypeScript transpile validation.

Full `next build` is not claimed in the artifact workspace when application dependencies are absent. Vercel/CI build remains a deployment gate.

### G7 source certification result

Final source/regression chain D1 → G7: **PASS**.

G7 gate result: 147 historical remote exports, 289 accepted G6 files, 7 protected Family foundations and the dual MET projection acceptance test all PASS. Changed G7 TS/TSX files pass TypeScript transpile validation and G7 CSS brace integrity passes.

The User/Admin DOCX was rendered after the G7 guide addition; the existing pages remain visually stable and the new G7 page renders cleanly.

## G8 — Productized Business Verticals validation — 2026-08-25

Final automated source/regression chain after identity and member-administration hardening:

**D1 → V1 → CR1/CR2 → S1 → S2 → S3-A1 → G1.1/G1.2/G1.3/G1.4 → G2 → G3 → G4 → G5 → G6 → G7 → G8: PASS**

G8-specific gate confirms:
- 147 historical remote exports preserved;
- all 333 accepted G7 files remain present;
- 12 protected Family/Alumni foundations match their G7 SHA-256 hashes;
- Organization, Business Trust and Franchise are active in vertical registry/runtime;
- each has coherent dimensions/projections/catalog/composition;
- productized runtime does not import deployed Family/Alumni persistence semantics;
- productized handoff precedes Family feature evaluation;
- migration 048 contains direct-table lockdown, composite tenant constraints, internal helper revocation, vertical-scoped rollout, claiming and member-admin guards;
- one-account/one-entity claiming and own-claimed-entity editing are enforced;
- member removal clears stale active-network and claimed-owner state;
- multi-value affiliations are preserved;
- changed G8 TypeScript/TSX surface transpiles under TypeScript 5.8.3;
- CSS integrity checks pass.

Full Next.js production build is not certified in this artifact workspace because `node_modules` is absent. Vercel/CI build remains a deployment gate.

## G8 deployment hotfix — build typing + SQL membership timestamp — PASS

Real deployment validation exposed two issues not caught by the earlier transpile-only gate: a TypeScript optional-property inference issue in Alumni navigation and an invalid membership timestamp column in migration 048.

Corrections:
- merged Alumni navigation is explicitly typed as `readonly VerticalSurfaceDescriptor[]`;
- `get_productized_network_memberships()` selects `m.joined_at`.

Permanent G8 source guards were added and the complete D1→G8 automated chain passed after the correction.

A full Next.js build still requires the installed dependency tree; this artifact workspace does not contain `node_modules`.

## G8 Launch Control bundle typing regression — PASS

A real Next.js build exposed `string` → `never` inference at `playgroundExcludedBundles.includes(f.bundle)`. Launch Control now widens the concrete vertical composition list to the shared `readonly string[]` contract before filtering.

`validate:g8` contains permanent source assertions for this rule. Complete D1→G8 automated source chain: **PASS**.

## G8 R4 Product Experience Completion — PASS

Reported UX regressions were fixed and converted into source-gate assertions:

- productized sidebar navigation now uses `nav-btn` and has an explicit styled product identity block;
- product creation cards use container-safe `auto-fit/minmax` responsive layout;
- onboarding exposes read-only Playgrounds for all five released products;
- root ThemeProvider exposes Light / Dark / Aurora and persists `network-os-theme`;
- shared NetworkTopbar exposes the compact theme control across verticals;
- G8 business Home uses shared Network Pulse for events/history/groups/places;
- CSS brace integrity remains enforced.

Complete D1→G8 historical source chain after these changes: **PASS**.

DOCX QA: the updated User/Admin Guide renders to 23 pages. Pages 1–22 are pixel-identical to the previously visually accepted G8 render; page 23 was visually inspected and is clean.

## G8.5-A — Baseline cleanup and capability-governance validation

G8.5-A adds `npm run validate:g8.5a`.

The gate verifies:
- required current G8.5-A audit/rule/release artifacts exist;
- historical docs are present in categorized archive folders;
- repository-root Markdown remains intentionally small;
- the two missing accepted G5 certification artifacts are restored;
- every accepted-baseline manifest entry still resolves after archival;
- the capability utilization rule contains reuse/productized/showcase requirements;
- the applicability matrix covers maps, connection paths, stories/history, contributions, Launch Control, notifications/digest and all three G8 business verticals;
- current roadmap/status/codebase/validation/handoff reference G8.5-A and resume at G8.5-B.

G8.5-A must also rerun `validate:g8`; this proves documentation archival did not silently weaken historical G8 acceptance. No Supabase migration is introduced.

### G8.5-A certification result

Complete historical source chain **D1 → V1 → CR1/CR2 → S1 → S2 → S3-A1 → G1.1/G1.2/G1.3/G1.4 → G2 → G3 → G4 → G5 → G6 → G7 → G8 → G8.5-A: PASS**.

`validate:g8` now passes with 147 historical remote exports, 333 accepted G7 files, 12 protected Family/Alumni foundations and all three released G8 product verticals preserved. `validate:g8.5a` passes with 21 root Markdown docs and all accepted baseline paths resolving through the archive.

Production `npm run build` was attempted in the artifact workspace but cannot execute because the uploaded baseline does not contain `node_modules` (`next: not found`). Run `npm ci && npm run build` in the normal local/CI/Vercel environment.

## G8.5-B validation
Source certification: `node scripts/g8-5b-capability-parity-gate.mjs` PASS. Historical `g8-5a-clean-audit-gate` and `g8-productized-verticals-gate` PASS after implementation. Normal production build remains a local/CI check because dependency installation could not complete inside this sandbox execution window.

### G8.5-B full regression run
PASS on 2026-08-25 for: D1, V1, CR1, CR2/2.1/2.2/2.3, S1-A/B/C/D/Hardening, S2-A/B/C/D/E/Closure, S3-A1, G1.1/G1.2/G1.3/G1.4, G2, G3, G4, G5, G6, G7, G8, G8.5-A and G8.5-B. The G8 gate still reports 147 historical remote exports, 333 accepted G7 files, 12 protected Family/Alumni foundations and three productized business verticals preserved.


## G8.5-C validation
New `npm run validate:g8-5c` verifies the five-vertical showcase contract and then reruns G8.5-B/G8 historical protection. It requires the existing Family 60-member demo foundation, a 36-profile Alumni showcase, 36-entity Organization/Business Trust/Franchise showcases, guided Playground UX, and G8.5-C lifecycle documentation. Runtime verification additionally covers Light/Dark/Aurora and mobile widths. No migration is introduced. Production build remains a dependency-ready local/CI/Vercel check (`npm ci && npm run build`).

### G8.5-C certification result — 2026-08-25
Complete historical source chain **D1 → V1 → CR1/CR2 → S1 → S2 → S3-A1 → G1.1/G1.2/G1.3/G1.4 → G2 → G3 → G4 → G5 → G6 → G7 → G8 → G8.5-A → G8.5-B → G8.5-C: PASS**.

`validate:g8-5c` reports: Family 60+ demo members; Alumni 36; Organization 36; Business Trust 36; Franchise 36. `validate:g8` continues to report 147 historical remote exports, 333 accepted G7 files and 12 protected Family/Alumni foundations. Alumni's G8.5-C demo expansion is guarded by a normalized-core hash: only explicitly designated sample/showcase regions may differ; the rest of the protected Alumni runtime must remain byte-equivalent to the G8.5-B core.

Production `npm run build` was attempted but this uploaded workspace has no installed Next.js dependency (`next: not found`). Run `npm ci && npm run build && npm run validate:g8-5c` in the normal local/CI/Vercel environment.

## G8.6-A + B validation

Source certification command:
`npm run validate:g8-6ab`

This verifies the shared structure, 360° entity, living knowledge/help, Alumni bounded augmentation and modal contracts, then runs the G8.5-C → G8.5-B → G8 historical gates.

Production build remains an installed-environment gate: `npm ci && npm run build && npm run validate:g8-6ab`.

G8.6-A/B packaging certification also re-ran the historical D1 → V1 → CR → S1 → S2 → S3 → G1 → G2 → G3 → G4 → G5 → G6 → G7 source gates. No protected Family foundation was changed.

## G8.6-C
`npm run validate:g8-6c` verifies outcome Home, return loop, mature Guide, contextual What's New and vertical-aware Launch Control, then executes the G8.6-A/B → G8.5 → G8 protected chain.

Production build must still be run in an environment with installed dependencies: `npm ci && npm run build && npm run validate:g8-6c`.

### G8.6-C certification result
Historical source gates D1 through G8 passed in this workspace. After archive-lifecycle correction, G8.5-A/B/C, G8.6-A/B and G8.6-C also pass. Full semantic TypeScript/Next compilation is not certified in this extracted workspace because React/Next/Lucide dependencies are not installed locally; run the runtime checklist in the normal dependency-installed environment.

## G9 final certification
- Complete historical source chain D1 → V1 → CR1/CR2 → S1/S2/S3 → G1/G2/G3/G4/G5/G6/G7 → G8 → G8.5 → G8.6 → G9: **PASS**.
- G9 deterministic engine standalone strict TypeScript check: **PASS**.
- `npm ci` in the artifact workspace did not complete within the execution window; therefore production `npm run build` remains a local/CI runtime check and is not claimed as passed here.

## G9 runtime certification + Commercial Reality Gate — 2026-08-26
- Full historical source chain D1 → G9: PASS.
- `npm run validate:g9`: PASS.
- New executable `npm run validate:g9-runtime`: PASS 7/7 after correcting single-target warm-introduction reasoning.
- Dependency-installed Next build remains external/local/CI because `npm ci` did not complete in the sandbox window.
- Commercial gate: CONDITIONAL PASS TO PILOT; G10 remains blocked pending buyer/data/paid-pilot evidence.


## Mission 3 source validation
- `node scripts/m3-governed-graph-bootstrap-gate.mjs` → 11/11 PASS.
- `node scripts/m2-professional-i18n-gate.mjs` → 19/19 PASS.
- `node scripts/stability-1-source-gate.mjs` → 14/14 PASS.
- `node scripts/i18n-extraction-audit.mjs` → 0 direct visible TSX literals.
- 186 TS/TSX files parsed with 0 syntax errors.
- Relative import integrity checked with 0 missing relative imports.
- Live Next.js build/runtime remains a local verification gate.


## 2026-08-27 — Post-Mission-3 Runtime Architecture Decision

The current Next.js + Supabase + Vercel architecture is considered a valid managed/serverless backend, not an architectural failure. The next maturity gap is an **application-owned server/command boundary**, not a wholesale backend rewrite.

**Mission 4 — Network OS Application & Runtime Foundation** is the next recommended major mission at **MEDIUM effort**. It will introduce a modular TypeScript `server/` layer, versioned Next.js `/api/v1` command endpoints, server-side Supabase adapters, shared mobile-portable contracts, command/query classification, an observability seam and a GitHub Actions CI baseline. Supabase Postgres/Auth/Storage/Realtime/RLS remain core infrastructure.

Do not add microservices, Kubernetes, Kafka, Redis, a dedicated graph database, native mobile, or RAG expansion as part of Mission 4. Extract only 3–5 high-value multi-step/privileged commands and preserve safe direct RLS-protected queries.

See `NETWORK-OS-BACKEND-RUNTIME-ARCHITECTURE.md` and `MISSION-4-APPLICATION-RUNTIME-FOUNDATION.md`.

## Mission 4 validation
Run:
- `node scripts/m4-application-runtime-gate.mjs`
- `node scripts/stability-1-source-gate.mjs`
- `node scripts/m2-professional-i18n-gate.mjs`
- `node scripts/m3-governed-graph-bootstrap-gate.mjs`
- `node scripts/i18n-extraction-audit.mjs`
- `npm run build` once dependencies are installed.

Runtime verification must confirm authenticated create/join/relationship/bootstrap/claim commands work through `/api/v1`, unauthorized calls return normalized 401/403 responses, and direct Supabase access still remains constrained by existing RLS.


## Mission 5 validation
- `npm run validate:m5` — Mission 5 production-runtime source gate plus full Mission 4→3→2→STABILITY/i18n regression chain.
- `npm run check:types` — strict TypeScript no-emit check.
- `npm run build` — production Next.js build.
- Runtime: apply migration 056, test `/api/health`, `/api/ready`, the five commands, idempotency behavior, request rejection behavior and structured logs. See `MISSION-5-RUNTIME-VERIFICATION-CHECKLIST.md`.


## Mission 6-A — Trusted Identity Unification + Cross-Network Reachability
**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / RUNTIME VERIFICATION PENDING

M6-A reuses NX-1 rather than creating a second identity system. The existing `TrustedPersonIdentity` now carries a privacy-safe `TrustedNetworkReach` aggregate. My Networks shows active networks, distinct verticals, distinct authenticated member accounts across networks the user already belongs to, identity-linked/claimed contexts, and owned/administered network counts. Migration 057 adds a counts-only RPC that never exposes or merges cross-network member identities, profile fields, relationships or graph data. Cross-network trust edges/discovery/introductions remain explicitly deferred to M6-B/M6-C. Permanent mission closure now requires a human-readable `.docx` artifact via `MISSION-DOCUMENTATION-RULE.md`.


## M6-B — Trusted Network-to-Network Linking & Governed Bridges
M6-B extends M6-A/NX-1 with an explicit neutral graph of networks. Administrators exchange private Bridge Codes, request a typed relationship, propose future discovery/introduction capability intent, and the receiving network administrator must accept or decline. Either side can revoke an accepted bridge. The bridge itself exposes no cross-network members, profiles, relationships, activity or graph data; capability intent remains inert until M6-C. All writes use the M4/M5 application command runtime. Migration: `058_m6b_network_trust_bridges.sql`.

## M6-C
Run `npm run validate:m6c`, then `npm run check:types` and `npm run build`; complete `MISSION-6C-RUNTIME-VERIFICATION-CHECKLIST.md`.

## M6-D validation
Run `npm run validate:m6d`; then `npm run check:types` and `npm run build` in a fully installed workspace. Runtime-test the bridge → discover → request → consent funnel and aggregate-only pulse.


## M6-E source certification
Run `npm run validate:m6e`. The gate verifies migration 061, explicit path-traversal consent, bounded two-hop reasoning, path provenance, introduction path revalidation, privacy-safe multi-hop measurement, UI provenance, M7 program documentation, and then runs the full M6-D→prior regression chain. Runtime certification additionally requires type/build and the M6-E two-hop/negative-governance checklist.

## M7-B — WOW Showcase Universe & Guided Scenario Theater
Source implemented. My Networks now includes a read-only synthetic Scenario Theater backed by a deterministic 720-person / six-network showcase universe and seven authored stories. It demonstrates direct and governed two-hop trusted reach while preserving M6 anonymous discovery and target consent. M7-B also re-ships `CrossNetworkDiscovery.tsx` to repair the observed sequential-package missing-module regression. No database migration is required. Runtime/type/build certification remains pending in the fully installed project workspace.

## M7-A — Zero-Friction Network Launch & Activation
M7-A is source implemented. My Networks now gives Owners/Admins a privacy-safe launch-readiness path: seed meaningful people/entities → bring in participants → claim/link identities → establish trusted reach when appropriate → complete a first consented outcome. Migration 062 returns aggregate counts only for networks the caller administers. Existing import/invite/claim/admin experiences are reused rather than duplicated. Validate with `npm run validate:m7a`; runtime/type/build certification is pending in the normal installed workspace. After M7-A, proceed to M7-C Guided Pilot/Admin Activation and then M7-D Pilot Feedback & Learning, using M7-B/M7-A friction as evidence.

## M7-C validation
`npm run validate:m7c` runs the M7-C source gate and then the complete M7-A → M7-B → M6-E → prior regression chain. Final runtime closure additionally requires typecheck/build and `MISSION-7C-RUNTIME-VERIFICATION-CHECKLIST.md`.

## M7-D — Pilot Feedback & Product Learning Loop
- `npm run validate:m7d`
- M7-D source gate validates contextual feedback, membership/admin scope, bounded friction taxonomy, privacy separation, spam guard and cumulative M7-C chain.
- Runtime checklist: `MISSION-7D-RUNTIME-VERIFICATION-CHECKLIST.md`.

## M7-E validation
Run `npm run validate:m7e`, then `npm run check:types` and `npm run build`. Runtime verification is defined in `MISSION-7E-RUNTIME-VERIFICATION-CHECKLIST.md`.

## M7-F validation
Run `npm run validate:m7f`. The command executes the M7-F source gate and then the entire cumulative validation chain through M7-E and earlier missions. Runtime closure additionally requires applying migration 067 and executing `MISSION-7F-RUNTIME-VERIFICATION-CHECKLIST.md`.
