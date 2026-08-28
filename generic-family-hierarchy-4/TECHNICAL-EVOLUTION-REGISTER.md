# Technical Evolution Register

**Purpose:** keep technical maturity visible without allowing speculative infrastructure work to dominate product delivery.

## Promotion rule
A technical item becomes an implementation mission only when it blocks one or more of: validated user value, security/privacy, mobile portability, institutional scale, a commercial vertical, operational reliability, or development velocity.

## T1 — Application-owned backend boundary — NEXT / Mission 4
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
