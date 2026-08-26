# Plan: Next Direction + Session Navigation

## Context
Two questions from the user:
1. What is the best next product move?
2. Should we create an .md file to help Claude navigate to the next direction at session start?

---

## Answer 1: Best Next Product Move

**Documentation Gap Intelligence** — the highest ROI next step.

### Why now
`eval.js --blocked` already surfaces unanswered questions from `data/eval.jsonl`.
Every query that hit the confidence gate and failed is stored there.
The data exists. The pipeline exists. The gap is: nothing surfaces this to the user.

### What it delivers
- "These are the 10 questions your users asked that your docs can't answer" — shown in UI
- Recurring blocked queries → ranked documentation gaps
- Zero new infrastructure: reuses eval.js, existing analytics, existing UI

### Why this matters strategically
It moves the product from:
> "Ask questions, get answers"

to:
> "Here is what your organization doesn't know"

That is the beginning of organizational intelligence — the core of the Engineering Intelligence Platform vision.

### What to build (minimal)
1. New API endpoint: `GET /api/gaps` — reads eval.jsonl, groups blocked queries by similarity, returns ranked gaps
2. New UI tab: "Documentation Gaps" — shows top unanswered questions with frequency
3. (Optional) Suggest which Confluence space / section the missing content should live in

### What NOT to build yet
- Auto-generating documentation (too early — premature automation)
- Health scores (complex to define, validate, and present — separate mission)
- Knowledge graph (large lift, architectural — separate mission)

---

## Answer 2: Session Navigation File

**Short answer: Don't create a new file. Use what exists.**

### The system already solves this
CLAUDE.md Stage 2 loads `.product/04_NEXT_MISSION.md` on EVERY conversation automatically.
If `04_NEXT_MISSION.md` has the right content, Claude arrives oriented — no "read xyz" needed.

### The actual gap
`04_NEXT_MISSION.md` has a 5-line template.
`05_WORK_QUEUE.md` is empty.

If these two files are filled, any new conversation starts with Claude already knowing:
- What we're building (NEXT_MISSION)
- What the specific work items are (WORK_QUEUE → NOW slot)

### If you still want a shortcut command
One option: enrich `04_NEXT_MISSION.md` so well that you can open Claude and type:
> *"Read CLAUDE.md, load Stage 1 and 2, then start building"*

That's the pattern. No extra file needed.

---

## Execution Plan

### Step 1 — Fill `04_NEXT_MISSION.md`
Replace template with: goal, why now, exact deliverables, what to reuse, success metric.

### Step 2 — Fill `05_WORK_QUEUE.md`
NOW: Documentation Gap Intelligence (with exact deliverables)
NEXT: Organization Memory, Engineering Decision Graph
LATER: Documentation Health Score, AI Documentation Reviewer

### No new files needed
The OS is complete. Content was missing. Two files fill the gap.

---

## Verification
After execution: start a fresh Claude conversation, say "read CLAUDE.md and tell me what we're building."
Claude should respond with Documentation Gap Intelligence without any additional prompting.
