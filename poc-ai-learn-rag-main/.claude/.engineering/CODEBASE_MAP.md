# Codebase Map

Single-read orientation for the entire codebase. Read this first. Navigate to detail files only when the task requires it.

*Last updated: 2026-08-21 — Product Polish: citation chips redesigned, IDS gradient meter, streaming cursor fix*

---

## System Data Flow

```
Source (file / URL / Confluence)
  → Extractor (pdf / docx / code / text / zip)
  → Cleaner → Chunker → Embedder
  → VectorStore (JSON-sharded, per-section)
  → [Query time] Hybrid Retrieval (BM25 + cosine + RRF)
  → Section Multipliers → Confidence Gate
  → LLM (streaming)
  → eval.jsonl (every query logged)
  → Intelligence Layer (gaps, health, IDS, memory, decisions, risk)
```

---

## Module Registry

### Backend — Core Pipeline

| Path | Purpose | Status |
|---|---|---|
| `src/api/server.js` | All API routes — the single backend entry point | Built |
| `src/config/config.js` | Central config (model, paths, thresholds) | Built |
| `src/ingestion/ingest.js` | Ingestion orchestrator — coordinates all extractors | Built |
| `src/ingestion/cleaner.js` | Text normalisation before chunking | Built |
| `src/ingestion/embedder.js` | Generates embeddings (Ollama/local model) | Built |
| `src/ingestion/extractors/pdf.js` | PDF text + table extraction | Built |
| `src/ingestion/extractors/docx.js` | DOCX extraction | Built |
| `src/ingestion/extractors/code.js` | Source code file extraction (as documents) | Built |
| `src/ingestion/extractors/text.js` | Plain text / markdown | Built |
| `src/ingestion/extractors/zip.js` | ZIP unpacking → delegates to other extractors | Built |
| `src/crawler/crawl.js` | Generic web crawler (Playwright, multi-auth, incremental) | Built |
| `src/integrations/confluence.js` | Confluence OAuth 2.0 + API token ingestion | Built |
| `src/integrations/confluence-fetch.js` | Confluence page fetching utility | Built |
| `src/vectorstore/store.js` | JSON-sharded vector store; hybrid BM25+cosine+RRF search | Built |

### Backend — RAG & Intelligence

| Path | Purpose | Status |
|---|---|---|
| `src/rag/query.js` | Query engine: hybrid retrieval, section multipliers, confidence gate, soft-block detection | Built |
| `src/rag/llm.js` | LLM interface: prompt building, streaming, model routing | Built |
| `src/rag/codegen.js` | Code generation mode (separate prompt path) | Built |
| `src/rag/copilot.js` | Engineering Copilot — streams 5-section implementation plan before any code | Built |
| `src/ingestion/enricher.js` | Contextual chunk enricher (D.12) — LLM context prepended to each chunk before embedding | Built |
| `src/rag/eval.js` | Eval scoring — writes to `data/eval.jsonl` | Built |
| `src/rag/ragas.js` | RAGAS evaluation pipeline — LLM-as-judge: Faithfulness, Context Precision, Context Recall | Built |
| `src/rag/reranker.js` | Cross-encoder reranker (D.13) — batched LLM scoring, 1 call for all candidates | Built |
| `src/rag/diagnose.js` | Diagnostics endpoint | Built |
| `src/decisions/extract.js` | LLM-based decision extraction → `data/decisions.json` | Built |
| `src/license/license.js` | Free / Pro / Lifetime license check | Built |

### Frontend — Intelligence Panels

| Path | Purpose | Status |
|---|---|---|
| `frontend/src/components/chat/IntelligenceDashboard.tsx` | IDS meter, 6 KPI tiles, 4 dimension cards — the command centre | Built |
| `frontend/src/components/chat/GapsPanel.tsx` | Documentation gap intelligence | Built |
| `frontend/src/components/chat/HealthPanel.tsx` | Documentation health score + trend | Built |
| `frontend/src/components/chat/MemoryPanel.tsx` | Organisational memory / query clusters | Built |
| `frontend/src/components/chat/DecisionsPanel.tsx` | Engineering decision graph | Built |
| `frontend/src/components/chat/KnowledgeRiskPanel.tsx` | Knowledge risk analysis (SPOF, dead sections) | Built |
| `frontend/src/components/chat/InsightsPanel.tsx` | Top topics, pain areas, section quality trend | Built |
| `frontend/src/components/chat/MaintenancePanel.tsx` | Autonomous maintenance suggestions | Built |
| `frontend/src/components/chat/RagasPanel.tsx` | RAGAS eval UI — generate test set, run evaluation, view history | Built |
| `frontend/src/components/chat/AnalyticsPanel.tsx` | Query analytics (eval.jsonl aggregation) | Built |
| `frontend/src/components/chat/KnowledgeMapPanel.tsx` | Cross-source knowledge map | Built |

### Frontend — Interaction & Onboarding

| Path | Purpose | Status |
|---|---|---|
| `frontend/src/components/chat/InputArea.tsx` | Chat input + streaming response handler | Built |
| `frontend/src/components/chat/MessageList.tsx` | Message list rendering | Built |
| `frontend/src/components/chat/MessageItem.tsx` | Individual message + source citations | Built |
| `frontend/src/components/chat/CopilotPanel.tsx` | Engineering Copilot UI — spec input, streamed plan output, "→ Build" handoff | Built |
| `frontend/src/components/chat/BuildPanel.tsx` | Code generation UI | Built |
| `frontend/src/components/chat/UploadPanel.tsx` | File upload UI | Built |
| `frontend/src/components/chat/WelcomeFlow.tsx` | Self-serve onboarding (zero to first query < 3 min) | Built |
| `frontend/src/components/chat/OnboardingPanel.tsx` | Role-based onboarding assistant | Built |
| `frontend/src/components/chat/ChunkExplorer.tsx` | Chunk viewer with pinning | Built |
| `frontend/src/components/chat/RebuildPanel.tsx` | Knowledge rebuild trigger | Built |
| `frontend/src/components/chat/FilterBar.tsx` | 6-dimension server-side dashboard filters | Built |
| `frontend/src/components/chat/Sidebar.tsx` | Primary nav (Chat + Intelligence primary; Knowledge + Manage dropdowns) | Built |

### Frontend — Setup Wizard

| Path | Purpose | Status |
|---|---|---|
| `frontend/src/components/wizard/Step1Welcome.tsx` → `Step5Build.tsx` | 5-step guided setup wizard | Built |
| `frontend/src/store/wizardStore.ts` | Wizard state (Zustand) | Built |
| `frontend/src/store/appStore.ts` | Global app state (Zustand) | Built |

### Distribution

| Path | Purpose | Status |
|---|---|---|
| `electron.js` | Electron shell — Node server as child process | Built |
| `vscode-extension/src/extension.ts` | VS Code sidebar extension — ready to publish | Built |
| `public/setup.html` + `public/js/setup.js` | HTML setup wizard (non-Electron path) | Built |
| `src/license/license.js` | License enforcement (Free/Pro/Lifetime) | Built |

---

## Intelligence Data Model

These files are the permanent product asset. The LLM is a plug-in; these are the moat.

| File | Powers | Schema note |
|---|---|---|
| `data/eval.jsonl` | ALL intelligence features — gaps, health, IDS, memory, insights, analytics | Foundation. Every query logged with userId, section, score, blocked, softBlocked |
| `data/ragas_eval_set.jsonl` | Synthetic Q&A test set for RAGAS evaluation | Generated by `POST /api/eval/ragas/generate` |
| `data/ragas_history.jsonl` | RAGAS run history — Faithfulness, Precision, Recall per run | Appended by `POST /api/eval/ragas/run` |
| `data/decisions.json` | Decision Graph, Decisions Panel | Extracted by `src/decisions/extract.js` |
| `data/intelligence_snapshots.jsonl` | IDS sparkline, delta KPIs, trend banners | Weekly snapshots; written by `/api/snapshots` |
| `data/ingest_hashes.json` | Incremental sync (file ingestion) | MD5 content hashes |
| `data/crawl_hashes.json` | Incremental sync (web crawler) | MD5 content hashes |
| `data/upload_index.json` | Uploaded file registry | — |
| `data/ingest_meta.json` | Section names, chunk counts | Written at ingest time |
| `data/sessions.json` | Multi-user session / identity | No auth; per-browser localStorage identity |
| `data/vectors_<section>.json` | Per-section vector shards (the vector store) | Loaded fully into memory at startup |

---

## Architectural Decision Index

Full rationale in `DECISIONS.md`. One-line verdicts here.

| # | Decision | Verdict |
|---|---|---|
| 1 | Local-first, privacy-first | **Permanent.** All data on device. Cloud LLMs opt-in only. |
| 2 | Hybrid retrieval (BM25 + cosine + RRF) | **Permanent.** Do not replace with single-method retriever. |
| 3 | JSON-sharded vector store (no DB) | **Permanent** until paying customer hits memory limit. |
| 4 | Dual confidence gate (hallucination prevention over recall) | **Permanent.** Never loosen to improve answer rate. |
| 5 | Electron shell (zero-infrastructure distribution) | **Permanent.** Must also run CLI-mode without Electron. |
| 6 | Incremental sync via MD5 hashing | **Permanent.** URL change without content change detected separately. |
| 7 | Rejected: rewrite to vector DB | **Rejected.** Revisit only if paying customer exceeds memory limits. |
| 8 | Section priority as score multipliers (1.3× boost, 0.4× ignore) | **Permanent.** No separate cache layer. |
| 9 | Model-agnostic JSON fallback parser for LLM output | **Permanent.** Apply to all extraction endpoints. |
| 10 | LLM is a plug-in; intelligence schema is permanent | **Permanent.** Add `schemaVersion` before first paying customer. |
| 11 | Local-first as competitive defense vs. foundation vendors | **Permanent.** Never transmit intelligence to cloud storage. |
| 12 | Contextual chunk enrichment (Anthropic pattern) | **Adopt before first paying regulated professional.** |
| 13 | Cross-encoder reranking (20–50 → 5–10 candidates) | **Shipped.** LLM-batched scoring. Enable: `RERANKER_ENABLED=true`. |
| 14 | Document-type chunking by professional segment | **Shipped.** Legal hierarchical + research semantic. Enable: `DOC_TYPE_CHUNKING=true`. |
| 15 | Code-aware RAG / AST chunking / code graph traversal — out of scope | **Permanently out of scope.** Not our product. |

---

## Navigation Guide — What to Load When

| Task involves... | Also read... |
|---|---|
| Retrieval quality, confidence gate, embeddings | `DECISIONS.md` D.2, D.4, D.13 + `RAG_STRATEGY.md` |
| Adding a new RAG pattern | `RAG_STRATEGY.md` FIRST — it gates all RAG decisions |
| Ingestion, new extractor, new source type | `src/ingestion/ingest.js` + `src/vectorstore/store.js` |
| New intelligence feature | Check `data/eval.jsonl` schema first — it probably has the data already |
| Architectural change | `DECISIONS.md` in full |
| Why something was built a certain way | `SESSION_MEMORY.md` — permanent lessons |
| New frontend panel | `IntelligenceDashboard.tsx` for reference + `appStore.ts` for state |
| Distribution / packaging | `electron.js` + `DECISIONS.md` D.5 |
| Customer / persona decisions | `.customer/` not `.engineering/` |
| Terminology confusion | `GLOSSARY.md` |

---

## How to Update This File

After every mission or feature, update:

1. **Module Registry** — add any new files; update status of changed modules
2. **Intelligence Data Model** — add new data files or schema changes
3. **Architectural Decision Index** — add new decisions (one-line only; full rationale in `DECISIONS.md`)
4. **Last updated** line at the top — date + one-phrase summary of what changed

Keep this file under 200 lines. If it grows beyond that, the detail belongs in a linked file, not here.
