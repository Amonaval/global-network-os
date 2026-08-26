# Next Mission — Team IDS + Intelligence Maturity

*Updated: 2026-08-05*

---

## Status

**Distribution + VS Code Extension mission: COMPLETE.**
**Multi-user / Team Mode mission: COMPLETE.**

Previous missions shipped: Intelligence Consolidation, Self-Serve Onboarding, Intelligence Persistence, Dashboard Filters, Code Generation Level 2, Pricing Page, VS Code Extension v1, Multi-user / Team Mode.

---

## Strategic Direction (Builder-First)

This product is being built by a solo developer/entrepreneur working silently. The goal is a product that is **genuinely outstanding and demoable** — used extensively by the builder before it is shown to anyone else. Monetization remains the long-term purpose but is not the current priority. No deployment, no publishing, no company formation yet. Build it right first.

---

## What Was Completed — All Missions to Date

**Intelligence Dashboard** (`IntelligenceDashboard.tsx`)
- Unified 🧠 primary nav tab replacing Intelligence dropdown
- IDS meter (0–100 score, moat threshold marker at 70)
- 6 KPI tiles: Answered %, Open Gaps, Risk Alerts, Mem Clusters, Avg Health, Total Queries
- 4 dimension cards (Gaps, Risk, Topics, Memory) with top-4 entries + "View All →" drill-down
- 📸 Snapshot button always visible in header
- Trend banner: sparkline + delta KPIs when ≥2 snapshots exist

**Self-Serve Onboarding** (`WelcomeFlow.tsx`)
- Shown when `totalChunks === 0` and `kh_welcome_dismissed` not set
- Phase 1: upload drop zone with live streaming progress
- Phase 2: Ready screen — chunk count, section chips, IDS starter value (12+), 3 templated questions from section names
- Clicking a question fires it directly into chat and dismisses the flow

**Intelligence Persistence & History**
- `maybeWriteSnapshot()` auto-runs on every `/api/insights` call (7-day guard)
- `data/intelligence_snapshots.jsonl` — `schemaVersion: 1`, one line per week
- `GET /api/intelligence/history` → snapshots array + `latestDelta` (diff between last two)
- `POST /api/intelligence/snapshot` — force snapshot, bypasses guard
- Fixed: zero-delta state shows "No change yet" message; 1-snapshot dead state shows correct prompt

**Dashboard Filters** (`FilterBar.tsx`)
- 5 filter dimensions applied server-side in `/api/insights`:
  - **Time**: All / 7d / 30d / 90d / 180d
  - **Last N**: All / 5 / 10 / 25 / 50 / 100
  - **Section**: dropdown from live sections API
  - **Status**: All / Answered / Unanswered
  - **Keyword**: free text against question text
- `useInsights` accepts `Partial<InsightsFilters>`, query cache keyed by filter params
- "Showing X of Y queries" footer when filters active; "× Clear filters" button

**Nav Redesign**
- 11 flat tabs → Chat + Intelligence primary; Knowledge dropdown; Manage dropdown
- `NavDropdown` component: click-to-open, outside-click-to-close, active child reflected in button

---

## Platform State After This Session

✔ Documentation Gap Intelligence (v1 + v2)
✔ Organizational Memory (Query Memory + Knowledge Map)
✔ Engineering Decision Graph (validated)
✔ Documentation Health Score
✔ Section Intelligence Controls
✔ AI Documentation Reviewer
✔ Engineering Onboarding Assistant
✔ Knowledge Risk Analysis
✔ Engineering Insights
✔ **Intelligence Dashboard** (IDS meter, unified command centre)
✔ **Self-Serve Onboarding** (zero-to-first-query < 3 min)
✔ **Intelligence Persistence** (weekly snapshots, sparkline, delta KPIs)
✔ **Dashboard Filters** (5 dimensions, server-side)
✔ **Nav Redesign** (11 tabs → grouped hierarchy)
✔ **Strategic documents** (MOAT, IDS, tech alignment, Decisions 10+11)
✔ **Code Generation Mode — Level 2** (code upload, Build panel, `/api/code/generate`)
✔ **Pricing Page** (`/pricing.html`) — Individual $20/mo, Team $99/mo, Enterprise contact; linked from settings menu
✔ **VS Code Extension v1** (`vscode-extension/`) — sidebar chat, Ask about selection, configurable server URL; built and ready
✔ **Pricing Page** (`/pricing.html`) — Individual $20/mo, Team $99/mo, Enterprise contact; built
✔ **Multi-user / Team Mode** — per-browser identity, userId in eval.jsonl, UserPicker in FilterBar, `/api/users` endpoint, backwards-compatible with solo use

---

## ✔ Completed — Team IDS (2026-08-05)

**Team IDS** — shipped. `GET /api/team/ids` computes team IDS from full combined query pool + per-user IDS breakdown. Intelligence Dashboard shows `👥 Team Intelligence` / `👤 Your Intelligence` section with team meter, per-user bars, scores, and query counts. Solo use is first-class (always renders). Feature doc: `project-docs/features/TEAM_IDS.md`.

---

## ✔ Completed — Health Trend

**Health Trend Over Time** — shipped. Week-over-week avg health score delta visible in HealthPanel (trend banner + sparkline). Delta also added to Intelligence Dashboard trend banner as a 6th signal. Foundation was already in `intelligence_snapshots.jsonl` (`avgHealthScore` field). Zero new storage — reads existing snapshots. Feature doc: `project-docs/features/HEALTH_TREND.md`.

---

## ✔ Completed — Autonomous Documentation Maintenance (2026-08-05)

**Autonomous Documentation Maintenance** — Phase 1 + Phase 2 shipped. `GET /api/maintenance/staleness` detects stale files by comparing stored MD5 hashes vs current on-disk state; maps each file to its section + title via manifest. `POST /api/maintenance/suggest` runs LLM diff of on-disk content vs indexed chunks, returning severity-coded suggestions. MaintenancePanel added to Knowledge dropdown. Zero new storage. Feature doc: `project-docs/features/AUTONOMOUS_DOC_MAINTENANCE.md`.

---

## ✔ Completed — RAG Strategy Alignment (2026-08-08)

**RAG Strategy Alignment** — complete. Comprehensive 2025–2026 RAG research documented in `artifact/RAG_TRENDS_2025_2026.md`. Full KH-specific RAG strategy created in `.claude/.engineering/RAG_STRATEGY.md` — maps every major RAG pattern (contextual enrichment, RAGAS, reranking, multimodal, GraphRAG, AST chunking) to named customer personas, with explicit out-of-scope designations. Engineering docs updated: DECISIONS.md (D.12–D.15), SESSION_MEMORY.md (2 lessons), GLOSSARY.md (5 terms), README.md (reading order). Visual strategy artifact published. Key permanent decision: Code-aware RAG (AST chunking, function call graphs) is explicitly out of scope — Cursor/Copilot territory; KH's engineering customer (Sarah) needs document intelligence about ADRs/runbooks, not AST traversal.

---

## ✔ Completed — Engineering Copilot Phase 1 (2026-08-21)

**Implementation Plan Generator** — shipped. New 🧭 Copilot primary nav tab. `POST /api/copilot/plan` streams a five-section structured plan (Affected Modules, Reuse Opportunities, Implementation Order, Decision References, Flagged Risks) before any code is written. Reads both codebase uploads AND documentation. "Generate Code →" button hands spec directly to Build panel. Backend: `src/rag/copilot.js`. Frontend: `CopilotPanel.tsx`.

---

## ✔ Completed — Contextual Chunk Enrichment (2026-08-21)

**Contextual Chunk Enrichment (Decision D.12)** — shipped. New `src/ingestion/enricher.js` module. At ingestion time, if `CONTEXTUAL_ENRICHMENT=true`, each chunk receives a 1–2 sentence LLM-generated context prepended before embedding. Context describes: which document/project/client/case, what topic or decision, and key named entities. Cached in `data/enrichment_cache.json` (keyed by chunk content hash — incremental-safe). Enriched text used for both BM25 and embedding. Original text preserved for display. Auto-detects enrichment mode change and forces rebuild. Works for both `ingest.js` and the upload path. Result: the "it reduced latency by 40%" fragment now embeds as "In Aarav's service mesh decision for Client X, it reduced latency by 40%." Feature doc: `project-docs/features/CONTEXTUAL_ENRICHMENT.md`.

---

## Founder's Compass Alignment — Roadmap Reset (2026-08-21)

**What was removed from the roadmap:**

- Engineering Copilot Phase 2 (PR Summary Generator) — dev tool feature. GitHub, Cursor, and GitLab already do this better. Does not strengthen the MOAT. Kill List item.
- Engineering Copilot Phase 3 (Session Kickoff Mode) — same category risk.
- Code Intelligence Engine — symbol graph, AST traversal, import graphs. The intelligence value was real, but the implementation path goes through code tool territory. Removed until the intelligence layer is proven irreplaceable on documents first.

**What the Founder's Compass actually says to do right now:**

The feature count has outrun depth of use. The product has more features than most users will explore. Breadth before depth is how products die quietly.

The question is not "what do we build next?" — it is "which existing feature, if it disappeared, would make the platform feel broken?"

The answer is the retrieval pipeline. If answers are mediocre, every intelligence feature on top of it is mediocre. Contextual enrichment and reranking are not features — they are quality improvements to the foundation every existing feature depends on.

**Current strategic direction:** Build a platform that is genuinely outstanding at what it does, not broad. A professional who queries their documents should get answers that feel almost impossibly good — specific, grounded, confident. That quality bar is the product. Every mission between now and the first paying customer serves that bar.

---

## ✔ Completed — RAGAS + Reranking + Doc-Type Chunking (2026-08-21)

**RAGAS Evaluation Pipeline** — shipped. `src/rag/ragas.js` implements three LLM-as-judge metrics (Faithfulness, Context Precision, Context Recall) with no Python dependencies. Synthetic eval set generated from indexed documents via `POST /api/eval/ragas/generate`. Evaluation run via `POST /api/eval/ragas/run` (background, 5-15 min). Results stored in `data/ragas_history.jsonl`. RAGAS quality tile in Intelligence Dashboard shows live scores. `RagasPanel.tsx` provides full drill-down with history and progress tracking.

**Cross-Encoder Reranking (D.13)** — shipped. `src/rag/reranker.js` uses a single batched LLM call to score all top-N candidates jointly with the query. Integrated into both `query()` and `queryStream()` in `query.js`. Enable: `RERANKER_ENABLED=true`, `RERANKER_CANDIDATES=20`, `RERANKER_TOP_K=8`. Disabled by default — enable after establishing RAGAS baseline.

**Document-Type Chunking (D.14)** — shipped. `chunkByDocType()` in `cleaner.js` detects legal (hierarchical section/clause splitting) and research (semantic heading-boundary splitting) documents automatically. Falls through to standard chunking if patterns not matched. Enable: `DOC_TYPE_CHUNKING=true`. Used in both `ingest.js` and the upload path in `server.js`.

---

## ✔ Completed — Product Polish (2026-08-21)

**Source Citation Quality** — complete chip redesign. Backend now returns `nearHeading` + `snippet` (160 chars) alongside each source. Chips show document title + `section › heading` breadcrumb, colored relevance dot (green=high/amber=mid/gray=low) instead of raw %, clickable only when URL exists. Inline `[N]` citation tooltips include snippet text on hover. Feature doc: `project-docs/features/PRODUCT_POLISH.md`.

**Streaming Cursor Fix** — removed double-cursor bug: JS was appending `<span class="cursor">▋</span>` while CSS `::after` also rendered `▋`. Removed the JS span; CSS `::after` is the sole cursor.

**IDS Meter Polish** — gradient fill (orange→yellow→green spectrum), taller bar (8px), threshold marker now shows "70" label, animated fill with cubic-bezier easing.

**Onboarding Clarity** — `WelcomeFlow.tsx` Ready screen section chips now use `formatSectionName()` so slugs like `api-docs` display as `API Docs`.

---

## Next Mission — Answer Quality Audit

The UI is now polished. The remaining polish item is answer quality — the one that requires actually running the product.

**How to run it:**
1. Start the app normally
2. Ask 20 real queries across different document types and topics you have indexed
3. For each answer that feels wrong, vague, or over-hedged, copy the query + answer
4. Bring those back here — Claude will tune the system prompt in `src/rag/query.js` (the `SYSTEM` constant) based on the patterns

Likely improvements based on known issues:
- Answers that say "I couldn't find this" when relevant content exists → confidence gate or prompt tuning
- Answers that over-hedge with "the documentation states…" instead of just answering → prompt directness
- Answers that use the wrong section's context → section multiplier tuning
- Answers that are too long / repeat themselves → prompt conciseness rule

## Maturity Horizon — What Comes After Polish

1. **Multimodal RAG** — PDF charts, tables, figures. Anjali's financial statements have key data in charts that text-only RAG misses entirely.

2. **HyDE for vague recall queries** — when a user asks "what strategy did I use for clients with this profile?", generate a hypothetical answer first, then embed it for retrieval. Applies when initial retrieval fails the confidence gate.

---

## What Does Not Get Built

Per the Founder's Compass and Kill List:

- No Engineering Copilot extensions beyond Phase 1 (already shipped)
- No PR summary generator
- No session kickoff mode
- No Code Intelligence Engine (symbol graph, AST traversal)
- No IDE-native integration
- No real-time collaboration features
- No horizontal new features until retrieval quality is measured and excellent

The question at the end of every session: *"If I stopped building new features today and spent the next 30 days deepening how I use what already exists — would I be further ahead or further behind?"*

Answer that honestly before proposing the next feature.
