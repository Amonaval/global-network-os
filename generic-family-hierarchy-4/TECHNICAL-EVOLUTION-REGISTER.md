# Technical Evolution Register

**Purpose:** keep technical maturity visible without allowing speculative infrastructure work to dominate product delivery.

## Promotion rule
A technical item becomes an implementation mission only when it blocks one or more of: validated user value, security/privacy, mobile portability, institutional scale, a commercial vertical, operational reliability, or development velocity.

## T1 — Application-owned backend boundary — SOURCE IMPLEMENTED / RUNTIME VERIFY
- Introduce modular server-side domain services and versioned command APIs.
- Preserve Supabase as primary managed backend infrastructure.
- Extract only high-value multi-step/privileged commands.

## T2 — CI/CD maturity — Mission 4 baseline, then incremental
- GitHub Actions: install, source gates, i18n/directive checks, type/build, targeted tests.
- Later: preview/staging promotion, security/dependency scanning, migration checks and rollback evidence.

## T3 — Observability — Mission 4 seam
- Request/correlation IDs, command outcomes, duration and sanitized errors.
- Add external observability products only when operational value justifies them.

## T4 — Async jobs / queues — FUTURE, evidence-triggered
Candidates: bulk invitations, large imports, enrichment, embeddings, digest generation, graph recalculation. Do not add a queue before these workloads require one.

## T5 — Cache / Redis — FUTURE, evidence-triggered
Only after profiling proves repeated expensive reads/traversals. Prefer Postgres indexes/materialized views first.

## T6 — Dedicated graph database — FUTURE, benchmark-triggered
Typed graph remains on Postgres initially. Benchmark recursive CTEs/indexes/projections before considering Neo4j/Neptune/AGE or another graph engine.

## T7 — Search engine — FUTURE
Evaluate only when Postgres search no longer meets validated discovery requirements.

## T8 — Mobile native client — FUTURE PRODUCT MISSION
Architecture must remain mobile-portable now. Native client should consume shared contracts/API rather than reproduce browser business logic.

## T9 — Internationalization
Keep all visible UI text tokenized. English is canonical; language packs are independent. Future priorities include Spanish and Simplified Chinese after EN/HI/MR quality is stable; RTL languages require explicit layout readiness.

## T10 — Security / enterprise readiness
- RLS regression tests.
- privileged-command review.
- audit trail.
- secrets management.
- backup/restore validation.
- tenant isolation testing.
Promote based on design-partner/customer needs rather than enterprise theater.

## T11 — AI/RAG runtime
Keep intelligence decoupled. Reintroduce deeper RAG only when real professional/institutional/network knowledge creates enough evidence and usage to justify it.


## T12 — Mission 5 operational runtime — IMPLEMENTED BASELINE
The application backend now has a shared command execution runtime, bounded request parsing, per-instance burst protection, durable Postgres idempotency for selected duplicate-sensitive commands, health/readiness probes, centralized runtime config, structured logs, stronger CI and a background-job abstraction that intentionally refuses non-durable async execution. This is the production baseline; shared rate limiting, managed queues/workers and external observability remain evidence-triggered.


## 2026-08-28 — M6-A trusted reach aggregate
Added counts-only cross-membership reach aggregation on the existing NX-1 trusted-person seam. This deliberately avoids a global profile table and keeps network-local identity bindings authoritative. Future M6-B work should add explicit network-to-network trust edges before any cross-network discovery.


## M6-B — Trusted Network-to-Network Linking & Governed Bridges
M6-B extends M6-A/NX-1 with an explicit neutral graph of networks. Administrators exchange private Bridge Codes, request a typed relationship, propose future discovery/introduction capability intent, and the receiving network administrator must accept or decline. Either side can revoke an accepted bridge. The bridge itself exposes no cross-network members, profiles, relationships, activity or graph data; capability intent remains inert until M6-C. All writes use the M4/M5 application command runtime. Migration: `058_m6b_network_trust_bridges.sql`.

- M6-C: added opaque cross-network discovery handles and target-consented introduction state. Identity disclosure occurs only after acceptance.

### M6-D — Privacy-safe product telemetry
Added compact first-party behavioral telemetry and deterministic activation-stage derivation. Explicitly excludes search text and cross-network candidate identity from analytics.


## 2026-08-28 — M6-E bounded graph complexity
Decision: support maximum-depth-2 trusted-path reasoning in Postgres before considering a dedicated graph store. Add explicit transitive-path consent per bridge, shortest-path preference, deduplication, path revalidation and privacy-safe multi-hop measurement. Rejected for now: unrestricted traversal, depth >2, graph DB, global social graph and automatic trust propagation.

## 2026-08-28 — Mission 7 showcase-first product validation
Decision: define M7 as Real-World Activation, Showcase & Pilot Readiness and implement the WOW Showcase Universe before launch/pilot optimization. The demo must exercise real product paths and synthetic interconnected data so it functions as both market education and UX validation.

## M7-B — WOW Showcase Universe & Guided Scenario Theater
Source implemented. My Networks now includes a read-only synthetic Scenario Theater backed by a deterministic 720-person / six-network showcase universe and seven authored stories. It demonstrates direct and governed two-hop trusted reach while preserving M6 anonymous discovery and target consent. M7-B also re-ships `CrossNetworkDiscovery.tsx` to repair the observed sequential-package missing-module regression. No database migration is required. Runtime/type/build certification remains pending in the fully installed project workspace.

## M7-C — Pilot portfolio operating layer
Added an admin-scoped aggregate pilot console above M7-A. Reuses existing membership/claim/bridge/M6-D event data; no new analytics vendor or parallel admin subsystem. Migration 063 returns counts and timestamps only. Reconsider richer operational analytics only after real pilot evidence demonstrates a need.

## M7-D — First-party pilot learning seam
Added a small first-party `pilot_feedback` store with governed submission/context/admin-summary RPCs. This intentionally avoids a third-party analytics/survey dependency. Revisit external product analytics only if real pilot volume, cohort analysis or experimentation needs exceed the bounded Postgres model.

## M7-F — Evidence-governed product decisions
Added `pilot_product_decisions` as a small governed decision ledger above M7-D feedback. The system computes transparent advisory recommendations from aggregate pilot outcomes; a human Owner/Admin records the disposition. This is intentionally not an automated product-management agent: no database decision can toggle features, change permissions, edit roadmap artifacts or open engineering scope by itself.

### LC-1 — Advanced capability rollout governance
Reused the existing vertical-aware `platform_feature_flags` architecture rather than introducing a parallel flag service. Added catalog/runtime registration for M6/M7 and restored fail-closed rendering semantics on My Networks.


## T13 — Network federation / affiliation graph — PLANNED, NF-0 first
Model federation as governed many-to-many `Network ↔ Umbrella/Federation` relationships, not as a single parent pointer and not as M6 peer trust. A network may have multiple valid affiliations if policy permits. Preserve source-network provenance and publish only explicit federated-profile fields. Do not merge child graphs into umbrella graphs. NF-0 must define relationship types, authorization, visibility, revocation and application-specific publication scopes before NF-1/NF-2 implementation.


## T14 — Capability delivery / modular runtime — STARTED 2026-08-29
Feature rollout and code delivery are separate concerns. Advanced My Networks capabilities now begin moving from static imports to Launch-Control-driven dynamic imports. Continue toward route/dependency isolation, backend activation boundaries, bundle budgets and capability manifests. Dynamic loading is performance/operational optimization only; RLS/server authorization remains the security boundary. See ROADMAP CR-1..CR-4.

## T15 — Composable Network Type Studio — PLANNED AFTER VERTICAL MATURITY
The fixed six-vertical catalog must evolve into a declarative Network Type Manifest and governed studio where customers can define terminology, entity/relationship schemas, projections, modules, workflows, roles and application scopes. Build only after repeated verticals prove the stable primitive vocabulary. See ROADMAP NC-0..NC-5.

## 2026-08-29 — NF-3 federation read model
Decision: implement the first umbrella operating runtime as an authorization-scoped **derived read model** over NF-2 affiliations + NF-1 outward Passport metadata. Do not copy child graphs into umbrella storage.

Benefits:
- keeps federation loosely coupled from vertical schemas;
- preserves source-network revocability/privacy changes at read time;
- avoids a second source of truth for network profiles;
- creates a neutral substrate for future NF-4 discovery;
- aligns with CR lean-capability loading through dynamic import.

## 2026-08-29 — NF-4 governed federated discovery
- adds a derived, read-time Network discovery projection instead of materializing a central federation directory;
- uses active membership + approved source/target umbrella affiliations + permitted Network Passport as the complete eligibility chain;
- adds explainable trust-path provenance to each result;
- keeps purpose filters at network-declaration level and reserves person/resource eligibility for NF-5+;
- continues CR-1 lazy capability delivery through dynamic import.

## 2026-08-29 — NF-5 Purpose-Scoped Projection
Introduced `federated_scope_profiles` as a generic, user-owned selective projection rather than reading vertical-specific person tables across federation boundaries. This creates a reusable application contract while preserving vertical data isolation and supports lean dynamic delivery behind `*.advanced.application_scopes`.


## 2026-08-29 — NF-6 Trusted Request Routing
**Decision:** add persisted `federated_requests` and `federated_request_routes` rather than treating search results as transient UI only.

**Reason:** durable request/route evidence is required for later introduction/outcome learning and provides an auditable Trust Receipt path.

**Guardrail:** route scoring uses only selective NF-5 outward snapshots and current federation eligibility; it is not a reputation score. NF-6 cannot contact the target or reveal source/private contact data.

**Delivery:** capability remains lazy-loaded and TEST-by-default via Launch Control.

## 2026-08-29 — Documentation as controlled-disclosure architecture
**Decision:** plan a standalone role-specific documentation repository rather than exposing the entire internal document corpus.

**Reason:** reduce founder explanation load, enable repeatable partner/agent/community onboarding and prevent accidental disclosure of founder strategy/IP. Public build exclusion, not hidden navigation, is the required boundary for private material.


### NF-7 — Consent-gated introduction boundary
Added isolated `core/federation`, remote adapter, lazy UI capability and migration 076. Direct table access is revoked. RPCs revalidate NF-5 purpose participation, active umbrella, NF-2 affiliations and NF-1 Passport visibility/purpose at request/acceptance time. Full cross-mission TS/import/build hardening is deferred to NF-8 by explicit validation strategy.
