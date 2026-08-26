# Feature: Section Intelligence Controls

## What It Is
An action layer on top of the Documentation Health Score that lets users act on health signals — and lets the system act on them automatically through retrieval priority multipliers.

## The Two Loops This Closes

**Intelligence loop** (existed before): `eval.jsonl → health score → insight`

**Action loop** (this feature): `health score → recommended action → user approves → system changes retrieval behavior`

## User Actions (Health Panel)

### ⬆️ Boost
Marks a section as high-priority. The retrieval layer applies a **1.3× score multiplier** to all chunks from this section before ranking. Boosted sections appear earlier in context and are more likely to influence answers.

**When to use:** Core docs that should always be referenced. Sections your team queries constantly but whose answers feel thin.

**Effect on confidence gate:** A section that was borderline (semScore ~0.12) can now pass the 0.15 gate after boosting (0.12 × 1.3 = 0.156). This is intentional — boosting means "I trust this content, lower the bar slightly."

### 👁️ Ignore
Marks a section as low-priority. The retrieval layer applies a **0.4× score multiplier**. Ignored sections still stay in the index but rarely appear in answers unless no better source exists.

**When to use:** Sections you know are outdated, duplicated, or low quality but you're not ready to delete yet. Staging/test content that accidentally got indexed.

**Effect on confidence gate:** An ignored section with semScore 0.3 becomes 0.12 — below the gate. Queries primarily about this section will start returning "I couldn't find this." This is expected — fix the docs or remove the section.

### ↩ Reset
Returns a section to normal priority. No multiplier applied.

### 🗑️ Remove
Permanently deletes all chunks for this section from the vector index. Requires confirmation. The section file (`data/vectors_<section>.json`) is deleted and the section disappears from all panels.

**Cannot be undone without re-ingesting** the source documentation.

## System Recommendations (Auto-Suggestions)

The health endpoint generates two types of recommendations automatically:

| Recommendation | Trigger | Suggested Action |
|---|---|---|
| `consider-removing` | Section has 0 queries ever AND priority is normal | Remove from index |
| `consider-boosting` | Section has ≥60% of max query traffic AND priority is normal | Boost |

Recommendations appear as a dedicated card at the top of the Health panel. Users can act on them or dismiss them.

## Data Storage
Section priorities are stored in `data/section_config.json` — a simple key-value file keyed by section slug. This file is read on every query, so priority changes take effect immediately without restart.

```json
{
  "getting-started": { "priority": "boost", "updatedAt": "2026-08-01T..." },
  "legacy-v1-api":   { "priority": "ignore", "updatedAt": "2026-08-01T..." }
}
```

## API
- `GET /api/health` — all sections with score + priority + recommendation
- `PATCH /api/health/section/:section` — body: `{ "priority": "boost" | "ignore" | "normal" }`
- `DELETE /api/health/section/:section` — remove from index + config

## Limitations
- Retrieval multipliers affect all queries globally — there is no per-user or per-session priority.
- Removed sections cannot be restored from within the app. The user must re-run the ingestion pipeline for that source.
- Boosting cannot make a section answer questions it doesn't contain. The multiplier improves rank, not relevance.

---

## Mission Completion Assessment

*Claude's answers at time of shipping. For future sessions revisiting this feature.*

**Is this actually solving the problem?**
Yes. The Health panel was a report with no action path — users could see a section scoring 8 but had no way to act on that from within the app. Now they can remove dead sections in one click, boost core docs, and the system immediately applies those preferences on the next query. The intelligence-to-action gap is closed. The retrieval multipliers are not cosmetic — a boosted section that was borderline-blocked at semScore 0.12 now passes the confidence gate at 0.156, producing real answers instead of "I couldn't find this."

**Is it enough?**
Yes for v1. The three actions (boost/ignore/remove) cover the main use cases. What is deliberately deferred: per-user priorities (belongs in a paid tier), automatic boosting without user approval (violates the trust model — the system should recommend, humans should decide), and bulk actions across all sections at once (useful but not critical for the first release). The auto-recommendation cards cover the most common automation users want without removing their judgment.

**Does it really add value?**
Yes, with two measurable effects. First, removing unused sections immediately reduces index noise — queries that previously retrieved irrelevant chunks from dead sections will now retrieve better content. Second, boosting high-traffic sections improves answer density — more chunks from the most-relied-upon section enter the context window, producing more complete answers. Both effects are observable on the next query after the action, with no restart required.

**Is it readable and actionable at scale?**
Yes. The System Recommendations section at the top means users don't need to scroll — the two highest-ROI actions (remove unused, boost high-traffic) are surfaced automatically. At 50+ sections with many recommendations, the recommendations list could itself become overwhelming. A cap of 5 recommendations shown at a time would be the right fix. The confirm modal for destructive remove is appropriately placed — visible enough to prevent accidents, unobtrusive enough not to slow down confident users.
