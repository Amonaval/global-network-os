# Multi-user / Team Mode

**Status:** Shipped  
**Priority:** P1  
**Date:** 2026-08-05

---

## Problem

Every query in eval.jsonl was anonymous — there was no way to distinguish which team member asked what. A team of 10 engineers sharing a single Knowledge Hub instance appeared as one user in the intelligence store. The Dashboard had no way to filter insights by individual contributor, and the intelligence signals reflected aggregate team behavior with no attribution.

## Solution

Lightweight per-browser identity, no auth required. Each browser stores a user name in `localStorage` under key `kh_user_name`. When a query fires, the name travels as `userId` through the entire pipeline and is stored in eval.jsonl alongside the question.

### Architecture Decision

User identity is per-browser (localStorage), not per-server-account. This is the right architecture for a shared local server where:
- Each team member has their own browser pointing at the shared instance
- No login/auth infrastructure is needed
- The intelligence store remains append-only and backwards-compatible (old entries default to `'default'`)

### Data Flow

```
Browser localStorage (kh_user_name)
  → App.tsx sends userId in /api/chat/stream POST body
  → server.js extracts userId, passes to queryStream()
  → query.js logs userId in all four logEval() call sites
  → eval.jsonl: { ..., userId: "alice" }
  → GET /api/users: scans eval.jsonl, returns distinct users + query counts
  → GET /api/insights?user=alice: server-side filter on userId field
  → FilterBar UserPicker: dropdown of known users, triggers re-query
```

## Files Changed

| File | Change |
|------|--------|
| `src/rag/query.js` | `userId = options.userId \|\| 'default'` in both `query()` and `queryStream()`; added to all 4 `logEval()` calls |
| `src/api/server.js` | Extract `userId` from `/api/chat` and `/api/chat/stream` bodies; `fUser` filter in `/api/insights`; new `GET /api/users` endpoint |
| `frontend/src/types.ts` | Added `userId: string` to `InsightsFilters`; new `UserEntry` interface |
| `frontend/src/hooks/useApi.ts` | `useUsers()` hook; `useInsights()` now passes `user` param |
| `frontend/src/components/chat/FilterBar.tsx` | `UserPicker` dropdown component (mirrors SectionPicker pattern); `DEFAULT_FILTERS` + `isActive()` updated |
| `frontend/src/components/chat/SidebarFooter.tsx` | User name display + inline edit form, persists to localStorage |
| `frontend/src/App.tsx` | Reads `localStorage.kh_user_name`, passes as `userId` in stream body |
| `public/css/app.css` | `.sidebar-user-row` and related styles |

## API Changes

### `GET /api/users`
Returns all distinct users who have asked questions, ordered by query count.

```json
{
  "users": [
    { "userId": "alice", "queryCount": 42 },
    { "userId": "bob",   "queryCount": 17 },
    { "userId": "default", "queryCount": 5 }
  ]
}
```

### `GET /api/insights?user=alice`
New `user` query parameter filters all insights dimensions (topics, pain areas, quality trend, recurring gaps) to a specific user's queries.

### `POST /api/chat`, `POST /api/chat/stream`
Now accept `userId` in request body (optional, defaults to `'default'`).

## eval.jsonl Schema Evolution

Old entries without `userId` default to `'default'` at read time — no migration needed. The eval.jsonl file remains append-only.

```jsonl
// Before (backwards-compatible reads as userId: 'default')
{"ts":"...","question":"...","sectionsUsed":["api-docs"],...}

// After
{"ts":"...","question":"...","sectionsUsed":["api-docs"],...,"userId":"alice"}
```

## UX

- **Sidebar footer**: displays current user name (defaults to `'default'`). Click to edit — submitting an empty name resets to `'default'`.
- **Intelligence Dashboard FilterBar**: new User dropdown next to Section. Shows all users with query counts. Selecting one re-fetches all insights dimensions filtered to that user.
- Zero friction for solo use: if no name is set, everything works exactly as before under `'default'`.

---

## Mission Completion Assessment

**Did we solve the right problem?**  
Yes. The fundamental gap was that shared-instance intelligence was indistinguishable from single-user intelligence. Teams couldn't answer "which sections are _my team's_ pain areas?" without the user dimension. This closes the gap.

**Is there a more transformative opportunity?**  
The bigger unlock is Team IDS — computing an aggregate intelligence density score across all users' combined queries. Right now IDS is a single-instance metric. With userId data now flowing, a per-user IDS breakdown and a team aggregate become feasible. That's the next compounding step.

**Should the roadmap change?**  
The VS Code Extension (previously Active) is shipped. Multi-user is now shipped. The roadmap should shift focus to two things: (1) first paying customer via the pricing page + cloud trial, and (2) Team IDS as the next intelligence layer feature — it now has the data foundation it needs.

**What is the highest ROI next step?**  
First paying customer acquisition. The technical foundation is strong — the moat is real but invisible without a customer using it daily. One team running Knowledge Hub for 30 days with 5+ engineers will generate IDS data that validates the entire platform thesis. That demo closes the next 10 customers.
