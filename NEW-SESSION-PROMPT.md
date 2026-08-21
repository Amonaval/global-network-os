# Resume Prompt --- Relationship Intelligence Platform

I am continuing development of the attached latest source ZIP. Treat the
ZIP as the **single source of truth**. Do not rely on old chat history
or generated code when it conflicts with source.

## Vision

This is a **family-first but vertically extensible Relationship
Intelligence Platform**.

Family/community must remain an excellent simple, visual, privacy-aware
product. Underneath it, build a reusable relationship-network core that
can support other commercial verticals.

Do not confuse configurable labels with generic semantics. Long-term
architecture:

**shared core + domain modules + domain configuration + focused
products**

Graph/path/privacy/search are generic. Kinship, deceased/in-memoriam and
family anniversaries belong to the family module. Organization/ownership
networks should load their own semantics rather than renaming family
concepts.

**Sustainable monetization is a primary objective.** Other verticals may
have more monetary potential than family. Major decisions should
consider willingness to pay, distribution, retention and
defensibility---not feature count.

## Read First

1.  `CODEBASE.md`
2.  `PROJECT-VISION.md`
3.  `FOUNDER-COMPASS.md`
4.  `ROADMAP.md`
5.  `MISSION-STATUS.md`
6.  `DEVELOPMENT-RULES.md`
7.  `CODEBASE-UPDATE-RULE.md`
8.  relevant migration/source files

Also inspect `artifact/platform-vision.html` as supporting vision
material. Actual source/migrations override docs.

## Current Baseline

P3/P4 are implemented through production hardening. Migration chain is
`001`--`013`.

Recent work: - `010_p4_production_hardening.sql` ---
IDOR/ownership/invitation/audit/first-admin hardening. -
`011_configurable_types.sql` --- configurable network
vocabulary/templates. - `012_private_storage.sql` --- private Storage;
signed-URL app flow. - `013_public_page.sql` --- privacy-masked
anonymous public directory. - `/public` route exists. - Preserve
local/demo and Supabase paths unless intentionally changed.

Architectural truth: - configurability has begun, but DB/domain
semantics remain family-centric; - do not perform a risky big-bang
generic schema rewrite; - evolve incrementally toward core + modules.

## Known Issue First

Migration `012` grants authenticated users broad SELECT access to
profile/community bucket objects. Normal UI hides paths and uses signed
URLs, but Storage authorization should be tightened so knowing an object
path is insufficient for private/admin media.

Full production build/staging migration/RLS verification also remains
required.

## Active Roadmap

Start with **P5-S0 --- Security & Baseline Closure**: 1. tighten
Storage/media authorization; 2. verify signed media respects
profile/memory visibility; 3. clean `npm install` + `npm run build`; 4.
clean staging migration 001--013 and upgrade sanity; 5.
anon/member/admin/invited-user RLS checks; 6. update readiness/docs.

Then **P5.1 --- Living Network**: - privacy-aware network timeline; -
domain-aware upcoming milestones; - controlled member self-edit; -
field-aware governance: safe profile fields may direct-save when
configured; identity/relationship/governed fields remain reviewed.

Do not automatically implement later roadmap items before the active
mission is stable.

## Rules

-   Code/migrations authoritative; verify DONE claims.
-   Security/data-integrity/build blockers before expansion.
-   DB/RLS/RPC enforces privacy; UI hiding is insufficient.
-   Check IDOR/ownership for every ID-taking RPC.
-   `SECURITY DEFINER` requires safe `search_path` + authorization.
-   Avoid speculative/destructive migrations.
-   Preserve mobile usability.
-   Classify work as CORE / MODULE / CONFIG / PRODUCT.
-   Do not generalize family semantics through labels alone.
-   Prefer end-to-end missions.
-   Update CODEBASE/mission docs when work lands.
-   Keep planning concise; spend context primarily on
    implementation/verification.

## Do Now

1.  Inspect the attached ZIP and confirm docs match code.
2.  Resume **P5-S0**.
3.  Implement and verify it end-to-end.
4.  Update maintained handoff Markdown files.
5.  Return the updated ZIP plus a concise summary of changes, tests,
    remaining risks and exact next mission.

Do not start a giant redesign or implement the whole vision at once.
