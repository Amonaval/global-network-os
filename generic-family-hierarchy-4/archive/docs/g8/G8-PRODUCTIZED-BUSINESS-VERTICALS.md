# G8 — Productized Business Verticals: Organization, Business Trust & Franchise

**Status:** IMPLEMENTED / SOURCE CERTIFIED / READY FOR DEPLOYED SMOKE  
**Date:** 2026-08-25  
**Baseline:** G7 Generic Network OS Certified R2  
**Migration:** `048_g8_productized_verticals.sql` after 047

## Mission

Turn three G7 template proofs into real user-creatable products on the same Network OS:

1. **Organizational Intelligence**
2. **Business Trust Network**
3. **Franchise Network**

The goal is not three forks. They share the productized vertical runtime, generic affiliations/projections, activity/group engines, tenant/membership model, claiming, contributions, import, Guide, Playground and Launch Control while keeping domain semantics explicit.

## User-facing creation

From the normal welcome/setup flow a signed-in user can now:

- create Family;
- create Alumni;
- create Organizational Intelligence;
- create Business Trust Network;
- create Franchise Network;
- enter read-only Playground for the three G8 products;
- join a G8 productized network with its Network OS join code.

Each created network is a real tenant with an owner membership and active network context.

## Shared product runtime

`components/TemplateNetworkApp.tsx` is the proven shared product runtime for the three G8 verticals. It provides:

- **Home** — context, metrics, network health and projection preview;
- **Explorer** — configurable hierarchy/projection navigation;
- **Directory** — search across names, metadata and affiliations;
- **Community** — events/RSVP, memories/history, milestones, announcements, groups;
- **Places** — location coverage derived from the configured geographic dimension;
- **Connections** — typed domain relationships and connection paths;
- **Contribute** — governed member suggestions reviewed by admins;
- **Admin** — join code, member/admin management, add/edit entities and Excel/CSV import;
- **Guide** — domain-specific onboarding and privacy guidance.

The shell is shared because the interaction pattern is proven common. Domain vocabulary, dimensions, entity types, relationship types, projection definitions and copy remain vertical-owned.

## Organizational Intelligence

### Primary entity
Person

### Dimensions
- Region
- Business Unit
- Department
- Team
- Project
- Skill / Expertise

Dimensions support multiple values. One person can therefore participate in multiple projects or hold multiple skills without data loss.

### Projections
- Region → Business Unit → Department → Team
- Project → Team → Skill
- Skill → Department → Team

### Typed relationships
- reports_to
- works_with
- owns
- depends_on

### User value
The product can represent formal organization structure and matrix structures at the same time. It is ready for future intelligence such as expertise discovery, ownership, knowledge concentration, dependency impact and bus-factor analysis.

## Business Trust Network

### Primary entity
Business / organization

### Dimensions
- Region
- Business Category
- Product / Service

A business may provide multiple services.

### Projections
- Region → Category → Service
- Category → Region

### Typed relationships
- recommends
- verified_by
- supplies_to
- worked_with

### User value
Users can build a private business ecosystem where discovery is enriched by explicit relationships and provenance rather than anonymous public ratings. Future intelligence can add trust confidence and warm-introduction reasoning without making trust score a generic core field.

## Franchise Network

### Primary entity
Location / branch

### Dimensions
- Country
- State
- City
- Store Type
- Franchise Owner

### Projections
- Country → State → City → Store Type
- Owner → State → City

### Typed relationships
- owns
- operates
- manages
- supports

### User value
A distributed franchise can be explored through geography or ownership without duplicating locations. Shared Community can host operator councils, training, launch history and operational learning. Performance/compliance remain future franchise-specific capability adapters.

## Identity & claiming

Imported G8 entities can contain an email in metadata. A signed-in member whose verified account email matches an unclaimed entity receives a **This is me** action.

Security rules:
- claiming requires active network membership;
- email must match the verified account email;
- an entity already claimed by another user cannot be taken over;
- one account cannot claim multiple entities in the same productized network;
- a member can edit only the entity they have claimed;
- admins retain network-wide entity management.

## Membership administration

Owners/admins now have a real member lifecycle for G8 products.

- Owner can promote/demote admins.
- Owner/admin can remove ordinary members.
- Only owner can remove an admin.
- Owner cannot remove/change themselves through these RPCs.
- Removing a member clears a stale `active_network_id` and unlinks any claimed generic entity so the identity can be safely reclaimed later.
- These generic membership RPCs are restricted to the three G8 productized verticals; they do not become an alternate admin path into Family or Alumni.

## Import

Excel/CSV import uses the shared Network OS entity + affiliation runtime.

Recommended inputs:
- Name / Label
- Type
- Email
- Description / Role / Manager / Contact / Website where applicable
- any configured dimension labels

Comma-separated dimension values are preserved as multiple affiliations rather than silently truncating to one value.

## Security / database

Migration 048 is additive.

New productized tables include:
- `productized_network_settings`
- `network_entity_relationships`
- `network_join_codes`
- `network_contributions`

Direct authenticated/anonymous table access is revoked. Application access is through scoped RPCs. Cross-network relationship/contribution references use composite tenant-aware constraints.

The migration also:
- activates the three vertical kinds in the durable network constraint;
- seeds feature registry/Launch Control rows per vertical;
- supports vertical-scoped Launch Control bundles;
- keeps internal SECURITY DEFINER helpers non-public;
- adds real creation, join-code, claiming, relationship, contribution, import and membership administration RPCs.

## Architecture boundaries

Permanent rules after G8:

1. Productized shared runtime may not import Family or Alumni implementations.
2. Each released vertical owns its feature catalog and app composition.
3. Productized handoff occurs before Family feature evaluation.
4. Family + Alumni protected foundations are release blockers.
5. G8 domain relationships are not converted into generic synonyms.
6. Template configuration can describe semantics, but SQL/security/domain algorithms remain explicit code.
7. Future Organization/Trust/Franchise intelligence must extend the corresponding vertical or a genuinely shared intelligence engine; it must not pollute Network Core.

## Validation result

Complete automated source chain after the final identity/member-admin hardening:

**D1 → V1 → CR1/CR2 → S1 → S2 → S3-A1 → G1.1 → G1.4 → G2 → G3 → G4 → G5 → G6 → G7 → G8: PASS**

G8 gate confirms:
- 147 historical `lib/remote.ts` exports preserved;
- 333 accepted G7 files preserved;
- 12 critical Family/Alumni foundations hash-identical;
- all three G8 product verticals active and coherent;
- productized runtime contains no Family/Alumni persistence leakage;
- migration 048 contains tenant/security guards;
- claim/member-admin rules are protected;
- G8 TS/TSX change surface transpiles with TypeScript 5.8.3;
- CSS brace/integrity checks pass.

A full Next.js production build is not claimed in this artifact workspace because the installed dependency tree is absent. CI/Vercel build remains a deployed release gate.
