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
