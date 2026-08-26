# Team IDS

**Status:** Shipped  
**Date:** 2026-08-05

---

## Problem

IDS was a single aggregate metric across the entire instance. With `userId` now flowing through every eval.jsonl entry, the data existed to answer "who is driving intelligence?" and "what is each person's contribution?" — but nothing visualised it. A team of 5 engineers looked identical to a single power user. The metric had no faces.

## What Was Built

### `GET /api/team/ids`

New endpoint that reads all eval.jsonl entries, groups them by `userId`, runs `serverComputeIDS` against each user's query pool, and runs it again against the combined pool for the team score.

**Response shape:**
```json
{
  "teamIds": 0.54,
  "userCount": 3,
  "perUser": [
    { "userId": "alice", "queryCount": 42, "ids": 0.61 },
    { "userId": "bob",   "queryCount": 17, "ids": 0.38 },
    { "userId": "default", "queryCount": 5, "ids": 0.21 }
  ]
}
```

`perUser` is sorted by individual IDS descending. `teamIds` is computed from the union of all entries — not an average of individual scores.

### Intelligence Dashboard — Team IDS Section

A new section renders between the KPI row and the FilterBar.

**Solo user (1 contributor):**
- Header: `👤 Your Intelligence`
- Team IDS meter (reuses existing `.id-ids-track` / `.id-ids-fill` CSS)
- Single user row with mini bar + IDS score + query count

**Team (2+ contributors):**
- Header: `👥 Team Intelligence` + contributor count
- Team IDS meter with moat threshold marker
- Per-user rows: username | bar (proportional to highest individual IDS) | score | query count

Each bar and score is colour-coded: green ≥ 70, amber ≥ 40, grey otherwise.

## Files Changed

| File | Change |
|------|--------|
| `src/api/server.js` | New `GET /api/team/ids` endpoint; `computeIdsInputs()` helper (local to endpoint) |
| `frontend/src/types.ts` | Added `TeamIdsUser`, `TeamIdsData` interfaces |
| `frontend/src/hooks/useApi.ts` | Added `useTeamIds()` hook; `TeamIdsData` added to import |
| `frontend/src/components/chat/IntelligenceDashboard.tsx` | Added `UserIdsBar`, `TeamIdsSection` components; rendered between KPI row and FilterBar |
| `public/css/app.css` | Added `.id-team-*` styles |

## Design Decisions

**Team IDS ≠ average of individual IDS.** It's computed by running `serverComputeIDS` against the full combined query pool. A team of 3 active users will produce a higher team IDS than any individual because the combined pool has more queries, more clusters, and more answered questions — which is the correct behaviour. The metric rewards collective use.

**Per-user bar is relative, not absolute.** Each bar's width is proportional to the highest individual IDS on the team, not against the 100-point scale. This makes differences between users visible even when all scores are in a narrow range.

**Solo use is a first-class case.** The section always renders when data exists — a solo user sees their own IDS framed as "Your Intelligence," which is equivalent to the main IDS bar but with the user breakdown layer ready for when more users join.

## The Signal This Adds

Before: IDS was one number. You knew the instance was at 54/100 but not why.

After: You can see alice is at 61, driving most of the intelligence. Bob is at 38, underserved — his questions are probably being blocked. That's an actionable signal: which sections need work to serve bob's query patterns better.
