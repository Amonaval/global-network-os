# Feature: Documentation Gap Intelligence

## What It Is

Documentation Gap Intelligence tracks every question your team asks that the system **cannot answer from your documentation** — clusters them by topic, prioritizes them by impact, and generates actionable recommendations including AI-drafted document outlines.

It answers questions like:
- "What topics are our users asking about that we haven't documented?"
- "Which gaps are trending — getting worse this week?"
- "Should I create a new doc or update an existing section?"
- "What should that missing doc actually say?"

---

## Where to Find It

**Gaps tab** (🔎) in the main navigation bar.

---

## How It Works

Every question asked in chat is logged to `data/eval.jsonl`. A question is marked as a **gap** (blocked) when:

1. **Confidence gate failure** — retrieved chunks scored too low (semantic similarity < 0.15 and RRF score < 0.014)
2. **LLM deflection** — chunks were retrieved but the LLM responded with "I cannot find this in the documentation" or similar phrases (soft-block)

When a question is blocked, the system also logs `nearMissSections` — the sections of chunks that were retrieved but failed the gate. This tells the intelligence layer *which section almost answered* the question, enabling `update_section` recommendations vs `create_doc` recommendations.

The Gaps panel calls `/api/gaps/intelligence` which computes prioritized, enriched clusters.

---

## What the Panel Shows

### KPI Row
| Metric | Meaning |
|---|---|
| Unanswered Queries | Total blocked queries across all time |
| Hard Blocked | Confidence gate failures (no relevant docs found) |
| Soft Deflections | LLM deflections (docs retrieved but not relevant enough) |
| Trending Topics | Gap clusters where ≥30% of occurrences are in the last 7 days |

### Recommended Actions Banner
- **"N docs to create"** — gaps where no related documentation exists
- **"N sections to update"** — gaps where a near-miss section was identified

### Prioritized Gap Cards (sorted by impact)

Each gap card shows:

| Field | Description |
|---|---|
| **Topic label** | Most significant keyword across all questions in the cluster |
| **↑ Trending** | Badge shown when the gap is getting worse recently |
| **Query count** | Total blocked queries on this topic |
| **Action recommendation** | 📝 Create new doc / ✏️ Update existing section / 🔍 Review coverage |
| **Near-miss sections** | Sections that were close but didn't answer (only when captured) |
| **First / Last seen** | Temporal spread of the gap |
| **7-day count** | How many in the last week |
| **Example questions** | Top 5 representative questions, with repeat count |
| **Generate Doc Outline** | On-demand LLM-generated document structure |

---

## Priority Score

Each cluster receives a priority score computed as:

```
priority = count × recencyWeight × trendingMultiplier

recencyWeight = max(0.1,  1 - daysSinceLastQuery / 30)
trendingMultiplier = 1.5 if trending else 1.0
```

A gap asked 5 times last week scores higher than one asked 20 times six months ago. Clusters are sorted by this score descending.

---

## Action Types

| Action | When assigned | What to do |
|---|---|---|
| `create_doc` | No near-miss sections AND average semScore < 0.1 | The topic is completely absent — write a new document from scratch |
| `update_section` | Near-miss sections are present | The topic is partially covered — expand or clarify the named section |
| `review_section` | Near-miss sections present, moderate scores | The docs exist but may be poorly worded — review and restructure |

---

## Generate Doc Outline

Each gap card has a **"✨ Generate Doc Outline"** button. Clicking it:

1. Sends the gap topic and sample questions to the LLM via `POST /api/gaps/outline`
2. The LLM generates a structured documentation plan:
   - Page title
   - One-paragraph summary
   - 3–6 sections, each with a heading and content hint
   - Estimated read time
3. The outline appears inline below the card, expandable/collapsible

This gives a team a ready-to-use documentation skeleton without having to write from scratch.

---

## Near-Miss Sections

Introduced alongside the intelligence endpoint. When a query fails the confidence gate, the system logs which sections were retrieved (but didn't pass) as `nearMissSections` in `eval.jsonl`. Example:

```json
{
  "ts": "2026-08-03T10:00:00Z",
  "question": "how do I configure the deployment pipeline?",
  "topSemScore": 0.08,
  "blocked": true,
  "nearMissSections": ["devops-runbook", "ci-cd-overview"]
}
```

Historical entries without `nearMissSections` still work — they get `actionType: create_doc` unless scores suggest otherwise.

---

## Example

A team has indexed architecture docs but not deployment runbooks. Users ask:

- "How do I deploy to production?" → blocked, nearMissSections: `[devops-runbook]`
- "What is the deployment checklist?" → blocked, nearMissSections: `[devops-runbook]`
- "How do I roll back a failed deployment?" → blocked, nearMissSections: `[]`
- "Where do I find the deployment scripts?" → blocked, nearMissSections: `[ci-cd-overview]`

**Gaps panel shows:**
```
#1  deployment  ·  4 queries  ↑ Trending
    ✏️ Update existing section: devops-runbook
    Near misses: devops-runbook, ci-cd-overview
    First: Aug 1, 2026 · Last: Aug 3, 2026 · 4 in last 7 days
    - how do i deploy to production?
    - what is the deployment checklist?
    - how do i roll back a failed deployment?
    - where do i find the deployment scripts?
    [✨ Generate Doc Outline]
```

Clicking Generate Doc Outline produces:
```
Title: Deployment Guide
Summary: Step-by-step instructions for deploying, rolling back, and monitoring services in production.
1. Prerequisites — required access, tools, environment setup
2. Deploying to Production — step-by-step deployment procedure
3. Rollback Procedure — how to revert a failed deployment
4. Deployment Scripts — where scripts live and how to use them
5. Monitoring After Deploy — what to watch, alert thresholds
~8 min read
```

---

## Soft-Block Detection

A subtle but important case: sometimes a question retrieves chunks (passes the confidence gate) but the LLM correctly recognizes they aren't relevant. Example:

> **Question:** "What is the temperature in Jalgaon today?"
> **What happened:** "temperature" matched LLM parameter docs. Chunks retrieved. LLM responded: "The documentation does not contain any information about current temperature in Jalgaon."
> **Result:** Logged as soft-blocked gap. Correctly captured.

The Gaps panel captures both retrieval failures and LLM reasoning failures.

---

## Limitations

### Keyword clustering is simple
Clusters group by the most-frequent keyword. "How do I deploy?" and "what is the CI/CD pipeline?" may land in different clusters even though they're about the same topic. Semantic clustering would fix this but adds complexity. v1 surfaces the pattern even split.

### Near-miss sections only for new queries
Entries logged before the `nearMissSections` enhancement have `sectionsUsed: []`. Action recommendations for old entries default to `create_doc` if scores are very low, `review_section` otherwise.

### Outline quality depends on the LLM model
Smaller models (qwen2.5:3b) produce usable outlines but may be generic. Claude API produces significantly better outlines.

---

## How to Act on Gaps

1. Open the Gaps tab
2. Review the Recommended Actions banner — it tells you at a glance how many docs to create vs sections to update
3. For each trending or high-priority card, read the example questions — they tell you exactly what users want to know
4. Click **Generate Doc Outline** to get a starting structure
5. Write the documentation using the outline as a scaffold
6. Re-ingest and verify the questions now get answered

---

## Related Features

- **Organizational Memory** (🧠) — shows what the org *keeps asking* (answered questions)
- **Documentation Health** (❤️) — scores each section and flags stale/unused sections
- **AI Documentation Reviewer** — reviews existing docs for quality, not just coverage gaps
- **Analytics** (📊) — overall answer rate, latency, top sections

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/gaps` | GET | Basic keyword-clustered blocked queries (legacy) |
| `/api/gaps/intelligence` | GET | Enriched clusters with priority, trending, action recommendations |
| `/api/gaps/outline` | POST | Generate doc outline for a gap topic |

`POST /api/gaps/outline` body:
```json
{ "topic": "deployment", "questions": ["how do I deploy?", "..."] }
```

Returns:
```json
{
  "topic": "deployment",
  "outline": {
    "title": "...",
    "summary": "...",
    "sections": [{ "heading": "...", "contentHint": "..." }],
    "estimatedReadMins": 8
  }
}
```

---

## eval.jsonl Schema (current)

```json
{
  "ts": "ISO timestamp",
  "question": "raw user question",
  "topSemScore": 0.0–1.0,
  "latencyMs": 12345,
  "blocked": true,
  "softBlocked": true,
  "sectionsUsed": ["section-slug"],
  "nearMissSections": ["section-slug"],
  "usedChunks": 3,
  "budgetUsed": 1200
}
```

`nearMissSections` is present only on blocked entries logged after the Session 17 enhancement. `usedChunks` and `budgetUsed` are present only on answered (non-blocked) entries.

---

## Mission Completion Assessment

*Claude's answers at time of shipping (Session 17). For future sessions revisiting this feature.*

**Did we solve the right problem?**
Yes. The v1 Gaps panel showed clusters but gave no guidance on what to do. Teams knew "deployment is a gap" but not whether to update an existing section or write a new doc. The intelligence layer answers that question directly and with evidence (nearMissSections).

**Is there a more transformative opportunity?**
Yes — automatic remediation: detect a gap, generate the outline, open a PR to the documentation repo. That's Phase 2. The current feature establishes the human-in-the-loop version, which is the right starting point for enterprise trust.

**Should the roadmap change?**
No. The next logical step remains Organization Memory and Engineering Decision Graph — both of which benefit from having higher-quality gap data flowing from this feature.

**What is the highest ROI next step?**
When the team has 200+ queries in eval.jsonl, revisit the clustering algorithm — keyword clustering will fragment related topics. Semantic cluster-merging (embedding the cluster labels and merging similar ones) would double the signal quality at low implementation cost.
