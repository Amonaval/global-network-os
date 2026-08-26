# New Session Context — Knowledge Hub RAG

> **Paste the contents of this file at the start of every new Claude session.**
> It gives the AI complete context to resume work without re-explaining anything.

---

## What This Project Is

A **private, self-hosted RAG (Retrieval-Augmented Generation) assistant** built as an
Electron desktop app (`.exe` for Windows). It crawls any web-based documentation portal
(including Auth0/SSO-protected portals), chunks and indexes the content locally using
semantic embeddings, and serves a chat UI where users ask questions and get answers
grounded in the actual documentation.

**Key constraint:** Everything runs locally. No document content, embeddings, or queries
are sent to any external service (unless the user opts into cloud LLM or cloud embeddings).

**Current state:** Fully working Electron app. Setup wizard lets any user configure portal
URL, authentication, LLM provider, and embedding engine. Phase 1 enhancements are complete.

---

## Working Directory

```
D:\AI\xyz_org AI\docportal\xyz_org-docs-rag\
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Desktop shell | Electron (packaged via electron-builder → .exe) |
| Server | Node.js + Express (runs inside Electron) |
| Crawler | Playwright (Chromium persistent context, handles any auth/MFA) |
| Embeddings | nomic-embed-text via Ollama (local, 768d) — default |
| LLM | Ollama (qwen2.5:3b default) or Claude API (configurable) |
| Vector store | JSON file + BM25 + cosine similarity + RRF fusion |
| UI | Vanilla JS/HTML/CSS (no framework) |
| Config | `data/app_config.json` written by setup wizard |

---

## Key Files to Know

```
src/crawler/crawl.js        — Playwright crawler. Modes: crawl, prelogin. Flags: --incremental
src/ingestion/ingest.js     — chunk + embed + index pipeline. Flags: --force, --incremental
src/rag/query.js            — retrieval engine. Exports: query(), queryStream()
src/api/server.js           — Express API + SSE endpoints
src/config/config.js        — reads/writes data/app_config.json, configToEnv()
scripts/sync.js             — incremental re-crawl + re-ingest using saved config
public/js/app.js            — Chat UI frontend
public/js/setup.js          — Setup wizard frontend
public/setup.html           — Setup wizard HTML
```

---

## Current Configuration (user's saved config)

```
Portal: https://docx.xyz_org.com/docs
Auth type: browser (pre-cached Playwright session)
LLM: Ollama / qwen2.5:3b
Embeddings: nomic-embed-text (local via Ollama)
Vector store: JSON (data/vectors.json)
```

---

## How to Run

```bash
# Start the app (runs Express server at localhost:3000)
npm run server

# Or start Electron desktop app
npm run electron

# Rebuild knowledge base (incremental — fast)
npm run sync

# Rebuild knowledge base (force full rebuild)
npm run sync:force

# Diagnose retrieval issues
npm run diagnose "your question"
```

---

## Phase 1 Enhancements — COMPLETE (built in prior sessions)

### 1. Streaming Responses
- `src/rag/query.js`: added `askOllamaStream()`, `askClaudeStream()`, `queryStream()`
- `src/api/server.js`: added `POST /api/chat/stream` SSE endpoint
- `public/js/app.js`: `sendMessage()` uses streaming; tokens appear word-by-word; blinking cursor during stream; sources appear after completion
- `public/css/app.css`: `.message.ai.streaming::after` blinking cursor style

**How to see it:** Ask any question in the chat UI → words appear progressively with blinking `▋` cursor.

### 2. Rebuild Index Live Log (QW-1)
- `src/api/server.js`: `/api/setup/rebuild` now runs full crawl + ingest pipeline via SSE
- `public/js/app.js`: `rebuildIndex()` shows inline dark log panel with live output
- `public/css/app.css`: rebuild panel styles

**How to see it:** Sidebar → 🔄 Rebuild Index → dark terminal panel appears with live progress.

### 3. Incremental Re-crawl (Leap 3)
- `src/crawler/crawl.js`: `--incremental` flag, MD5 hash per page, `data/crawl_hashes.json`
- `src/ingestion/ingest.js`: `--incremental` flag, MD5 hash per file, `data/ingest_hashes.json`
- `scripts/sync.js`: wrapper that reads `app_config.json` and runs both scripts with correct env vars
- `package.json`: added `sync`, `sync:force`, `crawl:incremental`, `ingest:incremental` scripts

**How to see it (CLI):** `npm run sync` — second run skips unchanged pages.

---

## Phase 2 — Next Up (not yet started)

1. **Local Document Upload** — PDF, DOCX, ZIP, MD drag-and-drop. New `POST /api/docs/upload` endpoint. Pure-JS deps: `pdf-parse`, `mammoth`, `adm-zip`.
2. **Eval Harness + Analytics Dashboard** — log every query to `data/eval.jsonl`, port eval CLI from cr2 project, new Analytics tab in chat UI.
3. **Per-Section Vector Store Isolation** — each section gets its own `data/vectors_<section>.json` (port `SpaceVectorStore` pattern from cr2).

---

## Phase 3 — Planned (after Phase 2)

- Confluence OAuth adapter (REST API, no crawling)
- Google Drive integration
- Smart "not found" suggestions (recommendSpaces from cr2)
- vLLM support

## Phase 4 — Planned (Month 3)

- License key validation system
- Stripe payment integration
- Free tier feature gating

---

## Important Design Decisions (don't re-litigate these)

| Decision | What was chosen | Why |
|---|---|---|
| Storage | JSON file (not SQLite) | `better-sqlite3` needs C++ build tools on Windows |
| Crawler nav | `.article-next` button (not sidebar) | Does complete depth-first tree traversal |
| Embeddings | nomic-embed-text (not TF-IDF) | Semantic understanding of paraphrase queries |
| Search | BM25 + cosine + RRF hybrid | Exact term recall AND semantic relevance |
| History | Clean Q&A pairs only (no context blobs) | Context blobs bloated Ollama at turn 5+ |
| Chunking | NOMIC_MAX_CHARS=20000 cap | nomic crashes at >~6000 tokens; 20000 chars is safe |
| Auth | Playwright persistent context | Login once, session cached; handles any MFA type |

---

## Known Working Patterns

- **SSE streaming:** all long-running ops (build, rebuild, chat) use `text/event-stream`. Client reads with `response.body.getReader()`.
- **Child process env vars:** crawler and ingest don't import `config.js`. Server calls `configToEnv(readConfig())` and passes result as `childEnv` when spawning.
- **Crawl exit codes:** SIGTERM on child returns `code = null` (not 0). All build endpoints check `code !== 0` (not `code > 0`).
- **No `req.on('close')` handlers:** In Electron localhost, Express emits `close` on the request immediately after body is consumed — do NOT use it to kill child processes.

---

## Reference Docs in the Repo

- `CLAUDE.md` — complete config reference, API endpoints, crawler details
- `ARCHITECTURE.md` — data flow, search algorithm, chunk structure
- `DECISIONS.md` — all design decisions with rationale (D-01 through D-12)
- `KNOWN_ISSUES.md` — bugs found and fixes applied
- `project-docs/README.md` — documentation hub linking to session log and roadmaps
- `project-docs/session-log.md` — session-by-session history of what was built
