# Generic Network OS — AI Start Here

**Purpose:** minimal durable context for every new AI session. Read this before large roadmap/history files.

## Read order

### Always read
1. `AI-START-HERE.md`
2. `PRODUCT-CONSTITUTION.md`
3. `CURRENT-STATE.md`
4. `AIDLC-OPERATING-RULE.md` when planning/building/reviewing a mission
5. `MISSION-DOCUMENTATION-RULE.md` before closing a major mission

### Read only when relevant
- `CODEBASE.md` / architecture docs — implementation or architecture work.
- `VALIDATION.md` — validation/release work.
- `ROADMAP.md` — strategy/sequence decisions; use current sections, not the whole history by default.
- `MISSION-STATUS.md` — recovery/status questions; prefer recent entries.
- `FOUNDER-COMPASS.md`, `PROJECT-VISION.md`, `MASTER-VISION-PLAN.md` — deeper strategic history only.
- old release docs / handoffs — only to recover rationale or regressions.
- `GLOBAL-VERTICAL-OPPORTUNITY-STRATEGY.md` — new vertical/global market decisions.
- `GLOBALIZATION-MOBILE-QUALITY-STRATEGY.md` — i18n/mobile quality and portability.
- `GRAPH-NETWORK-PLATFORM-ARCHITECTURE.md` — graph evolution and architecture diagrams.
- `COMMERCIALIZATION-DISTRIBUTION-LICENSING-STRATEGY.md` — anchor sales, licensing/OEM/channel strategy.
- `TECHNICAL-EVOLUTION-REGISTER.md` — periodic technical debt/future architecture checkpoints.

## Current mission doctrine

**Build a product that earns attention before asking the founder to spend scarce time selling it.**

Public availability is allowed and encouraged when safe. Founder-led outreach to people, communities, institutions or businesses is **not** the default validation mechanism while the product/story still produces “nice, but we don't need it.”

The product must increasingly sell itself through:
- obvious value;
- exceptional first-use experience;
- polished mobile-first UI;
- memorable showcase/Playground;
- simple guidance and onboarding;
- credible privacy/trust;
- clear use-case storytelling;
- compounding network value.

## AI mandate

The AI is not only coder/implementer/architect. It is also a **product co-creator, strategic challenger, daily-user persona, skeptical critic, community/operator customer and large-customer persona**.

For every meaningful mission, ask:
1. What would make a user say **“wow — I want this”**?
2. What pain or valuable outcome becomes dramatically easier?
3. Can the product demonstrate the value without founder explanation?
4. Is there a stronger strategic initiative than the one currently proposed?
5. Are we adding capability, or improving desirability, activation, retention, trust, distribution or defensibility?
6. Can this be simpler?
7. As a real user, would I come back tomorrow without being reminded?
8. As a large customer/community operator, would this remove enough work or create enough value to matter?
9. As a critic, what would make me say “nice, but unnecessary” — and how do we eliminate that reaction?

Do not wait for the founder to originate every major product idea. Bring forward missing journeys, product bets, UX improvements, distribution mechanisms and strategic opportunities proactively.

## Non-negotiables

- Network privacy/isolation remains default.
- Identity != membership != network-scoped profile/entity.
- Vertical semantics remain real; no cosmetic relabeling of incompatible concepts.
- Stable products remain independently usable.
- Prefer additive/decoupled architecture and minimal changes to stable code.
- AI/RAG remains optional and evidence-governed; intelligence hardening is parked until real data/usage justifies it.
- Do not confuse feature count with product quality.
- Do not build speculative enterprise/commercial infrastructure before evidence.

## Current strategic direction

The strongest long-term thesis is **trusted multi-network participation**: independently governed networks become more useful as trusted people participate across multiple networks, without creating a universal readable social graph.

Current strategic work should reconcile the existing architecture with the `NE-*` Network Effect track before starting a new numbered G mission.

## Product outcome north star

Aim for genuine usage strong enough that users eventually describe the product as a habit, necessity, one-stop solution, meaningful utility or something that materially simplifies their lives. Treat such language as an **outcome to earn through behavior**, never as an unsupported marketing claim.

For Family specifically, preserve a deeper mission: help extended families retain inter-generational relationship knowledge, memories, culture and belonging that can otherwise fade as families become geographically and socially fragmented.

## Milestone verification loop

Build coherent increments without demanding founder verification after every small change. Periodically cut a milestone; use that checkpoint for runtime verification, bug fixing and hardening; then resume forward development. Do not defer urgent security/privacy validation.

## Documentation discipline

- Active read-first docs stay lean.
- Do not copy the same truth into many files.
- `ROADMAP.md` and `MISSION-STATUS.md` may retain history, but append concise logs rather than expanding session bootstrap context.
- Archive superseded handoffs instead of forcing every session to read them.
- At mission close, update only files whose durable truth changed.


## 2026-08-27 — Mission 2 checkpoint
Mission 2 (Trusted Expertise & Professional Network) is source implemented and source-gated. Preserve STABILITY-1 baseline and do not redesign Family/NX while hardening this vertical. Current EN/HI/MR catalog is key-complete at 328 tokens each; continue extracting legacy visible literals screen-by-screen using `npm run audit:i18n`. Read `MISSION-2-TRUSTED-EXPERTISE-PROFESSIONAL-NETWORK.md` and its runtime checklist before selecting the next mission.

## Current implementation checkpoint
Mission 3 Governed Graph + Institutional Bootstrap is source implemented. Preserve the STABILITY-1 UX baseline. Do not expand Family broadly. i18n is catalog-first and direct visible TSX literals are gated by `npm run audit:i18n`. Consume runtime/build feedback before another major mission.


## 2026-08-27 — Post-Mission-3 Runtime Architecture Decision

The current Next.js + Supabase + Vercel architecture is considered a valid managed/serverless backend, not an architectural failure. The next maturity gap is an **application-owned server/command boundary**, not a wholesale backend rewrite.

**Mission 4 — Network OS Application & Runtime Foundation** is now **source implemented; runtime certification remains open**. It introduces a modular TypeScript `server/` layer, versioned Next.js `/api/v1` command endpoints, caller-JWT Supabase access, shared mobile-portable contracts, an observability seam and a GitHub Actions CI baseline. Supabase Postgres/Auth/Storage/Realtime/RLS remain core infrastructure.

Mission 4 extracted five representative commands and preserved safe direct RLS-protected queries. Do not expand it into microservices, Kubernetes, Kafka, Redis, a dedicated graph database, native mobile, Network Effect exposure or RAG work during runtime hardening.

See `NETWORK-OS-BACKEND-RUNTIME-ARCHITECTURE.md` and `MISSION-4-APPLICATION-RUNTIME-FOUNDATION.md`.


## 2026-08-28 — Mission 5 checkpoint
Mission 4 was runtime-accepted after broad manual cross-application navigation with only minor regression backlog items. Mission 5 Production & Operational Runtime is now source implemented. Preserve the single-deploy Next.js + Supabase model: do not add Redis, queues, microservices or other operational infrastructure without measured need. Before the next major product mission, apply migration 056 and runtime-certify M5 using its checklist.


## M6-A current state
M6-A is source implemented. It reuses NX-1 one-account/many-network identity and adds a privacy-safe Network Reach aggregate to My Networks. It does not create a universal profile or merge graphs. M6-B is the next strategic step: governed network-to-network trust bridges.


### Current strategic edge — M6-B
The platform now has governed, bilateral, revocable network-to-network bridges via private Bridge Codes. Do not add public network search or cross-network member disclosure. `discovery` and `introductions` stored on bridges are policy intent only until M6-C.

- Current strategic frontier: M6-C privacy-safe discovery + trusted introductions is source implemented. Preserve anonymous-discovery / explicit-consent invariant.

### Latest mission
M6-D Network Effect Activation & Measurement is source-implemented. Preserve M6-C anonymity/consent and the mission DOCX rule.


## Current strategic position — M6-E / M7
M6-E adds bounded two-hop trusted-path reasoning with explicit per-edge path traversal consent. Never interpret an accepted bridge as automatic transitive permission. Maximum path depth is 2 and M6-C consent remains authoritative for identity disclosure.

Mission 7 is formally defined in `MISSION-7-REAL-WORLD-ACTIVATION-SHOWCASE.md`. Recommended next build: **M7-B WOW Showcase Universe & Guided Scenario Theater**. Treat demo quality as product validation: use synthetic interconnected data and real flows, not fake shortcuts.

## Latest mission — M7-B WOW Showcase Universe
M7-B is source implemented. The My Networks experience now contains a synthetic, read-only 720-person Showcase Universe and seven guided Network Effect stories. Apply the M7-B delta as self-contained: it deliberately re-ships `components/CrossNetworkDiscovery.tsx` to repair the observed missing-module regression. Latest cumulative source gate is `npm run validate:m7b`. Runtime/type/build certification remains local-workspace work.

## M7-A — Zero-Friction Network Launch & Activation
M7-A is source implemented. My Networks now gives Owners/Admins a privacy-safe launch-readiness path: seed meaningful people/entities → bring in participants → claim/link identities → establish trusted reach when appropriate → complete a first consented outcome. Migration 062 returns aggregate counts only for networks the caller administers. Existing import/invite/claim/admin experiences are reused rather than duplicated. Validate with `npm run validate:m7a`; runtime/type/build certification is pending in the normal installed workspace. After M7-A, proceed to M7-C Guided Pilot/Admin Activation and then M7-D Pilot Feedback & Learning, using M7-B/M7-A friction as evidence.

## M7-C handoff
M7-C Guided Pilot & Admin Launch Console is source implemented. Treat M7-A as the per-network activation guide and M7-C as the portfolio prioritization layer. Preserve the admin-only aggregate RPC and M6 privacy boundaries. Next strategic product-learning step is M7-D.

### Latest mission: M7-D Pilot Feedback & Product Learning Loop
Mission 7 is now complete at source level: M7-B SHOW → M7-A GUIDE → M7-C OPERATE → M7-D LEARN. Preserve the privacy separation between pilot feedback and M6 search/candidate data. Future mission selection should use repeated pilot friction and proven outcomes as primary evidence rather than extending graph/platform complexity by default.

### M7-F product-decision checkpoint
Mission 7 ends at M7-F. Before proposing more trusted-network/showcase capability, inspect pilot evidence and recorded product decisions. Prefer fixing repeated friction or investing in demonstrated value; HOLD when evidence is insufficient. Never infer that a recorded database decision authorizes automatic code, permission, feature-flag or roadmap mutation.

### Permanent launch-control rule (LC-1)
Never close a user-facing mission unless its capability is registered in the owning vertical feature catalog, persisted in Founder Launch Control, and runtime-gated. Deployment is not release. M6/M7 advanced capabilities are the reference implementation.


## 2026-08-28 read-first product-model correction
Before proposing Federation work, internalize these invariants:
- `Person ↔ Network` is many-to-many.
- `Network ↔ Umbrella/Federation` is also many-to-many.
- A person's two Family networks may share one community umbrella; their two Retail businesses may share a Retail federation; an unrelated Medical business may belong to another association. Never infer umbrella membership from the person who belongs to those networks.
- M6 bridge = peer trust/reach. NF affiliation = governed umbrella/federation participation. Do not reuse them as synonyms.
- Federation publishes explicit federated profiles; it does not merge child graphs.
- The system is now a Network OS product with a reusable platform foundation and multiple applications/verticals, not merely a Family app.

For product history, use `TRUSTWEAVE-PRODUCT-EVOLUTION-JOURNEY.html` V2 and durable mission records rather than reconstructing history from memory.
