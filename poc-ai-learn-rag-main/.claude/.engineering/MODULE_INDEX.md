# Module Index

Quick navigation to the codebase. Read this before exploring the repository.

---

## Backend — Core Pipeline

| Capability | Path |
|---|---|
| API Server (all routes) | `src/api/server.js` |
| Configuration | `src/config/config.js` |
| Ingestion orchestrator | `src/ingestion/ingest.js` |
| Text cleaning | `src/ingestion/cleaner.js` |
| Embedding generation | `src/ingestion/embedder.js` |
| File extractor — PDF | `src/ingestion/extractors/pdf.js` |
| File extractor — DOCX | `src/ingestion/extractors/docx.js` |
| File extractor — Code | `src/ingestion/extractors/code.js` |
| File extractor — Plain text | `src/ingestion/extractors/text.js` |
| File extractor — ZIP | `src/ingestion/extractors/zip.js` |
| Web crawler | `src/crawler/crawl.js` |
| Confluence integration | `src/integrations/confluence.js` |
| Confluence fetch | `src/integrations/confluence-fetch.js` |
| Vector store (JSON-sharded) | `src/vectorstore/store.js` |

---

## Backend — RAG & Intelligence

| Capability | Path |
|---|---|
| Query engine + confidence gate + hybrid retrieval | `src/rag/query.js` |
| LLM interface (prompt building, streaming, model routing) | `src/rag/llm.js` |
| Code generation | `src/rag/codegen.js` |
| Decision extraction | `src/decisions/extract.js` |
| Eval scoring | `src/rag/eval.js` |
| Diagnostics | `src/rag/diagnose.js` |

---

## Distribution

| Capability | Path |
|---|---|
| Electron shell | `electron.js` (root) |
| VS Code extension | `vscode-extension/src/extension.ts` |
| Setup wizard (HTML) | `public/setup.html` + `public/js/setup.js` |
| Licensing | `src/license/license.js` |

---

## Frontend — Intelligence Panels

| Capability | Path |
|---|---|
| Intelligence Dashboard (IDS meter, KPI tiles, Team IDS) | `frontend/src/components/chat/IntelligenceDashboard.tsx` |
| Gaps panel | `frontend/src/components/chat/GapsPanel.tsx` |
| Health panel (score + trend) | `frontend/src/components/chat/HealthPanel.tsx` |
| Memory panel (query clusters) | `frontend/src/components/chat/MemoryPanel.tsx` |
| Decisions panel | `frontend/src/components/chat/DecisionsPanel.tsx` |
| Knowledge risk panel | `frontend/src/components/chat/KnowledgeRiskPanel.tsx` |
| Insights panel | `frontend/src/components/chat/InsightsPanel.tsx` |
| Autonomous maintenance panel | `frontend/src/components/chat/MaintenancePanel.tsx` |
| Analytics panel | `frontend/src/components/chat/AnalyticsPanel.tsx` |
| Knowledge map panel | `frontend/src/components/chat/KnowledgeMapPanel.tsx` |

---

## Frontend — Interaction & Onboarding

| Capability | Path |
|---|---|
| Chat input + streaming | `frontend/src/components/chat/InputArea.tsx` |
| Message list + message items | `frontend/src/components/chat/MessageList.tsx`, `MessageItem.tsx` |
| Build panel (code generation UI) | `frontend/src/components/chat/BuildPanel.tsx` |
| Upload panel | `frontend/src/components/chat/UploadPanel.tsx` |
| Welcome / onboarding flow | `frontend/src/components/chat/WelcomeFlow.tsx` |
| Onboarding panel | `frontend/src/components/chat/OnboardingPanel.tsx` |
| Chunk explorer | `frontend/src/components/chat/ChunkExplorer.tsx` |
| Rebuild panel | `frontend/src/components/chat/RebuildPanel.tsx` |
| Filter bar (5-dimension server-side filtering) | `frontend/src/components/chat/FilterBar.tsx` |
| Sidebar + nav | `frontend/src/components/chat/Sidebar.tsx`, `SidebarFooter.tsx`, `TopBar.tsx` |

---

## Frontend — Setup Wizard

| Capability | Path |
|---|---|
| Wizard steps (1–5) | `frontend/src/components/wizard/Step1Welcome.tsx` → `Step5Build.tsx` |
| Wizard state | `frontend/src/store/wizardStore.ts` |
| App state (global) | `frontend/src/store/appStore.ts` |

---

## Data / Storage

| File | Purpose |
|---|---|
| `data/eval.jsonl` | Every query logged — foundation of the entire intelligence layer |
| `data/decisions.json` | Extracted decision graph |
| `data/intelligence_snapshots.jsonl` | Weekly IDS snapshots (sparkline, delta KPIs) |
| `data/ingest_hashes.json` | MD5 hashes for incremental sync |
| `data/crawl_hashes.json` | MD5 hashes for web crawler incremental sync |
| `data/upload_index.json` | Index of uploaded files |
| `data/ingest_meta.json` | Ingestion metadata (section names, counts) |
| `data/sessions.json` | Multi-user session / identity store |
| `data/vectors_<section>.json` | Section-sharded vector store (one file per section) |
