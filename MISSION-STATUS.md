# Mission Status

## Current — D1 source complete; live Gate A pending

The Production Participation Release is source-complete through migration `016`: scaled invitation/claim lifecycle, deterministic contribution prompts, privacy-aware QR/public/embed distribution, connected groups, reunion RSVP and funnel metrics. Local typecheck/build/demo/source-security gates pass. Release still requires dated clean-staging, upgrade, actor/RPC/media matrix and Vercel smoke evidence.

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
-   `016_d1_production_participation.sql`: invitation lifecycle, contribution engine, privacy-safe sharing metrics, groups/events/RSVP and participation dashboard.
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

**D1 Gate A:** execute `D1-RELEASE-GATE.md` for migrations `001`–`016`, the real actor/media matrix, and production runtime smoke. D1 feature implementation is complete; only live evidence and resulting blocker fixes remain.

See `ROADMAP.md`.
