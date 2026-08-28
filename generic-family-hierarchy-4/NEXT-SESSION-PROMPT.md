# Next Session Prompt — Mission 4

Resume Generic Network OS from the post-Mission-3 stabilized codebase.

## Authoritative current state
- STABILITY-1 is the accepted UX baseline; do not revive the rejected Mission 1 Family redesign.
- Mission 2 Trusted Expertise / Professional Network is source implemented.
- Mission 3 Governed Graph + Institutional Bootstrap is source implemented; preserve hierarchy behavior.
- i18n architecture uses canonical English token catalogs plus Hindi/Marathi locale files and fallback. Do not reintroduce inline translation dictionaries.
- `use client` / `use server` directives must remain the first executable statement; preserve the directive-order gate.
- NX functionality is reviewable and should not be broadly removed/reworked without explicit decision.

## Next mission
Implement **Mission 4 — Network OS Application & Runtime Foundation** with **MEDIUM effort**.

Read first:
1. `AI-START-HERE.md`
2. `CURRENT-STATE.md`
3. `MISSION-STATUS.md`
4. `ROADMAP.md`
5. `NETWORK-OS-BACKEND-RUNTIME-ARCHITECTURE.md`
6. `MISSION-4-APPLICATION-RUNTIME-FOUNDATION.md`
7. `GRAPH-NETWORK-PLATFORM-ARCHITECTURE.md` if present
8. `I18N-ARCHITECTURE.md`
9. `VALIDATION.md`

## Mission intent
Do not replace Supabase. Add a modular application-owned server boundary on top of Next.js + Supabase + Vercel.

Preferred stack:
- Next.js/React/TypeScript remains frontend.
- Next.js Route Handlers + server-only TypeScript modules on Node runtime become the primary application command layer.
- Supabase Postgres/Auth/Storage/Realtime/RLS remain core infrastructure.
- Supabase Edge Functions are reserved for webhooks/light integrations/event work, not the main domain backend.
- `/api/v1` versioned command endpoints.
- Shared UI-independent contracts for future native mobile.
- GitHub Actions CI baseline.

Implement only 3–5 representative high-value commands. Do not migrate every direct Supabase query. Keep safe RLS-protected reads direct where appropriate.

## Non-goals
No microservices, Kubernetes, Kafka, Redis, graph DB migration, native mobile build, RAG expansion, Network Effect cross-network exposure, or Family UX redesign.

## Release discipline
IMPLEMENT → VALIDATE → GUIDE/DOC → RUNTIME CHECKLIST → ROADMAP/STATUS → CLOSE.
Return affected/new files only, preserving repository hierarchy.
