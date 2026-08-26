# Feature: Documentation Health Score

## What It Is
A per-section composite score (0–100) that tells teams which parts of their documentation need attention — not from intuition, but from actual query usage data.

## How It Works
The score is computed from two signals already in `data/eval.jsonl`:

| Signal | Weight | Logic |
|---|---|---|
| Coverage | 40% | How often this section appears in answered queries, normalized against the most-used section |
| Recency | 60% | Days since the section last appeared in an answer — penalizes stale sections heavily |

**Score thresholds:**
- 80–100: Healthy — actively used, recently queried
- 50–79: Fair — used but declining, or infrequently queried
- 20–49: Needs Work — rarely used or not queried in 60+ days
- 0–19: Critical — never queried, or ignored by users entirely

**Important distinction:** Blocked queries (confidence gate rejections) do NOT have section attribution in `eval.jsonl`, so the health score only reflects sections that actually contributed to answered queries. Sections that are indexed but never make it into an answer score 0.

## API
`GET /api/health` — returns all sections sorted worst-first with score, queryCount, daysSinceLastHit, priority, and recommendation fields.

## Limitations
- Score 0 means "never contributed to an answer" — it does NOT necessarily mean the docs are bad. The section might be valid but not yet tested by users.
- The recency signal is based on query hits, not on when the documentation was last edited. A recently edited section still scores 0 if nobody has queried it.
- The coverage signal is relative — it measures share of traffic, not absolute query volume. A section in a low-traffic deployment scores the same as one in a high-traffic deployment if their relative share is equal.
- New deployments with few queries produce unreliable scores. Scores become meaningful after ~20 answered queries.

## Good Inputs / Expected Outputs
- A section queried 15 times in the last 7 days → score ~88 (Healthy)
- A section queried 3 times, last hit 45 days ago → score ~28 (Needs Work)
- A section that was indexed but never queried → score 0 (Critical)

## How to Act on It
See `SECTION_INTELLIGENCE_CONTROLS.md` for the action layer built on top of health scores.

---

## Mission Completion Assessment

*Claude's answers at time of shipping. For future sessions revisiting this feature.*

**Is this actually solving the problem?**
Yes. Before this, teams had no way to know which sections were carrying the load vs. which were invisible dead weight. The score gives a single number per section that correctly reflects usage reality — a section nobody queries scores 0, a section queried 15 times last week scores high. That is directly actionable without any additional interpretation.

**Is it enough?**
For v1, yes. The two signals (coverage + recency) give actionable output. The known missing signal is answer quality — `topSemScore` in `eval.jsonl` could reveal sections that get queried but consistently produce weak answers. That would differentiate "unused" from "used but unreliable," which are different problems requiring different actions. Adding a quality signal is the natural v2 extension.

**Does it really add value?**
Yes. The key evidence: sections with score 0 either (a) genuinely have no content worth querying, making them candidates for removal, or (b) haven't been tested yet, making them candidates for targeted queries to validate. Both are useful signals a team can act on immediately. Sections with score 80+ are the ones to protect in Section Intelligence Controls via boosting.

**Is it readable and actionable at scale?**
Yes at 10–50 sections. The "Needs Attention" sub-list prevents the worst-first sort from overwhelming users when there are 30+ sections — critical items appear first without requiring scrolling through everything. At 100+ sections, the sub-list could itself become long; a pagination or "show top 10 critical" cap would be needed. That is not a current customer problem. One future improvement: sections with fewer than 3 answered queries should show "Too new to score" rather than a low score — the score is misleading when based on minimal data.
