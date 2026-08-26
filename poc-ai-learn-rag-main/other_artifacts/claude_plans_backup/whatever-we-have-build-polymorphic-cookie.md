# Knowledge Hub — Artifact Catalog & Build Plan

## Context

You asked: given everything built so far, **what artifacts can be created**, across three audiences —
(a) end users of the system, (b) architects needing depth on RAG behaviour (RAG/UI/DB/LLM/backend),
and (c) the system design of the entire RAG flow — and which are the **most important to build**,
covering both what exists today and a future-focused roadmap.

Exploration of the codebase confirms Knowledge Hub is a self-hosted, provider-agnostic RAG platform
with a **hand-rolled hybrid pipeline** (no LangChain/LlamaIndex): BM25 + cosine fused with Reciprocal
Rank Fusion, a sharded JSON vector store, pluggable LLM providers (Ollama / Claude / vLLM) and embedders
(Nomic / TF-IDF / OpenAI), confidence gating, context compression, codegen, a diagnose tool, and a
home-grown eval loop. The frontend (React 19 + Zustand + React Query) ships a 5-step setup wizard and
~15 panels, headlined by the **Intelligence Dashboard / IDS** (Intelligence Density Score).

**Key finding — what already exists (do NOT rebuild):** strategy (`knowledge-hub-strategy.html`),
GTM (`knowledge-hub-go-to-market.md`), RAG industry trends (`RAG_TRENDS_2025_2026.md` +
`rag-trends-artifact.html`), and RAG-to-persona strategy (`KH_RAG_STRATEGY_VISUAL.html`). These are
**strategy/market** artifacts.

**The real gaps** — and therefore the artifacts this plan builds — are **technical/system** artifacts:
there is no visual system-design of the actual RAG flow, no unified architect deep-dive across layers,
and no clean end-user product tour. `Questions_Open.txt` at repo root already frames exactly this ask.

**Decisions (confirmed):** deliver as **self-contained interactive HTML** (matching the existing
`artifact/*.html` dark-theme style), and build in the order **(c) system design → (b) architect deep-dive
→ (a) user tour**.

---

## The Artifact Catalog

Two tiers. **Tier 1 = build now** (the app as built today, the three requested audiences).
**Tier 2 = roadmap** (future-focused, tied to the platform vision in `.product/`).

### Tier 1 — Build Now (in sequence)

#### 1. `rag-system-design.html` — System Design of the RAG Flow *(category c — build first)*
The foundational artifact. A single interactive page tracing one question end-to-end.
- **Write path (ingest):** source fetch (portal/Confluence/URL/upload) → clean/extract → chunk
  (token-based, table-preserving, breadcrumb prefix) → embed → sharded JSON vector store.
- **Read path (query):** embed question → hybrid search (BM25 + cosine) → RRF fuse → priority
  multipliers → confidence gate → context compression (dedup + token budget + `[n]` citations) → LLM
  → streamed answer with sources.
- Include a **live legend** mapping each stage to its source file and the config knob that controls it
  (`topK`, `hybridWeight`, `confidenceGate`, `chunkSize/overlap`, `CTX_BUDGET`).
- **Draws from:** `src/ingestion/{ingest,cleaner,embedder}.js`, `src/vectorstore/store.js`,
  `src/rag/query.js`, `src/config/config.js`, root `ARCHITECTURE.md`, `project-docs/RAG_PIPELINE.md`.

#### 2. `rag-architect-deepdive.html` — Architect Deep-Dive Across Layers *(category b — build second)*
Layer-by-layer "why", tabbed or sectioned by the five layers you named:
- **RAG layer:** classification (this is *Hybrid Retrieval RAG*, not Naïve, not yet Agentic), RRF math
  (k=60), BM25 params (k1=1.5, b=0.75), `HYBRID_WEIGHT` semantics, confidence + deflection gating.
- **UI layer:** React 19 + Zustand + React Query split, SSE streaming (`useStream`), the two entry
  points (main app + wizard), 15-panel `ActivePanel` map.
- **DB / vector store:** JSON sharding per section, record shape `{id,text,meta,embedding}`, dimension
  auto-migration (768/1536/2048), Pinecone as optional/aspirational.
- **LLM layer:** provider fan-out (Ollama/Claude/vLLM), streaming vs non-streaming, model defaults —
  **flag the inconsistency** (`query.js` defaults `claude-sonnet-4` while `llm.js`/`codegen.js` default
  `claude-haiku-4-5`).
- **Backend layer:** Express endpoint map grouped by concern (chat, setup/build SSE, Confluence,
  uploads, analytics/intelligence, licensing), child-process build pipeline.
- **Draws from:** all of the above plus `src/api/server.js`, `src/rag/{llm,codegen,diagnose}.js`,
  `.claude/.engineering/{DECISIONS,GLOSSARY,MODULE_INDEX}.md`.

#### 3. `product-user-tour.html` — End-User Product Tour *(category a — build third)*
How to actually use the system, screen by screen, for an operator (not a buyer — that's the existing
strategy/demo artifacts).
- 5-step **setup wizard** walkthrough (source → auth → AI settings → build).
- **Chat**: sections filter, pinned chunks, citations, suggestions, streaming.
- **Intelligence Dashboard / IDS**: what the 0–100 score means, the 70 "moat threshold", the six KPIs,
  team/per-user bars, trend sparkline.
- The other panels grouped: Knowledge (Map/Gaps/Memory/Risk/Insights), Manage (Upload/Chunks/Health/
  Decisions/Onboarding/Maintenance/Build).
- **Draws from:** `frontend/src/components/wizard/Step1-5*.tsx`,
  `frontend/src/components/chat/IntelligenceDashboard.tsx`, `frontend/src/store/appStore.ts`,
  `frontend/src/hooks/useApi.ts`.

### Tier 2 — Roadmap (future-focused)

4. **`rag-evolution-roadmap.html`** — the pipeline's growth path: Hybrid RAG (today) → contextual
   retrieval → cross-encoder reranking → Agentic RAG / tool-use → GraphRAG. Ties each step to a persona
   need and to `RAG_STRATEGY.md`'s in/out-of-scope boundary. (Bridges the *strategy* artifacts you
   already have with the *system* artifacts above.)
5. **`ids-moat-explainer.html`** — deep visual of the IDS formula, how usage compounds the switching-cost
   moat, and the 90-day window. Draws from `computeIDS()` and the North-Star memory.
6. **`api-reference.html`** — interactive, grouped reference for the ~40 Express endpoints (request/
   response shapes, SSE event types). Useful once the VS Code extension / integrations expand.
7. **`agentic-ai-leverage.html`** — the Question-1 gap in `Questions_Open.txt`: agentic AI both as a
   product capability (tool-using retrieval, autonomous doc maintenance) and as a build accelerator.
8. **`eval-observability.html`** — how the home-grown eval loop (`eval.jsonl`, `eval.js`, analytics/gaps
   endpoints) works, and the path toward RAGAS-style scoring.

**Housekeeping surfaced during exploration (not artifacts, but worth noting in the deep-dive):**
canonicalize the three overlapping `ARCHITECTURE.md` files (root / `project-docs/` / 165-byte
`.engineering/` stub); the Claude model default inconsistency; and dead duplicates
(`src/rag/oldcodegen/codegen_old.js`, `src/ingestion/cleaner - Copy.js`).

---

## Build Approach

- Each artifact is a **single self-contained `.html`** written to `artifact/`, following the existing
  dark-theme, inline-CSS/JS convention of `knowledge-hub-strategy.html` / `rag-trends-artifact.html`
  (no external CDN/fonts required to render; theme-aware).
- Content is **grounded in the actual code** (file paths + real config values cited above), not generic
  RAG description — this is what makes them architect-grade rather than marketing.
- Build strictly in sequence 1 → 2 → 3; each reuses the stage model established by #1 so the three read
  as one coherent set. Tier 2 built later, on request.
- The `artifact-design` skill must be loaded before writing each page (per Artifact tooling rules), and
  `artifact-diagramming` for the pipeline diagrams in #1 and #2.

## Verification

- Open each generated `.html` directly in a browser (or via the Artifact tool preview) and confirm it
  renders standalone with no console/network errors and works in both light and dark theme.
- **Accuracy check:** cross-read each artifact's technical claims against the cited source files
  (e.g., confirm RRF k=60, BM25 k1/b, IDS weights, endpoint list) so no diagram drifts from the code.
- Confirm no overlap/duplication with the existing strategy/GTM/trends artifacts already in `artifact/`.
