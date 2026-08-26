# Work Queue

*Last updated: 2026-08-06*

---

## STAGE GATE (Read Before Anything Else)

Before building anything new, answer honestly:
- Do I open Knowledge Hub before starting an engineering session?
- Would I notice if it was gone tomorrow?
- Is there one intelligence signal I genuinely rely on?

If the answer to any of these is no — the next action is not a new feature.
It is daily use until the answer becomes yes.
Stage 1 is complete when this question answers itself.

---

## NOW — Engineering Copilot Phase 1

**Implementation Plan Generator**

Accept a feature spec. Before generating anything, the system answers:
- Which existing implementations are similar?
- Which files need to change?
- Which patterns and abstractions should be reused?
- What are the architecture layer constraints?
- Which decisions and risks are relevant?

Output: a structured implementation plan. Not code.

Validated by: builder opens Knowledge Hub before every coding session and uses the plan output.

---

## NEXT — Depth Before Breadth

Before Engineering Copilot Phase 2 or any new capability category, validate Phase 1 is used daily.

Candidates for intelligence depth work (not new features):
- Gap intelligence — make recommendations more specific and immediately actionable
- Decision archaeology — surface decisions relevant to current work without being asked
- Health scoring — make per-section explanation clearer so it drives action, not just awareness
- Maintenance suggestions — validate that staleness suggestions are actually being acted on

---

## LATER — Code Intelligence Engine Phase 1

Repository Understanding Layer: symbol index, import/dependency graph, architecture classification.

Primary value: deepens ALL intelligence signals.
- Gap detection becomes architecture-aware
- Staleness detection becomes more precise
- Onboarding recommendations become structurally grounded
- Health scoring gains architectural dimension

Secondary value: better code generation grounding.

Build only after Engineering Copilot Phase 1 is validated as irreplaceable daily use.

---

## ICEBOX

- Engineering Copilot Phase 2 — PR Summary Generator
- Engineering Copilot Phase 3 — Session Kickoff Mode
- Documentation Drift Report — scheduled staleness sweep
- Slack Integration — second external channel after VS Code
- Cloud-Hosted Option — after local-first is proven irreplaceable
- Public API — after Stage 3 (first charge)
- org.fingerprint.json — compressed org knowledge DNA

---

## COMPLETED (most recent first)

- Code Generation grounding fix — file inventory, compressContext, score gate, codeOnly flag
- Autonomous Documentation Maintenance — Phase 1 (staleness detection) + Phase 2 (LLM suggestions)
- Team IDS — aggregate team IDS + per-user breakdown in Intelligence Dashboard
- Health Trend Over Time — week-over-week avg health score delta in HealthPanel
- Multi-user / Team Mode — userId in eval.jsonl, UserPicker, /api/users
- VS Code Extension v1 — built and ready (publish deferred)
- Pricing Page
- Intelligence Dashboard — IDS meter, 6 KPI tiles, 4 dimension cards
- Self-Serve Onboarding — zero-to-first-query < 3 minutes
- Intelligence Persistence — weekly snapshots, sparkline, delta KPIs
- Dashboard Filters — 5 dimensions, server-side
- Nav Redesign — 11 tabs → grouped hierarchy
- Code Generation Mode Level 2 — upload code, build panel, /api/code/generate
- Engineering Insights, Knowledge Risk Analysis, AI Documentation Reviewer,
  Engineering Onboarding Assistant, Section Intelligence Controls,
  Documentation Health Score, Engineering Decision Graph,
  Organizational Memory (Query Memory + Knowledge Map),
  Documentation Gap Intelligence v1 + v2,
  Hybrid Retrieval, Confidence Gate, Electron Desktop,
  Confluence Integration, File Upload Pipeline, Incremental Sync,
  Session Memory, Analytics, Chunk Explorer, Licensing
