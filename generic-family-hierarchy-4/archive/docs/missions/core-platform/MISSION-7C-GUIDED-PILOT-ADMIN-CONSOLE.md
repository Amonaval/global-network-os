# M7-C — Guided Pilot & Admin Launch Console

## Mission
Turn M7-A's per-network activation guide into a portfolio operating console for Owners/Admins running real pilots.

M7-C answers four practical questions:
1. Which of my networks needs attention first?
2. Where is each pilot stuck in the activation funnel?
3. Which pilots are progressing toward a real trusted outcome?
4. Which network has already proven value and should be observed for repeat behavior rather than pushed to grow blindly?

## Product model
M7-A remains the authoritative per-network launch journey. M7-C sits above it.

`Pilot portfolio → prioritize network → open real network → use existing M7-A/import/invite/claim/bridge/discovery flows`.

No duplicate admin center, invitation system, onboarding wizard or cross-network directory is introduced.

## Pilot health states
- **Starting** — early launch, below the core activation threshold.
- **Progressing** — enough foundations exist to test trusted discovery/outcomes.
- **Needs attention** — an older pilot (14+ days) remains below the progression threshold and has no accepted outcome.
- **Value proven** — at least one accepted trusted introduction exists in the last 30 days.

These states are operating heuristics, not a score of community quality.

## Highest-leverage intervention
Every network is reduced to its first missing constraint:
`seed → participation → claim → bridge → discovery → introduction → none`.

The portfolio sorts by intervention priority and readiness. The top network becomes the recommended intervention so an organizer does not have to inspect every application manually.

## Signals
The admin-scoped RPC returns aggregate-only signals:
- seeded people/entities;
- active memberships;
- claimed/linked identities;
- accepted trusted bridges;
- discovery searches in the last 30 days;
- introduction requests in the last 30 days;
- accepted introductions in the last 30 days;
- network age and latest aggregate activity timestamp.

## Privacy and governance
The console never exposes adjacent-network people, candidate identities, search text, private profile fields or member directories. It uses only counts and timestamps for networks the caller actively administers.

M6-C/M6-E privacy invariants remain unchanged.

## Architecture
`My Networks → AdminPilotLaunchConsole → capabilities/pilot-console/remote.ts → get_my_pilot_launch_console() → aggregate Postgres state`.

This is a safe RLS/governance-aware read, so it remains a direct Supabase query rather than creating a new command API.

## Migration
Apply `063_m7c_guided_pilot_admin_console.sql` after M7-A migration 062.

## Validation
Run:
- `npm run validate:m7c`
- `npm run check:types`
- `npm run build`

Then follow `MISSION-7C-RUNTIME-VERIFICATION-CHECKLIST.md`.

## Success criterion
M7-C succeeds when a pilot organizer can open My Networks and identify the highest-leverage next intervention across all administered networks in under a minute.

## Next
M7-D should capture lightweight qualitative feedback and milestone drop-off so the operating console can be informed by real pilot behavior rather than expanding with more invented metrics.
