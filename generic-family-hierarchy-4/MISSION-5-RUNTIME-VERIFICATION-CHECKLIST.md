# Mission 5 — Runtime Verification Checklist

## A. Build/regression
- [ ] `npm ci`
- [ ] `npm run validate:m5` → M5 source gate 12/12 and regression chain passes
- [ ] `npm run check:types`
- [ ] `npm run build`

## B. Database/deployment
- [ ] Migration `056_m5_production_operational_runtime.sql` applied after prior migrations.
- [ ] No service-role key added to browser or server runtime configuration.
- [ ] Existing Supabase URL + anon key are configured in deployment environment.

## C. Health/readiness
- [ ] `GET /api/health` → HTTP 200, `status: healthy`.
- [ ] `GET /api/ready` → HTTP 200, `status: ready` with Supabase healthy.
- [ ] Missing/broken dependency configuration causes `/api/ready` → HTTP 503 without leaking secrets.

## D. Existing UI regression
- [ ] Login/logout and My Networks work.
- [ ] Family tree/profile/navigation work.
- [ ] Alumni and productized verticals open.
- [ ] NX surfaces remain available.
- [ ] i18n/theme behavior remains unchanged.

## E. Command runtime
- [ ] Create Family/Productized Network succeeds normally.
- [ ] Join Network succeeds normally.
- [ ] Create governed relationship succeeds normally.
- [ ] Institutional Bootstrap succeeds normally.
- [ ] Identity Claim succeeds normally.
- [ ] Unauthenticated command returns normalized 401.
- [ ] Unauthorized cross-network/data operation remains rejected by existing authorization/RLS.

## F. Idempotency
Use a REST client/browser dev tool against authenticated APIs if desired.
- [ ] `createNetwork` without `Idempotency-Key` → 400 `IDEMPOTENCY_KEY_REQUIRED`.
- [ ] Same idempotency key + same request body → second response returns same result, no duplicate network.
- [ ] Same idempotency key + different body → rejected.
- [ ] Institutional Bootstrap retry with same key does not re-import completed work.

Normal UI already sends keys for these commands.

## G. Request safety
- [ ] Command request without `application/json` → 415.
- [ ] Malformed JSON → 400.
- [ ] Payload beyond route limit → 413.
- [ ] Rapid repeated command burst eventually → 429 on that runtime instance.

Do not treat the instance-local burst guard as globally distributed rate limiting.

## H. Observability
Inspect server/Vercel logs for one success and one failure:
- [ ] `type=network_os_command`
- [ ] request ID
- [ ] actor ID
- [ ] command
- [ ] network where known
- [ ] outcome
- [ ] durationMs
- [ ] timestamp
- [ ] errorCode on failure
- [ ] idempotency state on protected commands

## Acceptance
If A–H are satisfactory and broad navigation regression is clean, mark Mission 5 **RUNTIME ACCEPTED / CLOSED**. Minor unrelated legacy defects may be logged separately rather than holding the architecture mission open.
