# Project Vision --- Relationship Intelligence Platform

## Immediate North Star

Deliver a family product so attractive, fast and easy that a non-technical
relative can create or join a family, understand the tree and contribute without
training. Mobile is the primary surface. English must never be a prerequisite;
initial supported product languages are English, Hindi and Marathi.

For the current family releases, the product is judged by successful setup,
Excel import, joining, exploration, contribution, sharing and return visits—not
by enterprise feature count or generic architecture.

## Long-term North Star

Build a **vertical-strong family/community product on top of a genuinely
reusable relationship-network platform**.

Family is the proving ground: it demands hierarchy, identity, lineage,
privacy, invitations, memories, life events, geography, governance, and
non-technical usability. The platform underneath should be extensible
enough to support higher-value domains without weakening the family
experience.

## Commercial Objective

**Sustainable monetization is a primary product objective.** Product and
architecture decisions should preserve credible paths to paid usage. We
should not optimize only for feature count or technical elegance.

The intended model is: - **Shared platform core** --- graph,
entity/profile primitives, typed edges, search, privacy, permissions,
invitations, audit/change workflow, media, timeline primitives,
analytics, exports. - **Domain modules** --- loaded/enabled only where
meaningful. - **Domain vocabulary/configuration** --- labels and
templates customize presentation, but must not pretend that renaming a
family semantic makes it universally valid. - **Domain-specific
products** --- family, organization, alumni, academic lineage,
ownership/compliance, knowledge/skills, etc. can expose different
modules while sharing the same engine.

## Key Architectural Principle: Core + Modules

A capability belongs in the generic core only when its semantics are
broadly reusable.

Examples: - Generic: entity, edge, path, visibility, ownership,
contribution, event, media, location, search, audit. - Family module:
deceased/in-memoriam, birth/marriage anniversary semantics,
genealogy/kinship, ancestors/descendants. - Organization module:
reporting line, role history, department, headcount. - Ownership module:
ownership percentage, effective control, UBO chain. - Skills module:
prerequisite, proficiency/difficulty, learning path.

Do **not** implement `spouse = collaborator` or
`deceased = inactive employee` merely through labels when the semantics
differ. Move toward typed domain capabilities over time.

## Product Philosophy

Prefer simple, visual, human, invitation-driven, relationship-centric,
mobile-friendly and privacy-aware experiences. Older/non-technical users
must be able to participate.

For family audiences, usability and emotional warmth are core product
capabilities and potential defensibility—not final-stage polish. Validate
rendered phone and desktop journeys, use family language, and make the next
action obvious without exposing platform or governance terminology.

Avoid enterprise-dashboard complexity, LinkedIn-style profiles,
excessive settings, feature overload, speculative AI, and abstractions
without a concrete product need.

The technical platform roadmap is preserved, but paused until Family Releases 1
and 2 have been used by real families. Required privacy, integrity, performance
and deployment work continues invisibly because family trust is non-negotiable.

## Platform Thesis

The durable asset is not a family-tree UI. It is a privacy-aware
**relationship intelligence engine** capable of answering who/what is
connected, how they are connected, what changed over time, what the
viewer may see, who may change it, and what useful insight/action
follows.

## Monetization Thesis

Family can drive emotional engagement, retention, sharing and product
learning. Other verticals may provide stronger willingness to pay.
Validate both rather than prematurely choosing one.

Potential paths: 1. Family premium --- larger networks, storage, private
circles, premium exports/books, reunion/event tooling. 2.
Alumni/association SaaS --- branded directories, invitations, events,
admin workflows, member self-service. 3. Org/network SaaS ---
relationship maps, history, controlled collaboration. 4. Specialist
verticals --- academic genealogy, ownership/compliance, professional
communities. 5. Platform/white-label/embed/API later, only after the
core is stable and repeatable.

Every major phase should answer: **Does this improve user value,
defensibility, distribution, retention, or monetization evidence?**

## 2026-08-23 Strategic Product Thesis — From Feature-Rich to Investable

The near-term objective is no longer to maximize capability. It is to make the existing capability produce three observable outcomes:

- **Instant Family Magic:** personal value in under a minute through no-login exploration or frictionless joining/creation, My Family Line, relation-to-me clarity and emotional family context.
- **Living Family Loop:** a private family space that becomes more valuable as relatives return, confirm facts, add memories, celebrate milestones and invite others.
- **Defensible Business Proof:** a permission-aware relationship graph plus trust/governance, measurable family-level retention and organic expansion, scalable multi-family operations, and credible willingness-to-pay/adjacent-vertical evidence.

The investor/acquirer story must therefore be stronger than “we built a family tree.” The asset is a consumer-quality family product on top of a privacy-aware relationship intelligence platform, with structured relationship data that compounds as families participate.

AI is differentiated only when grounded in authorized relationship data. Generic chat or content generation is not the moat.


## Expanded platform vision — 2026-08-25

The long-term product is a **family-first Trusted Network Platform** composed as a capability tree:
- core primitives;
- reusable capabilities;
- intermediate domain layers;
- explicit vertical specializations.

Target product family includes Family, Alumni, Professional Associations, Enterprise Relationship Intelligence, Founder/Investor Networks, Clubs/Societies and Nonprofit/Volunteer Networks.

A future idea should be evaluated by asking:
> What is the lowest existing capability layer it can reuse, and what is genuinely unique?


## G0 architecture decision — 2026-08-25

The capability-tree vision is now an architecture contract, not only a future idea. The platform will use typed composition with explicit verticals. Reuse will be earned at the lowest semantically correct layer and proven by a second consumer. Family kinship will not become the universal graph model, and Alumni will not be implemented by relabeling parent/child/spouse. See `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`.

## G1.1 architecture becomes executable — 2026-08-25

The G0 capability-tree decision now has its first physical code seam. Core owns a typed vertical contract; Family and Alumni are explicit definitions; app-shell owns composition. Family is still the only active product vertical and remains behaviorally unchanged. Alumni exists only as a typed skeleton with institutional-membership semantics.

This is deliberately stronger than `NETWORK_TEMPLATES`: labels may configure presentation, but relationship meaning, authorization, matching, conflict resolution and workflow semantics remain typed domain/capability code.

## G1.2 shared runtime is now separated from vertical product catalogs — 2026-08-25

Feature rollout is now a concrete example of the capability-tree rule: the mechanics of launch state, default evaluation and eligibility are reusable core runtime, while what the features *mean* belongs to each explicit vertical.

Family keeps its complete existing feature catalog and product language. Alumni proves the second-consumer contract with a separate hidden skeleton catalog rather than inheriting Family feature semantics. This is the pattern future capabilities should follow: share mechanics downward, keep meaning at the lowest semantically correct vertical/domain layer.
