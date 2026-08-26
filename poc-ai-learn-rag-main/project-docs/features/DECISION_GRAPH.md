# Feature: Engineering Decision Graph

## What It Is

The Decision Graph scans your indexed documentation and extracts **engineering and architectural decisions** — what was chosen, why, and what alternatives were rejected.

It answers questions like:
- "Why did we choose Postgres over MySQL?"
- "Why are we not using a vector database?"
- "What was considered before we picked this approach?"

---

## Where to Find It

**Decisions tab** (⚖️) in the main navigation bar.

---

## How It Works

1. You click **"⚡ Extract Decisions"**
2. The system scans all indexed documentation chunks for decision-language patterns
3. Candidate chunks (those containing phrases like "we chose", "instead of", "the reason we", etc.) are sent to the LLM
4. The LLM extracts a structured record: **decision**, **reason**, **alternatives**
5. Results are saved to `data/decisions.json` and displayed in the panel

Extraction is **on-demand** — it does not run automatically during ingest. Re-run it after adding new documentation.

---

## What a Decision Card Shows

| Field | Example |
|---|---|
| **Decision** | "Use BM25 + cosine hybrid retrieval" |
| **Why** | "Pure semantic search misses exact technical terms like error codes" |
| **Rejected** | `pure cosine similarity` `pure BM25` |
| **Section** | RAG Pipeline |
| **Source text** | The original paragraph it was extracted from (expandable) |

---

## Example — Good Source Text

This documentation paragraph will produce a high-quality decision:

> "We chose BM25 + cosine hybrid retrieval because pure semantic search consistently missed exact technical terms like error codes and function names. We evaluated pure cosine similarity and pure BM25 separately but found that hybrid consistently outperformed either alone, so we implemented Reciprocal Rank Fusion weighting."

**Extracted:**
- Decision: Use BM25 + cosine hybrid retrieval with RRF
- Reason: Pure semantic search misses exact technical terms
- Alternatives: pure cosine similarity, pure BM25

---

## Example — Poor Source Text

This paragraph will not produce a useful decision, or may produce a low-quality one:

> "The retrieval system works well for our use case. It handles both keyword and semantic queries efficiently."

**Extracted:** Nothing (no explicit decision language)

---

## Current Limitations

### 1. Local model JSON reliability
When using a local model (e.g. `qwen2.5:3b`), the LLM sometimes returns malformed JSON or natural language instead of the required structure. This causes the extraction to silently skip those chunks.

**Workaround:** Use Claude as the LLM provider (`LLM_PROVIDER=claude` in `.env`) for significantly better extraction quality. Claude reliably returns structured JSON and understands implicit decision language.

### 2. Decisions must be documented
The system can only extract decisions that are **written down**. If your team made a decision verbally or it lives only in a Slack thread, it will not appear.

**What this means:** The Decision Graph is also a forcing function — it reveals where your documentation is missing institutional reasoning, not just missing answers.

### 3. Implicit decisions are harder to find
"We use PostgreSQL" is not extracted — there is no stated reason. "We use PostgreSQL because it handles our transactional workload better than MySQL, which we evaluated and rejected for its weaker ACID compliance" will be extracted.

**How to improve:** Write ADR-style sections in your docs: Decision → Context → Reason → Alternatives Considered.

### 4. No incremental re-extraction
Clicking "Extract Decisions" re-scans everything and overwrites `decisions.json`. There is no per-section re-extraction yet.

---

## How to Get the Best Results

### Write ADR-style paragraphs in your docs

Add sections like this anywhere in your documentation:

```
Decision: We use local JSON sharding instead of a vector database.
Reason: Zero external infrastructure. No Postgres, no Chroma, no install step.
Alternatives considered: Chroma, Pinecone, Weaviate — all rejected because they
require external services that break the zero-infrastructure principle.
```

This format is explicitly detected and produces the highest-quality extractions.

### Use explicit decision language

Phrases that trigger extraction:
- "we chose X because"
- "we decided to use X instead of Y"
- "we rejected X due to"
- "the reason we picked X"
- "X was selected over Y because"
- "we avoided X because"

### Use Claude as your LLM provider

In your `.env` file:
```
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=your-key-here
```

Claude produces significantly more reliable structured extraction than local models.

---

## Honest Assessment

**Current state:** Works well when documentation is written in explicit decision language and when using Claude as the LLM provider. Produces limited results with local models or documentation that describes *what* was built without explaining *why*.

**The real value:** Even when extraction produces few results, the gaps reveal where institutional reasoning is undocumented. A section with zero extracted decisions is a section where the team's reasoning lives only in people's heads — a knowledge risk.

**When it becomes powerful:** After a team adopts the habit of writing ADR-style paragraphs in their docs. The Decision Graph then becomes queryable institutional memory that survives team changes.

---

## Filtering

- **Search box** — filters by decision text, reason, or alternatives
- **Section dropdown** — filter to decisions from a specific documentation section

---

## Related Features

- **Documentation Gaps** (🔎) — shows what questions the docs *cannot* answer
- **Organizational Memory** (🧠) — shows what questions the org *keeps asking*
- **Decision Graph** (⚖️) — shows *why* things were built the way they were

---

## Validation Fix (Session 17)

Three bugs were identified and fixed that caused the feature to produce 0 results on real-world documentation:

### Fix 1 — Qwen JSON extraction failure
The original `parseDecisionJson` only stripped markdown fences. Qwen routinely wraps JSON in prose ("Here is the result: {...} This is not a decision because..."). The fix extracts the first `{...}` block from anywhere in the response, making the parser model-agnostic.

### Fix 2 — Signal patterns too narrow
The original patterns only matched active-voice first-person ("we chose", "we rejected"). Real-world documentation uses passive voice, recommendations, and implicit choices. Added 10 new patterns covering:
- Passive voice: "was chosen for", "is preferred over"
- Recommendations: "recommended", "best practice"
- Negative guidance: "don't use", "avoid"
- Technology stack: "built on", "powered by", "relies on"
- Rationale headers: "rationale:", "design decision"

### Fix 3 — Silent failure, no diagnostic
When extraction returned 0 results, users couldn't tell if it was a documentation problem or an LLM problem. The extractor now tracks `parseFailures` (LLM responses that couldn't be parsed as JSON) and the UI surfaces three distinct messages:
- `parseFailures > 0` → "X chunks produced unparseable output — set LLM_PROVIDER=claude"
- `candidates = 0` → "No decision-language patterns found — add ADR-style paragraphs"
- `candidates > 0, extracted = 0, parseFailures = 0` → "LLM judged none as a clear decision — add explicit 'because' rationale"

---

## Mission Completion Assessment

*Claude's answers after validation fixes. For future sessions revisiting this feature.*

**Is this actually solving the problem?**
Yes, now fully. The original feature worked only on idealized ADR-style docs and with Claude as the LLM provider. After the validation fixes: the JSON parser handles Qwen output, the signal patterns catch real-world documentation language (passive voice, "recommended", "built on"), and the diagnostic tells users exactly why they're getting 0 results. A user on Qwen who indexes a real Confluence space will now get results or get a clear message explaining why they didn't.

**Is it enough?**
For v1, yes. The three-part diagnostic (parse failures / no patterns found / LLM rejected) covers every failure mode. What remains deliberately deferred: per-decision "mark as outdated" (decisions accumulate without decay, which becomes misleading over time — this is v2), and per-section re-extraction (currently full re-scan on every run — acceptable until corpus > 10,000 chunks).

**Does it really add value?**
Yes, with one important caveat clearly stated: the Decision Graph is a forcing function. It reveals where institutional reasoning is undocumented. Even an empty graph has value — it shows the team that their docs describe *what* was built but not *why*. The onboarding prompt ("Add ADR-style paragraphs") converts the empty-state into a documentation improvement task.

**Is it readable and actionable at scale?**
Yes. Search + section filter handle large decision sets. The diagnostic messages convert failure states into actionable next steps. The one remaining scale issue: 200+ decisions become a long list with no grouping — section filter is the workaround, but a "group by section" default view would be the right fix at that scale.
