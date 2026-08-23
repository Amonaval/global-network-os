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

## Showcase principle — 2026-08-23

For acquisition, demos and investor conversations, prefer a **dense living family** over a merely large tree. The current 60-person / 5-generation showcase should demonstrate relationship magic, history, memory, geography, contribution, governance and participation in one coherent family. Raw node count is not the wow moment; seeing a trusted family network feel alive is.

## Engagement integration compass — games & external media (2026-08-23)

**Prefer family-native engagement over generic engagement.** A game is strategic when family context makes it better: a reunion Tambola room, “Who is this childhood photo?”, family trivia or generation challenges. A video integration is strategic when the family adds durable context—who shared it, why it matters, which memory/event/person it belongs to—not when the product merely recreates a social feed.

**Platform integration is distribution, not moat.** YouTube/Instagram embedding can reduce friction and increase time-in-family, but the defensible asset is the permissioned relationship graph plus identity, memories, history, contribution and family rituals accumulated around it. Do not distort product priorities around a hypothetical acquisition by a large social platform; build unique family value that makes partnership or acquisition optional upside.

## S2 retention rule — added 2026-08-23

Do not turn Family Network into a generic feed. A return surface should answer at least one of: **what is happening, what can I discover, what tiny thing can I contribute, what should I celebrate/remember?** Family Pulse should normally show 1–3 meaningful items, not infinite content. Measure deliberate family actions and returning people; page views alone are not retention proof.

## Community expansion principle
The community layer can multiply distribution and utility, but must not destroy the trust moat. **Family graph private by default; community discoverability explicit by choice.** Maheshwari/Pune/etc. should be an umbrella for introductions, opportunity and shared identity — not an excuse to expose every family member. Prefer introductions over direct contact leakage. Do not build caste/community popularity leaderboards; use curated Community Highlights by useful category. A future “how are we connected?” capability must use explicit trusted cross-family edges, never inferred caste/surname kinship.

## S2-C founder rule — never fake trust
A connection path is valuable only if every hop is explainable and explicitly accepted. Never manufacture social proof from surname, caste/community membership, city, school, profession or graph similarity. A smaller trusted graph is more defensible than a larger speculative one.

Introduction success is a future business signal, but privacy and consent outrank conversion. Do not expose private contact details merely because a request is accepted; hand-off mechanics must remain deliberate.

## S2-D founder rule — earn the return without becoming noisy
A family product should not copy the engagement mechanics of public social media. Prefer a small number of emotionally or practically relevant updates over infinite feeds and notification volume. A weekly digest is successful when relatives voluntarily return, contribute or share—not when notification counts increase.

## S2-E founder rule — understanding is part of the product

Once the product has meaningful breadth, discoverability becomes a growth and retention feature. Do not treat documentation as cleanup. Family Network must explain its own purpose, inspire concrete family use cases and make hidden power discoverable without requiring a founder-led demo.

**Rule:** every help surface explains both `how` and `why would I care?`. Prefer contextual, progressive guidance over walls of documentation. Preserve one structured source of truth so help, search, Playground demos and future AI assistance cannot drift into contradictory product claims.

User feedback from the guide is evidence, not an automatic roadmap commitment. Repeated needs should become product intelligence; privacy-sensitive family content must never be silently captured as feedback metadata.
