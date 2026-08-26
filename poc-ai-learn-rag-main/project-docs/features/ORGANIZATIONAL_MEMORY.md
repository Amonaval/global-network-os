# Feature: Organizational Memory

Organizational Memory has two layers:

1. **Memory Panel** (🧠) — recurring query patterns: topics your team asks about repeatedly
2. **Knowledge Map** (🗺️) — cross-source synthesis: what the org knows about any topic across all sources

---

## Layer 1: Memory Panel (🧠)

### What It Is

Surfaces topics your team **repeatedly asks about** in chat — not one-off questions, but recurring knowledge needs.

Answers: "What subjects does our team rely on most?" and "What is trending right now?"

### How It Works

Every answered query lands in `data/eval.jsonl`. The Memory panel clusters answered questions by keyword with three filters:

1. **Minimum threshold** — a topic must be asked 3+ times to appear (one-offs are noise)
2. **Recency weighting** — asks in the last 30 days count twice as much
3. **Hard cap** — maximum 15 topics, sorted by momentum score

### What a Memory Card Shows

| Field | Meaning |
|---|---|
| Topic label | Most frequent keyword across clustered questions |
| Total / this month | Total asks vs. asks in last 30 days |
| ↑ Trending | 50%+ of asks in the last 30 days |
| Answered by | Sections that handled the questions |
| Example questions | Top 5 representative questions |

### How to Act on Memory

- **High-count topics:** Keep those sections up to date — they carry real user load
- **Trending topics:** Someone is actively struggling now — prioritize improving those docs
- **Single-section topics:** That section is a single point of failure — consider expanding it

---

## Layer 2: Knowledge Map (🗺️)

### What It Is

A cross-source knowledge synthesis panel. You search any topic and see what the organization knows about it across **all four knowledge dimensions simultaneously**:

| Dimension | Source | Answers |
|---|---|---|
| 📚 Documentation Coverage | Vector store search | What sections cover this topic, how many chunks, relevance scores |
| ⚖️ Engineering Decisions | Decisions store | Why things were built this way — architectural reasoning |
| 🧠 Query Memory | eval.jsonl answered queries | How often this comes up, who answered it, if it's trending |
| 🔎 Known Gaps | eval.jsonl blocked queries | What remains unanswered about this topic |

This directly answers the product vision: **WHY, not just WHAT**.

---

### How to Use

1. Open the Knowledge Map tab (🗺️)
2. Type any topic in the search box — e.g. `authentication`, `deployment`, `API rate limits`
3. Press Enter or click Search
4. All four dimensions load in parallel
5. Optionally click **✨ Generate Summary** — LLM produces a 2–3 sentence synthesis of the org's current knowledge state on the topic

### Example

Search: `authentication`

```
📚 Documentation Coverage (3 sections)
  auth-setup       · 12 chunks · score 0.82
  getting-started  · 5 chunks  · score 0.71
  api-reference    · 3 chunks  · score 0.54

⚖️ Engineering Decisions (2)
  "We chose OAuth 2.0 over API keys for user-facing auth"
    Why: API keys don't support per-user revocation without reissue
  "Sessions expire after 8 hours for compliance"
    Why: SOC2 requirement for idle session timeout

🧠 Query Memory
  14 total · 6 this month · ↑ Trending
  Answered by: auth-setup · getting-started
  "how does authentication work?"
  "what auth methods are supported?"

🔎 Known Gaps
  3 unanswered questions related to "oauth"
  "how do i configure SSO with Okta?"
  "can i use service accounts?"
```

✨ Generated Summary:
> "Authentication is well-documented in auth-setup and getting-started, covering OAuth 2.0 flows and session management. The decision to use OAuth over API keys is captured with compliance reasoning. A gap exists around SSO integration with external identity providers — 3 users asked and got no answer."

---

### API Reference

| Endpoint | Method | Description |
|---|---|---|
| `GET /api/knowledge/map?q=topic` | GET | Cross-source knowledge context for a topic |
| `POST /api/knowledge/summary` | POST | LLM-generated org knowledge summary |

`GET /api/knowledge/map?q=authentication` returns:
```json
{
  "topic": "authentication",
  "docSections": [
    { "section": "auth-setup", "chunkCount": 12, "topScore": 0.82, "sampleTitles": ["..."] }
  ],
  "relatedDecisions": [
    { "id": "...", "decision": "We chose OAuth 2.0...", "reason": "...", "section": "..." }
  ],
  "memoryCluster": {
    "label": "authentication", "count": 14, "recentCount": 6,
    "trending": true, "topSections": ["auth-setup"], "questions": [...]
  },
  "gapCluster": {
    "label": "oauth", "count": 3, "questions": [...]
  }
}
```

`POST /api/knowledge/summary` body: the full `KnowledgeMapData` object. Returns `{ topic, summary }`.

---

## Relationship Between Memory, Knowledge Map, and Gaps

| Panel | Question it answers | Signal source |
|---|---|---|
| 🧠 Memory | What does our team keep asking? | Answered queries |
| 🗺️ Knowledge Map | What does the org KNOW about X? | All sources combined |
| 🔎 Gaps | What can't we answer? | Blocked queries |
| ❤️ Health | Which sections are stale or unused? | Section-level analytics |
| ⚖️ Decisions | Why was X built this way? | Extracted decisions |

The Knowledge Map is the synthesis layer — it aggregates Memory, Gaps, Decisions, and the vector store into one view per topic.

---

## Limitations

### Requires indexed content to be useful
The vector search behind Documentation Coverage only finds content that has been ingested. A newly deployed instance with no content will show empty doc sections.

### Memory and gap clusters are keyword-based
The memory/gap matching in Knowledge Map uses the same keyword clustering as the individual panels — semantic equivalence is not detected. "OAuth flow" and "authentication process" may not cluster together.

### Decisions require prior extraction
The Decisions dimension only shows results if `/api/decisions/extract` has been run. If the decisions store is empty, this dimension always shows "No related decisions found."

### LLM summary quality depends on model
Small models (qwen2.5:3b) produce workable summaries. Claude API produces substantially better synthesis. The summary is optional — the four-dimension view is fully usable without it.

---

## Mission Completion Assessment

*Claude's answers at time of shipping (Session 17). For future sessions revisiting this feature.*

**Did we solve the right problem?**
Yes. The original Memory panel answered "what keeps coming up." The Knowledge Map answers a harder question: "what does the organization actually know about X, and where are the gaps?" That second question is what engineering leaders actually need — not query stats, but a knowledge audit on demand.

**Is there a more transformative opportunity?**
Yes — proactive alerts. The Knowledge Map currently requires the user to search. The next step is the system proactively surfacing: "authentication is trending and has 3 unanswered questions — here's the gap." That turns the map from a lookup tool into an active advisor.

**Should the roadmap change?**
No. Engineering Decision Graph is the right next priority — it feeds better data into the Knowledge Map's Decisions dimension, making it more useful. The more decisions are extracted, the richer the WHY layer becomes.

**What is the highest ROI next step?**
Auto-suggest searches. When a user opens the Knowledge Map, show the top 3 trending memory topics as clickable suggestions. This removes the blank-page problem and immediately demonstrates value to new users, at near-zero implementation cost.
