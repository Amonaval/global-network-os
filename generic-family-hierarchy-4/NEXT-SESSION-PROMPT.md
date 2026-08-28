# Next Session Prompt — Mission 4 Runtime Certification

Resume Generic Network OS from the Mission 4 source-implemented codebase.

## Authoritative current state
- STABILITY-1 remains the accepted UX baseline; do not revive the rejected Mission 1 Family redesign.
- Mission 2 Trusted Expertise / Professional Network is source implemented.
- Mission 3 Governed Graph + Institutional Bootstrap is source implemented; preserve hierarchy behavior.
- Mission 4 Application & Runtime Foundation is **source implemented; runtime/build certification remains open**.
- i18n uses canonical English token catalogs plus Hindi/Marathi locale files and fallback. Do not reintroduce inline translation dictionaries.
- `use client` / `use server` directives must remain first executable statements.
- NX functionality remains reviewable and must not be broadly removed/reworked without explicit decision.

## Read first
1. `AI-START-HERE.md`
2. `CURRENT-STATE.md`
3. `MISSION-STATUS.md`
4. `MISSION-4-APPLICATION-RUNTIME-FOUNDATION.md`
5. `NETWORK-OS-BACKEND-RUNTIME-ARCHITECTURE.md`
6. `MISSION-4-RUNTIME-VERIFICATION-CHECKLIST.md`
7. `VALIDATION.md`

## Immediate task
Runtime-certify Mission 4 against a dependency-installed copy:
1. run `npm ci`;
2. run `npm run validate:m4`;
3. run `npm run build`;
4. exercise the five authenticated commands through the existing UI/API;
5. verify unauthenticated/unauthorized behavior and RLS remains authoritative;
6. inspect structured command logs for request/actor/network/command/outcome/duration;
7. fix only contained Mission 4 seams if needed.

## Mission 4 architecture now present
- `core/api/contracts.ts` — UI-independent request/response contracts.
- `lib/api-client.ts` — authenticated browser command transport.
- `server/` — request context, normalized errors/responses, network/graph/institutional/identity services.
- `/api/v1` — five Node-runtime command endpoints.
- Existing UI-facing transport function signatures remain compatibility facades.
- Supabase Postgres/Auth/Storage/Realtime/RLS remain core infrastructure.
- Server uses caller JWT + anon key; no service-role key was introduced.
- Safe RLS-backed reads remain direct.
- `.github/workflows/ci.yml` provides the initial CI baseline.

## Five extracted commands
1. create network (Family + productized)
2. join network (Family + productized)
3. create productized graph relationship
4. institutional bootstrap/import
5. claim identity (Family + Alumni + productized)

## Non-goals during certification
No microservices, Kubernetes, Kafka, Redis, graph DB migration, native mobile build, RAG expansion, cross-network Network Effect exposure, broad Supabase migration, or Family/NX redesign.

## After runtime certification
Update Mission 4 status to certified, close its checklist, then reassess the roadmap/Network Effect/product priorities before choosing the next major implementation mission. Do not automatically expand backend infrastructure merely because the server boundary now exists.
