# Current State

*Last updated: 2026-08-05*

## Platform Phase

Intelligence Platform — MOAT Building (v0.9)

## Completed Capabilities

### Core Retrieval
- Hybrid Retrieval (BM25 + cosine + RRF)
- Confidence Gate (dual threshold, soft-block + deflection detection)
- Context compression
- Session memory

### Data Ingestion
- File upload pipeline (PDF, DOCX, TXT, MD, ZIP)
- Confluence integration (API token + OAuth 2.0)
- Generic web crawler (multi-auth, Playwright)
- Search-Driven Knowledge Discovery (DDG → URL group ingestion)
- URL Section Groups (named groups, separate vector shards)
- Incremental sync (MD5 hashing)

### Intelligence Layer (the MOAT)
- **eval.jsonl** — full query audit trail, the foundation of all intelligence features
- Documentation Gap Intelligence v1 + v2 (priority scoring, trending, nearMissSections, action recommendations, doc outline generator)
- Organizational Memory — Query Memory panel (3+ threshold, trending signal)
- Organizational Memory — Knowledge Map (cross-source synthesis: docs + decisions + memory + gaps)
- Engineering Decision Graph (extraction pipeline, validated on engineering content)
- Documentation Health Score (per-section composite score)
- Section Intelligence Controls (Boost / Ignore / Remove, retrieval multipliers)
- AI Documentation Reviewer (LLM → missing-topic suggestions per section)
- Engineering Onboarding Assistant (role-based learning paths)
- Knowledge Risk Analysis (dead sections, single-expert, SPOF; risk score per section)
- Engineering Insights (top topics, pain areas, section quality trend, recurring gaps)
- **Intelligence Persistence** (weekly snapshots, IDS history, sparkline, delta KPIs)
- **Intelligence Density Score (IDS)** — composite 0–100 score, moat threshold at 70

### Distribution
- **Pricing Page** (`/pricing.html`) — three tiers: Individual $20/mo, Team $99/mo, Enterprise contact; accessible from settings menu in app
- **VS Code Extension v1** (`vscode-extension/`) — sidebar WebviewPanel, POSTs to `/api/chat`, configurable server URL, "Ask about selection" context menu, 120s timeout, live elapsed timer, ready to `vsce package`. Publish to VS Code Marketplace deferred to user decision.

### Multi-user / Team Mode
- **User identity** — per-browser `localStorage` (key `kh_user_name`), no auth required, defaults to `'default'`
- **userId in eval.jsonl** — all query paths (`query()`, `queryStream()`) stamp `userId` on every eval entry; backwards-compatible (old entries read as `'default'`)
- **`GET /api/users`** — returns distinct users + query counts from eval.jsonl
- **User filter in Insights** — `?user=` param on `/api/insights`; UserPicker dropdown in Dashboard FilterBar
- **SidebarFooter user row** — shows current user name, inline edit form, saves to localStorage

### Platform / UX
- **Intelligence Dashboard** — unified command centre (IDS meter, 6 KPI tiles, 4 dimension cards, drill-downs)
- **Dashboard Filters** — 6 dimensions: Time, Last N, Section, Status, User, Keyword (server-side, all dimensions respond)
- **Self-Serve Onboarding / Welcome Flow** — zero-to-first-query in < 3 minutes for new users
- Nav Redesign — Chat + Intelligence primary; Knowledge + Manage dropdowns (11 tabs → clean hierarchy)
- Analytics (eval.jsonl aggregation)
- Chunk Explorer (with pinning)
- Electron desktop distribution (zero-infrastructure)
- Licensing system (Free / Pro / Lifetime)

### Strategic Documents Updated
- MOAT First Principle encoded in Company Constitution and DECISIONS.md
- IDS North Star documented in PRODUCT_VISION.md and NEXT_BIG_DIRECTION.md
- Decision 10: LLM is a plug-in, intelligence is permanent
- Decision 11: Foundation vendor threat, local-first as permanent defense
- Technology alignment: private AI future, why foundation advances benefit us

## In Progress

None.

## Platform Layer

The product has a complete intelligence layer with IDS tracking. The moat is now visible to users — they can watch their score compound over time. The transition from "documentation search" to "Intelligence Platform" is complete. Next evolution: make the intelligence compound faster through multi-user mode and external integrations.

## Stage Gate Status

**Stage 1 — Irreplaceability:** In progress. Builder using the product but daily irreplaceability not yet validated.
**Stage 2 — Five People:** Not started.
**Stage 3 — First Charge:** Not started.

## Not Yet Started — Pending Stage 1 Validation

- **VS Code Marketplace publish** — extension built and ready; `vsce publish` is a decision, not a technical blocker
- **Cloud-hosted trial instance** — requires infrastructure provisioning; deferred until Stage 1 complete
- **First paying customer outreach** — deferred until Stage 1 validated; premature outreach before irreplaceability is proven wastes the moat window
