# A8 + A9 — Engagement & 20→50 Family Scale Bundle

Status: **IMPLEMENTED / VERIFY** — 2026-08-22

## Decision
A8 and A9 are combined because the engagement loop and the 20→50-family operating gate share the same Alpha objective: families must return, participate, share safely, and remain operable without platform-owner intervention. No risky schema rewrite was required, so separating the missions would add ceremony without reducing material risk.

## A8 — Engagement & sharing
- Home now exposes a compact Family Pulse: memories, upcoming special days, and profiles that need enrichment.
- Existing A6 return loops (On This Day, celebrations, memories, gatherings, quiet digests) remain intact and are surfaced more clearly.
- Participation sharing adds a one-tap warm family/WhatsApp sharing action while retaining privacy-safe public directory/profile rules.
- Contribution, reunion, celebration and memory sharing stay deliberate; no noisy social feed was introduced.

## A9 — 20→50 family scale
- Family Admin Center adds a Pilot Readiness tab with a visible operating score.
- Readiness checks cover continuity (2 admins), storage headroom, approval backlog, family data health, and profile activation.
- Each failed gate links back to an Owner action: invitations, participation, or backup.
- This is deliberately family-admin self-service rather than a premature enterprise control plane.

## Validation
1. Home: confirm Family Pulse shows three tappable signals and routes to Memories/Participation.
2. Participation → Share cards: confirm “Share family on WhatsApp” uses native share or clipboard fallback.
3. Family Settings → Admin Center → Pilot readiness: confirm the 5 readiness gates and score render.
4. Change data (add second admin, resolve approvals, enrich profiles) and confirm readiness changes after reload.
5. Confirm A6 features still work: On This Day, memory sharing, gathering attendees/story, reunion directory, quiet updates.
6. Mobile-width smoke test the Home pulse and readiness rows.

No new database migration is required beyond canonical migrations through 025.
