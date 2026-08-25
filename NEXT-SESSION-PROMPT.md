# NEW SESSION START PROMPT — G0 Trusted Network Architecture Blueprint + S3-A2 Preparation

I am attaching the **latest cumulative Family Network codebase ZIP** containing all work through **S3-A1 Distributed Family Intake V1 + S3-A1 UX Closure** and the latest strategic roadmap updates. Treat that ZIP as the **only canonical implementation baseline**. Do not reconstruct code from older conversations or older ZIPs.

## Strategic direction

Family remains the first flagship vertical, but the product is now intentionally evolving into a **layered Trusted Network Platform**.

Do not interpret this as one giant generic base module and do not perform a broad rewrite.

Target capability tree:
- Core Network Foundation
- Network Construction
- Relationship Intelligence
- Community & Engagement
- Governance & Product Runtime
- optional intermediate domain layers
- explicit verticals:
  - Family / Kinship
  - Alumni / Institutional Membership
  - Professional / Trade Associations
  - Enterprise Relationship & Expertise Intelligence
  - Founder / Investor / Industry Networks
  - Clubs / Societies / Membership Networks
  - Nonprofit / Volunteer Networks

A new vertical should reuse the lowest genuinely common ancestor capability and add only what is unique.

## Non-negotiable architecture principles

**Stable Family Rule:** current Family Network must keep working as-is.

**Lowest Common Capability Principle:** place each capability at the lowest layer where semantics remain reusable.

**Second-Consumer Rule:** do not generalize Family behavior merely because it might someday be reused. Alumni is the second real consumer used to prove abstractions.

**Dependency Direction:** `Vertical → Intermediate Domain Layer → Shared Capability → Core`

Core/shared code must never import Family/Alumni/Enterprise specialization.

**Strong primitives, explicit verticals:** do not convert everything into metadata/config. Keep generic primitives typed and domain semantics explicit.

Permanent lifecycle:
**CLASSIFY → IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**

## Current Family state

S3-A1 is implemented and UX-closed in source:
- secure representative contribution tokens;
- mobile branch intake;
- staged data;
- deterministic matching;
- conflict/provenance handling;
- Owner reconciliation/commit;
- contextual Guide;
- safe no-save Playground;
- Launch Control;
- What's New;
- roadmap/status traceability.

It still requires LIVE VERIFY for migration/RLS/token/browser behavior.

Immediate Family follow-up:
**S3-A2 — Populated-Family Onboarding**
- "Your family is ready — find yourself and explore";
- find pre-created profile;
- safe claiming;
- immediate relationship/lineage value;
- prefilled Complete my branch;
- lightweight correction/contribution;
- activation instrumentation.

Do not implement S3-A2 until G0 classifies its capabilities.

## First task in this new session — G0 only

Do **not** begin a giant refactor and do **not** immediately implement Alumni.

Audit the latest codebase and produce **G0 — Trusted Network Architecture Classification & Extraction Blueprint** covering:

1. Current modules/components/schema/RPCs classified as:
   - CORE
   - SHARED CAPABILITY
   - INTERMEDIATE DOMAIN LAYER
   - FAMILY-SPECIFIC

2. Family-hardcoded assumptions inside otherwise reusable code.

3. Target logical capability tree and dependency boundaries.

4. First extraction candidates that are:
   - low regression risk;
   - clearly useful to Alumni.

5. What should remain Family-only.

6. Vertical registry/module-loading/configuration approach without making everything metadata-driven.

7. Migration/refactor safety:
   - stable interfaces;
   - backwards compatibility;
   - database migration strategy;
   - RLS implications;
   - regression gates;
   - incremental file movement rules.

8. Alumni MVP only enough to act as second consumer:
   - institution;
   - department/program;
   - batch/year;
   - alumnus/faculty profile;
   - claiming;
   - search/discovery;
   - relationship paths;
   - mentorship interest;
   - groups/events;
   - distributed batch intake.

9. Estimate realistic reuse by capability, not by forcing a percentage. Directional goal: ~60%+ applicable runtime reuse if genuinely supported.

10. Show how S3-A2 should be classified before implementation.

11. Update roadmap/status/docs only after the blueprint is coherent.

## Planned strategic missions

- G0 — Trusted Network Architecture Classification & Extraction Blueprint
- G1 — First Shared Capability Extraction + Alumni Skeleton
- G2 — Distributed Network Construction Platform
- G3 — Relationship Intelligence Platform
- G4 — Alumni Network MVP
- G5 — Professional / Trade / Community Association Vertical
- G6 — Enterprise Relationship & Expertise Intelligence
- G7 — Founder / Investor / Industry Trusted Network
- G8 — Clubs / Societies / Nonprofit / Volunteer Networks

These are roadmap commitments, not instructions to implement everything now.

## Commercial thesis

Family is the deep trust/relationship vertical.
Alumni proves cross-vertical reuse.
Associations are an important B2B monetization direction.
Enterprise may have the highest eventual contract value but higher complexity.

> **Build trusted networks from fragmented knowledge, reconcile identity and relationships safely, activate them through discovery and trusted connection intelligence, and reuse the same capability tree across multiple vertical products.**

## Delivery rules

- Latest attached ZIP is the only canonical baseline.
- Preserve all roadmap/mission history.
- Preserve Family behavior.
- Prefer incremental extraction over rewrites.
- Keep status truth: PLANNED / IMPLEMENTED / PARTIAL / VERIFIED / LIVE VERIFY / DEFERRED.
- When implementation begins later, return only affected/new files in a delta ZIP unless a cumulative ZIP is explicitly requested.
- Source/build checks do not replace deployed Supabase/RLS/browser verification.

Read only the minimum strategic files first:
`ROADMAP.md`, `MISSION-STATUS.md`, `FOUNDER-COMPASS.md`, `PROJECT-VISION.md`, `DEVELOPMENT-RULES.md`, `CODEBASE.md`, `S3-A-ACTIVATION-NETWORK-GROWTH.md`, `S3-A1-DISTRIBUTED-FAMILY-INTAKE.md`, `PILOT-LAUNCH-VISIBILITY.md`, `VALIDATION.md`.

Then inspect only the code/schema/RPCs necessary for G0 classification.

**First response in the new session must be the G0 architecture audit/blueprint — not code implementation.**
