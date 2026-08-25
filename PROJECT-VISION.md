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

## G1.3 core membership semantics are now separated from Family profile claims — 2026-08-25

The platform now has an explicit distinction between **belonging to a network** and **being linked to a vertical-specific profile/entity inside that network**. A user↔network membership is Core; the current `member_id -> family_members` pointer is Family compatibility, not the future universal membership model.

That distinction is important for Alumni and future verticals: Alumni can reuse tenancy, role, active-network context and resource-policy mechanics without being forced to claim a kinship `family_member`. Vertical identity-link semantics will be introduced only where a real second consumer proves them.

G1.3 also adds a product-runtime integrity principle: frontend vertical catalogs and deployed backend registries must fail safely when temporarily out of sync. Platform Owner controls now surface migration drift rather than executing against unknown feature keys.


## G1.4 shared transport is now a capability boundary — 2026-08-25

The capability-tree architecture now extends through remote transport. Network context, launch/playground runtime and Platform Owner operations are reusable capability modules, while Family behavior continues through the stable `lib/remote.ts` compatibility surface.

This establishes an important platform rule: **sharing a capability does not require renaming the deployed database or forcing every existing caller to migrate at once.** We can move implementation ownership downward while keeping compatibility upward. Family-specific claiming, kinship, memories, admin and construction remain explicit until a second consumer proves the right contract.


## G2 identity and participation become shared capability contracts — 2026-08-25

The platform now distinguishes three concepts that Family previously exposed through one implementation shape: **account membership**, **vertical identity/profile**, and **participation lifecycle**. Shared identity/claiming/invitation/contribution mechanics are typed capability contracts; Family keeps its existing secure backend through adapters; Alumni is represented explicitly with institutional identity semantics and no Family persistence reuse.

This reinforces the platform thesis: reuse is earned at the lifecycle/mechanics layer while profile meaning and persistence remain vertical-specific. A future Alumni user may belong to the same Core network/membership runtime and use the same claiming/participation lifecycle without becoming a `family_member`.

G2 also establishes the new delivery cadence for architecture work: coherent High-effort G batches rather than micro-extractions. The next proof is G3, where the S3-A1 distributed intake workflow will be separated into reusable construction mechanics plus Family/Alumni domain adapters.


## G3 network construction becomes a shared lifecycle — 2026-08-25

The platform can now describe how a trusted network is assembled without making kinship the universal model. Source/session/access, staging, candidate identity resolution, decisions, conflicts, provenance, validation and commit are shared construction concepts; Family parent/child/spouse, generation/lineage rules and canonical Family graph commit remain explicit Family/Kinship semantics.

This is a major proof of the capability-tree thesis: **the workflow can be shared while the meaning and integrity rules remain vertical-specific**. Alumni now supplies institutional/batch/program construction semantics as a non-persistent second-consumer skeleton, proving the contract without forcing Alumni into `family_members`.

The next platform proof is G4: compose these capabilities through a cleaner vertical runtime/app shell so navigation, features, Guide, Playground, Launch Control and What's New can be vertical-owned without scattering Family assumptions through the shell.

## G4 app composition becomes vertical-owned — 2026-08-25

The platform now has a clean distinction between **what a vertical can do** and **how that vertical is assembled into the application**. Family registers its own navigation, Guide routing, Playground identity, launch bundles and What's New destinations; the app-shell validates and composes them. Alumni does not inherit Family surfaces by default and remains fail-closed until its real product experience exists.

This is the final major architecture proof before the second vertical: G5 should now build Alumni as a real product using the shared network, identity, participation, construction and app-composition seams rather than reopening Family internals.


## G6 proof — one platform, two product-quality verticals — 2026-08-25

Family + Alumni now provide the first concrete proof that the architecture is not merely reorganized Family code. The products share trusted-network mechanics, launch/runtime infrastructure and selected UX primitives, while preserving different identity models, relationship semantics, persistence and user value.

The product rule going forward is **shared quality system, vertical-specific experience**. Reuse topbars, navigation mechanics, metrics, search/filter shells, empty states, import/claim/invite patterns and platform controls where evidence proves they are common. Do not force Family memories/lineage or Alumni cohort/career concepts into a generic lowest-common-denominator screen.

G7 can productize the platform only from these proven seams and should make a third vertical cheaper without weakening Family or Alumni.


## G7 — Network OS vision now executable

The long-term architecture is no longer only a vision statement. G7 introduces executable primitives for configurable entities, affiliations, hierarchy projections, shared network activity and vertical templates.

The platform model is now:

`Generic Network Core → Shared Capability Engines → Vertical Templates/Adapters → Strong Vertical Products → Permission-aware Intelligence`

Family remains the kinship-first vertical. Alumni becomes the first affiliation-first vertical. Future Organization/Trust/Franchise/Education networks can prove additional relationship and non-person entity semantics without rewriting Core.
