# Mission 5 — Release Manifest

## New files
- `server/shared/runtime-config.ts`
- `server/shared/request-safety.ts`
- `server/shared/rate-limit.ts`
- `server/shared/idempotency.ts`
- `server/shared/command-runtime.ts`
- `server/jobs/contracts.ts`
- `server/jobs/dispatcher.ts`
- `app/api/health/route.ts`
- `app/api/ready/route.ts`
- `supabase/migrations/056_m5_production_operational_runtime.sql`
- `scripts/m5-production-runtime-gate.mjs`
- `MISSION-5-PRODUCTION-OPERATIONAL-RUNTIME.md`
- `MISSION-5-RELEASE-MANIFEST.md`
- `MISSION-5-RUNTIME-VERIFICATION-CHECKLIST.md`

## Modified runtime files
- all five Mission 4 `/api/v1` command routes — standardized on shared command runtime;
- `server/shared/request-context.ts` — centralized runtime config;
- `server/shared/response.ts` — operational metadata;
- `lib/api-client.ts` — request IDs, typed command errors, idempotent bounded retry;
- `lib/remote.ts` — Family create uses idempotent transport;
- `capabilities/template-product/remote.ts` — productized create/bootstrap use idempotent transport;
- `package.json` — M5 + typecheck scripts;
- `.github/workflows/ci.yml` — M5/type/build pipeline.

## Documentation/status updated
- `AI-START-HERE.md`
- `CURRENT-STATE.md`
- `MISSION-STATUS.md`
- `NETWORK-OS-BACKEND-RUNTIME-ARCHITECTURE.md`
- `ROADMAP.md`
- `TECHNICAL-EVOLUTION-REGISTER.md`
- `VALIDATION.md`
- `NEXT-SESSION-PROMPT.md`

## Database order
Apply migration `056_m5_production_operational_runtime.sql` after the migrations present in your working repository before deploying M5. The separate Mission 4 regression hotfix migration `055_m4_runtime_regression_hotfix.sql` is not a functional prerequisite for M5 and may remain postponed if that hotfix has not been adopted yet.
