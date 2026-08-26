# Plan: Five Knowledge Hub HTML Artifacts

## Context

The user has five companion artifacts that need to be created to bridge the existing strategy documents (RAG_STRATEGY.md, IDS logic, GTM) with the codebase as actually built (server.js endpoints, computeIDS(), eval.js, query.js pipeline). Each artifact has a distinct audience and job — some are navigational references, some are persuasive explainers, one is a developer tool. Every one gets a distinct visual identity pitched at its actual treatment level.

---

## Artifact 1 — `rag-evolution-roadmap.html`

**Job**: Show the RAG evolution arc (hybrid → contextual enrichment → reranking → agentic → GraphRAG), anchored to persona needs and the in/out-of-scope decisions from RAG_STRATEGY.md. Makes the strategy feel like a journey, not a checklist.

**Treatment**: Editorial. This is a document they'll share with co-founders and future team members. It needs a distinct point of view.

**Design identity**
- Palette: Deep ink navy `#0D1B2A`, warm parchment `#F2E8D0`, bronze amber `#B8651C`, muted sage `#3D6B50`, pale blue-slate `#6B8FA8` — warm cartographic feel, like an architectural timeline
- Type: Display — a geometric serif rendered via `@font-face` data URI (Playfair Display or DM Serif Display for stage headings); Body — `system-ui` with generous line-height (1.7); Mono — for code/config references
- Layout: Vertical spine down the center page. Each stage is a horizontal band crossing the spine. Left margin carries persona callouts ("who benefits here"). Right margin carries in/out-of-scope flags. The spine breaks visually at Stage 1 (current) vs. stages ahead. A single amber horizontal rule marks "where we are today."
- Risk (the one bold move): Stage bands alternate between parchment and navy grounds — light then dark alternating — which makes the evolution feel like turning pages, not scrolling a list.

**Content sources**
- Evolution path steps: `RAG_STRATEGY.md` → "Evolution Path" section
- Implementation status table: `RAG_STRATEGY.md` → "Current Implementation Status"
- Persona-to-stage mapping: `RAG_STRATEGY.md` → "Our Customers" table + Tier 1/2/3 rationale text
- In/out-of-scope boundary: `RAG_STRATEGY.md` → "Out of Scope" section
- RAG pattern details (what each stage is): `RAG_TRENDS_2025_2026.md` sections 5 (Reranking), 2 (Agentic), 3 (GraphRAG), 13 (Contextual RAG)

**Key sections**
1. Hero band: "From Search to Reasoning" — 3-line thesis
2. Stage 0 (Current): Hybrid BM25 + Dense + RRF + Confidence Gate — ✓ Implemented
3. Stage 1A: Contextual Chunk Enrichment — persona: Aarav/Anjali, why fragments fail, 67% stat
4. Stage 1B: Cross-Encoder Reranking — `cross-encoder/ms-marco-MiniLM-L-6-v2`, 10–25% precision gain
5. Stage 1C: RAGAS Evaluation — what it measures (Faithfulness, Precision, Recall, Relevancy)
6. Stage 2: Document-Type Chunking + Multimodal
7. Stage 3: GraphRAG (enterprise legal/medical) + Agentic Multi-Hop
8. Permanent boundary: "What we deliberately do not build" — AST code chunking, LangGraph orchestration now, code graph traversal
9. Footer: links to rag-system-design.html and rag-architect-deepdive.html

---

## Artifact 2 — `ids-moat-explainer.html`

**Job**: Explain the IDS formula, show mathematically why ≥ 0.7 creates a self-reinforcing moat, and make the 90-day window feel urgent but achievable. Audience: founders, potential investors, curious early customers.

**Treatment**: Editorial, with a precision-instrument aesthetic. This is a persuasion piece that uses math as its rhetorical engine.

**Design identity**
- Palette: Near-black `#0A0F1E`, electric indigo `#3B4EFF`, phosphor green `#22C77A`, warm white `#F4F6FA`, mid-slate `#8896AA` — instrument panel, slightly cold, credible
- Type: Display — a condensed grotesque for large numbers and labels (a data-focused feel); Body — `system-ui`; Numerics — monospace, `font-variant-numeric: tabular-nums`
- Layout: Opens with the IDS score as a massive typographic display (0.00 → 0.70 → 1.00 scale bar). Then decomposes the formula into 5 weighted component cards in a 2+3 or 3+2 grid. Then a "compound moat" section showing usage → memory → IDS → retention loop. Closes with the 90-day window callout.
- Risk: The IDS number scale bar (0–1) is rendered as a live-feeling gauge with a marker at 0.70 labeled "Moat begins here" — static HTML but visually feels like a reading instrument.

**Content sources from code** (exact weights from `IntelligenceDashboard.tsx` lines 15–47)
```
overallSuccessRate × 0.30
queryVolumeFactor × 0.15
memoryClusters × 0.20
gapRatio × 0.15
riskBaseline + 0.10
avgHealth × 0.10
```
Plus idsLabel() thresholds: < 0.30 = "No signal", 0.30–0.50 = "Emerging", 0.50–0.70 = "Building moat", ≥ 0.70 = "Moat achieved"

**Key sections**
1. Hero: IDS as the single number that defines irreplaceability
2. The formula: 5 weighted components, each with name / weight bar / what it measures / how to improve it
3. The threshold: Why 0.70, not 0.65 or 0.80 — what the components sum to at 0.70 in practice
4. The compound loop: diagram — more queries → more eval.jsonl → better memory clusters → higher IDS → more trust → more queries
5. The 90-day window: why competitors can't reconstruct organizational memory even if they copy the feature set
6. The risk: what drags IDS down (high blocked rate, dead sections, no repeat users)

---

## Artifact 3 — `api-reference.html`

**Job**: Interactive grouped reference for all ~40 Express endpoints — request/response shapes, SSE event types, streaming vs REST. Audience: developer (future self building the VS Code extension or integrations).

**Treatment**: Utilitarian but highly polished. Developer reference. Needs to be scannable, copyable, and trustworthy.

**Design identity**
- Palette: Dark `#0D1117` (GitHub-adjacent but not identical), pale mint `#D6FFE8`, terminal green `#1DB954`, near-white `#E6EDF3`, comment gray `#6E7681` — developer documentation feel with a distinct mint accent instead of blue
- Type: Display — none needed; Body — `system-ui`; Code — `'Fira Code', 'Cascadia Code', 'Consolas', monospace` — monospace throughout for method/path labels
- Layout: Two-column: fixed left sidebar (nav by category), scrollable right main area. Each endpoint is a card with method badge (color-coded: GET teal, POST amber, DELETE red, PATCH purple), path in monospace, description, request shape (collapsible), response shape (collapsible). SSE endpoints get a special "⚡ Streaming" badge.
- Risk: The sidebar stays fixed on scroll (sticky) and highlights the current category with a left rail indicator. Clicking a nav item smooth-scrolls and expands the first endpoint in that group.

**Endpoint groups** (from server.js route table)
1. Chat & Query (POST /api/chat/stream, POST /api/chat)
2. Setup & Build (POST /api/setup/build, rebuild, reset, cancel, test-*)
3. Document Upload (POST /api/docs/upload, GET /api/docs/uploads, DELETE)
4. Confluence Integration (test, spaces, oauth/*)
5. Intelligence & IDS (GET /api/team/ids, intelligence/history, intelligence/snapshot)
6. Analytics & Gaps (GET /api/analytics, /api/gaps, /api/gaps/intelligence, POST /api/gaps/outline)
7. Knowledge (GET /api/knowledge/map, POST /api/knowledge/summary, GET /api/knowledge/risk)
8. Insights & Memory (GET /api/insights, /api/memory, /api/decisions, POST /api/decisions/extract)
9. Health & Sections (GET /api/health, PATCH /api/health/section/:section, DELETE, POST /api/health/review/:section, GET /api/sections)
10. Sessions (GET/DELETE /api/sessions, /api/session/:id)
11. Code Generation (POST /api/code/generate)
12. Config & Status (GET/POST /api/app/config, GET /api/app/status, /api/stats, /api/license)
13. Onboarding & Maintenance (POST /api/onboard, GET /api/maintenance/staleness, POST /api/maintenance/suggest)
14. Chunk Explorer (POST /api/chunks/search)

**SSE event types** (from query.js + server.js)
- `token` — LLM output token
- `phase` — pipeline phase label (retrieving, ranking, generating)
- `log` — build/ingest progress log line
- `done` — final payload `{answer, sources, sessionId, score}`
- `error` — error message

---

## Artifact 4 — `agentic-ai-leverage.html`

**Job**: Explain Agentic AI in two roles — as a future product capability in KH (tool-using retrieval, autonomous doc maintenance) and as the build accelerator already in use (Claude Code constructing the platform). Addresses the gap in Questions_Open.txt.

**Treatment**: Editorial position paper. Two-column diptych structure makes the two roles feel like two sides of the same coin.

**Design identity**
- Palette: Warm off-white `#FAF7F2`, deep plum `#2D1B4E`, copper `#C4712A`, steel blue `#4A6FA5`, light gray `#E8E4DE` — intellectual, warm, editorial — feels like a considered strategy memo from a boutique consultancy, not a startup blog
- Type: Display — a transitional serif (Georgia or Charter-style data URI) for section titles; Body — `system-ui`; Mono — for code/tool references
- Layout: Opens with a full-width thesis statement. Below, two equal columns: LEFT = "Agentic AI as product feature" / RIGHT = "Agentic AI as build accelerator." Each column has 3 segments. Below the columns, a convergence section: "The recursive advantage — building an AI product with AI."
- Risk: A subtle diagonal line / watermark separating the two columns that dissolves at the convergence section below — signals the merging of the two themes.

**Content sources**
- RAG_TRENDS_2025_2026.md → Section 2 (Agentic RAG vs Naive RAG)
- RAG_STRATEGY.md → Tier 3 ("Agentic / Multi-Hop RAG for Complex Professional Queries")
- query.js → the tool-using pattern possible if extended (multi-hop retrieval loop)
- PRODUCT_BRAIN.md → platform identity, what we don't compete on
- The actual Claude Code usage context (the user is building with Claude Code right now)

**Left column — KH as agentic product** (future capability)
1. What agentic retrieval means: iterative query decomposition, self-grading, tool calls to multiple sources
2. Which personas benefit: Marcus (multi-hop legal research), Dr. Priya (cross-reference between papers)
3. The RAG_STRATEGY.md placement: Stage 3+ — why not yet, what must be true first
4. What it would look like in the UI: a "Research Mode" vs. "Quick Answer" toggle

**Right column — Claude Code as build accelerator** (current reality)
1. How the platform was built: Claude Code as the engineering partner
2. What this proves about the product: dog-fooding the intelligence leverage thesis
3. The token ROI model: each Claude Code session is an investment in accumulated codebase context
4. The recursive advantage: as KH indexes its own build history, it can answer "why was this built this way?"

---

## Artifact 5 — `eval-observability.html`

**Job**: Document the home-grown eval loop — eval.jsonl schema, eval.js CLI flags, the analytics/gaps endpoints that read it, current KPIs, and the path toward RAGAS-style scoring. Audience: developer/founder reviewing the observability posture before first paying customer.

**Treatment**: Utilitarian + operational. Think: a well-designed ops runbook, not a landing page. Dense but organized.

**Design identity**
- Palette: `#0F172A` (deep slate), `#F8FAFC` (near-white), `#0D9488` (teal signal), `#F59E0B` (amber warning), `#EF4444` (red critical), `#64748B` (mid-slate) — semantic color is the palette; the teal/amber/red are the three signal states; no decorative accent competing with them
- Type: Display — none (all headings are weight/size hierarchy within `system-ui`); Body — `system-ui`; Code/Data — monospace
- Layout: Three-part document:
  - Part 1: The Data Contract — eval.jsonl record schema as a typed table, with each field's purpose and which endpoints consume it
  - Part 2: The Observability Surface — current KPIs (answer rate, blocked rate, avg semantic score, avg latency, per-section risk) with visual representations of where thresholds sit
  - Part 3: The Path Forward — RAGAS gap analysis (what we have vs. Faithfulness/Context Precision/Context Recall/Answer Relevancy), prioritized implementation steps
- Risk: Part 1 is rendered as a "schema card" — monospace field names, type badges, purpose prose — that reads like a well-maintained API schema doc. Feels more trustworthy than a table.

**Content sources**
- `src/rag/eval.js` — CLI flags, KPI calculations, field reading logic
- `src/rag/query.js` → the eval.jsonl write call (what fields are written, when)
- `src/api/server.js` → `/api/analytics` and `/api/gaps` handlers (what they aggregate from eval.jsonl)
- `RAG_STRATEGY.md` → RAGAS section (what to move toward)
- `RAG_TRENDS_2025_2026.md` → Section 9 (Evaluation Frameworks — RAGAS, TruLens, DeepEval, Arize Phoenix)

**eval.jsonl record fields** (reconstructed from eval.js and query.js)
- `question` — user query text
- `answer` — LLM response text (or null if blocked)
- `status` — `answered` | `blocked` | `soft_blocked`
- `score` — semantic similarity score (top chunk vs query)
- `rrfScore` — hybrid RRF score from retrieval
- `latencyMs` — end-to-end query latency
- `sections` — array of section names used
- `ts` — timestamp
- `sessionId` — session identifier
- `sources` — array of `{section, title, url, score}`

**KPI thresholds** (from analytics endpoint logic)
- Answer rate: > 80% = healthy, 60–80% = watch, < 60% = blocked alert
- Blocked rate: < 20% = healthy
- Avg semantic score: > 0.35 = healthy (CONF_GATE baseline is 0.15)
- Latency: < 2000ms = healthy

---

## Output Paths

All artifacts written to `D:\AI\AI_Learning_Projects\poc-ai-learn-rag\artifact\`:
- `artifact/rag-evolution-roadmap.html`
- `artifact/ids-moat-explainer.html`
- `artifact/api-reference.html`
- `artifact/agentic-ai-leverage.html`
- `artifact/eval-observability.html`

---

## Reuse Existing Files

- Reference `artifact/rag-architect-deepdive.html` and `artifact/rag-system-design.html` for cross-links in rag-evolution-roadmap.html and eval-observability.html
- Do not replicate the pipeline diagram from rag-system-design.html — link to it instead

---

## Implementation Order

Build in this order to allow cross-referencing:
1. `eval-observability.html` — most concrete, data-grounded, no cross-links needed
2. `api-reference.html` — pure reference, self-contained
3. `ids-moat-explainer.html` — uses IDS formula from code
4. `rag-evolution-roadmap.html` — the strategy bridge piece
5. `agentic-ai-leverage.html` — the most conceptual, built last when all others exist

---

## Verification

- Open each file in a browser in both light and dark mode (DevTools forced dark)
- Check: sidebar nav in api-reference.html stays fixed on scroll
- Check: IDS formula weights sum to 1.0 (0.30+0.15+0.20+0.15+0.10+0.10 = 1.00 ✓ — but note: riskBaseline adds 0.10 as a constant, not a multiplier, so the formula adds 0.10 then multiplies the other 5 components summing to 0.90 of the weighted input — verify the display is accurate to the code at IntelligenceDashboard.tsx lines 15–47)
- Check: endpoint count in api-reference.html matches the route table (40+ routes verified from server.js)
- Check: eval.jsonl field names match what eval.js actually reads (verified against src/rag/eval.js lines)
- Check: all cross-links between artifacts use relative paths (`./rag-system-design.html` etc.)
- Check: no scrolling sideways on any page (wide tables/code have overflow-x: auto)
