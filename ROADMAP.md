# Product & Platform Roadmap

## Current Position --- August 2026

P3 established the hierarchy product. P4 added trust/governance,
adoption, relationship intelligence, profiles, community/memories,
discovery, analytics/geography/export and scale foundations. Migration
`010` hardened major IDOR/ownership/audit issues.

Early P5 shipped: - configurable vocabulary/templates (`011`); - private
Storage + signed URL path (`012`); - shareable anonymous public page
(`013`).

Current caveats: - full production build remains to be independently
verified; - authenticated Storage SELECT is broader than desired; - the
platform is configurable vocabulary over a family-centric schema, not
yet a fully generic domain model.

# Immediate Roadmap

## P5-S0 --- Security & Baseline Closure

**Goal:** make the current baseline safe to extend.

Deliver: - tighten Storage object authorization so private/admin media
cannot be fetched merely by knowing an object path; - validate
signed-media access against entity/memory visibility; - clean
`npm install` / `npm run build`; - apply migrations 001--013 on clean
staging; - exercise anon/member/admin/invited-user RLS journeys; -
update production-readiness status.

**Exit:** no known P0 security/build/migration blocker.

## P5.1 --- Living Network

**Goal:** turn static hierarchy data into an ongoing human experience.

Deliver: - privacy-aware network-wide timeline; - upcoming
birthdays/anniversaries/milestones only for domains where those
semantics apply; - controlled member self-edit; - field-aware
governance: low-risk profile fields may direct-save when configured;
identity/relationship/governed fields remain reviewed; - mobile-complete
experience.

Family value: collective history and reasons to return. Platform value:
generic event-stream + ownership/edit primitives.

## P5.2 --- Participation & Distribution

**Goal:** make contribution and sharing self-propagating.

Deliver: - invitation/claim flow at scale; - QR/public profile cards
where visibility permits; - group connection view; - contribution
prompts for missing information; - public/embed hardening; - lightweight
reunion/event use-case validation.

Measure invite acceptance, contributed data, shares and return visits.

## P5.3 --- Modular Domain Architecture

**Goal:** evolve from labels to a real core + vertical-module
architecture.

Deliver: - define generic entity/edge/event capabilities; -
capability/module registry; - family module: genealogy,
deceased/in-memoriam, kinship, family milestones; - prove one second
vertical with real semantics; - prevent new family-specific assumptions
in generic services; - design a safe migration path away from `family_*`
persistence without a big-bang rename.

Candidate validation verticals: alumni/associations first; organization
or ownership depending customer evidence.

## P5.4 --- Commercial Validation

**Goal:** prove willingness to pay before expensive platformization.

Run parallel experiments for: - family premium; - alumni/association
paid network; - one B2B specialist vertical.

Add only minimal infrastructure needed to test pricing/limits. Track
activation, retained networks, invitations, contributions, admin effort,
usage, conversion intent and paid pilots.

**Exit:** at least one vertical has credible paid demand and a defined
ICP.

# Vision Roadmap

## P6 --- Multi-Network SaaS

Only after commercial evidence: - first-class `network_id` tenancy; -
network dashboard/switching; - network-scoped roles and tenant-safe
RLS; - plans/limits; - branded/public/embed options; -
observability/backups.

## P7 --- Focused Domain Products

**Family/Heritage:** genealogy-grade lineage, private circles,
stories/documents, reunions, heritage exports/books, geographic
journeys.

**Alumni/Associations:** directory, batches/chapters, mentorship,
events, contribution campaigns, branded portals.

**Organization/Relationship Mapping:** reporting structures, role
history, controlled directories and organizational insight.

**Ownership/Specialist Networks:** typed ownership edges, percentages,
control chains and historical ownership when market evidence justifies
it.

## P8 --- Relationship Intelligence

After data quality and permissions mature: - semantic/network-aware
search; - natural-language questions over authorized graph data; -
anomaly/suggestion engine; - relationship-aware recommendations; -
generated histories/summaries grounded in source records; -
domain-appropriate graph analytics.

AI must remain permission-aware and evidence-grounded.

## P9 --- Platform / Ecosystem

Only when multiple products repeatedly need it: - stable API; -
integrations/webhooks; - embeddable components; - import connectors; -
white-label; - partner/developer capabilities.

The platform should emerge from repeated product needs, not precede
them.

# Architectural North Star

                        Shared Product Platform
     Auth • Tenant • Privacy • Audit • Search • Storage • Notifications
                                  |
                     Relationship Intelligence Core
     Entity • Typed Edge • Path • Event • Media • Location • Contribution
                                  |
                 +----------------+----------------+
                 |                |                |
            Family Module     Alumni Module    Org/Other Module
            genealogy         batch/chapter    reporting semantics
            kinship           mentorship       role history
            in-memoriam       reunion          domain analytics
                 |                |                |
                 +----------------+----------------+
                                  |
                        Shared UI primitives

## Deliberately Postponed

Premature universal schema rewrite, complex enterprise RBAC, native
mobile apps, social feed/chat, broad AI assistant, marketplace/ecosystem
and full billing platform before paid-demand validation.
