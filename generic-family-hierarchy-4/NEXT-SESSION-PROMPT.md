# Next Session Prompt — Mission 5 Runtime Certification

Resume Generic Network OS from the Mission 5 source-implemented codebase.

## Authoritative current state
- STABILITY-1 remains the accepted UX baseline.
- Mission 2 Trusted Expertise and Mission 3 Governed Graph remain implemented.
- Mission 4 Application & Runtime Foundation was manually runtime-accepted after broad cross-application testing; minor unrelated regression bugs remain backlog items.
- Mission 5 Production & Operational Runtime is **source implemented; runtime/deployment certification remains open**.
- Supabase Postgres/Auth/RLS/Storage/Realtime + Vercel/Next.js remain the production architecture.
- No service-role application runtime, microservices, Redis, Kafka or queue was introduced.

## Read first
1. `AI-START-HERE.md`
2. `CURRENT-STATE.md`
3. `MISSION-STATUS.md`
4. `MISSION-5-PRODUCTION-OPERATIONAL-RUNTIME.md`
5. `NETWORK-OS-BACKEND-RUNTIME-ARCHITECTURE.md`
6. `MISSION-5-RUNTIME-VERIFICATION-CHECKLIST.md`
7. `VALIDATION.md`

## Immediate task
1. Apply migration `056_m5_production_operational_runtime.sql` after existing migrations.
2. Run `npm ci`, `npm run validate:m5`, `npm run check:types`, `npm run build`.
3. Verify `/api/health` and `/api/ready`.
4. Exercise the five existing authenticated commands through the UI.
5. Verify create-network/bootstrap idempotency with same key/same body and same key/different body.
6. Verify malformed/non-JSON/oversized command requests normalize to 400/415/413.
7. Inspect structured success/failure logs.
8. Fix only contained runtime defects; do not turn certification into product redesign.

## M5 architecture now present
- `server/shared/command-runtime.ts` owns common command execution concerns.
- `request-safety.ts` streams and bounds JSON request bodies.
- `rate-limit.ts` supplies lightweight per-instance actor/command burst protection.
- `idempotency.ts` + migration 056 provide authenticated durable retry protection.
- `/api/health` is liveness; `/api/ready` is dependency/config readiness.
- `runtime-config.ts` centralizes required runtime config.
- `server/jobs/` establishes a future async seam but refuses fake durable post-response work.
- CI runs M5 regression + TypeScript + production build.

## After certification
Close Mission 5 and stop speculative infrastructure expansion. Reassess the strongest product/customer/network-effect mission from the current roadmap before adding more platform machinery.
