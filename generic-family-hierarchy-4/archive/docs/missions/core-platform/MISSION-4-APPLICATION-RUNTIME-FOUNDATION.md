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

## Implementation checkpoint — 2026-08-27

**Status:** SOURCE IMPLEMENTED — RUNTIME/DEPLOYMENT VERIFY

Mission 4 now proves the application-owned boundary with five commands while preserving existing UI contracts:

1. `createNetwork` — Family and productized vertical creation.
2. `joinNetwork` — Family and productized join-code flows.
3. `createGraphRelationship` — governed productized relationship creation.
4. `bootstrapInstitution` — existing productized bulk entity import behind an authenticated server command.
5. `claimIdentity` — Family, Alumni and productized verified-email claiming.

Implemented architecture:
- UI-independent command/response contracts in `core/api/contracts.ts`.
- Browser command client in `lib/api-client.ts` that forwards the signed-in user's access token.
- Node-runtime `/api/v1` Route Handlers.
- Modular `server/` services for network, graph, institutional and identity commands.
- Server request context derives the authenticated actor and active network from Supabase; the browser is not trusted to assert actor/network scope.
- The server uses the public anon key plus the user's JWT, so Supabase RLS/RPC authorization remains authoritative. No service-role credential was introduced.
- Structured command logging captures request ID, actor, active/result network where available, command, outcome and duration.
- Existing browser transport functions remain compatibility facades; only the selected commands were rerouted.
- Safe reads and low-risk existing direct Supabase flows remain unchanged.
- GitHub Actions baseline now runs install, Mission 4 + existing source gates, and production build.

Source gates passed locally without installed project dependencies: Mission 4 11/11, STABILITY-1 14/14, Mission 2 19/19, Mission 3 11/11, i18n visible-literal audit 0.

Production `next build` could not be executed in the extracted working copy because dependencies were not available and `npm ci` could not complete in the execution environment. Treat build + authenticated live command verification as the remaining runtime gate.

## Runtime acceptance — 2026-08-28
Mission 4 was manually accepted after approximately 30 minutes of navigation across Family and other vertical applications with core Family Tree behavior working well. Three minor/legacy regression findings were logged separately and explicitly deferred; they do not block the Mission 4 architecture objective. Mission 5 now builds on Mission 4 as the accepted application-runtime baseline.
