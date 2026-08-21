# Project Vision --- Relationship Intelligence Platform

## North Star

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

Avoid enterprise-dashboard complexity, LinkedIn-style profiles,
excessive settings, feature overload, speculative AI, and abstractions
without a concrete product need.

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
