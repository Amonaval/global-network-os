# TrustWeave Documentation & Controlled-Reveal Architecture

**Status:** Strategic architecture approved — 2026-08-29  
**Purpose:** make documentation a separate product, onboarding system and privacy/disclosure boundary.

## 1. Principle
TrustWeave should not lead every conversation by exposing the entire implementation, roadmap, founder strategy and moat. Reveal the smallest layer that proves the current claim, then reveal deeper execution evidence when the audience has a reason to see it.

The intended experience is:

`Understand the problem → see the idea → believe the product value → ask “how will this actually work?” → reveal that the implementation/governance/architecture/partner system is already prepared.`

Progressive disclosure must never mean misleading claims. It means sequencing truthful evidence.

## 2. Separate documentation repository
Create a future Git repository such as `trustweave-docs`. Markdown remains the canonical authoring format; a static documentation site can be generated from it. The product code repository should keep engineering/mission artifacts necessary to build and operate the software, while the documentation repository curates what each external/internal audience should consume.

## 3. Audience hierarchy
1. **Public / first-contact** — problem, mission, product concept, safe screenshots, public privacy principles.
2. **Interested community head** — launch mechanics, volunteer roles, governance, expected effort, demo path.
3. **Agent/operator** — acquisition/onboarding process, activation-quality definition, attribution and compensation rules, support boundaries.
4. **Partner/institution** — federation/supernode operating model, economics, pilot process, responsibilities, integrations and governance.
5. **User** — complete usage, privacy controls, network/federation/application behavior.
6. **Developer** — setup, APIs/modules, migrations, testing, capability conventions.
7. **Architect** — graph model, privacy boundaries, composable runtime, custom network type architecture, trust routing.
8. **Founder private** — sequencing, acquisition tactics, partner economics, IP candidates, trade secrets, reveal strategy and decision register.

Access is not strictly cumulative: a developer may not need founder economics; an agent may not need architecture internals. Share by role and purpose, not by curiosity alone.

## 4. Strength-card reveal ladder
### Card 1 — Problem + Mission
Why fragmented trusted communities are difficult to operate and why a governed Network OS matters.

### Card 2 — Product Proof
Show an actual working vertical and core workflows.

### Card 3 — Governance + Privacy Proof
Show separated networks, Network Passport, consent boundaries and revocation.

### Card 4 — Federation Proof
Show Network↔Umbrella affiliation, umbrella runtime and governed discovery.

### Card 5 — Outcome Proof
Show request routing, consented introduction and eventually outcome receipts.

### Card 6 — Scale Proof
Show onboarding systems, operator model and supernode distribution only when the conversation moves to implementation/scale.

### Card 7 — Architecture Proof
Show modular runtime, generic primitives and Custom Network Type Studio direction to technical evaluators.

### Card 8 — Commercial/Strategic Proof
Reveal partner economics, deeper moat and founder strategy only to the appropriate trusted audience.

## 5. Repository hierarchy
```text
trustweave-docs/
  00-start-here/
  10-user-guide/
  20-community-head-guide/
  30-agent-operator-guide/
  40-partner-guide/
  50-developer-guide/
  60-architecture-guide/
  70-founder-guide/
  80-demo-and-sales/
  90-reference/
```

Each top-level guide should have its own landing page, 5–10 minute quick path, detailed reference path and audience-specific FAQ.

## 6. Content classification
Every source page should carry front matter similar to:

```yaml
audience: partner
classification: PARTNER
shareable: true
contains_founder_strategy: false
source_of_truth: ROADMAP.md
last_reviewed: 2026-08-29
```

Suggested classifications: `PUBLIC`, `PROSPECT`, `COMMUNITY_HEAD`, `AGENT`, `PARTNER`, `USER`, `DEVELOPER`, `ARCHITECT`, `FOUNDER_PRIVATE`.

Sensitive founder material must be **excluded from public build outputs**, not merely hidden from navigation.

## 7. Single-source rule
Do not manually duplicate architecture truth across many guides. Maintain canonical technical/strategy sources and create audience-specific summaries or generated inclusions. Every derived page should record its source.

## 8. Mission integration rule
Major missions update:
- product source + migration;
- internal architecture/status/roadmap;
- User Guide when behavior changes;
- Architect/Developer guides when contracts change;
- Partner/Agent/Community Head guides only when their workflow changes;
- Founder guide for strategy/economics/IP;
- Public Product Profile only for intentionally revealed product capabilities.

**A feature becoming real does not automatically make its complete internals public.**

## 9. Why this is a moat-supporting system
Documentation reduces dependence on the founder for every explanation, makes partner/operator scaling repeatable, raises perceived execution maturity and creates controlled evidence for technical/institutional diligence. It also reduces accidental leakage of acquisition sequencing, partner economics, unfiled invention details, ranking mechanics and anti-abuse logic.
