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
- [ ] 100 MB per-family quota — blocked on multi-family network_id + server-side usage accounting (A1/A5).
- [ ] Optional public social-profile links / selectable avatar icons (A4).
- [ ] Autonomous multi-family Alpha onboarding (A1/A2).
See `ALPHA-FAMILY-PLATFORM-ROADMAP.md`.
