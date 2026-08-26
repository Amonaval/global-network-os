# Feature Backlog

*Last updated: 2026-08-06*

---

## Depth Work (Before New Capabilities)

These are not new features. They are deepening of what already exists.
Run these in parallel with daily use validation — they make existing features more irreplaceable.

- Gap intelligence — make recommendations specific enough to act on immediately (not just "add more content")
- Decision archaeology — surface relevant decisions proactively during session kickoff, not just on query
- Health scoring — make per-section explanation clearer; score should prompt specific action, not just awareness
- Maintenance suggestions — validate staleness suggestions are actionable and being acted on

---

## Active — Next Mission

**Engineering Copilot Phase 1 — Implementation Plan Generator**
- Accept: feature spec or issue description
- Internally ask: which files change, which patterns exist, what can be reused, what risks apply, which decisions are relevant
- Output: structured implementation plan (files, order, reuse opportunities, risks, decision refs)
- NOT a code generator — code comes later, grounded in the plan
- Success: builder opens Knowledge Hub before every coding session and uses the plan

---

## Shipped ✔

### Intelligence Layer (core MOAT)
✔ Documentation Gap Intelligence v1 + v2
✔ Organizational Memory — Query Memory Panel
✔ Organizational Memory — Knowledge Map
✔ Engineering Decision Graph (extracted + validated)
✔ Documentation Health Score
✔ Section Intelligence Controls
✔ AI Documentation Reviewer
✔ Engineering Onboarding Assistant
✔ Knowledge Risk Analysis
✔ Engineering Insights

### Intelligence Platform
✔ Intelligence Dashboard — IDS meter, unified command centre, dimension cards, drill-down nav
✔ Self-Serve Onboarding / Welcome Flow — zero-to-first-query < 3 minutes
✔ Intelligence Persistence & History — weekly snapshots, sparkline, delta KPIs
✔ Dashboard Filters — 6 dimensions (Time, Last N, Section, Status, User, Keyword), server-side
✔ Nav Redesign — 11 tabs → Chat + Intelligence primary + 2 dropdown groups
✔ Team IDS — aggregate team IDS + per-user breakdown
✔ Health Trend Over Time — week-over-week avg health delta in HealthPanel + Intelligence Dashboard

### Distribution + Team
✔ Pricing Page — Individual $20/mo / Team $99/mo / Enterprise
✔ VS Code Extension v1 — sidebar panel, ask question, Ask about selection; built and ready (publish deferred)
✔ Multi-user / Team Mode — userId in eval.jsonl, /api/users, UserPicker in FilterBar
✔ Autonomous Documentation Maintenance — Phase 1 (staleness detection) + Phase 2 (LLM rewrite suggestions)

### Engineering Automation
✔ Code Generation Mode — Level 2 (code upload, Build panel, /api/code/generate)
✔ Code Generation grounding fix — file inventory, compressContext, score gate, codeOnly flag, system prompt rule

### Foundation
✔ Hybrid Retrieval (BM25 + cosine + RRF)
✔ Confidence Gate (dual threshold + deflection detection)
✔ Electron desktop distribution
✔ Confluence Integration (API token + OAuth 2.0)
✔ File Upload Pipeline (PDF, DOCX, TXT, MD, HTML, ZIP, + all major code extensions)
✔ Incremental Sync (MD5 hashing)
✔ URL Section Groups + Search-Driven Knowledge Discovery
✔ Generic Web Crawler (multi-auth, Playwright)
✔ Session Memory, Analytics, Chunk Explorer, Licensing

---

## Queued — After Stage 1 Validated

**Engineering Copilot Phase 2 — PR Summary Generator**
- Accept: git diff (pasted or from file)
- Generate: PR description with summary, what changed, why, affected sections
- Queue until Phase 1 is proven irreplaceable in daily use

**Engineering Copilot Phase 3 — Session Kickoff Mode**
- "I'm working on X today" → retrieve context, surface decisions, flag gaps, propose starting approach
- Queue until Phase 2 is validated

**Documentation Drift Report**
- Scheduled staleness sweep (daily/weekly)
- Produce a drift report: sections most likely out of sync
- Builds on existing Autonomous Maintenance infrastructure

---

## Icebox — After Stage 3 (First Charge)

- Code Intelligence Engine Phase 1 — Repository Understanding (symbol index, import graph, architecture classification). Primary value: deepens ALL intelligence signals. Secondary: better code generation grounding.
- Slack Integration — second external channel after VS Code
- Cloud-Hosted Option — after local-first proven; privacy-preserving isolated instances
- IDS goal-setting — let teams set a target IDS, see what actions advance it fastest
- org.fingerprint.json — compressed org knowledge DNA, the irreproducible intelligence asset
- Public API — let external tools query the intelligence layer
- Cross-section deduplication — identify sections answering the same questions

---

## Never Build

Anything on the Kill List. Competitor categories (code gen quality, IDE integration, real-time
collaboration, general document search). Features for customers who do not yet exist.
