# Engineering Insights

## What It Does

A four-dimension knowledge quality dashboard computed entirely from `eval.jsonl`. No LLM required — instant, deterministic, zero cost.

Answers: *What are teams searching for? Where does knowledge fail? Which sections are getting better or worse? What gaps keep coming back?*

## Dimensions

### 1. Top Searched Topics
Keyword frequency across all queries (answered + blocked). Each topic shows:
- Total count
- This week vs last week count
- Trending flag (this week > last week)

### 2. Pain Areas
Sections with high query volume but low success rate. A "failure" is a near-miss: the section was retrieved by the retrieval pipeline but the answer was blocked by the confidence gate (captured in `nearMissSections` field of eval.jsonl).

Formula: `painScore = 1 - (answered / (answered + nearMisses))`

### 3. Section Quality Trend
Per-section answer rate comparison: last 30 days vs prior 30 days.

| Trend | Condition |
|---|---|
| improving | recentRate - priorRate > 0.10 |
| declining | recentRate - priorRate < -0.10 |
| stable | delta within ±0.10 |
| new | no prior window data |

Sections sorted: declining first (highest urgency).

### 4. Recurring Gaps
Blocked query clusters with ≥2 hits. Priority = `count × (1 + recentCount)`. Shows topic, frequency, recent count (last 30 days), and last-seen date. These are direct documentation priorities.

## API

```
GET /api/insights
```

Response:
```json
{
  "topTopics":    [{ "topic": "auth", "count": 12, "thisWeek": 5, "lastWeek": 3, "trending": true }],
  "painAreas":    [{ "section": "runbooks", "totalQueries": 14, "successRate": 0.43, "painScore": 0.57 }],
  "qualityTrend": [{ "section": "runbooks", "recentRate": 0.43, "priorRate": 0.71, "delta": -0.28, "trend": "declining" }],
  "recurringGaps": [{ "topic": "deployment", "count": 8, "recentCount": 3, "priority": 32 }],
  "totalQueries": 150,
  "totalAnswered": 127,
  "overallSuccessRate": 0.85,
  "computedAt": "..."
}
```

## UI

New **📈 Insights** tab in the nav bar.

- 3 KPI tiles: Total Queries / Answered / Success Rate (colour-coded green/amber/red)
- Top Topics section: horizontal bar chart with trending badges
- Recurring Gaps section: frequency chips, last-seen date
- Pain Areas section: split success/failure bar per section
- Section Quality Trend section: trend badge per section with rate delta

## Implementation

- Backend: `src/api/server.js` — `GET /api/insights`
- Frontend: `frontend/src/components/chat/InsightsPanel.tsx`
- Hook: `useInsights(enabled)` in `frontend/src/hooks/useApi.ts`
- Types: `InsightsData`, `InsightsTopic`, `InsightsPainArea`, `InsightsQualityTrend`, `InsightsGap` in `frontend/src/types.ts`

## Verified Output (test data)

- 25 queries, 23 answered, 92% success rate
- 10 distinct topics extracted
- 2 pain areas (web-pages, uploads — both 100% success in test data)
- 4 quality-trend sections (all "new" — no prior window yet)
- 0 recurring gaps (all test queries answered)
