# Mission 4 — Network OS Application & Runtime Foundation

**Status:** PLANNED — NEXT MAJOR MISSION  
**Recommended effort:** MEDIUM  
**Mission character:** architecture extraction / hardening, not product redesign

## Hypothesis

Generic Network OS can preserve the speed and operational simplicity of Supabase/Vercel while adding an application-owned server boundary that makes future institutional scale, native mobile, integrations, Network Effect workflows and AI/RAG safe and portable.

## Why now

Mission 2 proved a commercial Professional vertical. Mission 3 introduced governed graph relationships and institution-scale bootstrap. Those capabilities create multi-step commands that should no longer be orchestrated primarily by browser components or direct data calls.

The current architecture is not wrong. Mission 4 is the next maturity layer.

## Scope — Medium effort

### M4.1 Server foundation
- Add `server/` modular domain boundary.
- Add authenticated request context and normalized error/result contracts.
- Add server-side Supabase adapter/repository seam.

### M4.2 Versioned command API
- Establish `/api/v1` convention.
- Extract 3–5 high-value commands only.
- Preserve existing direct safe reads.

### M4.3 Command policy
- Document and enforce `DIRECT QUERY / SERVER COMMAND / SERVER-ONLY` classifications.
- Privileged and multi-step workflows must not originate as browser-only orchestration.

### M4.4 Observability baseline
- Correlation/request ID.
- Actor + network + command + outcome + duration.
- Sanitized structured errors.
- No enterprise observability platform required yet.

### M4.5 CI/runtime baseline
- Add CI pipeline for existing source gates, i18n/directive checks, type/build and targeted server tests.
- Preserve local developer simplicity.

### M4.6 Mobile/API portability contract
- Keep server/domain contracts UI-independent.
- Document how future native mobile consumes the same command API.

## Explicit exclusions

- No microservices.
- No Kubernetes.
- No Kafka.
- No Redis unless a measured problem exists.
- No graph database migration.
- No wholesale rewrite of `remote.ts` or every Supabase call.
- No redesign of Family/NX UI.
- No Network Effect cross-network exposure yet.
- No RAG/LLM expansion.
- No native mobile client yet.

## Expected affected areas

Prefer new files under `server/`, `app/api/v1/`, tests/scripts and documentation. Modify existing UI/data modules only where needed to route the selected commands through the new boundary.

## Validation

1. Existing STABILITY/M2/M3 gates remain green.
2. Production build passes.
3. Selected commands work through API/service layer.
4. RLS still protects data if an API route is bypassed.
5. No service-role secret is reachable client-side.
6. API error contract is stable.
7. Web behavior is unchanged for unaffected flows.
8. Shared contracts contain no React/DOM/browser dependencies.

## Runtime scenarios

- create a network through server command;
- join network through server command;
- create governed relationship through server command;
- institutional bootstrap command is idempotent/safe to retry where applicable;
- unauthorized cross-network request is rejected;
- direct safe query still works where intentionally retained.

## Closure rule

Do not convert Mission 4 into an infrastructure program. Close it once the architectural boundary is proven and documented. Scale infrastructure only when production evidence demands it.
