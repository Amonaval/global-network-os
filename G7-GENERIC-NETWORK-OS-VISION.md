# G7 — Generic Network OS Productization & Template Architecture

**Status:** Strategy / architecture definition — ready for implementation  
**Runtime baseline:** Certified G6  
**Date:** 2026-08-25

## Product thesis

The product is no longer best described as a Family application with an Alumni extension.

The emerging platform is:

> **A configurable system for representing, activating and understanding real-world human, organizational, affiliation and trust networks.**

Family and Alumni are the first two real proof verticals. G7 productizes those proofs into a reusable **Generic Network OS**.

The goal is **maximum correct reuse**, not a forced reuse percentage. If semantics genuinely differ, they remain vertical-owned.

## Generic model

Most future network products can be described through:

1. **Network** — tenant, ownership, lifecycle.
2. **Entities** — people, organizations, locations, teams, stores, institutions, subjects, projects, accounts.
3. **Affiliations / Structure** — configurable belonging, dimensions, hierarchy and projections.
4. **Typed Relationships** — parent, spouse, batchmate, reports-to, owns, supplies, mentors, trusts, depends-on, prerequisite-of.
5. **Activities / Shared Context** — events, memories, media, milestones, achievements, contributions, locations, history.
6. **Intelligence & Governance** — search, paths, recommendations, permissions, privacy, provenance, claiming, delegated administration.

## Architecture north star

```text
GENERIC NETWORK CORE
│
├── Tenancy / Network Context
├── Membership / Roles
├── Identity / Claiming
├── Entities
├── Affiliations
├── Typed Relationships
├── Privacy / Permissions
├── Provenance / Audit
├── Storage / Quotas
└── Feature / Launch Runtime
        │
        ▼
SHARED CAPABILITY ENGINES
│
├── Network Explorer
├── Discovery / Search / Filters
├── Groups / Communities / Chapters
├── Events / RSVP
├── Memories / History / Media
├── Maps / Geography
├── Milestones
├── Contributions
├── Invitations
├── Connection Paths
├── Notifications / Digest
├── Construction / Import
├── Guide / Docs
├── Playground
└── Launch Control
        │
        ▼
INTELLIGENCE LAYER
│
├── Recommendations
├── Missing-link Detection
├── Network Health
├── Trust / Confidence
├── Expertise / Knowledge
├── Dependency / Structural Insights
├── Permission-aware AI Queries
└── Vertical Intelligence Adapters
        │
        ▼
VERTICAL TEMPLATES
│
├── Family
├── Alumni
├── Organizational Intelligence
├── Business Trust Network
├── Franchise Network
├── Education Graph
├── Professional Network
├── Association Network
├── Residential Network
├── Supply Chain Network
├── Investor Ecosystem
├── Customer / Account Intelligence
└── Custom Network
```

## Configurable affiliation graph

A fixed one-order tree is insufficient.

The same Alumni network may need to be explored as:

```text
MET → Engineering → 2011 → Computer
```

or:

```text
MET → 2011 → Engineering → Computer
```

or:

```text
Pune → MET → 2011
```

The underlying data should not be duplicated.

A person can instead have affiliations such as:

```text
Institution = MET
Program     = Engineering
Stream      = Computer Engineering
Batch       = 2011
City        = Pune
Company     = Microsoft
Chapter     = Pune Alumni Chapter
```

The UI applies a **projection definition** to the same affiliation graph.

This concept also enables:
- Organization: Region → Department → Team, or Project → Team → Person
- Franchise: India → State → City → Store, or Owner → Locations
- Education: Stream → Subject → Course, or Career → Required Skills
- Supply Chain: Region → Supplier Tier → Company, or Product → Dependencies

## Reuse classification rule

Every feature/capability is classified as:

- **SHARED-AS-IS**
- **SHARED-WITH-VERTICAL-CONFIG**
- **SHARED-ENGINE + VERTICAL-ADAPTER**
- **VERTICAL-ONLY**
- **DEFER / NEEDS MORE EVIDENCE**

This prevents both copy-paste duplication and fake genericity.

## Binding G7 acceptance test

G7 is not complete merely because a Template interface exists.

At minimum, one Alumni dataset must support both:

- `MET → Engineering → 2011 → Computer`
- `MET → 2011 → Engineering → Computer`

without duplicating the underlying people.

Family and Alumni must remain functional and isolated while the same platform can also model realistic Organization, Business Trust, Franchise, Education and Custom Network templates.

## Positioning

Customers buy vertical solutions, while the company builds a reusable platform underneath.

A strong platform statement is:

> **Network OS — configure the structure, relationships and capabilities of a real-world network, then help people explore it, contribute to it and understand it.**
