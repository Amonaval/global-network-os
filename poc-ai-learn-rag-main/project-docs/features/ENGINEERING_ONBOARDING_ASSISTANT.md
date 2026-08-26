# Feature: Engineering Onboarding Assistant

## What It Is

Given a role ("new backend engineer") and optional focus area ("authentication"), the Onboarding Assistant generates a personalized, ordered documentation reading list — from foundational to advanced — using the platform's accumulated usage intelligence.

It answers: *"What should I read first, given who I am and what I need to understand?"*

## Where to Find It

**Onboard tab** (🎓) in the main navigation bar.

## How It Works

1. You enter your role and an optional focus area
2. The system collects three signals already tracked by the platform:
   - **Section usage** — query counts from `eval.jsonl` (high-traffic = important)
   - **Organizational memory** — the most frequently asked topics across all answered queries
   - **Documentation gaps** — known unanswered question topics (flagged as warnings)
3. All section metadata + signals are sent to the LLM in a single call
4. The LLM generates an ordered path with priority, reasoning, and estimated read time per section
5. Results appear grouped into **Start Here / Read Next / Later**

## What a Learning Path Shows

Each section card includes:
- Section name
- **Why it's relevant** — one sentence specific to your stated role
- **Estimated read time** — 5–30 minutes
- **⚠️ Unvalidated** — if the section has no query history (never tested by the org)
- **→ Read** button — navigates to Chat with that section pre-selected as a filter

## Priority Groups

| Group | Meaning |
|---|---|
| 🟢 **Start Here** | Read in your first week — foundational for this role |
| 🔵 **Read Next** | Complete in your first month — important context |
| ⬜ **Later** | Useful but not urgent |

Sections the LLM judges irrelevant for your role are excluded from the display.

## Intelligence Signals Used

| Signal | Source | How It's Used |
|---|---|---|
| Query count per section | `eval.jsonl` | High-traffic sections → "start" priority |
| Recently active | `eval.jsonl` timestamps | Marks sections queried in last 14 days |
| Frequent topics | Answered query keywords | LLM context: what the org actually asks about |
| Gap topics | Blocked query keywords | LLM context: what the org can't find answers for |

## Technical Notes

- `POST /api/onboard` — body `{ role, topic? }`
- LLM call uses `maxTokens: 1800` to handle paths with 20+ sections
- JSON extraction uses the same robust fallback parser as Decision Graph (works with Qwen)
- "→ Read" button sets the section filter in Chat, so the user's first question is already scoped to the right content

## Limitations

- The LLM path is only as good as the section names — ambiguous section names ("docs-v2", "misc") produce generic reasoning
- With no eval.jsonl history (new deployment), all sections appear as "never queried" and the LLM falls back to role-based judgment alone — still useful, but less precise than on a deployed system
- The path is not saved between sessions — generate again to refresh with latest usage data

---

## Mission Completion Assessment

*Claude's answers at time of shipping. For future sessions revisiting this feature.*

**Is this actually solving the problem?**
Yes. Before this, a new team member had no way to know where to start — they either asked a colleague (interruption cost) or read everything (time cost). Now they get a role-specific ordered list in under 5 seconds. The "→ Read" button closes the loop: the assistant doesn't just tell them what to read, it navigates them there with the section pre-filtered.

**Is it enough?**
For v1, yes. The three-group structure (Start / Next / Later) is the right level of granularity — it matches how humans actually plan reading across a week and a month. What's deliberately deferred: saving paths between sessions (requires a user account system), marking sections as "read" (same), and generating quiz-style validation (out of scope for v1 — the product is a knowledge advisor, not an LMS).

**Does it really add value?**
Yes, with a strong ROI story: onboarding a new engineer has a real cost measured in senior engineer time. If this feature reduces the "what should I read?" interruption by half — even one per new hire — it pays for itself. The unvalidated warning (⚠️) also adds a layer of trust calibration: the path is honest about which sections have never been tested by the team.

**Is it readable and actionable at scale?**
Yes. The three-group structure keeps the panel scannable regardless of section count — a 50-section knowledge base produces a path that's still navigable. The → Read button makes each card immediately actionable, not just informational. One future improvement: if a user generates a path for "frontend engineer" and then "DevOps lead", it would be useful to compare them — a side-by-side or saved paths feature would serve teams onboarding multiple roles.
