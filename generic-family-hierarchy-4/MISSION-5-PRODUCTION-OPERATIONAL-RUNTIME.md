# Mission 5 — Production & Operational Runtime

**Status:** SOURCE IMPLEMENTED — RUNTIME/DEPLOYMENT VERIFY  
**Effort:** MEDIUM  
**Mission character:** operational hardening of the Mission 4 application boundary; no infrastructure expansion program.

## Goal
Move Network OS from a proven application-owned command boundary to a production-safer runtime that fails consistently, exposes health/readiness, prevents accidental duplicate expensive commands, provides bounded abuse protection, and has an honest seam for future background work.

## Implemented

### M5.1 Shared command runtime
All five `/api/v1` write routes now use `server/shared/command-runtime.ts` for:
- authenticated request context;
- bounded JSON parsing and payload limits;
- consistent request IDs;
- command-level burst protection;
- normalized success/failure contracts;
- structured outcome/error/idempotency logging;
- optional/required durable idempotency.

Domain services remain unchanged and Supabase RLS remains authoritative.

### M5.2 Request and abuse safety
- JSON content type enforced for command routes.
- Streaming request reader stops when configured byte limits are exceeded.
- Default command payload cap: 256 KB.
- Institutional bootstrap cap: 1.5 MB / existing 500-row rule.
- Lightweight actor+command burst guard added.

The burst guard is **instance-local** and is not represented as global distributed rate limiting. Introduce a shared limiter only when traffic/abuse evidence justifies it.

### M5.3 Durable idempotency for duplicate-sensitive commands
Migration `056_m5_production_operational_runtime.sql` adds authenticated Postgres-backed command idempotency RPCs.

Protected commands:
- `createNetwork`
- `bootstrapInstitution`

The browser command client sends an `Idempotency-Key` and may retry transient 502/503/504 failures once while preserving the same key. Existing join/claim/relationship commands are not blindly retried.

This is application-level retry protection, not a claim of cross-system exactly-once delivery.

### M5.4 Health and readiness
- `GET /api/health` — process/application liveness; no dependency requirement.
- `GET /api/ready` — validates runtime config and checks Supabase Auth health with a bounded timeout.
- Both responses are `no-store`.

### M5.5 Runtime configuration ownership
`server/shared/runtime-config.ts` centralizes required server runtime configuration and readiness diagnostics. Mission 5 introduces no service-role credential.

### M5.6 Observability
Structured `network_os_command` events retain:
- request ID;
- actor ID;
- command;
- network scope where known;
- success/failure;
- normalized error code;
- idempotency outcome;
- duration;
- timestamp.

This remains a logging seam, not a purchased observability stack.

### M5.7 Background work seam
`server/jobs/` defines portable job contracts and a dispatcher seam. The default dispatcher intentionally returns `BACKGROUND_RUNTIME_NOT_CONFIGURED` rather than pretending post-response work is durable on Vercel/serverless.

Bounded synchronous work may use `runBoundedInlineJob`. A real managed queue/worker is a future evidence-triggered evolution.

### M5.8 CI and deployment baseline
CI now runs:
1. `npm ci`
2. `npm run validate:m5` (includes M4→M3→M2→STABILITY/i18n regression chain)
3. `npm run check:types`
4. `npm run build`

## Explicit non-goals
- no Kubernetes;
- no Kafka;
- no Redis/shared rate limiter yet;
- no microservice split;
- no graph DB/search engine;
- no service-role application runtime;
- no broad direct-Supabase migration;
- no Family/NX redesign;
- no RAG expansion;
- no native mobile client.

## Production interpretation
M5 makes the current single-deploy Next.js + Supabase architecture more operationally credible without pretending it has traffic problems that do not yet exist. Supabase remains the database/auth/RLS/storage/realtime platform and Vercel remains the web/server runtime.

## Closure criteria
- Migration 056 applied before deploying code paths requiring idempotency.
- `npm run validate:m5`, `npm run check:types`, and `npm run build` pass.
- `/api/health` returns 200.
- `/api/ready` returns 200 with correctly configured Supabase and 503 on dependency/config failure.
- Create Network and Institutional Bootstrap succeed through existing UI.
- Same idempotency key + same body returns the cached result; same key + different body is rejected.
- Oversized/non-JSON command requests are rejected consistently.
- Existing Family/Alumni/Productized/NX behavior remains stable.
