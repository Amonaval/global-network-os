# Mission Status

## Current — P5.1 implemented + D1 family UX baseline

Privacy-aware timeline, family-aware milestones, controlled self-edit and field-aware governance are source-complete. A visual desktop/mobile audit improved setup, family language, navigation, contribution access, large-tree guidance, timeline empty states and profile privacy presentation. Release gate: staging migration `001`–`015` and anon/member/admin/invited-user checks, then the remainder of D1/P5.2.

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

**D1 Gate A:** live P5-S0 staging closure for migrations `001`–`015`, then
complete **P5.2 Participation & Distribution** as the remainder of D1.

See `ROADMAP.md`.
