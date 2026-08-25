# Codebase — Family Release 1

## Current product state

This source is now intentionally **family-first**. Family Release 1 adds a warm
premium visual system, mobile-first shell, multilingual first-use journeys and a
guided Excel creation/import experience while preserving the P3–P5.1 tree,
profiles, timeline, governance, local/demo and Supabase paths.

Key Release 1 files:

- `app/globals.css` — forest/ivory/gold design tokens, application shell,
  onboarding, Excel assistant and responsive layouts.
- `lib/i18n.tsx` — persisted English/Hindi/Marathi language foundation.
- `components/LanguageSwitcher.tsx` — shared language control.
- `components/SetupScreen.tsx` — two-step family-only onboarding.
- `components/ImportModal.tsx` — generated multi-sheet workbook, sheet parsing,
  preview, friendly validation and confirmed import.
- `components/NetworkApp.tsx` — translated primary shell, family home and mobile navigation.
- `components/ProfileDrawer.tsx`, `components/AuthPanel.tsx` — family-first profile and joining presentation.
- `FAMILY-RELEASE-1.md` — delivered scope and release acceptance checklist.

Verification in this workspace: clean dependency install, TypeScript, Next.js
production build and 150-member demo integrity pass. Rendered browser QA is
explicitly open because the environment could not download a browser binary.
Staging migrations/RLS remain a production gate.

## P5.1 Living Network

P5.1 is implemented in migration `015_p5_1_living_network.sql`, `TimelineView`, `UpcomingWidget`, `ProfileForm`, and the repository adapters. The D1 family-experience pass updates `SetupScreen`, `NetworkApp`, `TreeView`, `ProfileDrawer` and responsive styles. The migration chain is `001`–`015`. See `P5.1-IMPLEMENTATION.md`, `P5.1-FAMILY-UX-AUDIT.md` and `MODEL-SELECTION-RULE.md`.

## P4.1 — Foundation, Trust & Adoption
- Database-level privacy for private contact fields.
- Relationship integrity: self-link, duplicate, orphan, generation-order and parent/child-cycle protection.
- Duplicate identity detection and import validation.
- Generalized change-request and audit model.
- Repository abstraction separating shared Supabase and local/demo persistence.
- Profile photo upload through Supabase Storage with file type/size validation.
- Secure, single-use, expiring member invitation links.
- Mobile bottom navigation introduced now; every P4 feature must remain mobile-usable.

## P4.2 — Relationship Intelligence & Human Profiles
- How am I related?
- Relationship paths and common ancestors.
- Branch discovery and relationship explanations.
- Simple life-event timeline.
- Profile visibility controls and profile improvements.

## P4.3 — Community, Memories & Discovery
- Member collaboration through the generalized change-request model.
- In-app notifications for reviewed contributions and invitation acceptance.
- Community memories/stories with optional media and visibility controls.
- Profile-attached memories shown in the member drawer.
- Advanced directory discovery: text, profession, city, generation, and living/deceased filters.
- Mobile Community area and responsive discovery/memory experiences.

## P4.4 — Intelligence, Geography, Export & Scale
- Family/branch analytics.
- Geographic intelligence.
- PDF/SVG/filtered exports.
- Server-side discovery and graph windowing for larger networks.
- Final performance and PWA refinement.

### Product constraints
- Do not turn profiles into LinkedIn-style resumes.
- Mobile usability is a continuous requirement, not a final polish pass.
- Preserve the existing P3 tree, directory, map, auth, import/export and demo/local mode.
- Avoid native mobile apps, AI, social feeds, chat and complex RBAC until demand justifies them.


## P4.2 roadmap

P4.2 — Relationship Intelligence & Human Profiles: shortest relationship paths, common ancestors/descendants, kinship explanations, simple life-event timelines, profile/contact visibility controls, and mobile-usable relationship/profile experiences.

## P4.3 implementation

P4.3 is implemented in the current source baseline. See `P4.3-IMPLEMENTATION.md` and migration `008_p4_3_community_discovery.sql`.

---

# P4 Production Hardening — completed 2026-08-20

Migration `010_p4_production_hardening.sql` closes all security findings from the P4 audit:
- Race-safe first-admin bootstrap (advisory lock)
- Visibility-safe member projection (admin-only profiles fully redacted)
- IDOR-safe life-event and memory reads (checks target member visibility)
- Invitation account reassignment protection
- Profile submission ownership enforcement (non-admin can only submit for own member)
- Audit RPC restricted to admins

TypeScript target corrected to `es2017` in `tsconfig.json`.

---

# P5 — Platform Phase

## P5.0 — Configurable Entity & Relationship Types (DONE)

**Migration:** `011_configurable_types.sql`

`network_settings` extended with:
- `entity_label`, `entity_label_plural` — e.g. "Member" / "Members" or "Employee" / "Employees"
- `level_label`, `level_label_plural` — e.g. "Generation" / "Generations" or "Seniority" / "Levels"
- `parent_label`, `child_label`, `peer_label` — e.g. "Parent"/"Child"/"Spouse" or "Manager"/"Direct Report"/"Co-founder"
- `network_template` — chosen at setup ("family", "org", "alumni", "academic", "corporate", "skills")

**Code:**
- `lib/network.ts` — `NetworkSettings` type extended, `getNetworkConfig(network)` helper, `NETWORK_TEMPLATES` array
- `lib/remote.ts` — `saveNetworkSettings` writes all new fields
- `components/SetupScreen.tsx` — template selector cards
- All UI components — use `cfg.entity_label` etc. instead of hardcoded strings

**Key rule:** DB structural types (`parent`/`child`/`spouse`) are unchanged — only display labels are configurable.

## P5 Storage Privacy Fix (DONE)

**Migration:** `012_private_storage.sql`
- Both buckets (`profile-photos`, `community-media`) flipped to `public: false`
- Public SELECT policies dropped; authenticated-only SELECT policies added

**Code:**
- `lib/storage.ts` — uploads return storage path (not URL); `resolveSignedUrls(items, bucket)` batch-signs 24h TTL; `getSignedPhotoUrl(path)` for single-file use
- `lib/remote.ts` — `fetchRemoteState` batch-resolves all member photo paths to signed URLs; `fetchMemories` does the same for memory photos
- `components/ProfileForm.tsx` — upload call updated (removed obsolete `ownerKey` param)

**Important for future PRs:** `photo_url` in the DB now stores the storage path (e.g. `profiles/uid/uuid.jpg`), not a full URL. All rendering uses signed URLs resolved at fetch time. Backward compat: `resolveSignedUrls` extracts the path from legacy full public URLs automatically.

## P5.1a — Shareable Public Page (DONE)

**Route:** `/public`

**Migration:** `013_public_page.sql`
- `get_public_network_info()` — returns name, description, labels; granted to `anon`
- `get_public_family_members()` — returns only `profile_visibility = 'public'` approved members (no contact, no photo); granted to `anon`

## P5-S0 Media Authorization + P5.1 Living Network (DONE IN SOURCE)

- `014_p5_s0_media_authorization.sql` replaces path-knowledge access with visibility/ownership-aware private media authorization.
- `015_p5_1_living_network.sql` adds the privacy-aware network timeline and target-free, safe-field self-edit RPC.
- Live staging application and role-matrix verification remain the release gate.
- The first D1 visual usability pass is recorded in `P5.1-FAMILY-UX-AUDIT.md`.

**Code:**
- `app/public/page.tsx` — Next.js route
- `components/PublicPage.tsx` — standalone public directory: network header, stats (members/generations/in memoriam), searchable member cards, "Sign in" CTA
- `components/NetworkApp.tsx` — "Public Page" card added to admin section with copy-URL and preview link

**Key rules:**
- Public page never shows photos (storage is private; anon can't get signed URLs)
- Only members with `profile_visibility = 'public'` appear
- No navigation, no auth, no admin tools — pure read-only

---

# Migration chain summary

| # | File | Content |
|---|---|---|
| 001 | `001_initial.sql` | family_members, family_relationships, profile_submissions, baseline RLS |
| 002 | `002_p1.sql` | latitude, longitude |
| 003 | `003_production_auth.sql` | profiles, roles, auth trigger |
| 004 | `004_network_setup_and_governance.sql` | network_settings, audit_log |
| 005 | `005_p4_1_governance_integrity.sql` | relationship integrity, privacy RPC, change_requests, capability foundation |
| 006 | `006_p4_1_adoption.sql` | profile photo storage, member invitations |
| 007 | `007_p4_2_relationships_profiles.sql` | profile visibility, life-event timeline |
| 008 | `008_p4_3_community_discovery.sql` | memories, community media, notifications |
| 009 | `009_p4_4_intelligence_scale.sql` | server-side discovery, analytics, geography |
| 010 | `010_p4_production_hardening.sql` | all P4 security fixes |
| 011 | `011_configurable_types.sql` | entity/relationship label columns on network_settings |
| 012 | `012_private_storage.sql` | private buckets, drop public read policies |
| 013 | `013_public_page.sql` | anon-accessible RPCs for /public route |
| 014 | `014_p5_s0_media_authorization.sql` | visibility/ownership-aware private media access |
| 015 | `015_p5_1_living_network.sql` | network timeline, self-edit configuration and safe-field RPC |

---

# Key files

| File | Purpose |
|---|---|
| `lib/types.ts` | Domain types: Member, Relationship, Submission, LifeEvent, Memory, Notification |
| `lib/network.ts` | NetworkSettings type, getNetworkConfig(), NETWORK_TEMPLATES, local persistence |
| `lib/supabase.ts` | Supabase client (anon key) |
| `lib/remote.ts` | All Supabase data access (fetchRemoteState, fetchMemories, etc.) |
| `lib/storage.ts` | Photo upload (returns path), resolveSignedUrls batch helper |
| `lib/repository.ts` | Repository pattern — routes calls to remote or local store |
| `lib/store.ts` | Local/demo persistence (localStorage) |
| `lib/validation.ts` | Network integrity checks |
| `lib/auth.ts` | getAuthUser, signOut |
| `components/NetworkApp.tsx` | Root app shell — all state, views, admin panel |
| `components/TreeView.tsx` | React Flow hierarchy tree with PersonNode |
| `components/ProfileDrawer.tsx` | Member profile side panel |
| `components/ProfileForm.tsx` | Profile submission form (with photo upload) |
| `components/SetupScreen.tsx` | First-run setup with template selection |
| `components/TimelineView.tsx` | Privacy-aware network/family-wide event history |
| `components/UpcomingWidget.tsx` | Family-module upcoming milestones |
| `components/RelationshipModal.tsx` | Add/remove relationships |
| `components/RelationshipExplorer.tsx` | Shortest path / kinship explanation |
| `components/LifeEventEditor.tsx` | Life event CRUD |
| `components/CommunityHub.tsx` | Memories + notifications |
| `components/AnalyticsPanel.tsx` | Branch analytics |
| `components/MapView.tsx` | Leaflet map (dynamic import) |
| `components/ImportModal.tsx` | CSV/XLSX/XML import |
| `components/InvitationModal.tsx` | Admin invitation link generator |
| `components/AuthPanel.tsx` | Sign-in / sign-up |
| `components/PublicPage.tsx` | Standalone public directory (no auth) |
| `app/page.tsx` | Root → NetworkApp |
| `app/public/page.tsx` | /public → PublicPage |
| `app/invite/[token]/page.tsx` | Invitation acceptance |

---

# Dev rules

- Always read this file before starting a session.
- See `P5-ACTIVE-PLAN.md` for the current task queue and next steps.
- Follow `MODEL-SELECTION-RULE.md` before substantial work and state the recommended model/effort.
- Follow `P5.1-FAMILY-UX-AUDIT.md`; rendered mobile/desktop usability is a release criterion.
- `photo_url` in DB is a storage path after 011/012; always call `resolveSignedUrls` at fetch time.
- Structural relationship types (`parent`/`child`/`spouse`) never change — only display labels are configurable.
- Do not add migration columns without DEFAULT values — existing rows must not break.
- Run `npm install && npm run build` before any production deployment to verify the full build.


---

# Current Development Compass

Read alongside this file:
- `PROJECT-VISION.md`
- `FOUNDER-COMPASS.md`
- `ROADMAP.md`
- `MISSION-STATUS.md`
- `DEVELOPMENT-RULES.md`
- `CODEBASE-UPDATE-RULE.md`
- `artifact/platform-vision.html`

## Active next mission
**P5-S0 — Security & Baseline Closure.**

Immediate priorities:
1. tighten authenticated Storage SELECT authorization and media visibility boundaries;
2. verify build and migration/RLS baseline;
3. then proceed to P5.1 Living Network.

## Architecture direction
Family remains the strongest vertical and proving ground. Evolve incrementally toward **shared relationship core + domain modules + configuration + focused vertical products**. Configurable labels are not generic semantics.

## Business direction
Sustainable monetization is a primary objective. Family may drive engagement/distribution; other verticals may offer greater willingness to pay. Roadmap decisions should generate evidence about both.

## 2026-08-23 — S1-C cumulative additions

- Migration `035_s1c_profile_submission_review.sql`: family-scoped profile-submission review RPC + Add Myself bootstrap.
- `components/QuickFamilyStart.tsx`: first-person/close-family progressive creation.
- `lib/demo-data.ts`: current 60-person / 5-generation rich showcase family with events and memories.
- New public import assets: guided workbook, 10-person workbook, 60-person showcase workbook and people-only CSV.
- S1-C regression gate: `scripts/s1-c-source-gate.mjs`.

## 2026-08-23 — S1 family access/showcase hardening
- Migration 036: `family_lobby_mode`, family lobby/leave RPCs, independent Playground feature settings/RPCs.
- `FamilySwitcher`: create/join another, family lobby, guarded leave.
- `SetupScreen`: existing-family recovery and sign out.
- `NetworkApp`: always-visible auth escape controls, Playground Explorer/feature map, local memories persistence fix.
- `FounderLaunchConsole`: Playground feature visibility panel independent of real-user rollout.
- `supabase/seed-demo.sql`: synchronized 60-person full-potential showcase; old 150-person filler seed removed from the active seed path.

## 2026-08-23 S1-D cumulative notes

- `NetworkApp.tsx`: `UsersRound` import retained; admin audience selector is now a scoped profile privacy preview.
- `ProfileDrawer.tsx`: preview audience filters profile details, contacts, social links, life events and memories; backdrop dismissal remains supported.
- Dismissible modal components now close only when the backdrop itself is activated, not when a control inside the dialog is used.
- `app/globals.css`: user-verified `.card { padding: 10px; }` and Home memory tile bottom spacing are canonical.

## 2026-08-23 — S2-A codebase update

Latest additive migration: `037_s2a_living_family_loop.sql`.

S2-A adds a Home Family Pulse capped at 1–3 relevant moments, memory reactions, family-scoped engagement events, and aggregate living-loop metrics. Primary affected runtime files: `components/FamilyHome.tsx`, `components/CommunityHub.tsx`, `components/ParticipationCenter.tsx`, `lib/types.ts`, `lib/remote.ts`, `lib/demo-data.ts`, and `app/globals.css`. S1 remains substantially verified with residual QA; S2-A remains live verify until deployed/pilot behavior is measured.

## S2-B Community umbrella
Migration `038_s2b_community_umbrella_discovery.sql`, `components/CommunityNetwork.tsx`, `lib/community-network-types.ts` and the S2-B remote functions provide hierarchical communities, governed family links, opt-in profile snapshots and community posts. `connect.community` now surfaces the Community Network UI. Direct cross-family family-table access is intentionally not used.

## S2-C additions
- `supabase/migrations/039_s2c_trusted_introductions.sql` — governed family trust edges, shortest family path RPCs and persisted introduction requests.
- `lib/community-network-types.ts` — trust/path/introduction types.
- `lib/remote.ts` — S2-C RPC clients.
- `components/CommunityNetwork.tsx` — Trusted Families and Introductions tabs, connection-path badges and request modal.
- `scripts/s2-c-source-gate.mjs` — source invariants for S2-C.
- `S2-C-TRUSTED-INTRODUCTIONS-CONNECTION-PATHS.md` — mission contract and live behavior gate.

## S2-D — Quiet Family Digest + Return Engine
- `components/FamilyDigest.tsx`: private Home digest and privacy-safe sharing.
- `components/FamilyHome.tsx`: mounts digest for Simple/Connected/Explorer and blocks demo engagement writes.
- `components/CommunityHub.tsx`: expanded quiet digest preference controls.
- `supabase/migrations/040_s2d_quiet_family_digest_return_engine.sql`: digest generation/state/preferences + return metrics.
- `lib/remote.ts`: digest/preference RPC clients.
- `components/ParticipationCenter.tsx`: digest opens/returns/shares in S2 loop scorecard.
- `scripts/s2-d-source-gate.mjs`: S2-D source invariant gate.

Note: migration `039_s2c_trusted_introductions.sql` is included again in the S2-D affected package because the prior S2-C packaging omitted that migration even though S2-C source depended on it.

## Planned next architecture — S2-E living help system
S2-E should introduce a central structured user-guide content layer plus reusable contextual guide, standalone Explore & Guide portal, deterministic guide search and governed product-feedback persistence/triage. Do not implement help as duplicated per-component prose. Detailed contracts live in `S2-E-GUIDED-FAMILY-EXPERIENCE-LIVING-HELP-SYSTEM.md` and `S2-E-COMPLETE-GUIDE-CONTENT-MAP.md`.

## S2-E — Guided Family Experience & Living Help System (implemented in source)

New architecture:
- `lib/guide-types.ts` — guide/feedback contracts.
- `lib/user-guide-content.ts` — central structured source of product-help truth, personas, goals, inspiration and future-interest inventory.
- `components/FeatureGuide.tsx` — reusable collapsible contextual help.
- `components/GuidePortal.tsx` — standalone `Explore & Guide` product-discovery portal and deterministic search UI.
- `components/GuideFeedback.tsx` — contextual helpfulness/improvement feedback.
- `supabase/migrations/041_s2e_guided_family_help_feedback.sql` — governed feedback storage/RPCs and Platform Owner aggregates/status changes.
- `scripts/s2-e-source-gate.mjs` — S2-E source invariant gate.

Integration:
- `components/NetworkApp.tsx` owns Guide navigation/routing and reuses the central registry for contextual help.
- `components/SetupScreen.tsx` exposes `Explore & Guide` to signed-in users who do not yet have an active family, using the safe sample context.
- `components/FounderLaunchConsole.tsx` includes Platform Owner feedback triage; feedback status does not mutate roadmap files.
- `lib/remote.ts` contains feedback submit/triage/aggregate RPC clients.
- `app/globals.css` includes responsive Guide layouts through the 390px breakpoint (360/390/430 behavior still requires device/browser verification).

## S2-E release closure additions — 2026-08-24

- `S2-E-RELEASE-CLOSURE.md` — honest source-complete vs live-certification boundary.
- `S3-BUSINESS-PROOF-DESIGN.md` — canonical S3 evidence/activation/retention/operations/defensibility/monetization design.
- `scripts/s2-e-release-closure-gate.mjs` — detects broken guide relationships and important nested contextual-guide regressions.
- Contextual `FeatureGuide` integration expanded into `ProfileDrawer`, `ImportModal`, `InvitationModal` and `RelationshipModal`.
- Guide registry now includes a Platform Owner-only Feedback Intelligence & Triage entry; all `related` guide references resolve to real registry entries.

## 2026-08-24 — Pilot-freeze codebase state

Launch Control now includes explicit feature keys for `core.guide`, `remember.family_pulse`, `remember.quiet_digest` and `connect.trusted_introductions`. Migration `042_s3a_pilot_launch_defaults.sql` establishes the recommended pilot baseline independently for real families and Playground. Family Pulse and Quiet Digest can be gated independently; trusted-introduction UI is separately gated inside the Community surface.

Active product mission: `S3-A-ACTIVATION-NETWORK-GROWTH.md`. Broad S3 implementation is intentionally paused for real-user evidence.

Historical/superseded planning material is being consolidated under `archive/history/`; canonical current docs remain at root.

## S3-A1 additions — 2026-08-25

Distributed intake is isolated from canonical family editing until Owner approval.
- Public route: `app/contribute/[token]/page.tsx`
- Mobile form: `components/FamilyBranchIntakeForm.tsx`
- Owner review/share modal: `components/FamilyIntakeAdmin.tsx`
- Types: `lib/family-intake-types.ts`
- Client RPC wrappers: S3-A1 section in `lib/remote.ts`
- Feature registry: `contribute.branch_intake` in `lib/features.ts`
- Database: `supabase/migrations/043_s3a1_distributed_family_intake.sql`
- Source gate: `scripts/s3-a1-source-gate.mjs`

Canonical `family_members` and `family_relationships` remain the destination; anonymous forms never write them directly. Keep future intake extensions proposal/staging-first.


## Documentation / release-governance rule — 2026-08-25

The repository now treats user-facing mission closure as a product contract, not an optional documentation task:

**IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**

Canonical rule details live in `DEVELOPMENT-RULES.md`. Major mission documents must expose where the capability appears in the real product, Playground, Guide and Launch Control. Central guide content should be reused by contextual help where practical. Playground remains no-save. Launch visibility remains independent from code presence.

S3-A1 is currently **IMPLEMENTED IN SOURCE / CLOSURE PARTIAL / LIVE VERIFY REQUIRED** because Guide, Playground and What's New closure surfaces still need implementation.

## S3-A1 closure surfaces — 2026-08-25

S3-A1 now follows the permanent mission closure contract at source/UI level.

New/updated closure surfaces:
- `lib/user-guide-content.ts` — canonical `build-together` guide entry.
- `components/FeatureGuide.tsx` — full-guide action is now shown only when a destination callback exists, allowing the same contextual guide to be safely embedded in the public intake form.
- `components/FamilyIntakeAdmin.tsx` — contextual S3-A1 guide.
- `components/FamilyBranchIntakeForm.tsx` — contributor-facing contextual guide.
- `components/FamilyIntakePlayground.tsx` — new no-save/no-token/no-Supabase simulation.
- `components/NetworkApp.tsx` — routes guide/demo/feature announcements into real intake or simulated Playground appropriately.
- `components/GuidePortal.tsx` — S3-A1 What's New discovery.
- `components/FounderLaunchConsole.tsx` — explicit S3-A1 rollout/security/Playground explanation.
- `USER-GUIDE.md` — central owner/contributor instructions.
- `scripts/s3-a1-closure-source-gate.mjs` + `validate:s3-a1-closure` — closure regression contract.

Status: **UX CLOSURE COMPLETE / LIVE VERIFY REQUIRED**. The Playground component is intentionally separate from the real anonymous contribution RPC path.


## Strategic architecture direction — capability tree

Logical target:

```text
core/
capabilities/
domain-layers/
verticals/
apps/
```

This is a logical direction, **not** an instruction to move the whole repository immediately.

Likely shared capabilities:
- tenancy/network;
- identity/profile;
- membership;
- graph/relationships;
- invitations/claiming;
- distributed network construction;
- identity resolution;
- audit/provenance;
- relationship intelligence;
- discovery/introductions;
- groups/events/contributions/digest;
- Guide/Playground/Launch Control/What's New.

Likely Family specialization:
- genealogy;
- generations;
- ancestor/kinship semantics;
- deceased workflows;
- family-specific memories/language.

Likely Alumni specialization:
- institution;
- department/program;
- batch/year;
- alumnus/faculty semantics;
- career/mentorship/opportunity context.

Do not physically reorganize until G0 identifies stable boundaries and regression gates.


## G0 architecture classification — 2026-08-25

G0 is complete in `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`. No runtime files were moved in G0.

Binding codebase direction:
- CORE: network tenancy, memberships, active-network context, authorization primitives, platform ownership and rollout runtime.
- SHARED CAPABILITY: claiming/invitations/privacy primitives, governed contribution, construction workflow, graph algorithms, Guide/Playground/Launch Control/What's New frameworks.
- INTERMEDIATE KINSHIP DOMAIN: parent/child/spouse, generation ordering, ancestry/lineage and kinship explanations.
- FAMILY VERTICAL: emotional Home, memories/history/deceased/special days, Family-specific intake language, Family admin/copy and kinship presentation.

Important current leaks to remove incrementally: `network_memberships.member_id` references `family_members`; `Member` mixes generic identity with Family-only fields; `NetworkRepository` is Family-domain heavy; `lib/remote.ts` is monolithic; `lib/features.ts` mixes rollout engine with Family catalog; and legacy `NETWORK_TEMPLATES` incorrectly imply domain semantics can be generalized by relabeling Parent/Child/Spouse.

Approved first physical extraction is G1.1 architecture guardrails + typed vertical registry. S3-A1 physical generalization is explicitly deferred to G2.

## G1.1 physical architecture seam — 2026-08-25

New structure:

```text
core/verticals/contracts.ts
verticals/family/definition.ts
verticals/alumni/definition.ts
app-shell/vertical-registry.ts
scripts/g1-1-architecture-gate.mjs
```

Rules now enforced:
- core defines vertical contracts but does not import explicit vertical implementations;
- explicit verticals do not import each other;
- app-shell owns composition/registration;
- Family remains the default active vertical;
- Alumni remains a skeleton and must not reuse kinship semantics merely through labels;
- `vertical_kind` is currently a runtime compatibility field, not a required persisted database column;
- legacy `network_template` remains for compatibility until additive migrations are justified.

`components/SetupScreen.tsx` now obtains the existing Family setup labels through the Family vertical definition. Values are unchanged. `NETWORK_TEMPLATES` remains in `lib/network.ts` for compatibility and must not be treated as the new vertical architecture.

Run `npm run validate:g1.1` with the normal source gates before accepting architecture changes.

## G1.2 feature runtime / vertical catalog seam — 2026-08-25

New structure:

```text
core/features/contracts.ts
core/features/runtime.ts
verticals/family/features/catalog.ts
verticals/alumni/features/catalog.ts
verticals/family/definition.ts           # composes Family catalog
verticals/alumni/definition.ts           # composes hidden Alumni skeleton catalog
app-shell/vertical-registry.ts           # resolves vertical + feature catalog
lib/features.ts                          # legacy Family compatibility facade
scripts/g1-2-feature-runtime-gate.mjs
```

Architecture rule now enforced:
- core feature runtime owns mechanics only;
- feature keys/copy/defaults belong to vertical catalogs;
- core never imports Family/Alumni;
- Family and Alumni catalogs never import each other;
- app-shell composes vertical implementations;
- legacy Family callers may continue through `lib/features.ts` until migrated naturally;
- current database feature keys/RPC names remain unchanged.

The Family catalog contains the same 23 feature keys, bundle membership, experience thresholds and default launch states as before G1.2. Alumni catalog entries are hidden and are not wired to UI/database rollout.

Run `npm run validate:g1.2` plus the normal source gates. Use `G1.2-RUNTIME-VERIFICATION-CHECKLIST.md` for the short deployed smoke check.

## G1.3 neutral network/membership seam — 2026-08-25

New structure:

```text
core/network/contracts.ts
verticals/family/network/membership-adapter.ts
supabase/migrations/044_g1_3_feature_catalog_integrity.sql
scripts/g1-3-network-membership-gate.mjs
```

Important boundaries:
- Core `NetworkMembership` contains network identity, role/status, active state and resource policy only.
- `network_memberships.member_id` remains a Family database compatibility pointer and is represented only by the Family adapter in the new seam.
- `lib/remote.ts` still exports historical `NetworkMembership` + `fetchMyNetworks()` for Family UI, and now adds `fetchMyNetworkMemberships()` for neutral callers.
- `fetchNetworkSettings()` uses the neutral membership path internally.
- `AuthUser.family_role` remains supported while new neutral code may use `membership_role`.
- no membership schema/RPC rename occurred.

Feature registry integrity:
- migration 044 requires migration 043/S3-A1 first;
- it inserts only missing feature/Playground rows and preserves existing founder choices;
- Launch Control disables missing backend keys and labels them `Database update required`;
- bulk Playground controls operate only on backend-confirmed keys.

Run `npm run validate:g1.3` plus all historical gates. After deployment use `G1.3-RUNTIME-VERIFICATION-CHECKLIST.md` for the short smoke check.


## G1.4 remote capability seam — 2026-08-25

New structure:

```text
capabilities/network-context/remote.ts
capabilities/launch-runtime/remote.ts
capabilities/platform-ownership/remote.ts
lib/remote.ts                                  # historical compatibility facade
scripts/g1-4-remote-capability-gate.mjs
scripts/g1-4-remote-compatibility-exports.json
```

Rules now enforced:
- capability transport may depend on Core contracts/infrastructure but not root `verticals/*` implementations;
- neutral network-context transport does not expose `member_id`;
- existing Family callers continue importing from `lib/remote.ts`;
- all 147 historical G1.3 facade exports are compatibility-locked;
- Family-domain RPCs stay in the legacy/domain side until a real shared contract exists;
- deployed RPC names remain unchanged;
- the G1.3 frontend↔backend feature-catalog drift guard is protected during transport refactors.

Current extracted shared transport covers network context, launch/playground runtime and platform ownership only. Identity claiming is intentionally the next separate seam (G1.5).

Run `npm run validate:g1.4` plus all historical gates. Use `G1.4-RUNTIME-VERIFICATION-CHECKLIST.md` for the short deployed smoke check.
