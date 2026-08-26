# Knowledge Risk Analysis

## What It Does

Detects fragile knowledge before teams lose it. Every indexed section is scored on three risk signals derived from `eval.jsonl` and the vector store. No LLM required.

## Risk Signals

| Signal | Trigger | Meaning |
|---|---|---|
| `dead_section` | queryCount = 0 | Section exists in the index but has never been used to answer a query. May be stale, irrelevant, or misconfigured. |
| `single_expert` | queryCount 1–4 AND uniqueTopics ≤ 2 | Only one or two people (or use-cases) ever hit this section. If that person leaves, the knowledge becomes invisible. |
| `single_point_of_failure` | sole answering section for ≥1 topic cluster | This section is the only place the org can get an answer on specific topics. No redundancy exists. |

## Risk Score

```
dead_section:            +0.50
single_expert:           +0.30
single_point_of_failure: +0.10 per SPOF topic, capped at +0.40
Total capped at 1.00
```

| Score | Level |
|---|---|
| ≥ 0.70 | critical |
| ≥ 0.40 | high |
| ≥ 0.20 | medium |
| < 0.20 | low |

## API

```
GET /api/knowledge/risk
```

Response:
```json
{
  "sections": [
    {
      "section": "engineering-runbooks",
      "chunkCount": 42,
      "riskScore": 0.8,
      "riskLevel": "critical",
      "signals": ["dead_section", "single_point_of_failure"],
      "queryCount": 0,
      "uniqueTopics": 0,
      "spofTopics": ["deployment", "rollback"],
      "recommendation": "No queries have ever hit this section..."
    }
  ],
  "totalSections": 8,
  "criticalCount": 1,
  "highCount": 2,
  "mediumCount": 3,
  "lowCount": 2,
  "computedAt": "2026-08-03T..."
}
```

## UI

New **⚠️ Risk** tab in the nav bar.

- 4 KPI tiles: Critical / High / Medium / Low counts
- Per-section cards sorted by risk score (highest first)
- Each card: section name, risk badge, score bar, signal chips, SPOF topic list, plain-English recommendation

## Implementation

- Backend: `src/api/server.js` — `GET /api/knowledge/risk`
- Frontend: `frontend/src/components/chat/KnowledgeRiskPanel.tsx`
- Hook: `useKnowledgeRisk(enabled)` in `frontend/src/hooks/useApi.ts`
- Types: `RiskSection`, `RiskData`, `RiskLevel`, `RiskSignal` in `frontend/src/types.ts`

## Design Notes

- Pure signal-based scoring — no LLM call, instant response
- `extractKeywords()` re-used from the gap intelligence path for topic clustering
- SPOF detection uses a two-pass approach: first build `topicSections` map (topic → Set of answering sections), then invert to find sections that are the sole answer for any topic
- Works on zero eval data: all sections default to `dead_section` risk if eval.jsonl is empty or missing
