# Intelligence Persistence & History

**Shipped:** 2026-08-03  
**Mission:** Priority 3 — Weekly snapshots, before/after comparisons, IDS trend visible over time.

---

## Problem

The IDS score was computed fresh on every dashboard load — live but ephemeral. A user who came back after a month had no way to see "my intelligence grew 18 points since I started." The moat was invisible over time, which is precisely when it compounds the most.

Intelligence without a history is just a current reading. Intelligence with history is proof of compounding value.

---

## What Was Built

### Server: Auto-Snapshot on `/api/insights`

Every time `/api/insights` is called and the result contains at least 1 query, the server checks whether a snapshot should be saved:
- If no snapshots exist → save immediately
- If last snapshot is older than 7 days → save a new one
- Otherwise → skip (no noise, no churn)

Snapshots are stored in `data/intelligence_snapshots.jsonl` — one JSON line per week.

### Snapshot Schema (`schemaVersion: 1`)

```json
{
  "ts": "2026-08-03T10:00:00.000Z",
  "schemaVersion": 1,
  "totalQueries": 47,
  "totalAnswered": 43,
  "overallSuccessRate": 0.91,
  "totalBlocked": 4,
  "clusterCount": 6,
  "sectionCount": 3,
  "avgHealthScore": 50,
  "totalDecisions": 8,
  "ids": 0.47,
  "topTopics": ["kubernetes", "auth", "deployment"]
}
```

`schemaVersion` satisfies Engineering Decision #10 (intelligence schemas must be versioned).

### Server-Side IDS Computation

IDS is now computed server-side at snapshot time, using the same formula as the frontend:
- Answer quality × 0.30
- Query volume (min q/50, 1) × 0.15
- Memory richness (min clusters/8, 1) × 0.20
- Gap pressure (1 − blocked/total) × 0.15
- Risk baseline established × 0.10
- Average health score × 0.10

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `GET /api/intelligence/history` | GET | Returns all snapshots + `latestDelta` (diff between last two) |
| `POST /api/intelligence/snapshot` | POST | Force a snapshot now (bypasses 7-day guard) |

### `latestDelta` shape

```json
{
  "ids": 8,
  "totalQueries": 45,
  "clusterCount": 2,
  "successRate": 0.03,
  "totalBlocked": -1
}
```

All values are raw differences (current − previous). Negative `totalBlocked` = fewer gaps = good (shown green).

---

## Frontend: Intelligence Dashboard Updates

### Trend Banner (shown when ≥ 2 snapshots exist)

A blue band below the IDS meter showing:
```
Since last snapshot
IDS ↑ +8 pts · Queries ↑ +45 · Clusters ↑ +2 · Gaps ↓ -1
                                              [sparkline →]
```

The sparkline is a pure SVG polyline — no charting library. Each snapshot is one data point. The line grows left-to-right as weeks pass.

### First-Snapshot Prompt (shown when 0 snapshots, queries > 0)

An amber prompt: "Take your first intelligence snapshot to start tracking IDS over time."  
`[📸 Save snapshot]` button calls `POST /api/intelligence/snapshot` and refreshes history.

---

## The Moat Moment This Enables

Before this feature: IDS was a live number. Users saw "43/100 today."

After this feature: Users see "IDS was 12 when you started. It's 43 now. Last week it grew 8 points."

That's when the platform stops being a useful tool and starts being an irreplaceable record. The intelligence isn't just dense — it's provably growing. That's the moat made tangible across time.

---

## Storage Location

`data/intelligence_snapshots.jsonl` — same directory as `eval.jsonl`. Flat file, one JSON line per snapshot. No database. Consistent with Engineering Decision #3.
