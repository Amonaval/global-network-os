# Mission Status

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
-   Public page/admin sharing UI.

## Important Truths / Open Findings

-   Current implementation is not yet a universally generic hierarchy
    model; persistence and semantics remain family-centric.
-   Configurable labels are useful but are not configurable relationship
    semantics.
-   Visibility-aware authenticated Storage policies are implemented in `014`;
    staging verification remains required.
-   Clean production build and staging migration/RLS pass must be
    re-verified.
-   Public page intentionally excludes private data and photos.

## Active Mission

**P5-S0 --- Security & Baseline Closure** is implemented in source through
`014_p5_s0_media_authorization.sql`. Clean staging migration/RLS journeys and a
clean production build remain release gates because this workspace could not
complete dependency extraction.

After those gates pass, the exact next mission is **P5.1 --- Living Network**.

See `ROADMAP.md`.
