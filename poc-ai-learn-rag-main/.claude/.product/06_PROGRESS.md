# Product Progress

## Phase

Intelligence Platform — MOAT Building

## Version

1.3

## Completion

95%

*Completion measured against the intelligence platform vision, not a feature checklist.*

---

## Completed

✔ Authentication

✔ Hybrid Retrieval (BM25 + cosine + RRF)

✔ Context Compression

✔ Confidence Gate (dual threshold, soft-block detection)

✔ Electron desktop distribution

✔ Local Embeddings

✔ Analytics (eval.jsonl — full query audit trail)

✔ Licensing (Free / Pro / Lifetime)

✔ Confluence Integration (API token + OAuth 2.0)

✔ File Upload Pipeline (PDF, DOCX, TXT, MD, ZIP)

✔ Incremental Sync (MD5 hashing)

✔ Session Memory

✔ Chunk Explorer (with pinning)

✔ Generic Web Crawler (multi-auth, Playwright)

✔ URL Section Groups (named groups, separate vector shards)

✔ Search-Driven Knowledge Discovery (DDG search → URL group ingestion)

✔ Documentation Gap Intelligence v1 (Gaps panel, keyword clustering, soft-block detection)

✔ Documentation Gap Intelligence v2 (priority scoring, trending, nearMissSections, action recommendations, doc outline generator)

✔ Organizational Memory — Query Memory Panel (3+ threshold, recency momentum, trending signal)

✔ Organizational Memory — Knowledge Map (cross-source synthesis: docs + decisions + memory + gaps)

✔ Engineering Decision Graph (extraction shipped and validated on engineering content)

✔ Documentation Health Score (per-section composite score, coverage + recency signals)

✔ Section Intelligence Controls (Boost / Ignore / Remove, retrieval multipliers, auto-recommendations)

✔ AI Documentation Reviewer (LLM synthesizes section content + gap queries → missing-topic suggestions)

✔ Engineering Onboarding Assistant (role + focus → personalized learning path, Start/Next/Later priority)

✔ Knowledge Risk Analysis (dead sections, single-expert dependency, SPOF topics; per-section risk score)

✔ Engineering Insights (top topics, pain areas, section quality trend, recurring gaps; single API call)

✔ **Intelligence Dashboard** — unified 🧠 primary tab. IDS meter with moat threshold marker, 6 KPI tiles, 4 dimension cards (Gaps, Risk, Topics, Memory), drill-down nav. Replaces Intelligence dropdown (11 tabs → 2 primary + 2 dropdown groups).

✔ **Self-Serve Onboarding / Welcome Flow** — shown to new users when no docs indexed. Upload drop zone → live progress → Ready screen with chunk count, section chips, IDS starter value, 3 suggested questions from section names. First value in < 3 minutes.

✔ **Intelligence Persistence & History** — auto-snapshots every 7 days on insights load. `intelligence_snapshots.jsonl` (schemaVersion: 1). Dashboard sparkline, delta KPIs, 📸 Snapshot button always accessible.

✔ **Dashboard Filters** — 5-dimension filter bar: Time window, Last N queries, Section, Status, Keyword. Server-side, applied before all dimension computations. Cache keyed by filter params.

✔ **Nav Redesign** — 11 flat tabs → Chat + Intelligence primary; Knowledge + Manage dropdowns.

✔ **Strategic Direction Set** — MOAT principle, IDS north star, target market 1k→100k, Company Constitution updated, DECISIONS 10+11 added, PRODUCT_VISION rewritten, NEXT_BIG_DIRECTION.md created.

✔ **Code Generation Mode — Level 2** — code upload, Build panel, `/api/code/generate`.

✔ **Pricing Page** (`/pricing.html`) — Individual $20/mo, Team $99/mo, Enterprise contact; live.

✔ **VS Code Extension v1** — sidebar chat, Ask about selection, configurable server URL; built and ready to package. `vsce publish` deferred to user decision.

✔ **Multi-user / Team Mode** — per-browser identity (localStorage `kh_user_name`), `userId` in eval.jsonl, `/api/users` endpoint, UserPicker in FilterBar, backwards-compatible solo use. Full spec: `project-docs/features/MULTI_USER_TEAM_MODE.md`.

✔ **Health Trend Over Time** — week-over-week avg health score delta in HealthPanel (trend banner + sparkline of `avgHealthScore` across snapshots); `avgHealthScore` delta added as 6th signal in Intelligence Dashboard trend banner; `IntelligenceDelta` type extended. Full spec: `project-docs/features/HEALTH_TREND.md`.

---

✔ **Autonomous Documentation Maintenance** — Phase 1 (staleness detection) + Phase 2 (LLM rewrite suggestions). `GET /api/maintenance/staleness` compares stored MD5 hashes vs current files; surfaces stale candidates by section, reason, and mtime. `POST /api/maintenance/suggest` runs LLM diff of on-disk content vs indexed chunks → severity-coded suggestions. MaintenancePanel in Knowledge dropdown. Zero new storage. Full spec: `project-docs/features/AUTONOMOUS_DOC_MAINTENANCE.md`.

✔ **RAG Strategy Alignment (2026-08-08)** — Full 2025–2026 RAG research (`artifact/RAG_TRENDS_2025_2026.md`). KH-specific RAG strategy document created (`.claude/.engineering/RAG_STRATEGY.md`) mapping every major RAG pattern to named personas. Permanent boundary set: code-aware RAG (AST chunking, call graph traversal) is out of scope — Cursor/Copilot territory. DECISIONS.md +D.12–D.15, SESSION_MEMORY.md +2 lessons, GLOSSARY.md +5 terms. Visual artifact published. Tier 1 next moves: Contextual Chunk Enrichment, RAGAS Evaluation, Cross-Encoder Reranking.

✔ **Engineering Copilot Phase 1 — Implementation Plan Generator (2026-08-21)** — New 🧭 Copilot primary nav tab. `POST /api/copilot/plan` streams a five-section structured plan (Affected Modules, Reuse Opportunities, Implementation Order, Decision References, Flagged Risks) from a one-line feature spec. Reads both codebase uploads AND documentation context. "Generate Code →" button hands the spec directly to Build panel. Backend: `src/rag/copilot.js`. Frontend: `CopilotPanel.tsx`. Note: Phase 2/3 (PR Summary, Session Kickoff) removed from roadmap per Founder's Compass alignment — dev tool territory.

✔ **Contextual Chunk Enrichment — Decision D.12 (2026-08-21)** — `src/ingestion/enricher.js` prepends LLM-generated context (1–2 sentences) to each chunk before embedding. Context describes document, topic, client/case/project, and key entities. Cached in `data/enrichment_cache.json`. BM25 and cosine/RRF both use enriched text. Auto-detects mode change on re-ingest and forces rebuild. Works for ingest pipeline and upload path. Activated via `CONTEXTUAL_ENRICHMENT=true`. Expected: ~67% retrieval failure reduction per Anthropic benchmark. Feature doc: `project-docs/features/CONTEXTUAL_ENRICHMENT.md`.

✔ **Product Polish (2026-08-21)** — Source citation quality (breadcrumb + relevance dot + snippet tooltip), IDS meter gradient (orange→yellow→green, 8px, "70" threshold label), streaming double-cursor bug fixed, onboarding section chip formatting via `formatSectionName()`. Feature doc: `project-docs/features/PRODUCT_POLISH.md`.

---

## In Progress

None.

---

## Next Milestone

**Engineering Copilot** — read repo + docs, generate implementation plans and PR summaries. The feature that makes every engineering session faster. Transitions platform from knowledge retrieval to active engineering participant.

---

## Not Yet Started — Pending Stage 1 Validation

- VS Code Marketplace publish (extension built; `vsce publish` is a decision, not a blocker)
- Cloud-hosted trial instance (requires provisioning; deferred)
- First paying customer outreach (deferred until Stage 1 irreplaceability validated)

## Blockers

None. Daily use is the current work. Stage 1 gates everything else.

---

## Recently Finished (2026-08-05 — latest)

**Multi-user / Team Mode** — per-browser user identity, `userId` flowing through the full pipeline, UserPicker filter on the Intelligence Dashboard, `/api/users` endpoint. Teams sharing an instance now generate distinguishable intelligence signals.

**Health Trend Over Time** — avg health score history visible in HealthPanel. Trend banner + sparkline shows whether documentation health is improving or degrading across snapshots. Health delta also surfaced in the Intelligence Dashboard trend banner as the 6th signal alongside IDS, Queries, Clusters, and Gaps.

**Team IDS** — `GET /api/team/ids` computes aggregate IDS from the combined query pool + per-user breakdown. Intelligence Dashboard shows `👥 Team Intelligence` / `👤 Your Intelligence` section: team meter, per-user bars coloured by score tier, individual IDS and query count per contributor. Solo use is first-class.

---

## Success Criteria (Updated)

A new user installs, drops one document, gets 3 suggested questions, asks one, and comes back 30 days later to see their IDS grew from 12 to 43. They understand the intelligence is compounding and they don't want to lose it. That is the moat moment.
