# M7-C Release Manifest — Guided Pilot & Admin Launch Console

## New
- `components/AdminPilotLaunchConsole.tsx`
- `core/activation/pilot-console.ts`
- `capabilities/pilot-console/remote.ts`
- `supabase/migrations/063_m7c_guided_pilot_admin_console.sql`
- `scripts/m7c-guided-pilot-console-gate.mjs`
- `MISSION-7C-GUIDED-PILOT-ADMIN-CONSOLE.md`
- `MISSION-7C-RUNTIME-VERIFICATION-CHECKLIST.md`
- `MISSION-7C-GUIDED-PILOT-ADMIN-CONSOLE.docx`

## Updated
- `components/MyNetworksHome.tsx`
- `lib/i18n/messages/en.ts`
- `app/globals.css`
- `package.json`
- `.github/workflows/ci.yml`
- durable mission/status/roadmap/handoff documentation

## Database
Apply migration 063 after the previous M7/M6 migrations.

## Guardrails
M7-C is aggregate/admin-scoped. It does not expose cross-network identities or duplicate existing network administration workflows.
