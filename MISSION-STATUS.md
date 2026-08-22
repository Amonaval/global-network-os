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
