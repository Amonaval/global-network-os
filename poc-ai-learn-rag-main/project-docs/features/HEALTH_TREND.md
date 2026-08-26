# Health Trend Over Time

**Status:** Shipped  
**Date:** 2026-08-05

---

## Problem

The Documentation Health Score showed the current state of each section — but had no memory. A user could see "auth section: 62/100" today, but had no way to know whether that was up from 40 last month or down from 80. Health scores without history are readings, not trends. The intelligence layer already captured weekly snapshots with `avgHealthScore` — that data was sitting unused.

## What Was Built

### HealthPanel — Trend Banner

A trend banner appears at the top of the Health panel (above the KPI row), driven by `GET /api/intelligence/history`.

**0 snapshots:** Banner hidden.

**1 snapshot:** An amber prompt: "First snapshot saved (avg health: X%). Keep using the product to see your health trend."

**2+ snapshots:** A blue trend banner showing:
```
Health Trend
Avg score ↑ +8 pts · IDS ↑ +12 pts · Now 71%     [sparkline →]
```

The sparkline plots `avgHealthScore` across all snapshots — each dot is one week. The line grows as more snapshots accumulate.

### Intelligence Dashboard — Trend Banner (6th signal)

The existing trend banner in the Intelligence Dashboard now includes health as a 6th delta signal:
```
Since Aug 1
IDS ↑ +12 pts · Queries ↑ +45 · Clusters ↑ +2 · Gaps ↓ -1 · Health ↑ +8 pts    [sparkline →]
```

### Server — `latestDelta` extended

`GET /api/intelligence/history` now includes `avgHealthScore` in `latestDelta`:
```json
{
  "ids": 12,
  "totalQueries": 45,
  "clusterCount": 2,
  "successRate": 0.03,
  "totalBlocked": -1,
  "avgHealthScore": 8
}
```

## Files Changed

| File | Change |
|------|--------|
| `src/api/server.js` | Added `avgHealthScore` to `latestDelta` in `GET /api/intelligence/history` |
| `frontend/src/types.ts` | Added `avgHealthScore: number` to `IntelligenceDelta` |
| `frontend/src/components/chat/HealthPanel.tsx` | Added `HealthTrendBanner`, `HealthSparkline`, `HealthDeltaBadge` components; renders banner above KPI row |
| `frontend/src/components/chat/IntelligenceDashboard.tsx` | Added health delta as 6th item in trend banner |

## Zero New Storage

No new data is stored. `avgHealthScore` already existed in every snapshot since Intelligence Persistence shipped. This feature only reads and displays data that was already being captured.

## The Signal This Adds

Before: Health panel showed current state only. A score of 65 had no context.

After: "Health was 41 when you started. It's 71 now. It grew 8 points since last snapshot." That tells you whether your documentation work is paying off — or whether things are quietly degrading.
