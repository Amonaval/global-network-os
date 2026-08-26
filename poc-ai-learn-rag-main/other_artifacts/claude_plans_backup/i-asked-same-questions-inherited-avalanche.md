# Plan: Strategic Document Overhaul — Vertical Depth, Not Horizontal Breadth

> Prior plan (code gen fix) is fully complete. This plan replaces it.

---

## Context

The Founder's Compass (`.company/08_FOUNDERS_COMPASS.md`) was written this session, crystallizing a key strategic insight: we are building two products simultaneously — an Engineering Intelligence Layer (our MOAT, no competitor owns this category) and a Code Generation tool (Cursor/GitHub Copilot territory we cannot win). The directive is clear: go vertically deep on intelligence, not horizontally wide on features.

The problem: nearly every `.company/` and `.product/` document was written before this clarity existed. They contain:
- Generic principles with no competitor guardrails
- Aspirational customer numbers pretending to be goals
- False "completed" entries (first paying customer, cloud trial, VS Code Marketplace publish)
- Stale work queues and backlogs that describe done work as current work
- No "vertical depth before horizontal breadth" principle anywhere
- A Product Brain that still says "Current Stage: Strong RAG foundation"

This plan rewrites every applicable document to encode the new strategic clarity, fix factual accuracy, and make the document system a genuine operating instrument — not a historical record.

---

## Guiding Principle for All Changes

Every document must now pass this test:
> "If Claude reads only this document at the start of a session, will it know (a) what category we own and defend, (b) what category we explicitly do not compete in, (c) what stage the founder is in, and (d) whether the next proposed action deepens vertical strength or adds horizontal breadth?"

---

## Tier 1 — Structural/Directional (high impact, wrong without these)

### `.company/00_COMPANY_CONSTITUTION.md`

**Problem:** No principle about vertical depth vs. horizontal breadth. No stage-awareness. The constitution feels like a generic startup playbook, not a specific mandate for this company.

**Add these 3 principles at the end:**
```
## Vertical depth before horizontal breadth.
One capability that engineers depend on daily is worth more than ten capabilities
they occasionally use. Deepen before expanding. Irreplaceability in one category
beats partial coverage across five.

## Validate before you expand.
No new capability category until the previous one is genuinely irreplaceable in
daily use. The right to build the next thing is earned by making the last thing
indispensable.

## We do not win by competing. We win by owning.
There are categories where we are the only serious player (engineering organizational
memory). There are categories where we are not even in the race (code generation
quality, IDE integration, real-time collaboration). Never confuse the two.
```

---

### `.company/07_KILL_LIST.md`

**Problem:** Too generic. "Feature factory," "micro optimizations," "over-engineering" are things any startup avoids. This list has no Knowledge Hub-specific guardrails. It doesn't name the competitors we must not chase or the failure modes specific to our situation.

**Full rewrite:**
```
# Kill List

Things we intentionally never build or pursue.

## Competitor categories we do not enter

Code generation quality improvements to compete with Cursor, GitHub Copilot, or Windsurf.
IDE-native integration (inline suggestions, refactor menus, multi-file edit).
Real-time collaboration features (Notion, Linear, GitHub own this).
General document search (Glean, Notion AI, Confluence AI own this).
Project management or issue tracking.

## Founder-stage anti-patterns

Features imagined for customers who do not yet exist.
Cloud infrastructure before local-first is proven irreplaceable.
Monetization pressure before daily irreplaceability is demonstrated.
Building for scale (100k users) before building for depth (10 users who can't live without it).
Horizontal breadth before vertical depth is validated.

## Engineering anti-patterns

Feature factory — shipping features without validating the previous feature is used.
Micro optimizations on non-bottlenecks.
Framework chasing.
Architecture astronautics.
Premature scaling.
Cloud dependency.
Complex abstractions solving problems that don't exist yet.
Large rewrites.
Over-engineering.
Perfection before validation.

Everything should be questioned before implementation.
If it's on this list, the answer is no.
```

---

### `.company/02_EXECUTIVE_COUNCIL.md`

**Problem:** Council questions are generic ("Is this moving us toward a billion-dollar product?"). They don't encode our specific category ownership, stage, or competitive guardrails. CEO question should force the vertical/horizontal distinction.

**Rewrite the council questions:**
```
# Executive Council

You are NOT a coding assistant.
You are the executive leadership team of this company.
Every recommendation must pass through these perspectives.

## CEO
Does this deepen our vertical advantage in engineering organizational intelligence,
or does it add horizontal breadth in a category an established player already dominates?

## CTO
Does this architecture decision strengthen the intelligence layer that compounds over time,
or does it add infrastructure for a use case that isn't our core differentiation?

## Chief Product Officer
If this feature disappeared tomorrow, would the engineer who uses Knowledge Hub daily
notice its absence? Or is it something they'd discover eventually and sometimes use?

## Principal Engineer
Can we build this incrementally and validate at each step, or are we committing to
infrastructure before proving the use case?

## Chief of Staff
Is this the highest ROI use of the next 40 hours? What does not get built if we build this?
Is the previous capability genuinely irreplaceable before we add this one?

## Investor
Does this deepen the switching cost (intelligence that cannot be reconstructed), or does
it add a feature that a competitor could ship in a sprint?

## Customer
Would I pay an extra $50/month specifically because this feature exists? Or would I pay
for the platform and use this as a bonus?

---

## Where We Win
Engineering organizational memory: query history, decision archaeology, gap evolution,
risk history, health trending, proactive staleness detection. Accumulated, private, compounding.

## Where We Do Not Compete
Code generation quality. IDE integration. Real-time collaboration. General document search.

---

Never optimize one module while a larger opportunity exists.
Always challenge the current mission.
Sometimes the correct recommendation is: "Do not build this."
```

---

### `.company/03_CLAUDE_RULES.md`

**Problem:** No stage-awareness (Claude doesn't know we're in Stage 1 — Irreplaceability). No "where we don't compete" check built in. No vertical depth rule.

**Add to the end of the rules list:**
```
- Current founder stage: Stage 1 — Irreplaceability. Do not propose features for Stage 3-4 scale until Stage 1 is proven through daily irreplaceable use by the builder.
- Vertical depth before horizontal breadth. One intelligence signal that is deeply trusted beats five signals that are occasionally consulted.
- Before proposing any code generation, IDE-like, or real-time feature: check Founders Compass "Where we do not compete" section. If it's there, the answer is no.
- Before proposing any new capability category: ask whether the previous capability has been validated as irreplaceable in daily use. If not, deepen it first.
```

---

### `.company/04_DECISION_FRAMEWORK.md`

**Problem:** Only 5 priorities and a generic reject list. Missing the irreplaceability gate and the vertical/horizontal filter.

**Rewrite:**
```
# Decision Framework

Priority:
1 Customer Value (does an engineer depend on this daily?)
2 Competitive Moat (does this deepen intelligence that cannot be reconstructed?)
3 Irreplaceability (would removing this cause pain?)
4 Simplicity
5 Maintainability
6 Performance

Reject:
- Rewrites
- Hype frameworks
- Feature bloat
- Anything on the Kill List
- Horizontal breadth before vertical depth is validated
- New capability before previous capability is irreplaceable

MOAT filter — before any new capability ask:
Does this compound in the intelligence layer (yes → build),
or does it stand alone as a feature (no → defer or reject)?
```

---

## Tier 2 — Accuracy Fixes (documents contain false information)

### `.product/06_PROGRESS.md`

**Problem:** Three entries marked ✔ Completed that are not actually done:
1. `✔ First paying customer — onboarded; IDS compounding has begun.`
2. `✔ Cloud-hosted trial instance — provisioned, accessible to prospects.`
3. `✔ VS Code Extension v1 — ... published to VS Code Marketplace.` (should be "built and ready, publish deferred")

**Fix:** Remove items 1 and 2 entirely from the Completed list. Item 3 should read: `✔ VS Code Extension v1 — sidebar chat, Ask about selection, configurable server URL; built and ready to package. vsce publish deferred to user decision.`

Add these to the bottom as a new section:
```
## Not Yet Started — Pending Stage 1 Validation

- Cloud-hosted trial instance (requires infra provisioning)
- VS Code Marketplace publish (requires vsce publish decision)
- First paying customer outreach (requires Stage 1 irreplaceability validation)
```

---

### `.product/03_CURRENT_STATE.md`

**Problem:** Same false entries appear in "What's Missing Before First Paying Customer" section but items 1-3 are crossed out as done, including false items. The Distribution section in Completed lists "published to VS Code Marketplace" which is false.

**Fix:** In the Distribution section under Completed, change the VS Code entry to "built and ready, vsce publish deferred." In "What's Missing" section, un-strike items that aren't actually done (cloud-hosted option, first paying customer outreach).

---

### `.product/05_WORK_QUEUE.md`

**Problem:** Completely stale. NOW says "Multi-user / Team Mode" which shipped weeks ago. NEXT and LATER contain shipped items. ICEBOX contains items that are now active.

**Full rewrite:**
```
# Work Queue

*Last updated: 2026-08-06*

---

## STAGE GATE (Before ANY new feature)

Use the product every day on your own engineering work. Can you answer yes to:
- Do I open Knowledge Hub before starting an engineering session?
- Would I notice if it was gone tomorrow?
- Is there one intelligence signal I genuinely rely on?

If not — the next action is not a new feature. It is daily use until the answer is yes.

---

## NOW — Engineering Copilot Phase 1

**Implementation Plan Generator** — before writing any code, Knowledge Hub generates
a structured plan: which files change, what patterns exist, what can be reused, what risks
apply. The platform participates in engineering sessions, not just answers queries.

This is validated by: builder opens KH before every coding session and uses the plan.

---

## NEXT — Intelligence Depth Before New Features

Before Engineering Copilot Phase 2 or any new capability, validate that Phase 1 is
genuinely used daily. If yes, proceed. If no, iterate on Phase 1 until it is.

Candidates for depth work (not new features):
- Gap intelligence: make recommendations more specific and actionable
- Decision archaeology: surface decisions relevant to current work automatically
- Health scoring: make the per-section score explanation clearer and more trusted

---

## LATER — Code Intelligence Engine Phase 1

Repository Understanding Layer: symbol index, import/dependency graph, architecture
classification. Primary value: deepens ALL intelligence signals (better staleness detection,
better gap analysis, architecture-aware documentation scoring). Secondary value: better
code generation grounding.

Build only after Engineering Copilot Phase 1 is validated as irreplaceable.

---

## ICEBOX

- Engineering Copilot Phase 2 (PR Summary Generator)
- Engineering Copilot Phase 3 (Session Kickoff Mode)
- Slack Integration
- Cloud-Hosted Option
- Public API
- org.fingerprint.json

---

## COMPLETED (recent)

- Multi-user / Team Mode
- Team IDS
- Health Trend Over Time
- Autonomous Documentation Maintenance (Phase 1 + Phase 2)
- Code Generation grounding fix (file inventory, compressContext, score gate, codeOnly flag)
- VS Code Extension v1 (built, publish deferred)
- Pricing Page
- Intelligence Dashboard
- Self-Serve Onboarding
- Intelligence Persistence
- Dashboard Filters
```

---

## Tier 3 — Reframing (documents need updated focus/identity)

### `.product/02_PRODUCT_BRAIN.md`

**Problem:** 6 lines, years out of date. "Current Stage: Strong RAG foundation." We are an intelligence platform with a shipped MOAT layer.

**Full rewrite:**
```
# Product Brain

Identity: Engineering Intelligence Platform.
Category we own: Engineering organizational memory — accumulated, private, compounding.
Current Stage: Intelligence Platform — MOAT Building.
Founder Stage: Stage 1 — Irreplaceability (daily use validation before external customers).
Current Focus: Deepen intelligence signals. Not add new capabilities.
Core asset: Accumulated organizational intelligence. Cannot be reconstructed by competitors.
Never compromise: Privacy, simplicity, intelligence depth.
Biggest opportunity: Be the only product that makes engineering organizational memory visible, searchable, and compounding.
Biggest risk: Adding horizontal features before vertical depth is proven irreplaceable.
Where we win: Engineering organizational memory, local-first, intelligence compounding with usage.
Where we do not compete: Code generation quality, IDE integration, real-time collaboration, general document search.
```

---

### `.product/00_PRODUCT_VISION.md`

**Problem:** Duplicate `# Product Vision` header. Target Market shows aspirational customer numbers (1,000 Year 1, 100,000 Year 5) inappropriate for a product in Stage 1 with zero paying customers — these numbers create a false sense of pace. Roadmap is partially outdated.

**Changes:**
1. Remove the duplicate `# Product Vision` header (keep one)
2. Replace Target Market section with Stage-gated milestones:
```
## Milestones (Stage-Gated, Not Time-Boxed)

Stage 1 — Irreplaceability
Builder uses product every day. Would notice if it was gone.
One intelligence signal is genuinely relied upon.

Stage 2 — Five People
Five engineers with identical pain use it and love it.
Each can articulate the value in one sentence without being prompted.

Stage 3 — First Charge
At least one person pays before the product is "ready."
Payment is validation, not revenue.

Stage 4 — Feature Requests Replace Feature Ideas
Paying customers ask for specific things repeatedly.
Roadmap is driven by requests, not imagination.

Scale only begins at Stage 4. Segments: engineering teams (10–500),
consulting firms, regulated industries, individual developers.
```
3. Add a `## Where We Compete / Where We Do Not` section after Differentiators:
```
## Where We Compete
Engineering organizational memory. No mainstream product owns this category.

## Where We Do Not Compete
Code generation quality (Cursor, GitHub Copilot, Windsurf).
IDE-native integration.
Real-time collaboration.
General document search.
```
4. Update the Roadmap to mark completed items and reorder remaining items:
```
RAG Foundation ✔
Knowledge Intelligence Layer ✔
Intelligence Consolidation ✔
Self-Serve Onboarding ✔
Intelligence Persistence & History ✔
Multi-user / Team Mode ✔
VS Code Extension (built, publish deferred) ✔
Autonomous Documentation Maintenance ✔
↓
Engineering Copilot (active)
↓
Code Intelligence Engine (repository understanding → deepens all intelligence signals)
↓
Cloud-Hosted Option (after local-first is proven)
↓
Engineering Automation (intelligence drives action, not just insight)
↓
AI Company Operating System
```

---

### `.product/04_NEXT_MISSION.md`

**Problem:** The Engineering Copilot "Problem" section describes the Autonomous Maintenance problem (filesystem watching, stale docs) — which is already shipped. The framing is wrong. Engineering Copilot's actual problem is different: the platform doesn't actively participate in engineering sessions.

**Fix:** Replace the Engineering Copilot Problem section with:
```
### Problem

The platform is a knowledge retrieval system. Engineers query it — it answers. It does not
participate. It does not know what you are about to build. It cannot warn you about a relevant
decision made six months ago. It cannot suggest where to start. It waits to be asked.

The transition from "knowledge tool I search" to "engineering partner I open at session start"
requires the platform to read intent (what are you building?) and respond with structure (here
is what exists, what patterns to follow, what risks apply, and in what order to proceed).

Engineering Copilot is that transition. Phase 1 is not a code generator — it is a structured
reasoning step that happens before any code is written.
```

Also reframe the Code Intelligence Engine section to lead with the intelligence value, not code generation:
- Change the section header from "The Core Problem" (which frames it as a code gen problem) to clarify that the primary value is deepening all intelligence signals, with code generation improvement as a secondary benefit.

---

### `.product/07_FEATURE_BACKLOG.md`

**Problem:** Autonomous Documentation Maintenance is in "Active (Next Mission)" but it's shipped. Engineering Copilot is in "Icebox" but it's the next mission. The Code Generation grounding fix isn't reflected. No "Depth Work" category exists — the whole backlog is framed as "what new things to build" not "what existing things to deepen."

**Restructure:**
1. Move Autonomous Documentation Maintenance + all other shipped items into "Shipped ✔"
2. Move Engineering Copilot Phase 1 to "Active — Next Mission"
3. Add Code Intelligence Engine as a defined future mission (with "serves intelligence layer first" framing)
4. Add a new `## Depth Work (before new capabilities)` section above the queued items
5. Move Slack Integration and Cloud-Hosted to "Queued" with a note: "only after Stage 1 irreplaceability validated"
6. Remove the "Icebox" section (Engineering Copilot was the only real item and it's now active)
7. Update the Code Generation entry to reflect the grounding fix shipped this session

---

### `.product/01_CEO_DASHBOARD.md`

**Problem:** A contradiction exists: "Current Bottleneck: Intelligence depth, not features" — yet "Current Priority: Engineering Copilot" which is a new feature. The second Differentiator paragraph frames Code Intelligence Engine as primarily a code generation improvement rather than an intelligence signal deepener.

**Fixes:**
1. Resolve contradiction: change "Current Bottleneck" to: "Validation, not features. The gap between 'technically works' and 'genuinely irreplaceable in daily use' is closed through daily use, not more features. Stage 1 requires proving irreplaceability before expanding."
2. Rewrite the second Differentiator paragraph: "The next intelligence deepening is structured repository understanding: a persistent symbol graph, import/dependency graph, and architecture classification layer. Primary value: makes gap detection smarter, staleness detection more precise, and onboarding recommendations richer — because the platform will understand what each file does in the architecture. Code generation improvement is a secondary benefit."

---

### `.product/08_WEEKLY_REVIEW.md`

**Problem:** Dated 2026-08-03 and fully stale. The "Biggest Risk" says "No paying customers" but the actual biggest risk this week is strategic drift (building horizontally before vertical depth is proven). The "Top 5 Priorities" lists Distribution as #1 but the Founder's Compass says Stage 1 (irreplaceability) comes before Stage 2 (five people) comes before Stage 3 (distribution/charge).

**Full rewrite for current week (2026-08-06):**
```
# Weekly Review — 2026-08-06

## Biggest Win
Strategic clarity. The Founder's Compass named the two-product tension explicitly: Engineering
Intelligence Layer (our category, no one else owns it) vs. Code Generation quality (Cursor's
category, we cannot win it). Every document in the system is now being updated to encode this
distinction. This is the kind of clarity that prevents years of wasted effort.

## Biggest Mistake
Building in two directions simultaneously without naming the tension. Code Generation Level 2,
the Build panel, the Code Intelligence Engine roadmap item — all valuable, but none of them
were framed against the question "does this deepen our MOAT or dilute it?" They should have been.

## Biggest Risk
Continuing to add features before Stage 1 is proven. The product has more capabilities than
most engineering teams will explore on first contact. The right move is daily use until one
intelligence signal becomes genuinely irreplaceable — then expand.

## Biggest Opportunity
The Engineering Copilot Phase 1 (Implementation Plan Generator) is the first feature that
makes Knowledge Hub an active session participant, not a passive search target. If it works —
if the builder genuinely opens it before every coding session — that is the Stage 1 proof.

## Technical Debt
- Code generation grounding fix shipped but not deeply validated yet
- MaintenancePanel (Autonomous Maintenance) needs daily use to validate its suggestions are actionable
- avgHealthScore in snapshots: real value now computed but need to validate the trend is meaningful

## Top 3 Priorities
1. Daily use — prove Stage 1 irreplaceability before building anything new
2. Engineering Copilot Phase 1 — when Stage 1 is validated, this is the next build
3. Document system accuracy — false entries (first paying customer, cloud trial, VS Code publish) removed

## Features to Remove
None. But features to stop prioritizing: code generation quality improvements, IDE features.

## Should Roadmap Change?
Yes — already updated. The sequence is now: daily use validation → Engineering Copilot Phase 1
→ validate → Code Intelligence Engine (intelligence deepening first, code gen improvement second).
Distribution comes after Stage 1, not before.
```

---

### `.product/09_COMPANY_SCORECARD.md`

**Problem:** Empty table. Useless as an operating instrument.

**Rewrite to be useful:**
```
# Company Scorecard

*Updated: 2026-08-06 — self-assessed, solo builder*

| Metric                          | Score | Notes |
|----------------------------------|-------|-------|
| Intelligence Layer Depth         |  7/10 | Gap, memory, decisions, health, risk, staleness all shipped. Depth of daily use unproven. |
| Vertical Focus (MOAT strength)   |  6/10 | Clear now. Was diluted by code gen investment. Founder's Compass written. |
| Feature Irreplaceability         |  4/10 | Many features shipped. None yet proven irreplaceable in daily use. Stage 1 incomplete. |
| Stage Gate Progress              |  1/4  | Stage 1 in progress. 0 external customers. 0 charges. 0 validated feature requests. |
| Architecture Coherence           |  8/10 | Local-first, intelligence compounds, LLM as plug-in. All holding. |
| Competitive Moat (90-day clock)  |  0/10 | Clock hasn't started. No external user's eval.jsonl exists yet. |
| Founder Daily Use                |  ?/10 | Self-assessment required. Is the product open every engineering session? |
| Document System Accuracy         |  5/10 | False completed entries removed this session. Backlog and work queue rebuilt. |

## Stage Gate Status

| Stage | Condition | Status |
|-------|-----------|--------|
| Stage 1 | Builder uses product daily and would miss it | In progress — not yet validated |
| Stage 2 | 5 engineers with same pain use and love it | Not started |
| Stage 3 | First payment received | Not started |
| Stage 4 | Feature requests replace feature ideas | Not started |
```

---

## Files to Modify (complete list)

| File | Type of Change |
|------|----------------|
| `.company/00_COMPANY_CONSTITUTION.md` | Add 3 new principles (vertical depth, validate before expand, own don't compete) |
| `.company/02_EXECUTIVE_COUNCIL.md` | Rewrite all council questions to be category-specific; add Where We Win / Don't Compete |
| `.company/03_CLAUDE_RULES.md` | Add 4 rules: stage-awareness, vertical depth, competitor check, validate-before-expand |
| `.company/04_DECISION_FRAMEWORK.md` | Add irreplaceability as priority 3; add MOAT filter; expand reject list |
| `.company/07_KILL_LIST.md` | Full rewrite: add specific competitor categories + founder-stage anti-patterns |
| `.product/00_PRODUCT_VISION.md` | Fix duplicate header; replace customer numbers with stage milestones; add Where We Compete; update roadmap |
| `.product/01_CEO_DASHBOARD.md` | Fix contradiction in Bottleneck; reframe Code Intelligence Engine differentiator |
| `.product/02_PRODUCT_BRAIN.md` | Full rewrite to reflect current stage and competitive clarity |
| `.product/03_CURRENT_STATE.md` | Remove false VS Code Marketplace publish claim; fix "What's Missing" section |
| `.product/04_NEXT_MISSION.md` | Fix Engineering Copilot problem statement (currently describes Autonomous Maintenance); reframe Code Intelligence Engine primary value |
| `.product/05_WORK_QUEUE.md` | Full rewrite: stage gate, NOW/NEXT/LATER/ICEBOX reflecting current state |
| `.product/06_PROGRESS.md` | Remove 2 false completed entries; fix VS Code entry; add "Not Yet Started" section |
| `.product/07_FEATURE_BACKLOG.md` | Fix stale statuses; add Depth Work section; add vertical-depth framing throughout |
| `.product/08_WEEKLY_REVIEW.md` | Full rewrite for 2026-08-06 reflecting Founder's Compass insights |
| `.product/09_COMPANY_SCORECARD.md` | Full rewrite: meaningful scores, stage gate tracker |

`.company/05_KNOWLEDGE_EVOLUTION.md`, `.company/06_TOKEN_ROI.md`, `.company/08_FOUNDERS_COMPASS.md` — no changes needed.

---

## Execution Order

1. Kill List (sets guardrails — read first by Claude)
2. Company Constitution (principles layer)
3. Executive Council + Claude Rules + Decision Framework (operating layer)
4. Product Brain (identity — read early by Claude)
5. Product Vision (roadmap + milestones)
6. CEO Dashboard (current state summary)
7. Current State + Progress (accuracy fixes — remove false entries)
8. Work Queue + Feature Backlog (operational accuracy)
9. Weekly Review + Scorecard (self-assessment instruments)

---

## Verification

After all changes, ask: "If Claude reads all `.company/` files and `.product/00-02` at the start of a new session, will it:
1. Know we own engineering organizational memory, not code generation?
2. Know we are in Stage 1 — Irreplaceability?
3. Know not to propose IDE features, real-time collaboration, or code gen quality improvements?
4. Know the difference between 'deepening intelligence' and 'adding a new feature category'?
5. Know that the first paying customer has NOT been onboarded yet?

All five should be yes after this plan is executed."
