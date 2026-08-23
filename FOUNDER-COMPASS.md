# Founder Compass

## Objective Hierarchy

During the family-first release period, when priorities conflict: 1. **Help a
real family create, join and enjoy the product without training.** 2. Protect
privacy, security, data integrity, performance and reliability. 3. Make the
experience lovely enough to share and return to. 4. Learn what drives adoption,
retention and eventual willingness to pay. 5. Preserve—but do not prematurely
build—the reusable platform path. 6. Improve technical elegance only when it
supports the above.

For the family product, lovely and effortless UX is part of the moat. A smaller set of understandable, emotionally resonant journeys is more valuable than a larger feature set presented as a technical administration tool.

## Decision Tests

Before a major feature, ask: - Who has this problem and how
valuable/frequent is it? - Is there a credible willingness to pay? -
Does it improve activation, retention, sharing, conversion or ARPU? - Is
it family-specific, domain-specific, or truly generic? - Should it be
CORE, MODULE, CONFIG, or PRODUCT? - Does it increase lock-in to the
family schema? - What is the cheapest credible validation? - What
measurable result would justify continuing?

## Rules

-   Do not sacrifice the family experience merely to call the product
    generic.
-   Do not duplicate whole applications per vertical. Share the engine;
    vary modules, vocabulary and workflows.
-   Do not generalize semantics by renaming fields.
-   Do not build AI because it is fashionable; use it where network
    context creates differentiated value.
-   Do not build multi-tenancy, billing, API platforms or complex RBAC
    before validated need, but avoid choices that make them
    prohibitively expensive later.
-   Security/privacy blockers outrank feature velocity.
-   Production blockers are fixed before expanding scope.
-   Prefer one meaningful end-to-end mission over many partial features.
-   Maintain mobile usability continuously.
-   English cannot be assumed; core journeys must work in supported languages.
-   Every product deliverable must name the screens and user journey made better.
-   Spreadsheet setup must be understandable to a person who does not know IDs,
    databases or hierarchy terminology.
-   Keep migrations additive/backwards-safe where practical.

## Monetization Discipline

Starting in P5, each major mission should identify: - target
user/persona; - value hypothesis; - monetization hypothesis; - success
metric; - cheapest validation; - build/no-build decision.

A technically impressive capability without a plausible customer/value
hypothesis is not automatically a priority.

## 2026-08-23 Strategic Priority Filter — Binding

The next product phase is governed by three outcomes, in order:

1. **Instant Family Magic:** a skeptical user experiences personally meaningful value within 60 seconds, preferably before login through Playground or immediately after Join/Create.
2. **Living Family Loop:** the family graph creates a calm Discover → Feel → Contribute → Share → Return loop through lineage, memories, celebrations and tiny contextual contributions.
3. **Proof of a Defensible Business:** live retention, organic invitations, trusted/verified relationship data, scalable family operations, cohort metrics and willingness-to-pay evidence.

Use the four-audience review for major decisions: **critic user, founder, investor/acquirer, QA/technical reviewer**. A major item that does not materially improve first-session magic, retention/distribution, trust/defensibility, measurable growth or monetization evidence should not displace these milestones unless it is a release/security blocker.

Feature count is not a success metric. Source completion is not product completion. A family journey is complete only after fresh-state behavioural evidence exists.

See `STRATEGIC-NEXT-3-MILESTONES.md`.

## S1 product-reading rule — 2026-08-23

For the first minute, the product should read like a family experience, not genealogy software: **You → your closest people → how each person relates to you → optional wider family**. The anonymous Playground may simulate a viewpoint only when it is clearly temporary, read-only and non-persistent. Investor/demo polish does not override trust semantics.
