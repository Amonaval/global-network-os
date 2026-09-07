# CURRENT MISSION STATUS — G9 IMPLEMENTED / RUNTIME VERIFY

**G9 — Network Intelligence Layer:** IMPLEMENTED at source level.

Completed: deterministic intelligence engine, five-vertical surfaces, Ask Network, evidence/confidence, health/missing-link/connector insights, Launch Control registration, Guide/Playground coverage and G9 certification gate.

Remaining closure check: dependency-installed `npm run build`, migration 049 deployment verification and runtime smoke test.

---

# Mission Status

## Current — Family Release 1 source complete

The family product now has a warm responsive visual system, mobile-first shell,
English/Hindi/Marathi foundation, family-only setup, a guided Excel workbook and
import assistant, family home and simplified primary journeys. TypeScript,
production build and 150-member demo integrity pass. The current environment
could not install a browser binary, so the new rendered UI still requires the
documented real-device/desktop visual acceptance pass before release.

## Achieved

### P3 --- Core Hierarchy Product

Hierarchy, generations, profiles, directory/search/filtering, lineage,
relationship visualization, map, member management, imports/exports,
authentication, Supabase persistence, local/demo fallback, admin and
profile submissions.

### P4.1 --- Trust, Governance & Adoption

Repository abstraction, DB privacy foundations, relationship
integrity/cycle/duplicate validation, change
requests/audit/capabilities, profile photos,
invitations/claim/contribution, mobile navigation.

### P4.2 --- Relationship Intelligence & Human Profiles

Shortest paths, kinship interpretation, ancestors/descendants,
relationship exploration, life events and profile/contact visibility.

### P4.3 --- Community, Memories & Discovery

Memories/media, notifications, advanced directory discovery and
community experiences.

### P4.4 --- Intelligence, Geography, Export & Scale Foundation

Server-side discovery/RPC, analytics, geography, JSON/SVG/print export
and initial scale boundary.

### P4 Production Hardening

Migration `010`: first-admin race protection, profile redaction,
life-event/memory IDOR fixes, invitation reassignment protection,
submission ownership and admin audit restriction. TypeScript target
corrected.

### Early P5

-   `011_configurable_types.sql`: vocabulary/templates.
-   `012_private_storage.sql`: private buckets and signed-URL
    application flow.
-   `013_public_page.sql`: anonymous privacy-masked public directory.
-   `014_p5_s0_media_authorization.sql`: visibility-aware private media authorization.
-   `015_p5_1_living_network.sql`: privacy-aware timeline and field-aware self-edit.
-   Public page/admin sharing UI.

## Important Truths / Open Findings

-   Current implementation is not yet a universally generic hierarchy
    model; persistence and semantics remain family-centric.
-   Configurable labels are useful but are not configurable relationship
    semantics.
-   Storage authorization is tightened in source; live staging verification remains.
-   Clean production build passes locally; staging migration/RLS must still be verified.
-   Public page intentionally excludes private data and photos.

## Active Mission

**Family Release 1 acceptance and deployment:** run the visual/device checklist,
test the Excel workbook with a real family sheet, complete staging migrations and
the anon/member/admin/invited-user privacy matrix, then deploy to a small family
pilot. Fix release blockers only; do not reopen platform expansion.

See `ROADMAP.md`.


## Family Release 2 — Remember, Connect and Celebrate — IN PROGRESS
- New return-home experience: recent memories, special days, one small contribution.
- Memories can link to multiple relatives via migration 017.
- Notification preference foundation added with restrained defaults.
- D1 invitations/QR/sharing/contributions/gatherings reused rather than duplicated.
- Remaining: rich WhatsApp preview cards, event-photo follow-up, printable poster/reunion polish, real-device visual/usability gate.

## Family Release 2A — Lightweight Media Controls
- [x] Admin-controlled photo upload switch; default OFF.
- [x] 100 KB application hard cap for profile and memory uploads.
- [x] Initials avatar remains default when no image is stored.
- [x] 100 MB per-family quota — A5 source enforcement added with atomic tenant usage accounting; live Supabase verification pending.
- [x] Optional public social-profile links / selectable avatar icons (A4) — implemented in source via migration 022; live verification pending.
- [ ] Autonomous multi-family Alpha onboarding (A1/A2).
See `ALPHA-FAMILY-PLATFORM-ROADMAP.md`.

# 2026-08-22 Mission Status Addendum — Append-Only History

Nothing in the achieved/history sections above is removed. Mission Status is append-only: PLANNED -> ACTIVE -> IMPLEMENTED -> VERIFIED -> RELEASED -> SUPERSEDED. Superseded work remains recorded.

## Family Release 2A — Lightweight Media Controls — IMPLEMENTED / VERIFY
- Admin photo-upload switch; default OFF.
- 100 KB application hard cap for profile and memory uploads.
- Initials remain default identity treatment.
- 100 MB per-family server-side quota is implemented in A5 source; live tenant accounting/concurrency verification remains.
- Lightweight identity/social links are implemented in source; live verification remains pending.

## A1 — True Multi-Family Foundation — IMPLEMENTED / VERIFICATION GATE OPEN
- Added `019_a1_multi_family_foundation.sql`.
- Added `networks`, `network_memberships`, Owner/Admin/Member family roles and active-network context.
- Added/backfilled tenant ownership across current family-domain data.
- Existing family becomes Network #1; existing users/data are preserved.
- Client auth/settings foundations now resolve against active family.
- Tenant RLS/RPC/storage isolation must be audited in staging before A1 is VERIFIED.

A1 exit tests: Family A -> Family B denied; Family B -> Family A denied; guessed UUID/direct REST denied; SECURITY DEFINER RPC cross-tenant attempts denied; storage cross-tenant attempts denied; existing Release 1/2 journeys regress cleanly.

## Next priorities
1. Finish A1 verification/security/regression gate.
2. A2 autonomous Create Family / Join / Invite / Claim + family switcher + explicit Demo mode.
3. A3 Family Admin Center, ownership continuity, privacy preview, family health, quota/usage and friendly diagnostics.

## Preserved future mission queue
P5.3 Modular Domain Architecture, P5.4 Commercial Validation, mature P6 Multi-Network SaaS, P7 Family/Alumni/Organization/Ownership products, P8 Relationship Intelligence and P9 Platform/Ecosystem remain preserved exactly as roadmap intent. They are gated, not removed.


## 2026-08-22 — A1/A2 continuation from canonical family-network.zip

### A1 — True multi-family tenancy
**SOURCE AUDIT: PASS WITH LIVE VERIFICATION GATE STILL REQUIRED.**
The canonical baseline already contains migration `019` and active-family membership semantics. The continuation audit confirmed the intended tenant columns/RLS foundation and preserved the explicit requirement that staging must prove REST/RPC/storage isolation. This package does **not** falsely mark the live gate VERIFIED because no connected Supabase staging instance/credentials were supplied in-session.

A1 evidence still required before production Alpha: clean `001–020` migration, existing-instance upgrade, A↔B adversarial REST/RPC/storage tests, and Release 1/2/2A regression on staging.

### A2 — Autonomous Create / Join / Invite / Claim
**IMPLEMENTED IN SOURCE / STAGING VERIFICATION REQUIRED.**
- `020_a2_autonomous_family_onboarding.sql`: authenticated self-service family creation; unique slug generation; creator becomes Owner; family-scoped claim identity; tenant-safe invite preview/accept/revoke/resend/list; active-family switching.
- Existing `profiles.member_id` is retained as an active-family compatibility pointer while `network_memberships.member_id` stores the claim per family.
- Existing invitation links now join the invitation's family and claim only the intended profile.
- Family switcher added for accounts belonging to multiple families.
- Existing signed-in users with no family can create one without platform-owner/Supabase intervention.
- Create-another-family is available from the switcher and returns to the same guided family setup.

## 2026-08-22 — A2 UX/documentation continuation

### Family Home — Release 2 UX repair
**IMPLEMENTED IN SOURCE / USER DEVICE VERIFICATION RECOMMENDED.**
- Restored the missing `FamilyHome` source component referenced by `NetworkApp`.
- Replaced the broken/native-control-looking Home layout with a responsive family-first dashboard: welcome hero, memory/activity area, 30-day special days, family count/avatars and one contribution prompt.
- Uses the existing warm Family Release 1 visual system and responsive breakpoints; no older feature or navigation flow was removed.
- Build/device verification remains a user-run gate when dependencies/staging are available.

### User Guide coverage checkpoint
- `Family-Network-Complete-User-Admin-Guide` is updated through **Family Release 2 + Release 2A + A1/A2 source implementation**.
- A1 is documented as **implemented but not VERIFIED** until live Supabase tenant-isolation/regression evidence exists.
- A2 Create / Join / Invite / Claim / family switching is documented as **implemented in source; staging verification required**.
- Next guide refresh is needed after **A3–A5** (or earlier only if a user-visible flow changes materially). This keeps documentation useful without spending a session on minor internal changes.

## 2026-08-22 — A3 Family Admin Center implemented in source
- Added one family-first Admin Center: Overview, Members & roles, Approvals, Privacy, Storage, Family Settings, Export/Backup.
- Added family-scoped role management and admin summary RPCs in migration 021.
- Fixed admin UI authorization to recognize A1/A2 family owner/admin membership roles, preserving legacy compatibility.
- Existing advanced governance, diagnostics, imports and analytics were preserved rather than removed.
- A3 source-complete; live Supabase 001–021 / isolation / role-boundary verification remains a deployment gate.
- A4 Lightweight Identity & Social Links implemented in source.
- A5 100 MB Family Storage Enforcement implemented in source with migration `023_a5_family_storage_enforcement.sql`; live Supabase verification remains user-run.
- Next roadmap mission: A6 — Release 2 completion: Remember, Connect, Celebrate.


## A4 checkpoint — 2026-08-22
- Added storage-free avatar choices and privacy-controlled Facebook/Instagram/other links.
- Social images are never downloaded or cached.
- Added migration `022_a4_lightweight_identity_social_links.sql`.
- Public RPCs expose only explicitly public external links.
- Next: A6 — Release 2 completion: Remember, Connect, Celebrate.

## 2026-08-22 — A6 Release 2 Completion — IMPLEMENTED / VERIFY
- On This Day family-history return loop implemented.
- Birthday + anniversary celebration/share cards implemented.
- Privacy-safe memory sharing and multi-relative memory attribution implemented.
- Gathering attendee list + post-event story linkage implemented.
- Printable privacy-safe reunion directory implemented.
- Quiet digest/preferences implemented.
- Guided contribution completion now gives visible positive feedback.
- Added migration `024_a6_remember_connect_celebrate.sql`; live Supabase and real-device verification remain pending.
- **Next roadmap mission: A7 — Alpha operations: 20 → 50 families.**

## 2026-08-22 — A6 verification hotfix
- Fixed Family Settings failure `column i.status does not exist` in migration `025_fix_family_admin_invitation_status.sql`.
- Root cause: `member_invitations` uses derived lifecycle status, not a physical `status` column.
- Admin summary now uses `public.invitation_status(used_at,revoked_at,expires_at)='active'`.
- A6 remains **IMPLEMENTED / VERIFY** until migrations through 025 and the visible A6 flows are exercised on staging/deployed Supabase.
- Execution policy updated: future work should normally ship as **2–4 coherent features per mission/bundle**, scaled down only for genuinely high-risk or foundational changes.

## 2026-08-22 — A7 Alpha Launch & Family Delight Bundle — IMPLEMENTED / VERIFY
- First-10-minute Alpha activation checklist added.
- Family health score, duplicate candidate warning, incomplete-profile and unconnected-person guidance added.
- Ownership continuity warning added when a family has fewer than two admins; backup/export made part of recovery guidance.
- 20-family Owner operations consolidated in the Admin Center without SQL/Supabase dependency.
- Duplicate detection is intentionally advisory; A7 never auto-merges people.
- Next work should remain bundled: A8 Engagement & Sharing Bundle after A7 validation/pilot evidence.

## 2026-08-22 — A8 + A9 Engagement & 20→50 Family Scale Bundle — IMPLEMENTED / VERIFY
- Combined A8 and A9 intentionally: engagement and Alpha scaling are one product outcome and required no risky schema boundary.
- Added Family Pulse return-loop signals on Home.
- Added warm WhatsApp/native family sharing while preserving public-safe sharing rules.
- Added Family Admin Center Pilot Readiness with continuity, storage, approvals, health and activation gates.
- No migration after 025 is required for this bundle.
- Next gate: verify A6→A9 together on deployed Supabase/Vercel and real mobile devices, then start real-family Alpha onboarding rather than inventing more pre-pilot polish.

## 2026-08-22 — A1–A9 completeness re-audit (supersedes optimistic completion labels)
The canonical source and original/binding roadmap were compared again. Earlier `IMPLEMENTED / VERIFY` checkpoints remain historical implementation records, but they are **not full-completion claims**.

- A1: **SOURCE COMPLETE / VERIFY** — A1.1–A1.3 evidence open.
- A2: **SOURCE COMPLETE / VERIFY** — A2.1–A2.3 UX/safety follow-ups preserved.
- A3: **PARTIAL** — A3.1–A3.4 open.
- A4: **SOURCE COMPLETE / VERIFY** — A4.1 accessibility follow-up preserved.
- A5: **PARTIAL** — A5.1–A5.3 open.
- A6: **PARTIAL** — A6.1–A6.5 open.
- A7: **PARTIAL** — A7.1–A7.6 open.
- A8: **PARTIAL** — A8.1–A8.5 open.
- A9: **PART 1 ONLY / NOT COMPLETE** — A9.1–A9.7 open; the current per-family readiness score is not the 20→50-family operations mission.

See `A1-A9-COMPLETENESS-AUDIT.md` for the exact missing scope and the C1/C2/C3 bundled completion plan. This correction exists specifically to prevent accepted roadmap requirements from being silently lost or falsely marked complete.

## 2026-08-22 — B0-A Product Simplification Foundation — IMPLEMENTED / VERIFY

B0 now supersedes feature expansion as the immediate product priority. It does **not** supersede or erase any A1–A9 follow-up.

### Delivered
- Canonical feature/capability registry in `lib/features.ts`.
- Shared-family member experience levels: **Simple / Connected / Explorer**.
- Family administration separated into a role-gated **Manage family** surface instead of being mixed into member navigation.
- Default shared-family member experience is Simple: **Home · Family · Me** as the primary journey.
- Connected progressively adds Memories; Explorer adds search/history/places/help-family areas when founder rollout allows them.
- Platform-owner authority separated from family Owner/Admin via migration `026_b0a_progressive_experience_founder_flags.sql`.
- Founder rollout lifecycle implemented in backend: **Hidden → Test → Pilot → Released**.
- Strict effective visibility rule: founder rollout AND experience level AND role/permission.
- Existing advanced features seeded as `test`, allowing the platform owner to validate them while keeping ordinary member experience calm.
- Family-first terminology replaces implementation language in primary navigation.
- `B0-HISTORICAL-CAPABILITY-LEDGER.md` preserves pre-A1 through A9 capability history, partial work and deferred roadmap items.

### Verification still required
- Apply migrations through 026 on Supabase.
- Confirm the intended founder account is the single initial `platform_owners` row.
- Validate normal member vs family admin vs platform owner navigation and RPC boundaries.
- Production TypeScript/Next build in an environment with dependencies installed.
- Real-device visual/usability acceptance remains B0-C, not B0-A.

### Next
**B0-B — Progressive Launch System**: Founder Launch Console, bundle/individual controls, Pilot-family targeting UI, future family-admin member controls, What's New/discovery state.

Then **B0-C — Human-Friendly Family Experience**: invitation/claim simplification, radical first visit, older/non-technical user UX, mobile accessibility, slow-network/error/empty-state pass.

## 2026-08-22 — B0-B Progressive Launch System — IMPLEMENTED / VERIFY

### Delivered
- Founder-only **Platform → Launch Control** UI.
- Bundle-level and individual feature rollout controls.
- Hidden / Test / Pilot / Released lifecycle with explicit Pilot-family targeting.
- Pilot rollout is blocked when no family is selected.
- Family Admin Center **Member features** controls let each family narrow member-facing capability without bypassing founder rollout.
- Effective visibility is now founder rollout × family setting × experience tier × permission.
- Founder-announced Pilot/Released features create one-time **New in your family** discovery cards with Try it / Got it acknowledgement.
- Founder-only rollout audit trail records state, Pilot targeting and announcement changes.
- Added migration `027_b0b_progressive_launch_system.sql`.

### Verification required
- Apply migrations through 027.
- Validate platform owner / family admin / member boundaries.
- Validate Pilot targeting across at least two families.
- Validate family-admin OFF cannot be bypassed and cannot reveal founder-hidden features.
- Validate announcement acknowledgement persistence and family switching.
- Run full Next production build with dependencies installed and real mobile/device pass.

### Next
**B0-C — Human-Friendly Family Experience.** Do not resume feature expansion before this usability/adoption layer is complete.

## 2026-08-22 — B0-C Human-Friendly Family Experience — IMPLEMENTED / REAL-USER VERIFY

### Delivered
- Invitation flow changed to family-first identity confirmation before account mechanics: family → matched profile → “Is this you?” → sign in/create account → welcome → Simple family view.
- Ordinary Simple members now see less top-bar and Home-screen clutter; advanced capability remains available underneath B0 progressive disclosure.
- Simple Home prioritizes one obvious family action plus one compact next-family-moment signal instead of exposing engagement grids by default.
- Members can safely choose **Simple / More family / Everything** using the existing server-authorized experience-level RPC; this never changes family/admin permissions.
- Mobile usability baseline strengthened with larger touch targets, readable invitation controls, labeled bottom navigation and family-language experience choices.
- Friendly invalid/expired invitation, email-confirmation, slow-loading and successful-claim states added.
- No new migration; migrations through 027 remain sufficient.

### Verification still required
- Real 50+/60+ novice family-user invitation and navigation test.
- Non-technical 30–50 mobile-user test.
- Hindi/Marathi native-language review.
- Android/iOS back-navigation, browser zoom/large-text, narrow-screen and slow-network test.

B0-C source implementation does **not** satisfy the real-user usability gate by itself. Any findings become B0-C.1 corrections before broad Alpha rollout.

## 2026-08-22 — V1 Family Alpha Release Certification — IMPLEMENTED IN SOURCE / CERTIFICATION REQUIRED

V1 is now the binding release gate before broad pilot rollout.

### Launch Control ownership clarified
- Launch Control is **not hard-coded to an email**; authority lives in `platform_owners` keyed by Supabase Auth user ID.
- B0-A's first legacy platform admin remains the bootstrap owner.
- Migration `028_v1_alpha_release_certification.sql` adds founder-only owner management by email for existing accounts.
- Multiple platform owners are supported.
- The database prevents removal of the final platform owner and records owner-access changes.

### Missing normal-user essentials added
- Forgot-password entry from sign-in.
- Supabase password-reset email flow and in-app new-password screen.
- Explicit `PASSWORD_RECOVERY` and `SIGNED_OUT` auth-state handling.
- Signup confirmation resend.
- Friendly invalid-login / unconfirmed-email messaging.
- Show/hide password and browser autocomplete hints.

### Alpha release controls
- Founder-only **Day-1 Alpha preset** action: Core + Celebrate + Admin released; richer member capabilities returned to Test until intentionally promoted.
- Existing B0 feature precedence remains binding: founder rollout × family preference × experience × permission.

### Certification still required
Do not call V1 Alpha Certified until production build, migrations 001–028, auth/recovery, invitation/claim, cross-family privacy, role boundaries, real-device behavior and novice-user no-coaching gates pass. See `V1-FAMILY-ALPHA-RELEASE-CERTIFICATION.md`.

### After V1 certification
Pilot with founder family + 2–3 trusted families. Real friction becomes B0-C.1/V1 correction work. C1/C2/C3 remain preserved and resume only after initial pilot evidence.

### V1.1 explicitly preserved — not completed by V1
Verified email change, account deletion vs historical-record retention, leave-family semantics, other-session revocation, simple help/support routing and Terms/Privacy acknowledgement remain future account-lifecycle work. They must not be silently treated as complete because forgot-password/reset is implemented.

---

## 2026-08-23 — Pre-Alpha Mobile + Family Creation Governance

Status: **IMPLEMENTED IN SOURCE / VERIFY ON DEVICE + SUPABASE**

- Fixed the mobile-width foundation with an explicit device-width viewport and defensive full-width/overflow rules.
- Added migration `029_pre_alpha_mobile_and_family_creation_approval.sql`.
- New family creation is now platform-controlled: non-platform users submit requests; platform owners approve/reject in Launch Control; approved requester becomes Family Owner.
- `create_family(...)` itself now rejects non-platform-owner callers, preventing client/UI bypass.
- Added a durable value/cost review of family feedback in `PRE-ALPHA-FAMILY-FEEDBACK-PRIORITIZATION.md` and routed all items into C1/C2/D2/M0 rather than falsely marking them complete.
- Earlier notification-preferences typing hotfix remains included in the baseline used for this patch.

Required verification before family sharing: run migration 029; test request/approve/reject with separate accounts; verify the requester becomes Owner; verify a non-platform user cannot call `create_family`; test responsive layout on at least one real Android/iPhone-size viewport.

## 2026-08-23 — CR1 Core Family Simplicity & Trust

**IMPLEMENTED IN SOURCE / VERIFY — NOT globally complete.**

Implemented:
- strict direct lineage with no sibling/cousin side branches;
- Simple member defaults to own lineage when entering Family;
- mobile lineage-first non-canvas rendering;
- You/Viewing markers and stronger focused edges;
- profile Back/history + Back-to-profile from focused tree;
- relationship-to-viewer language in profile;
- member relationship management removed from member UI;
- Family Owner-only deletion of parent/child relationships via migration 030 + matching co-admin UI;
- persistent Larger Text option;
- `npm run validate:cr1` source gate.

Still open / not to be marked complete:
- CR1.1 governed Something-is-wrong correction journey;
- CR1.2 API-level contact sanitization + member verification/consent;
- CR1.3 explicit relationship provenance/Owner lock metadata;
- CR1.4 archive/recovery-backed cleanup semantics;
- CR1.5 translated dynamic kinship + real-user accessibility/language evidence;
- V1 real build/Supabase/device/no-coaching certification.

The next gate remains **CR1 verification + V1 Family Alpha Release Certification**, followed by a 2–3 trusted-family pilot before general feature expansion.

## CR2 — Frictionless Family Entry & Alpha Exploration
**Status: IMPLEMENTED IN SOURCE / ALPHA VERIFY**

Implemented to remove the current Alpha onboarding blocker:
- new users no longer default to Create Family;
- Join / Sample / Create entry choices;
- Family Code join;
- verified-email profile claim;
- read-only Sample Family with Supabase auth preserved;
- Excel creation is prominent again;
- Launch Control can require or bypass family-creation approval;
- migration 031 defaults the current Alpha to **auto-approved family creation**;
- Quick Start user help updated.

Verification pending against live Supabase and real mobile devices. CR2 is not marked complete.

## CR2.1 — Alpha onboarding/runtime hotfix
**Status: IMPLEMENTED IN SOURCE / LIVE VERIFY REQUIRED**

- [x] Non-UUID demo member profile selection no longer calls UUID-only member RPCs.
- [x] Excel source IDs are remapped to generated UUIDs before shared persistence.
- [x] `network_settings` update moved behind tenant/admin-scoped RPC.
- [x] Small Naval sample workbook added.
- [x] Existing 150-person workbook retained as full/default scale sample.
- [ ] Apply migration 032 to live Supabase.
- [ ] Verify fresh `Start with a few relatives` family creation end-to-end.
- [ ] Verify small and 150-person imports end-to-end.

## CR2.2 — Alpha First-Impressions QA & Progressive Onboarding

**Status: IMPLEMENTED IN SOURCE / BEHAVIOUR VERIFY REQUIRED**

The fresh-family `No active family selected` failure is fixed by carrying the created family UUID explicitly through activation/settings persistence. Anonymous Playground, minimum-data creation, progressive Excel/CSV, familiar relationship vocabulary, labeled tree edges and detailed Help preview are implemented.

Do not promote CR2.2 to VERIFIED until deployed behaviour tests pass for anonymous Playground, fresh family-name-only creation, people-only Excel import, human relationship import and 360/390/430 px mobile use.


## CR2.3 — Alpha Onboarding Stabilization + Behaviour QA

**Status: IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY REQUIRED**

- [x] Fresh-family creation re-reads auth after activation so creator family role resolves as Owner.
- [x] New-family hydration no longer relies on stale pre-create `auth.role`.
- [x] Redundant immediate post-create settings save removed from the standard family bootstrap path.
- [x] Bulk import accepts family Owner/Admin membership rather than only legacy global-admin state.
- [x] Post-create audit telemetry cannot turn a successful family creation into a failed onboarding screen.
- [x] Migration 034 hardens active-family fallback and family-scoped legacy admin/audit semantics.
- [x] User-verified `.card.home-coming` padding and `profile-overlay` z-index corrections retained.
- [x] `npm run validate:cr2.3` source gate passes.
- [ ] Apply migration 034 to live Supabase.
- [ ] Fresh non-platform-owner: family-name-only create → Owner → add relative → logout/login.
- [ ] Fresh creator: Excel/CSV create/import with partial data.
- [ ] Anonymous Playground has no auth/write errors.
- [ ] Family-code/invitation joiner resolves as Member.
- [ ] Returning Owner automatically resolves the same active family and admin capability.

CR2.3 must not be marked VERIFIED until those deployed behaviour journeys pass.

## 2026-08-23 — Strategic Review: Next 3 Milestones

**Status: ROADMAP REPRIORITIZED — NO EXISTING MISSION REMOVED.**

A cross-lens review (critic user + founder + investor/acquirer + QA/technical) concluded that additional feature breadth is no longer the highest-value immediate work.

The next three binding outcomes are:

1. **S1 Instant Family Magic — NEXT:** CR2.3 live verification/corrections, pitch-quality no-login Playground, <60-second time-to-value, My Family Line/relation-to-me first, mobile first-impression quality and minimum-input creation.
2. **S2 Living Family Loop:** convert existing partial memories/celebration/contribution/sharing capabilities into one measurable Discover → Feel → Contribute → Share → Return loop.
3. **S3 Proof of a Defensible Business:** latest-baseline V1 certification, 3→20→50 family evidence, real multi-family operations, critical trust completion, cohort instrumentation, willingness-to-pay validation and adjacent-vertical proof.

Important: S1/S2/S3 are outcome milestones. Existing A1–A9, B0, CR1/CR2, C1/C2/C3, D2 and M0 work remains preserved and is routed underneath them. Partial work remains partial until its own live/behaviour/security gate passes.

See `STRATEGIC-NEXT-3-MILESTONES.md`.

## S1 Batch 1 — Instant Family Magic · S1-A + S1-B

**Status: IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY REQUIRED**

- [x] Anonymous no-login Playground retained.
- [x] Playground uses a temporary read-only viewer so **You** and relationship-to-me work without signup or persistence.
- [x] Playground → Join/Create conversion remains visible.
- [x] Current viewer is visually anchored on Home.
- [x] My Family Line is the personal/default family representation for Playground/simple/mobile entry.
- [x] My Family Line ↔ Full Tree switching remains reversible on desktop and mobile.
- [x] Human relationship-to-me labels added to profiles, tree cards and mobile family-line rows.
- [x] Immediate family shortcuts added for parents/partner/siblings/children.
- [x] Parent/child edge rendering normalized for both `parent` and `child` stored vocabularies.
- [x] Member **Report correction** creates a governed change request rather than editing family structure directly.
- [x] 430px containment strengthened for tree/view controls.
- [x] Missing `public/sample-data-150.xlsx` packaging regression fixed.
- [x] S1-A/B source gate added.
- [ ] Deployed 360/390/430 behaviour verification.
- [ ] Anonymous stranger behaviour test.
- [ ] Fresh signup behaviour test.
- [ ] Family-name-only creator behaviour test.
- [ ] Invited member and returning Owner behaviour tests.
- [ ] S1-C Effortless Creation & Import.

**S1 overall remains PARTIAL. S2 is blocked.**

CR2.3 remains **IMPLEMENTED / LIVE VERIFY**; this batch does not promote it to VERIFIED.

## 2026-08-23 — S1 Batch 2: S1-C + Showcase Family + Profile Review Closure

**Status: IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY REQUIRED**

- [x] Fixed Family Owner/Admin `profile_submissions` approval failure without reopening direct table writes.
- [x] Added family-scoped `review_profile_submission(...)` RPC in migration 035.
- [x] Family Owner/co-admin review semantics no longer depend only on legacy global role state.
- [x] Added secure `add_myself_to_family(...)` bootstrap for a fresh creator.
- [x] Added visible **Add Myself first** flow.
- [x] Added one-name Father/Mother/Husband/Wife/Son/Daughter close-family creation.
- [x] Added **Your family is ready** success experience.
- [x] Guided workbook now includes dropdowns for gender, generation, living status and human relationship vocabulary.
- [x] Added people-only CSV sample.
- [x] Replaced the current showcase strategy from sparse 150-person emphasis to a dense 60-person / 5-generation demonstration family.
- [x] Playground showcase includes rich life events, memories/stories, locations, identity/social examples and participation/reunion proof.
- [x] Shared demo seeding remaps all synthetic member/relationship/event/memory IDs to real UUIDs before persistence.
- [x] S1-C source gate passes 18/18.
- [x] Cumulative S1/CR/V1/D1 source gates pass.
- [ ] Apply migration 035 to live Supabase.
- [ ] Production build/typecheck on restored dependencies.
- [ ] Run complete 10-persona S1 deployed behaviour matrix.

**S1-A/B/C are now implemented in source, but S1 is NOT behaviour-certified. S2 remains blocked.**

CR2.3 remains **IMPLEMENTED / LIVE VERIFY**.

## S1 Update Candidate — Access / Playground / Showcase Hardening
**IMPLEMENTED IN SOURCE / LIVE VERIFY**
- [x] Fix `State.memories` local persistence/build regression.
- [x] Never hide Sign out or family switching behind Simple experience.
- [x] Create/join another family escape path.
- [x] Family Lobby non-destructive unlink/switch path.
- [x] Guarded Leave Family behavior prevents ownerless populated families.
- [x] Setup/lobby shows existing families and Sign out.
- [x] Independent Playground feature visibility in Launch Control.
- [x] Playground uses Explorer presentation and separate feature map.
- [x] Old 150-person filler DB seed replaced by 60-person / 5-generation showcase seed.
- [x] Showcase includes history, memories, contribution prompts, groups and reunion events.
- [ ] Deployed behavior verification on Supabase/Vercel.
- [ ] 360/390/430 mobile behavior verification.

S1 is not yet promoted to VERIFIED. S2 remains blocked by the S1 behavior gate.

## 2026-08-23 — S1-D Interaction Reliability & Privacy Preview Clarity

**IMPLEMENTED IN SOURCE / LIVE VERIFY**

- [x] Preserve user-verified global card padding and Home memory tile spacing fixes.
- [x] Restore missing `UsersRound` import used by mobile family-access controls.
- [x] Outside-click dismissal for ordinary dismissible modal surfaces.
- [x] Keep blocking authentication/recovery surfaces protected from accidental backdrop dismissal.
- [x] Retain admin-only privacy preview, rename it so its scope is understandable.
- [x] Make Public / Family member / Family admin preview affect profile details, contacts, social links, life events and memories consistently.
- [ ] Deployed desktop + 360/390/430 interaction verification.
- [ ] Real privacy fixtures tested under all three preview audiences.

S1 remains **LIVE VERIFY** and S2 remains blocked.

## 2026-08-23 — S2-A Living Family Loop

**Status: IMPLEMENTED IN SOURCE / LIVE VERIFY**

Implemented Family Pulse, memory reactions, deliberate engagement tracking and Family Owner/admin living-loop metrics. S1 is now treated as **SUBSTANTIALLY VERIFIED / RESIDUAL QA** based on founder testing, while remaining mobile/persona/deployment checks stay open. S2 itself is not complete until pilot families show repeat return/contribution/share behavior.

### S2-B — Community Umbrella & Opt-in Discovery
**IMPLEMENTED IN SOURCE / LIVE VERIFY**
Community hierarchy, governed family links, opt-in cross-family profile discovery, community needs/posts, consent guard for marriage publishing, and curated Community Highlights are implemented. Real cross-family relationship-path intelligence remains deferred until explicit trusted cross-family edges exist.

### S2-C — Trusted Introductions & Connection Paths
**Status: IMPLEMENTED IN SOURCE / LIVE VERIFY**

Implemented explicit family trust edges, two-family consent, explainable up-to-four-hop connection paths and persisted community introduction requests. This is family-level path intelligence only; named-person connector claims remain intentionally deferred until explicit connector consent exists.

### S2-D — Quiet Family Digest + Return Engine
**Status: IMPLEMENTED IN SOURCE / LIVE VERIFY**

Implemented: private Home digest, topic/cadence preferences, preferred weekday, memory/family/gathering/contribution/introduction summaries, privacy-safe sharing, digest state, digest open/return/share instrumentation and admin retention metrics. External scheduled delivery is intentionally provider-agnostic and remains deployment integration work. S2 remains IN PROGRESS until repeat behavior is observed in real families.

### S2-E — Guided Family Experience & Living Help System
**Status: PLANNED — NEXT MAJOR MISSION**

Planning completed for a first-class interactive help/product-discovery system rather than another static guide refresh. Scope includes contextual collapsible guides across live modules, standalone Explore & Guide portal, central guide registry, deterministic search, persona/use-case inspiration, Privacy & Trust Center, Family Owner playbook, First 7 Steps, What's New, curated future roadmap and governed feedback intelligence with Platform Owner triage.

Implementation has **not** started in this session. Use `S2-E-GUIDED-FAMILY-EXPERIENCE-LIVING-HELP-SYSTEM.md` and `S2-E-COMPLETE-GUIDE-CONTENT-MAP.md` as completeness contracts in the next session.

## 2026-08-24 — S2-E Guided Family Experience & Living Help System

**Status: IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY REQUIRED**

Implemented:
- first-class desktop/mobile `Explore & Guide` destination;
- central `GUIDE_ENTRIES` product-help registry with role, feature, status and version metadata;
- reusable contextual `FeatureGuide` on primary live product surfaces;
- complete Guide Portal with product story, 10 personas, goal explorer, module library, inspiration, Owner playbook, First 7 Steps, What's New and curated future ideas;
- deterministic guide search with natural-goal keywords;
- role/feature-aware module filtering;
- `Try in Playground` actions using existing no-save sample-family behavior;
- Privacy & Trust Center language that avoids surname/community/city relationship inference and treats community/marriage discovery as explicit opt-in;
- structured feedback RPC/table with safe context fields only;
- Platform Owner feedback triage + aggregate family/request signals;
- source validation gate `validate:s2-e` (15/15 in this workspace).

Still LIVE VERIFY:
- migration `041_s2e_guided_family_help_feedback.sql` on clean staging and upgraded instances;
- feedback submit/status/aggregate RPC behavior with real auth/RLS;
- anonymous Playground, fresh auth/no-family, new creator, member, Owner, co-admin, Platform Owner and hidden-feature behavior;
- mobile behavior at 360/390/430 and older/non-technical usability;
- every Open Feature / Try in Playground route;
- privacy wording against deployed runtime/RLS;
- full dependency-complete Next production build.

## 2026-08-24 — S2-E Release Closure + S3 Design

### S2-E
Status: **SOURCE-COMPLETE / READY FOR LIVE CERTIFICATION**.

Closure pass fixed broken related-guide navigation and extended contextual guide coverage into Profile, Import, Invitations and Relationship management. New closure gate `scripts/s2-e-release-closure-gate.mjs` passes 13/13. S2-E is not yet production-certified because migration 041, deployed RLS/RPC behavior, real browser/mobile behavior, Playground no-save behavior and dependency-complete production build still require live verification.

### S3
Status: **DESIGNED / IMPLEMENTATION NOT STARTED**.

Canonical design: `S3-BUSINESS-PROOF-DESIGN.md`.
Execution order:
1. S3-A Family Activation & Network Growth Engine.
2. S3-B Retention & Compounding Family Value.
3. S3-C Founder Operations & Scale Proof.
4. S3-D Trust, Portability & Defensibility Proof.
5. S3-E Willingness-to-Pay & Monetization Proof.

S3 is evidence-led. It must not become another feature-count phase.

## 2026-08-24 — Pilot Freeze / Feedback-first operating mode

### ACTIVE
**S3-A — Family Activation & Network Growth.** The implementation backlog is defined in `S3-A-ACTIVATION-NETWORK-GROWTH.md`, but broad development is intentionally paused while real families use the system.

### OPERATING PRIORITY
Blocking user issues, privacy/security/correctness failures and repeated high-value friction are addressed first. Feedback is retained even when deferred; no useful idea is deleted merely because it is not active.

### DEFERRED / PRESERVED
S3-B, S3-C, S3-D and S3-E remain planned but inactive until S3-A evidence is strong enough. Existing future-feature ideas remain preserved.

### LAUNCH CONTROL DEFAULTS
Real-family release: Core + Explore & Guide + Special Days + Memories + Family History + Family Pulse + Quiet Digest + Contributions + Relationship Explorer + role-gated Administration.
Pilot: Gatherings + family sharing.
Test: Places + Community + Trusted Introductions + public profiles + Print/QR.
Playground: member-facing breadth visible for discovery except public profiles and Print/QR, which remain hidden by default.


## 2026-08-25 — S3-A activation hypothesis refined by real adoption friction

**ACTIVE NEXT EXPERIMENT: S3-A1 Distributed Family Intake & Branch Assembly.**

Broad feature development remains frozen. Rather than requiring relatives to enter an incomplete application and manually construct the tree, a Family Starter will eventually share a safe family contribution link/code. Representatives submit familiar mobile forms for the branch they know; submissions are staged, deduplicated with deterministic identity/context signals, reconciled into partial branches, and connected by the Owner/Admin. Wider family onboarding happens after useful family data exists.

No implementation is claimed by this roadmap update. S3-A1 is PLANNED / NEXT when user feedback justifies resuming development.

Also preserved as planned: a configurable About Creator / Connect with us surface for feedback, onboarding help, partnerships, organizations, speaking/media and investor/business opportunities, reusing governed feedback/triage patterns and avoiding exposure of private personal contact data.

## 2026-08-25 — S3-A1 Distributed Family Intake & Branch Assembly V1

**Status: IMPLEMENTED IN SOURCE / LIVE VERIFY REQUIRED**

Implemented as an independent activation/onboarding subsystem rather than a rewrite of the existing Family Network. Family creation now recommends Build Together; Family Owners can generate separate secure branch-contribution links; recipients complete a standalone mobile form without family-tree/app navigation; people and typed relationships are staged; deterministic identity candidates and cross-branch overlaps are surfaced; medium/high ambiguity blocks canonical commit; Same / Different / Not sure decisions are retained; approved branches enter existing `family_members` / `family_relationships` only through an Owner/Admin transactional RPC; conflicting canonical facts are preserved rather than overwritten; and intake funnel events support adoption measurement.

Launch Control key `contribute.branch_intake` defaults to **Pilot**. Voice/WhatsApp/NLP/OCR/AI inference and advanced automatic branch stitching remain **DEFERRED / EVIDENCE-GATED**.

Source gate `validate:s3-a1` passes 14/14. Production build, migration 043, deployed RLS/RPC, cross-family isolation, anonymous token behavior and 360/390/430 browser UX remain **LIVE VERIFY**.


## 2026-08-25 — Permanent mission closure lifecycle

**RULE ADDED / ACTIVE**

Major user-facing missions and coherent batches of 2–3 small missions now close through:

**IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**

A feature may be IMPLEMENTED before this sequence is complete, but it must not be called **UX COMPLETE / CLOSED** until all applicable closure layers are done. Backend-only work may mark irrelevant user-facing layers N/A with a reason.

### S3-A1 closure ledger
- [x] IMPLEMENT — distributed intake V1 is implemented in source.
- [x] VALIDATE — `validate:s3-a1` 14/14 plus surrounding source regression gates passed.
- [ ] GUIDE — contextual interfaces + central Guide/Doc Portal coverage still to be added.
- [ ] PLAYGROUND — safe no-save end-to-end Build Together demonstration still to be added.
- [x] LAUNCH CONTROL — feature key `contribute.branch_intake` exists and defaults to Pilot; closure patch should also make the feature meaning/placement clear in Launch Control UI/help.
- [ ] WHAT'S NEW — user-facing release entry still to be added.
- [x] ROADMAP/STATUS — implementation truth recorded; update again after closure patch.
- [ ] WHERE TO SEE THIS IN THE PRODUCT — formal traceability block still to be added with the closure patch.
- [ ] CLOSE — not yet UX complete.
- [ ] LIVE VERIFY — migration 043, deployed RLS/RPC/token behavior and mobile/browser validation remain outstanding.

**Current truthful state: IMPLEMENTED IN SOURCE / CLOSURE PARTIAL / LIVE VERIFY REQUIRED.**

### Next related mission
**S3-A2 — Populated-Family Onboarding: PLANNED / EVIDENCE-GATED.**

S3-A1 gets useful family data into the product before mass onboarding. S3-A2 begins after that: invite the wider family with **"Your family is ready — find yourself and explore"**, help each person identify/claim their pre-created profile, deliver immediate relationship/lineage value, and offer a prefilled **Complete my branch** flow for small missing pieces. It should optimize joining an already-useful family, not ask users to rebuild it.

## 2026-08-25 — S3-A1 closure patch completed

**S3-A1 — Distributed Family Intake & Branch Assembly: IMPLEMENTED IN SOURCE / UX CLOSURE COMPLETE / LIVE VERIFY REQUIRED**

Closure lifecycle:
- [x] IMPLEMENT
- [x] VALIDATE (implementation source gate + closure source gate)
- [x] GUIDE
- [x] PLAYGROUND
- [x] LAUNCH CONTROL
- [x] WHAT'S NEW
- [x] ROADMAP / STATUS
- [x] WHERE TO SEE THIS IN THE PRODUCT
- [x] CLOSE
- [ ] LIVE VERIFY

The previous `CLOSURE PARTIAL` checkpoint is superseded by this source/UI closure. It is **not** superseded into VERIFIED: migration 043, deployed anonymous token/RLS/RPC isolation, real multi-link submission, commit behavior and 360/390/430 browser verification remain outstanding.

### Where to see S3-A1
Create Family → Build together with relatives; Home quick-start → ask relatives through simple forms; Family Admin → Build together; contributor `/contribute/[token]`; Explore & Guide → Build Together; Playground → no-save Build Together walkthrough; Platform Owner → Launch Control → Contribute → Build family together; Explore & Guide → What's new.

### Next related mission
**S3-A2 — Populated-Family Onboarding remains PLANNED / EVIDENCE-GATED.** Its job begins after S3-A1 succeeds: wider relatives arrive to an already useful family, find themselves, safely claim the right pre-created profile, get an immediate relationship/lineage wow moment, and complete only missing pieces of their own branch.


# Generic Platform Expansion Missions — 2026-08-25

- **G0 — Trusted Network Architecture Blueprint:** ARCHITECTURE COMPLETE / 2026-08-25
- **G1 — First Shared Capability Extraction:** COMPLETE — G1.1/G1.2/G1.3/G1.4 CLOSED; planned G1.5 absorbed into G2
- **G2 — Shared Identity, Claiming & Participation Foundation:** IMPLEMENTED IN SOURCE / CLOSED
- **G3 — Network Construction Engine Extraction:** IMPLEMENTED IN SOURCE / CLOSED
- **G4 — Vertical Runtime & App Composition:** NEXT / HIGH-EFFORT CONSOLIDATED BATCH
- **G5 — Alumni Network V1:** IMPLEMENTED / CERTIFIED R2
- **G6 — Two-Vertical Architecture Proof, Shared UX Composition & Hardening:** IMPLEMENTED IN SOURCE / CLOSED / DEPLOYED SMOKE REQUIRED
- **G7 — Generic Platform Productization:** NEXT / EVIDENCE-GATED HIGH-EFFORT BATCH
- **G8 — Commercial Platform Foundation:** EVIDENCE-GATED
- **G9+ — Future Verticals & Ecosystem Scale:** FUTURE — association/professional/enterprise/founder/clubs/nonprofit scopes preserved

Permanent lifecycle:
**CLASSIFY → IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**

Working Family behavior must remain a stable contract throughout extraction.


## 2026-08-25 — G0 Trusted Network Architecture Blueprint closed

**G0 — ARCHITECTURE COMPLETE / NO RUNTIME REFACTOR PERFORMED**

G0 audited the current source, TypeScript domain model, repository/remote boundaries, feature runtime, database tenancy/membership spine and S3-A1 construction pipeline. Binding decisions are recorded in `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`.

Key conclusions:
- `networks`, `network_memberships`, active-network context, authorization primitives and platform rollout are the strongest current CORE candidates.
- identity/claiming, invitations, product runtime frameworks, governed contribution and construction workflow patterns are SHARED-capability candidates.
- parent/child/spouse, generation ordering, lineage and kinship explanation belong to a KINSHIP intermediate domain layer rather than universal core.
- Family memories/history/deceased/special-day/branch language stays explicit Family specialization.
- `NETWORK_TEMPLATES` vocabulary substitution is not the architecture for Alumni; Alumni is an explicit second vertical.
- S3-A1 is architecturally a future Distributed Network Construction capability and remains physically Family-specific until consolidated G3 extracts the workflow using the second-consumer evidence established by G2.
- S3-A2 is pre-classified so reusable seams can be used without delaying the Family activation experiment.

**NEXT CODE MISSION: G1.1 — Architecture Guardrails + Typed Vertical Registry.** Preserve all Family behavior and existing RPC/link compatibility.

## 2026-08-25 — G1.1 Architecture Guardrails + Typed Vertical Registry

**G1.1: IMPLEMENTED IN SOURCE / CLOSED (NON-USER-FACING) / FULL BUILD VERIFY ENVIRONMENT-LIMITED**

Delivered:
- `core/verticals/contracts.ts` typed vertical/capability composition contract;
- `verticals/family/definition.ts` active Family registration;
- `verticals/alumni/definition.ts` Alumni skeleton only;
- `app-shell/vertical-registry.ts` composition registry + uniqueness guard + Family default;
- optional `NetworkSettings.vertical_kind` runtime compatibility resolution;
- Family SetupScreen defaults sourced from the Family registry definition with identical existing values;
- `validate:g1.1` dependency-direction and registration gate.

Validation truth:
- G1.1 architecture gate: PASS.
- Every pre-existing source gate: PASS.
- New G1.1 TS architecture layer: PASS under TypeScript 5.8.3.
- Full `next build`: NOT CERTIFIED HERE because dependencies were not present and install did not complete; this is recorded as environment limitation rather than a passed build.

Closure: Guide / Playground / Launch Control / What's New are N/A because G1.1 has intentionally no user-facing surface. Family behavior remains the stable contract.

**NEXT CODE MISSION: G1.2 — Feature Runtime / Vertical Catalog Split.**

## 2026-08-25 — G1.2 Feature Runtime / Vertical Catalog Split

**G1.2: IMPLEMENTED IN SOURCE / CLOSED (NON-USER-FACING) / FULL BUILD VERIFY ENVIRONMENT-LIMITED**

Delivered:
- `core/features/contracts.ts` generic launch/catalog/effective-feature contracts;
- `core/features/runtime.ts` generic indexed runtime for defaults and eligibility;
- `verticals/family/features/catalog.ts` canonical Family catalog with all 23 existing keys/defaults preserved;
- `verticals/alumni/features/catalog.ts` hidden skeleton catalog proving a second vertical without Family semantics;
- Family and Alumni vertical definitions now compose their own feature catalogs;
- app-shell exposes typed feature-catalog resolution;
- `lib/features.ts` remains the compatibility facade for all existing Family callers;
- historical S2-B and S3-A1 source gates now follow the canonical Family catalog location;
- `validate:g1.2` prevents reverse dependencies and locks Family feature contracts.

Validation truth:
- all 20 source gates: PASS;
- focused TypeScript compile: PASS under TypeScript 5.8.3;
- focused runtime behavior compatibility assertions: PASS;
- deletion audit vs cumulative G1.1 baseline: PASS / zero deleted files;
- full `next build`: NOT CERTIFIED HERE because dependencies are absent and `npm ci` timed out/reset the temporary environment.

Closure: Guide / Playground / Launch Control / What's New changes are N/A because no visible feature changed. Existing Guide/Playground/Launch Control/What's New behavior is preserved. End-user/Admin guide documents are intentionally unchanged.

Quick runtime verification is documented in `G1.2-RUNTIME-VERIFICATION-CHECKLIST.md`.

**NEXT CODE MISSION: G1.3 — Neutral Network & Membership Contracts.**

## 2026-08-25 — G1.3 Neutral Network & Membership Contracts

**G1.3: IMPLEMENTED IN SOURCE / CLOSED / DEPLOYED DB SMOKE REQUIRED**

Delivered:
- neutral Core network/membership/context contracts;
- Family transport adapter isolating the `member_id -> family_members` compatibility leak;
- neutral `fetchMyNetworkMemberships()` plus preserved `fetchMyNetworks()` Family facade;
- neutral `membership_role` with preserved `family_role` auth alias;
- Playground/Launch Control code↔DB catalog-drift guard;
- additive/idempotent migration 044 repairing missing feature registry/Playground rows without overwriting existing rollout choices;
- `validate:g1.3` including all-23-feature catalog reconciliation checks.

Validation truth:
- all historical source gates: PASS;
- G1.1/G1.2/G1.3 gates: PASS;
- focused TypeScript 5.8.3 compile/syntax checks: PASS;
- focused membership runtime assertions: PASS;
- full Next.js build: not claimed in this dependency-less artifact workspace.

Closure lifecycle:
- [x] CLASSIFY
- [x] IMPLEMENT
- [x] VALIDATE
- [ ] DEPLOYED DB SMOKE — apply migrations through 044 and re-toggle Build family together
- [x] GUIDE N/A for ordinary users/admins
- [x] PLAYGROUND regression guard
- [x] LAUNCH CONTROL regression guard
- [x] WHAT'S NEW N/A
- [x] ROADMAP / STATUS
- [x] CLOSE in source

**NEXT CODE MISSION: G1.4 — Remote Capability Split Behind Compatibility Facade.**


## 2026-08-25 — G1.4 Remote Capability Split Behind Compatibility Facade

**G1.4: IMPLEMENTED IN SOURCE / CLOSED / NORMAL DEPLOYED SMOKE RECOMMENDED**

Delivered:
- `capabilities/network-context/remote.ts` for neutral membership retrieval + active-network switching;
- `capabilities/launch-runtime/remote.ts` for Playground/Launch Control/effective feature/rollout/announcement transport;
- `capabilities/platform-ownership/remote.ts` for Platform Owner transport;
- `lib/remote.ts` preserved as compatibility facade;
- compatibility snapshot/gate protecting all 147 historical remote exports;
- G1.3 gate updated to follow the neutral membership seam into its new capability module;
- G1.3 Playground catalog-drift protection included in the G1.4 gate.

Validation truth:
- every historical D1/V1/CR/S1/S2/S3-A1 source gate: PASS;
- G1.1/G1.2/G1.3/G1.4 gates: PASS;
- 147/147 historical remote facade exports preserved;
- focused TypeScript 5.8.3 compile: PASS;
- full Next.js build not claimed because dependencies are not present in this artifact workspace.

No migration/RPC rename/RLS change/Family UX change was introduced. User/Admin guide remains unchanged because there is no visible workflow change.

Closure lifecycle:
- [x] CLASSIFY
- [x] IMPLEMENT
- [x] VALIDATE
- [x] GUIDE N/A
- [x] PLAYGROUND existing G1.3 protection preserved
- [x] LAUNCH CONTROL existing behavior preserved
- [x] WHAT'S NEW N/A
- [x] ROADMAP / STATUS
- [x] CLOSE

**BATCHING UPDATE:** planned G1.5 was absorbed into consolidated G2 together with invitation and participation seams.


## 2026-08-25 — G2 Shared Identity, Claiming & Participation Foundation

**G2: IMPLEMENTED IN SOURCE / CLOSED / SHORT DEPLOYED SMOKE RECOMMENDED**

Delivered as one consolidated High-effort batch:
- `core/identity/contracts.ts` neutral vertical identity, account↔identity binding and claim contracts;
- `core/participation/contracts.ts` neutral invitation, governed contribution and metrics contracts;
- `capabilities/identity-claiming/runtime.ts` and `capabilities/participation/runtime.ts` adapter-independent runtimes;
- Family verified-email claiming adapter over existing `get_my_claimable_profiles` / `claim_profile_by_verified_email`;
- Family invitation/contribution/participation adapter over the existing production RPC set;
- Family invitation/contribution transport shapes moved behind `lib/participation-types.ts` compatibility facade;
- explicit Alumni institutional identity model + unavailable claiming/participation adapters, with no `family_members` or Family RPC reuse;
- app-shell vertical capability composition;
- G2 architecture/regression gate preserving all 147 historical `lib/remote.ts` exports.

Validation truth:
- every historical D1/V1/CR1/CR2/S1/S2/S3-A1 gate: PASS;
- G1.1/G1.2/G1.3/G1.4/G2 gates: PASS;
- 147/147 historical remote facade exports preserved;
- focused strict TypeScript 5.8.3 compile for the complete G2 contract/runtime/adapter layer: PASS;
- no post-044 migration introduced;
- no accepted application file deleted;
- full `next build`: NOT CERTIFIED HERE because `node_modules` is absent and `npm ci` timed out.

No Family UI/navigation/copy/feature defaults/RPC/RLS/schema changed. User/Admin Guide is intentionally unchanged because there is no visible workflow change.

Closure lifecycle:
- [x] CLASSIFY
- [x] IMPLEMENT
- [x] VALIDATE
- [x] GUIDE — architecture docs only; end-user guide N/A
- [x] PLAYGROUND — existing behavior preserved; no artificial architecture screen
- [x] LAUNCH CONTROL — existing behavior + feature-catalog drift guard preserved
- [x] WHAT'S NEW — N/A
- [x] ROADMAP / STATUS
- [x] WHERE TO SEE THIS — existing Family claim/invite/Participation surfaces unchanged
- [x] CLOSE
- [ ] SHORT DEPLOYED SMOKE

Quick runtime check: `G2-RUNTIME-VERIFICATION-CHECKLIST.md`. Full architecture record: `G2-SHARED-IDENTITY-CLAIMING-PARTICIPATION-FOUNDATION.md`.

**G3 completed as one consolidated batch; G4 subsequently completed. Current next batch: G5 — Alumni Network V1.**


## 2026-08-25 — G3 Network Construction Engine Extraction

**G3: IMPLEMENTED IN SOURCE / CLOSED / SHORT DEPLOYED SMOKE RECOMMENDED**

Delivered:
- neutral construction source/provenance/session/access/staged entity+edge/match/decision/conflict/validation/commit contracts;
- adapter-independent construction runtime;
- Family construction adapter owning all historical S3-A1 RPCs unchanged;
- Family intake type ownership moved under the Family vertical with `lib/family-intake-types.ts` compatibility preserved;
- explicit Alumni institutional construction types + skeleton adapter with zero Family persistence/kinship reuse;
- app-shell construction composition;
- `network.construction` typed capability;
- `validate:g3` including 147-export preservation and 234-file accepted-baseline deletion protection.

Validation truth:
- every historical D1/V1/CR/S1/S2/S3-A1 gate: PASS;
- G1.1/G1.2/G1.3/G1.4/G2/G3 gates: PASS;
- focused strict TypeScript 5.8.3 compile: PASS;
- focused runtime delegation/skeleton guard assertion: PASS;
- no G3 migration/RPC/RLS/Family UX change.

Closure lifecycle:
- [x] CLASSIFY
- [x] IMPLEMENT
- [x] VALIDATE
- [x] GUIDE N/A for new user-facing content
- [x] PLAYGROUND existing S3-A1 experience unchanged
- [x] LAUNCH CONTROL existing `contribute.branch_intake` unchanged
- [x] WHAT'S NEW N/A
- [x] ROADMAP / STATUS
- [x] CLOSE
- [ ] SHORT DEPLOYED SMOKE

**G4 subsequently completed; current next batch is G5 — Alumni Network V1.**

## 2026-08-25 — G4 Vertical Runtime & App Composition

**G4: IMPLEMENTED IN SOURCE / CLOSED / SHORT DEPLOYED SMOKE RECOMMENDED**

Delivered as one consolidated High-effort batch:
- neutral app-composition contracts;
- validated app-shell vertical runtime;
- Family navigation/Guide/Playground/Launch/What's New runtime registration;
- explicit fail-closed Alumni app skeleton;
- `NetworkApp` and Launch Control moved from inline registries to Family vertical composition without changing renderers;
- duplicate legacy `VerticalDefinition.navigation` ownership removed;
- `validate:g4` preserving 147 remote exports and 260 accepted G3 files.

Validation truth:
- every historical source gate through G4: PASS;
- focused TypeScript 5.8.3 composition compile: PASS;
- changed TS/TSX syntax transpilation: PASS;
- executable Family/Alumni composition assertion: PASS;
- no migration/RPC/RLS/Family UX change.

Closure lifecycle:
- [x] CLASSIFY
- [x] IMPLEMENT
- [x] VALIDATE
- [x] GUIDE registration moved; content unchanged
- [x] PLAYGROUND registration moved; behavior unchanged
- [x] LAUNCH CONTROL metadata moved; behavior unchanged
- [x] WHAT'S NEW routing moved; behavior unchanged
- [x] ROADMAP / STATUS
- [x] CLOSE
- [ ] SHORT DEPLOYED SMOKE

**NEXT CONSOLIDATED BATCH: G5 — Alumni Network V1.**

## G5 CERTIFICATION HOTFIX — CLOSED

Post-certification smoke testing exposed one cross-catalog dispatch bug (`alumni.core.home` evaluated by the Family feature facade). The issue is fixed without changing Family or Alumni feature catalogs. Full D1 → G5 gates pass again. G5 remains CLOSED/CERTIFIED, and G6 must use this corrected baseline.


## 2026-08-25 — G5 Alumni Network V1

**G5: IMPLEMENTED / CERTIFIED R2 / CLOSED**

The first real Alumni vertical is active with separate persistence and product surfaces. The `alumni.core.home` dispatch hotfix is included in the accepted R2 baseline used by G6.

## 2026-08-25 — G6 Two-Vertical Architecture Proof, Shared UX Composition & Hardening

**G6: IMPLEMENTED IN SOURCE / CLOSED / SHORT DEPLOYED SMOKE REQUIRED**

Delivered as one consolidated batch:
- shared topbar + neutral network switcher + reusable metric/section/empty/avatar primitives;
- polished responsive Alumni Home/Directory/Cohorts/Connections/Admin/Guide UX;
- Alumni-specific feature runtime/rollout evaluation retained;
- Family → Alumni early dispatch invariant retained;
- vertical-scoped Platform Launch Control and network targeting;
- migration 046 with Alumni feature registry, durable institution settings, tenant-integrity foreign keys/indexes and trusted connection RPCs;
- complete D1 → G6 source gate chain PASS;
- 147 historical remote exports, 280 accepted G5 files and 7 protected Family foundations preserved;
- G6 changed TS/TSX syntax/transpile PASS.

Closure lifecycle:
- [x] IMPLEMENT
- [x] VALIDATE
- [x] GUIDE
- [x] PLAYGROUND
- [x] LAUNCH CONTROL
- [x] WHAT'S NEW / composition integrity
- [x] ROADMAP / STATUS
- [x] CLOSE
- [ ] SHORT DEPLOYED SMOKE

**NEXT CONSOLIDATED BATCH: G7 — Generic Platform Productization.**


# G7 — Generic Network OS Productization & Template Architecture

**Status: IMPLEMENTED IN SOURCE / SOURCE CERTIFIED / DEPLOYED SMOKE REQUIRED**

Implemented:
- generic network entity/dimension/affiliation/projection contracts and additive persistence;
- multiple projections over the same dataset;
- reusable Network Projection Explorer;
- shared events/RSVP/memories/milestones/groups activity foundation;
- Alumni Explore, Community and Places surfaces;
- active Family + Alumni template definitions;
- future template definitions for Organization, Business Trust, Franchise, Education, Professional, Association, Residential, Supply Chain, Investor, Customer Intelligence and Custom Network;
- migration 047 security/tenant hardening;
- G7 acceptance and compatibility gate.

User-facing closure requires Guide/Playground/Launch/What's New alignment already represented through Alumni composition and updated guide docs. Final release certification must rerun all historical gates and package the exact affected-file delta.
# G8 — Productized Business Verticals: Organization, Business Trust & Franchise

**Status: IMPLEMENTED / SOURCE CERTIFIED / CLOSED IN SOURCE / SHORT DEPLOYED SMOKE REQUIRED**

Delivered:
- [x] CLASSIFY — G7 template proofs promoted to explicit released verticals
- [x] IMPLEMENT — Organization, Business Trust and Franchise creation + product runtime
- [x] VALIDATE — full D1→G8 automated chain PASS
- [x] GUIDE — in-app Guide plus User/Admin documentation
- [x] PLAYGROUND — three read-only domain sample networks
- [x] LAUNCH CONTROL — independent vertical catalogs/bundles
- [x] WHAT'S NEW / composition — released surfaces registered through vertical composition
- [x] ROADMAP / STATUS / HANDOFF
- [x] IDENTITY — verified-email claim + own claimed record edit
- [x] MEMBERSHIP — join code + owner/admin lifecycle
- [x] IMPORT — CSV/XLSX with multi-value affiliations
- [x] SECURITY — productized RPC scope, helper revocation, tenant-aware constraints
- [ ] SHORT DEPLOYED SMOKE / VERCEL BUILD

Migration: `048_g8_productized_verticals.sql` after 047.

**NEXT: G9 — Network Intelligence Layer & Five-Vertical Proof.**

## G8 certification hotfix — build + migration — CLOSED

- Fixed Alumni `adminOnly` TypeScript build failure by widening merged navigation to the shared surface contract.
- Fixed migration 048 membership listing to use `joined_at`, the real migration-019 column.
- Added permanent G8 regression guards.
- Full D1→G8 source-gate chain passed after the fixes.
- G8 Certified R2 supersedes the original certified G8 ZIP.

## G8 certification hotfix — Launch Control bundle typing — CLOSED

- Fixed Next.js TypeScript `string` not assignable to `never` failure in Platform Launch Control.
- Shared launch composition contract remains unchanged; the concrete exclusion list is widened at the caller.
- Added permanent G8 regression guard.
- No database migration change.
- Full D1→G8 source chain passed.
- **G8 Certified R3 is now the authoritative baseline.**

## G8 Product Experience Completion / Certified R4 — CLOSED

- Fixed browser-default productized sidebar caused by missing shared navigation class/styling.
- Fixed narrow onboarding card collapse using container-safe responsive grids.
- Added Safe Playgrounds gallery for Family, Alumni, Organization, Business Trust and Franchise.
- Added persisted Light / Dark / Aurora appearance system across the released app.
- Added shared Network Pulse to Organization, Business Trust and Franchise Home.
- Preserved all protected Family/Alumni foundations.
- No migration beyond corrected 048.
- Complete D1→G8 source/regression chain passed.
- R4 supersedes the original G8, R2 and R3 artifacts.

# G8.5-A — Clean + Audit + Rules

**Status: IMPLEMENTED / SOURCE CERTIFIED / CLOSED**

Delivered:
- [x] historical Markdown archive under `archive/docs/`;
- [x] root documentation reduced to active operating/current-release material;
- [x] accepted baseline manifests repointed to archived artifacts;
- [x] missing G5 certification-history artifacts restored;
- [x] five-vertical capability applicability/product-depth audit;
- [x] Generic Capability Utilization Rule;
- [x] Productized Vertical Gate definition;
- [x] permanent `validate:g8.5a` source guard;
- [x] roadmap/codebase/validation/handoff updates;
- [x] no runtime/schema behavior changed.

**NEXT: G8.5-B — Generic Capability Parity.**

## G8.5-B — CLOSED
- B1 Discovery & Relationships: implemented shared map/geography, entity detail and relationship/path explorer.
- B2 Living Network & Participation: corrected activity discoverability and enriched governed contribution intent.
- B3 Lifecycle, Governance & Help: added rollout visibility and capability-aware guide while preserving platform-owner Launch Control authority.
- No database migration. Historical G8/G8.5-A gates preserved.


## G8.5-C — CLOSED / SOURCE CERTIFIED
- Five-vertical showcase scale certified: Family 60+, Alumni 36, Organization 36, Business Trust 36, Franchise 36.
- Alumni expanded from 6 to 36 profiles with seven batches, six programs, 6 groups and 10 network-life items.
- Organization / Business Trust / Franchise expanded to 36 entities each with dense typed relationships, 6 groups and 10 activity items.
- Added Playground What's New, guided exploration journeys, Guide showcase proof, and responsive/theme-safe showcase polish.
- Added `validate:g8-5c`; historical regression chain remains mandatory.
- No database migration.

**NEXT: G9 — Network Intelligence Layer & Five-Vertical Product Proof.**

## 2026-08-26 — Strategic Product Review — COMPLETE / EXECUTION RESET

A founder-level go/no-go review was performed after G8.5-C.

### Conclusion
- Current three business verticals are **not yet strong enough to justify an unqualified subscription purchase**.
- The project should continue because the underlying trusted/multi-projection relationship platform enables credible high-value wedges, but further generic feature/vertical expansion is blocked.
- Commercial proposition is reset from “Generic Network OS” to outcome loops: **Find → Understand → Connect → Act → Capture → Improve**.
- Paid-wedge priority: Organizational Intelligence and Franchise first; Business Trust incubation; Alumni opportunity/community; Family remains flagship trust/UX laboratory.

### New binding artifacts
- `STRATEGIC-PRODUCT-REVIEW.md`
- `FAMILY-TO-NETWORK-EXPERIENCE-MAP.md`

### Next
**G8.6 — Outcome-Driven Vertical Experience Closure**, followed by **G9 — Paid Outcome Intelligence Proof**, followed by a real Commercial Reality Gate before G10.

## G8.6-A + G8.6-B — CLOSED / SOURCE CERTIFIED

- [x] fixed `.modal-backdrop` as a true viewport modal contract;
- [x] shared Structure Map for productized verticals;
- [x] Alumni living-structure augmentation within protected bounded regions;
- [x] Entity 360: view in network, connection question, update connection, ask network, edit where authorized;
- [x] Organization Wins & Lessons + Communities of Practice + expertise/help prompts;
- [x] Business Trust Evidence & Success Stories + Business Circles + warm-path/verification prompts;
- [x] Franchise Operations Playbook + Operator Networks + peer-location help prompts;
- [x] Alumni Journeys & Give Back;
- [x] governed contribution retained as persistence path for help requests;
- [x] no database migration;
- [x] inherited G8/G8.5 gates preserved.

**NEXT: G8.6-C — enriched Home, mature Guide/Explore, Platform Owner Launch Control parity, What's New/return loop and final five-vertical product closure.**

## G8.6-C — CLOSED
Status: DONE / source-certified.
Outcome Home, Guide, Launch Control and Return Loop are now part of the five-vertical product proof. G9 is the next mission.

## G9 Runtime Certification + Commercial Reality Gate
**Status: COMPLETE — technical PASS / commercial CONDITIONAL PASS TO PILOT.**

Primary commercial wedge: Organizational Intelligence focused on expertise, ownership and dependency-risk decisions. Franchise is the challenger. G10 is blocked until real buyer/pilot evidence exists. Next recommended mission: G9.1 Organization Paid-Pilot Readiness.

## G9.1 — Two-Codebase Integration Design Gate

**Decision:** PAUSE the earlier standalone G9.1 implementation plan until a two-codebase review is complete.

**Next session input required from founder:** authoritative ZIP of Generic Network OS + authoritative ZIP of RAG Knowledge Hub.

**Next action:** inspect both codebases deeply, compare actual contracts/runtime/deployment assumptions, and design the smallest high-value bridge. No implementation should begin from memory or conceptual assumptions alone.

**Commercial focus:** Organizational Intelligence. Franchise remains challenger. G10 is blocked pending commercial evidence.

## Strategic Update — Network Effect Thesis

**Status:** ACTIVE THESIS — requires validation.

> **The primary long-term moat may be the network effect of many trusted, independently governed networks connected through one privacy-preserving multi-network platform.**

Current interpretation:
- Organization remains the best near-term paid-pilot wedge.
- Franchise remains the strongest challenger.
- Family may be weak as a standalone subscription but strategically important as a trusted network/community primitive.
- Community umbrellas can turn isolated Family networks into larger trusted ecosystems for jobs, matrimonial discovery, trusted services, introductions, events and support.
- Multi-network membership can create a one-stop trusted network utility without becoming a noisy open social network.
- The largest scaling problem may become onboarding/seeding networks, not adding features.

G10 remains blocked pending commercial evidence, but the company thesis must no longer be judged only on single-vertical monetization.

## Strategic Planning Update — Network Operations & Activation

The network-effect thesis now includes a concrete distribution hypothesis:

**institutional anchor + trained operator + seed data + volunteer admins + member claiming + first useful outcomes + adjacent-network referral.**

This is now considered a first-class company capability alongside engineering.

Next technical work remains the two-ZIP G9.1 RAG × Network OS architecture review, but future roadmap decisions must account for the possibility that **network acquisition/activation—not feature development—is the dominant constraint.**



## G9.1-A — Evidence Foundation + Intelligence Adapter
Status: IMPLEMENTED / SOURCE-GATE VERIFIED

Delivered as additive bridge code. Existing G9 runtime behavior is preserved. Evidence, source, candidate-assertion and decision contracts are isolated from canonical graph truth. The Knowledge Hub bridge is network/corpus scoped and does not alter its existing Electron/API/query paths.

## G9.1-A Runtime / Database Verification — COMPLETE / SOURCE-CERTIFIED

- [x] active-membership enforcement verified for all G9.1-A read policies;
- [x] ordinary member SELECT excludes `restricted` knowledge sources/evidence;
- [x] no direct client write policies opened for evidence/candidate tables;
- [x] explicit network/corpus/principal/authorization adapter context verified;
- [x] principal/network mismatch and empty-scope blocking verified;
- [x] existing G9 deterministic intelligence remains decoupled from the bridge;
- [x] complete G9→G8 regression validation chain passes;
- [x] Knowledge Hub bridge syntax/context negative paths pass;
- [x] read-only Supabase catalog verification script added;
- [ ] live two-user/two-network Supabase isolation smoke test remains an environment certification step after migration 050 is applied.

**NEXT:** G9.1-B Organization Knowledge Bootstrap. Keep G9.1-B, G9.1-C and G9.1-D as independently gated missions; batch only small sub-batches inside each mission.

## G9.1-B — Organization Knowledge Bootstrap
**Status: IMPLEMENTED / SOURCE-VALIDATED**
- Added network-scoped corpus ingestion and targeted Organization extraction in additive Knowledge Hub bridge modules.
- Added governed Network OS evidence/candidate RPCs and an Organization-admin Knowledge Discovery Inbox.
- Supported first facts: expertise, ownership, dependency, architectural decision.
- Human verification is mandatory before graph-affecting commits; existing G9 runtime remains unchanged.
- Automated validation: `npm run validate:g9.1b` PASS, including complete G9/G8 regression chain and Knowledge Hub bridge syntax checks. Live Supabase/Ollama smoke remains the deployment gate.


## G9.1-C — Graph-Aware RAG
Status: IMPLEMENTED / SOURCE-GATE PASS

Graph truth and authorized organizational evidence now combine through a decoupled Organization-only orchestrator. Directed ownership/dependency traversal, skill expertise matching, decision evidence, provenance/freshness and graph-only fallback are implemented. Existing G9 and G8 regression chain remains green. Manual live runtime verification may be performed by the founder before G9.1-D.

## G9.1-D — Organizational Knowledge Risk Loop — IMPLEMENTED / SOURCE-CERTIFIED
- Added deterministic Organization risk analysis for key-person concentration, ownership gaps, dependency criticality, repeated unanswered questions, stale evidence and conflicted assertions.
- Added governed Organization query-outcome telemetry and admin-only risk summary RPC.
- Added Organization-admin Risk Loop UI under G9.1-C Intelligence.
- Preserved G9 deterministic engine and Knowledge Hub standalone behavior.
- `npm run validate:g9.1d` passes the complete G9.1-D → G9 → G8 regression chain.
- Live migration 053 / real-user runtime smoke remains for manual verification.

## G9.1-B.1 + C.1 — Intelligence Quality Hardening
Implemented after Northstar manual validation exposed explicit-target resolution and candidate-coverage defects. Exact named entities now win before fuzzy matching; dependency direction is question-aware; expertise ranking is strengthened; answer evidence is progressively disclosed; Knowledge Hub extraction uses focused structural/knowledge passes with diagnostics and de-duplication. No schema migration and no canonical G9 engine changes.

## NX-1 — My Networks & Trusted Identity Experience
**Status:** IMPLEMENTED / SOURCE-GATED / RUNTIME VERIFICATION PENDING

Delivered: My Networks home, generic Family-shell switching, account-scoped trusted identity aggregate, privacy explanation, five-vertical Playground, vertical-kind projection fix, guide + milestone checklist.
Validation: NX-1, G1.3, G2 and G8.5-C source gates PASS. Full build not completed in the authoring container because dependency restoration timed out; milestone checklist requires `npm ci` + `npm run build` in the normal project environment.

## NX-2 — Living Network: Daily Value & Generational Connection
**Status:** IMPLEMENTED / SOURCE-GATED / MILESTONE RUNTIME VERIFICATION PENDING

Delivered a calm Family return loop using existing authorized graph, memory, event and profile data: one meaningful family minute, graph-aware relative rediscovery, generational continuity, story-preservation prompts and family-continuity signals. No new schema/RLS and no addictive feed mechanics. Runtime verification is intentionally deferred to the next milestone verification window.

## NX-3 — Family Time Machine & Generational Legacy
**Status:** IMPLEMENTED / SOURCE-VALIDATION IN PROGRESS / MILESTONE RUNTIME VERIFICATION PENDING

Delivered an evidence-bound Family Time Machine, preservation-priority experience and generation-coverage view using existing Family data only. No AI-authored history, schema/RLS migration or cross-network exposure.


## NX-4 — Family Growth Relay
Status: IMPLEMENTED / SOURCE-VALIDATED / RUNTIME MILESTONE VERIFICATION PENDING.
Purpose: distribute family preservation and growth across ordinary relatives instead of concentrating upkeep on one organizer.

## NX-5 — Family Connection & Belonging
**Status:** IMPLEMENTED / SOURCE-VALIDATED / RUNTIME MILESTONE VERIFICATION PENDING

Delivered relationship-aware reconnect, explainable connection paths and derived private Family Circles using existing Family graph/context only. No schema/RLS change, public group model, contact exposure or engagement ranking.

## NX-6 — WOW Experience & Product Unification
**Status:** IMPLEMENTED / SOURCE-VALIDATED / MILESTONE RUNTIME VERIFICATION PENDING

Recomposed accumulated Family value into **Today · People · Legacy**, consolidated account actions across vertical shells, simplified profiles into focused tabs, and reduced My Networks/onboarding disclosure. No new schema/RLS or cross-network data path. NX-1→NX-5 and shared identity/membership source gates remain green. Runtime milestone should judge clarity, navigation, mobile quality and whether the product feels materially simpler—not re-test every historical feature.

- NX-6 visual hardening: runtime screenshot issues fixed for NetworkSwitcher row layout/menu height and ProfileDrawer content viewport/guide/header/action proportions. No feature or data-model changes.

## 2026-08-27 — Global Portfolio Brainstorm Recorded

**Type:** strategy capture only; no implementation started.

Recorded decisions/hypotheses:
- Family must not monopolize roadmap attention.
- Preserve post-NX Family signature direction: My Family, Through Me; One Family Moment; deeper Time Machine; less visible complexity.
- Global relevance is now explicit: regional/vertical capability profiles, complete localization and mobile-first/native-portable architecture.
- New candidate verticals include Professional Expertise & Referral, Industry/Trade Ecosystem, Healthcare Provider Collaboration, Education/Research, Public/Civic, Nonprofit and Built Environment.
- Platform should evolve from hierarchy-only assumptions toward governed typed graph relationships while preserving trees as valid projections.
- Institutional anchors and one-to-many distribution are preferred over founder-by-founder selling.
- Direct SaaS, partner/reseller, OEM/white-label, embedded/API and strategic investment/acquisition remain options; core IP retention is the default posture.
- Added a periodic technical-evolution/debt register.

No new mission number has been assigned.

## STABILITY-1 — NX Review + i18n Architecture + Small Fixes
**Status:** SOURCE IMPLEMENTED / LOCAL BUILD VERIFICATION REQUIRED

Purpose: restore the accepted post-NX UI baseline after the rejected Mission 1 redesign, introduce a safer review seam for NX-1→NX-6, establish clean locale-catalog architecture, and fix only contained runtime/CSS issues.


## Mission 2 — Trusted Expertise & Professional Network
**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / LIVE RUNTIME VERIFICATION OPEN

- Added the sixth Network OS vertical for professional associations and expert communities.
- Core job: expertise discovery + credential/context + trusted referral/collaboration paths + reusable case knowledge.
- Reuses existing productized runtime; no Family/NX redesign.
- 36-person global Playground spans India, USA, UK, Spain, Canada, UAE, Australia and Singapore.
- Healthcare patient data / diagnosis / regulated clinical workflows remain explicitly out of scope.
- Migration 054 activates professional tenancy/template/feature support.
- Current EN/HI/MR catalog is 328/328 tokens in each locale. Legacy visible-literal extraction remains tracked debt.
- `npm run validate:m2` PASS; STABILITY-1 chain remains PASS.
- Next roadmap mission remains the governed graph + institutional bootstrap direction, but only after Mission 2 live runtime verification and any contained hardening.

## Mission 3 — Governed Graph Platform + Institutional Bootstrap
**SOURCE IMPLEMENTED · RUNTIME VERIFICATION OPEN**
- M3 source gate: 11/11 PASS.
- M2 regression gate: 19/19 PASS.
- STABILITY-1 regression gate: 14/14 PASS.
- TS/TSX parse/import integrity: PASS.
- i18n AST direct-visible-literal audit: 0.


## 2026-08-27 — Post-Mission-3 Runtime Architecture Decision

The current Next.js + Supabase + Vercel architecture is considered a valid managed/serverless backend, not an architectural failure. The next maturity gap is an **application-owned server/command boundary**, not a wholesale backend rewrite.

**Mission 4 — Network OS Application & Runtime Foundation** is the next recommended major mission at **MEDIUM effort**. It will introduce a modular TypeScript `server/` layer, versioned Next.js `/api/v1` command endpoints, server-side Supabase adapters, shared mobile-portable contracts, command/query classification, an observability seam and a GitHub Actions CI baseline. Supabase Postgres/Auth/Storage/Realtime/RLS remain core infrastructure.

Do not add microservices, Kubernetes, Kafka, Redis, a dedicated graph database, native mobile, or RAG expansion as part of Mission 4. Extract only 3–5 high-value multi-step/privileged commands and preserve safe direct RLS-protected queries.

See `NETWORK-OS-BACKEND-RUNTIME-ARCHITECTURE.md` and `MISSION-4-APPLICATION-RUNTIME-FOUNDATION.md`.

## 2026-08-27 — Mission 4 Application & Runtime Foundation
**SOURCE IMPLEMENTED — RUNTIME VERIFY.** Added a modular `server/` command boundary and versioned `/api/v1` routes for five representative high-value commands: create network, join network, create graph relationship, institutional bootstrap/import and identity claim. Shared contracts are UI-independent for future mobile reuse. Authentication is caller JWT + Supabase anon key; RLS/RPC policies remain authoritative and no service-role secret is exposed or required. Existing UI transport APIs were preserved as compatibility facades. Added structured request/actor/network/command/outcome/duration logging and GitHub Actions CI. Source gates: M4 11/11, STABILITY-1 14/14, M2 19/19, M3 11/11, visible-literal i18n audit 0. Production build and authenticated runtime command checks remain pending due unavailable dependencies in the execution environment.


## Mission 5 — Production & Operational Runtime
**Status:** SOURCE IMPLEMENTED / RUNTIME-DEPLOYMENT VERIFICATION PENDING

Hardened the Mission 4 application boundary without expanding infrastructure: shared command runtime, bounded payload handling, lightweight actor-command burst guard, durable authenticated idempotency for duplicate-sensitive create/bootstrap commands, health/readiness endpoints, runtime config ownership, structured operational metadata, background-job seam and stronger CI/type/build gates. Migration 056 is required before deploying M5 code.


## Mission 6-A — Trusted Identity Unification + Cross-Network Reachability
**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / RUNTIME VERIFICATION PENDING

M6-A reuses NX-1 rather than creating a second identity system. The existing `TrustedPersonIdentity` now carries a privacy-safe `TrustedNetworkReach` aggregate. My Networks shows active networks, distinct verticals, distinct authenticated member accounts across networks the user already belongs to, identity-linked/claimed contexts, and owned/administered network counts. Migration 057 adds a counts-only RPC that never exposes or merges cross-network member identities, profile fields, relationships or graph data. Cross-network trust edges/discovery/introductions remain explicitly deferred to M6-B/M6-C. Permanent mission closure now requires a human-readable `.docx` artifact via `MISSION-DOCUMENTATION-RULE.md`.


## M6-B — Trusted Network-to-Network Linking & Governed Bridges
M6-B extends M6-A/NX-1 with an explicit neutral graph of networks. Administrators exchange private Bridge Codes, request a typed relationship, propose future discovery/introduction capability intent, and the receiving network administrator must accept or decline. Either side can revoke an accepted bridge. The bridge itself exposes no cross-network members, profiles, relationships, activity or graph data; capability intent remains inert until M6-C. All writes use the M4/M5 application command runtime. Migration: `058_m6b_network_trust_bridges.sql`.

## M6-C — Privacy-Safe Cross-Network Discovery & Trusted Introductions
Source implemented. Anonymous discovery + target consent + post-accept disclosure. Runtime certification pending.

- **M6-D Network Effect Activation & Measurement** — SOURCE IMPLEMENTED; runtime certification pending.


## M6-E — Governed Multi-Hop Trusted Paths
**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / RUNTIME VERIFICATION PENDING.
Maximum depth-2 trusted-path discovery is implemented with explicit `pathTraversal` consent on every edge. Identity disclosure remains governed by M6-C. Multi-hop opportunity counts feed M6-D.

## Mission 7 — Real-World Activation, Showcase & Pilot Readiness
**Status:** PROGRAM DEFINED / NOT YET IMPLEMENTED.
M7-B WOW Showcase Universe is recommended first, followed by launch optimization, guided pilots and measured learning. See `MISSION-7-REAL-WORLD-ACTIVATION-SHOWCASE.md`.

## M7-B — WOW Showcase Universe & Guided Scenario Theater
Source implemented. My Networks now includes a read-only synthetic Scenario Theater backed by a deterministic 720-person / six-network showcase universe and seven authored stories. It demonstrates direct and governed two-hop trusted reach while preserving M6 anonymous discovery and target consent. M7-B also re-ships `CrossNetworkDiscovery.tsx` to repair the observed sequential-package missing-module regression. No database migration is required. Runtime/type/build certification remains pending in the fully installed project workspace.

## M7-A — Zero-Friction Network Launch & Activation
M7-A is source implemented. My Networks now gives Owners/Admins a privacy-safe launch-readiness path: seed meaningful people/entities → bring in participants → claim/link identities → establish trusted reach when appropriate → complete a first consented outcome. Migration 062 returns aggregate counts only for networks the caller administers. Existing import/invite/claim/admin experiences are reused rather than duplicated. Validate with `npm run validate:m7a`; runtime/type/build certification is pending in the normal installed workspace. After M7-A, proceed to M7-C Guided Pilot/Admin Activation and then M7-D Pilot Feedback & Learning, using M7-B/M7-A friction as evidence.

## M7-C — Guided Pilot & Admin Launch Console
**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / RUNTIME VERIFICATION PENDING.
M7-C adds an admin-scoped pilot portfolio to My Networks. It classifies administered networks as Starting, Progressing, Needs attention or Value proven, shows 30-day activation signals and identifies the highest-leverage missing step. Migration 063 returns aggregate counts/timestamps only. Existing M7-A actions and M6 trust/privacy workflows remain authoritative.

## M7-D — Pilot Feedback & Product Learning Loop
**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / RUNTIME VERIFICATION PENDING

Members can provide lightweight contextual feedback on launch, participation, claiming, bridges, discovery, introductions and outcomes. Owners/Admins receive aggregate learning signals and de-identified notes. Mission 7 is now functionally complete as SHOW → GUIDE → OPERATE → LEARN. Runtime certification remains in the fully installed project.

### M7-E — Showcase Runtime Hardening & Demo Certification
Status: SOURCE IMPLEMENTED / RUNTIME CERTIFICATION PENDING. Closes the planned M6/M7 trusted-network showcase track after local runtime verification.

### M7-F — Pilot Evidence Review & Product Decision Gate — SOURCE COMPLETE
- Evidence review by launch/participation/claim/bridge/discovery/introduction/outcome/general moment.
- Advisory INVEST / FIX / HOLD recommendations with bounded confidence.
- Human Owner/Admin can explicitly record INVEST / FIX / HOLD / STOP, rationale and next action.
- Evidence snapshot stored with each decision; no automatic roadmap/feature mutation.
- Final planned Mission 7 closure: `SHOW → GUIDE → OPERATE → LEARN → CERTIFY → DECIDE`.

### LC-1 — M6/M7 Launch Control Governance Hardening — COMPLETE
Restored the permanent rule that deployment never equals release. All M6-A..M6-E and M7-A..M7-F surfaces are controlled per vertical through the existing Launch Control.


## 2026-08-28 — Strategic Product Model Update: Federation cardinality + product identity
The post-M7 strategic finding is now corrected and durable:
- Person↔Network is many-to-many.
- Network↔Umbrella/Federation is also many-to-many.
- A person's Family and Business networks do not automatically share an umbrella.
- Multiple Family networks may share one community umbrella; multiple Retail networks may share a Retail federation; a Medical network may independently affiliate with a Medical association.
- M6 peer trust and NF affiliation are distinct relationship classes.
- Federation exposes an explicit policy-controlled federated profile, never the child network's private graph by implication.

The system has crossed from a personal app into a reusable product/platform-backed product. Future roadmap language should use Product / Platform Foundation / Applications-Verticals consistently. The public Product Profile and Product Evolution Journey were rebuilt from the durable mission record rather than a conversational summary.

## NF Track
- **NF-0A / FD-2 — Federation as Distribution Supernode:** FOUNDATION IMPLEMENTED / RUNTIME MIGRATION VERIFY NEXT. Separate federation semantics, privacy invariants, deterministic Network Multiplication Potential, synthetic cross-domain playground, TEST launch control and verification artifacts are in place. Real affiliation persistence remains NF-2.

## NF-1 — Network Passport
**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / RUNTIME VERIFICATION PENDING.
NF-1 creates the first persisted federation-facing identity for a network without exposing its private graph. Owners/Admins can author a Passport with explicit `private | federation | public` visibility, network summary/geography/capabilities/purpose declarations and a stable slug. Public Passport reads are anonymous only when deliberately public. Participation-scope declarations are inert and create no person/application consent. Source gate and i18n gate pass; full type/build verification remains pending a complete dependency install. Next: NF-2 governed Network↔Umbrella affiliation.


## NF-2 — Governed Network↔Umbrella Affiliation — SOURCE IMPLEMENTED — 2026-08-29
- first-class federation umbrellas and umbrella administrators;
- many-to-many governed Network↔Umbrella affiliations;
- Federation/Public Network Passport required before request;
- request → approve/decline → suspend/revoke lifecycle;
- independent TEST-by-default `network_affiliation` Launch Control;
- no M6 bridge reuse and no implicit person/member/graph access;
- CR-1 first slice: advanced capability modules dynamically loaded when rendered.
Runtime DB migration/deployed smoke remains required in the user's installed workspace.

## NF-3 — Umbrella Network Runtime — SOURCE IMPLEMENTED 2026-08-29
**Outcome:** approved Network↔Umbrella affiliations now become an operational network-of-networks runtime without turning the umbrella into a people database.

Implemented:
- admin-only umbrella runtime summaries;
- approved participating-network directory;
- Passport visibility/freshness coverage;
- vertical/capability/application-scope aggregate mix;
- privacy-minimal readiness score;
- source Passport privacy respected dynamically;
- TEST Launch Control + lazy client loading.

**Verification posture:** integrated runtime verification intentionally deferred by founder until the federation batch is applied sequentially. See `MISSION-NF3-RUNTIME-VERIFICATION-CHECKLIST.md`.

**Next:** NF-4 Federated Directory & Discovery.

## NF-4 — Federated Directory & Discovery — SOURCE IMPLEMENTED 2026-08-29
**Status:** source complete / runtime validation deferred by founder batch strategy.

Delivered: Network-only federated search, purpose-aware filtering, approved-affiliation eligibility, directory-enabled Passport boundary, institutional trust receipt, TEST Launch Control, dynamic loading and a dedicated source gate.

**Privacy boundary:** network scope/capability declarations are not person consent. No federated people/resource discovery is introduced by NF-4.

**Next:** NF-5 Community Applications / Purpose Scope Framework.

## NF-5 — Community Applications / Purpose Scope Framework — SOURCE IMPLEMENTED 2026-08-29
- explicit person opt-in per network + umbrella + purpose;
- governed selective outward snapshot;
- participant discovery only through approved umbrella paths;
- Trust Receipt path on results;
- immediate withdrawal;
- TEST Launch Control + dynamic loading;
- runtime validation deferred until sequential ZIP application.


### NF-6 — Trusted Request Routing — SOURCE COMPLETE / RUNTIME DEFERRED
- persisted governed requests and route evidence;
- purpose/umbrella/network scoped;
- deterministic relevance reasons + institutional Trust Receipt path;
- current NF-5 consent, affiliation and Passport state rechecked;
- no contact reveal or recipient notification;
- Launch Control TEST default + dynamic import;
- dedicated source gate + i18n audit + isolated TS syntax transpilation passed;
- integrated runtime verification intentionally deferred with the federation batch.

**Next:** NF-7 Governed Introduction & Consent.


### NF-7 — Governed Introduction & Consent
**Status:** Source implemented / source-gated / runtime verification deferred.
**Next:** NF-8 Outcome + Trust Receipt, followed by the planned complete NF-1→NF-8 TypeScript/import/build + sequential runtime verification round.

### NF-8 — Outcome + Trust Receipt — SOURCE IMPLEMENTED / BATCH CLOSED
**Outcome:** the generic federation loop now reaches measurable post-introduction evidence without creating public trust scores. Trust Receipt provenance and bilateral private outcomes are persisted separately.

**Closure:** NF-1 through NF-8 dedicated source gates pass. Relative-import and syntax sweeps pass. Full project TypeScript is environment-blocked by incomplete third-party type definitions. User runtime validation has not yet started by design.

**Next:** sequential NF-1→NF-8 application + runtime/database verification and defect hardening. NF-9 remains held until this gate is complete.

### NX-8 — My Networks Guided Control Center / Iteration 2
**Status:** Source implemented; runtime review pending.
**Outcome:** Replaces subtle journey tabs and within-journey vertical dumping with visually explicit outcome navigation plus one-tool-at-a-time progressive disclosure. Existing NF/M6/M7 Launch Control remains unchanged.


## NX-9 — My Networks Contextual Guidance & WOW Refinement
**Status:** SOURCE IMPLEMENTED · runtime UX review pending.

The guided control center now teaches advanced areas/tools on demand through contextual explainers rather than adding more permanent copy to the page. This is a refinement of NX-8, not a new information architecture.

## HS-0 — Housing Society Vertical Foundation & Reuse Audit
**SOURCE IMPLEMENTED / RUNTIME VERIFY**

Delivered: typed vertical + registry/runtime, Unit-first entity model, property hierarchy, explicit ownership/tenancy/occupancy relationships, resident-oriented navigation, civic theme, 24-unit playground, guide truth, Launch Control feature seed, rerun-safe migration 082, source gate and closure docs. Runtime Supabase/Vercel verification is still required before certification. Next mission: HS-1 Property, Household & Resident Core.
