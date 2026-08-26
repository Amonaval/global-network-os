# Feature: Autonomous Documentation Maintenance

*Shipped: 2026-08-05*

## What Was Built

**Phase 1 — Staleness Detection** (no LLM required)
- `GET /api/maintenance/staleness` — compares `data/ingest_hashes.json` (MD5 hashes from last ingest) against current files in `docs/`
- Emits a stale candidate when: (a) file content hash changed, or (b) file mtime > last ingest timestamp
- Maps each file to its section + title via `docs/manifest.json`
- Returns: `lastIngest`, `staleCandidates[]`, `freshCount`, `staleCount`, `totalTracked`

**Phase 2 — Rewrite Suggestions** (LLM)
- `POST /api/maintenance/suggest` (body: `{file, section}`)
- Extracts current on-disk text from the HTML file using the existing `extractText` cleaner
- Loads currently indexed chunks from vector store for the section
- LLM prompt: "The file was modified. Here is the current on-disk content. Here are the indexed chunks. What is stale or missing?"
- Returns: `suggestions[]` with `topic`, `detail`, `severity` (high/medium/low)

**Frontend: `MaintenancePanel.tsx`**
- Accessible from Knowledge → Maintenance in the nav dropdown
- KPI row: Stale / Fresh / Total Tracked
- Last ingest timestamp shown below KPI row
- "All fresh" empty state when no stale files
- Stale candidates listed with section, title, mtime, reason badge
- "🔍 Analyze" button per candidate → calls POST /api/maintenance/suggest
- Inline suggestion cards with severity icons (🔴/🟡/🟢)

## Architecture

Reuses existing infrastructure:
- `ingest_hashes.json` (already written by ingest.js per-file)
- `ingest_meta.json` (lastIngest timestamp)
- `docs/manifest.json` (section/title mapping)
- `getVectorStore()` for indexed chunks
- `extractText` from cleaner.js for on-disk content
- `askLlm` for Phase 2 suggestions

No new data files introduced. Zero new storage.

## Files Changed

- `src/api/server.js` — added `crypto` require + 2 new endpoints
- `frontend/src/components/chat/MaintenancePanel.tsx` — new panel
- `frontend/src/hooks/useApi.ts` — `useStaleness`, `useMaintenanceSuggest`
- `frontend/src/types.ts` — `StaleCandidate`, `StalenessData`, `MaintenanceSuggestion`, `MaintenanceSuggestResult`
- `frontend/src/store/appStore.ts` — `'maintenance'` added to `ActivePanel`
- `frontend/src/App.tsx` — nav entry + panel routing

## Mission Completion Assessment

**Is this actually solving the problem?**
Yes. The platform was fully reactive — it had no awareness of whether docs had changed since indexing. This feature gives it a direct comparison: hash the current files, compare against stored ingest hashes, surface any delta. The first thing a builder sees after editing docs is "1 stale file — Modified: [timestamp]".

**Is it enough?**
Phase 1 + Phase 2 are complete and useful. Phase 3 (scheduled sweep) was marked optional/later in the spec and is the right next increment, not now. The feature delivers the core value: the platform now knows when docs drift from their indexed state.

**Does it really add value?**
Yes — it closes the silent staleness gap that existed since day one. Previously, if you edited a doc, the index silently diverged and answers became subtly wrong. Now the builder sees it immediately. The "Analyze" button turns detection into action within one click.

**Is it readable and actionable at scale?**
Three KPI tiles for at-a-glance status. Each stale candidate shows its section, why it's stale, and when it was modified. The LLM suggestions are severity-coded and specific. The pattern reuses HealthPanel styles so the UI is visually consistent.
