# CLAUDE.md — Knowledge Hub RAG

> **Read this first on every session.** This is the complete source of truth for this project.
> Do not ask the user to re-explain anything covered here.
>
> **Session continuity:** Also read `project-docs/session-log.md` — it has the full 10-session
> history and captures every decision, bug fix, and architectural change made since the project started.

---

## 1. What this project is

A **private, self-hosted RAG (Retrieval-Augmented Generation) assistant** — a desktop app and
web server that lets you connect any documentation source, build a local knowledge base, and
chat with an AI that answers questions grounded in your actual docs.

**Distribution:** Ships as a Windows `.exe` via Electron. The setup wizard guides configuration
on first launch. No `.env` editing required by end users.

**Privacy guarantee:** All data stays on the user's machine. No doc content, embeddings, or
queries are sent externally (unless user opts into cloud LLM or embeddings in the wizard).

**Current stack:** Node.js · Playwright · Ollama · nomic-embed-text · Express · Electron · Vanilla JS UI

**Future stack (planned):** TypeScript · Vite + React · LanceDB · pnpm · Vitest · Lemon Squeezy
See Section 15 for the full roadmap.

---

## 2. Repository layout

```
knowledge-hub-rag/
│
├── CLAUDE.md                         ← this file (auto-read by Claude Code)
├── ARCHITECTURE.md                   ← deep technical detail
├── DECISIONS.md                      ← every design decision + rationale
├── KNOWN_ISSUES.md                   ← bugs found, fixes applied, current status
│
├── electron.js                       ← Electron main process
├── src/
│   ├── crawler/
│   │   └── crawl.js                  ← Playwright crawler (Auth0-aware + generic)
│   ├── ingestion/
│   │   ├── cleaner.js                ← HTML → clean text + chunker
│   │   ├── embedder.js               ← nomic / TF-IDF / OpenAI (swappable factory)
│   │   └── ingest.js                 ← pipeline orchestrator (incremental + full)
│   ├── vectorstore/
│   │   └── store.js                  ← per-section JSON store + BM25 + cosine + RRF
│   ├── rag/
│   │   ├── query.js                  ← retrieval engine + LLM caller (streaming)
│   │   ├── eval.js                   ← query analytics CLI
│   │   ├── diagnose.js               ← retrieval debugger CLI
│   │   └── inspect_chunk.js          ← HTML file → extracted text viewer
│   ├── api/
│   │   └── server.js                 ← Express REST API + SSE streaming + session store
│   ├── config/
│   │   └── config.js                 ← app_config.json R/W + configToEnv() factory
│   ├── integrations/
│   │   ├── confluence.js             ← ConfluenceClient (API token + OAuth 2.0)
│   │   └── confluence-fetch.js       ← standalone: fetch Confluence pages to docs/
│   └── license/
│       └── license.js                ← tier system, activation, usage gates
│
├── public/                           ← Chat UI (single-page app)
│   ├── index.html
│   ├── setup.html                    ← Multi-step setup wizard
│   ├── css/
│   │   ├── app.css
│   │   └── setup.css
│   └── js/
│       ├── app.js                    ← Chat UI logic (~1100 lines)
│       └── setup.js                  ← Wizard logic + validation
│
├── scripts/
│   ├── setup.js                      ← first-run setup (legacy .env mode)
│   └── sync.js                       ← incremental crawl+ingest wrapper
│
├── project-docs/                     ← Session logs + roadmaps
│   ├── session-log.md                ← ⭐ READ THIS for session history
│   ├── README.md                     ← How to onboard a new session
│   └── *.md                          ← Phase roadmaps, validation guides
│
├── docs/                             ← GITIGNORED — crawled HTML files
│   ├── manifest.json                 ← index of all crawled pages
│   ├── uploads/                      ← user-uploaded documents
│   └── <section>/NNN_title.html      ← one file per crawled page
│
├── data/                             ← GITIGNORED — all runtime data
│   ├── app_config.json               ← wizard-saved config (source of truth)
│   ├── vectors_<section>.json        ← per-section embedded chunks
│   ├── ingest_meta.json              ← provider, dims, timestamp
│   ├── sessions.json                 ← conversation history
│   ├── eval.jsonl                    ← query log for analytics
│   ├── upload_index.json             ← uploaded document registry
│   ├── license.json                  ← activated license (if any)
│   ├── machine_id.txt                ← fingerprint for license binding
│   ├── crawl_hashes.json             ← incremental crawl checksums
│   ├── ingest_hashes.json            ← incremental ingest checksums
│   └── skipped_chunks.log            ← chunks that failed to embed
│
├── user_data/                        ← GITIGNORED — Playwright browser session
└── .env                              ← GITIGNORED — legacy env file (setup.html is preferred)
```

---

## 3. Quick-start commands

```bash
# First-time setup
npm install
npm run electron                 # Launch Electron app → setup wizard opens automatically

# CLI pipeline (advanced / server mode)
npm run crawl                    # Playwright crawl of configured portal
npm run crawl:incremental        # Only re-crawl changed pages
npm run ingest                   # chunk + embed + index all docs
npm run ingest:incremental       # Only re-embed changed pages
npm run ingest -- --force        # Wipe index + rebuild from scratch
npm run sync                     # Incremental crawl + ingest in one shot
npm run server                   # http://localhost:3000 (no Electron)

# Confluence
npm run confluence:fetch                  # Fetch all Confluence spaces
npm run confluence:fetch:incremental      # Fetch only changed pages

# Debugging
npm run diagnose "your question" [--section name]
npm run inspect docs/<section>/<file>.html
npm run query "your question"
npm run eval -- --summary
npm run eval -- --blocked        # Show unanswered questions (doc gaps)
```

---

## 4. Configuration — `data/app_config.json`

The wizard writes this file on first run. The server reads it on startup via `src/config/config.js`.
**Never edit `.env` directly** — use the wizard or edit `app_config.json`.

Key sections:
```json
{
  "app":       { "name": "Knowledge Hub" },
  "source":    { "type": "portal" },
  "portal":    { "baseUrl": "", "sections": [], "contentSelector": "#main-content", "nextButtonSelector": ".article-next" },
  "confluence":{ "url": "", "spaces": [], "authMethod": "apitoken", "email": "", "apiToken": "" },
  "auth":      { "type": "none", "email": "", "password": "" },
  "llm":       { "provider": "ollama", "ollamaUrl": "...", "ollamaModel": "qwen2.5:3b", "vllmUrl": "", "vllmModel": "" },
  "embeddings":{ "provider": "nomic", "nomicModel": "nomic-embed-text" },
  "retrieval": { "topK": 6, "hybridWeight": 0.5, "confidenceGate": 0.22, "chunkSize": 400, "chunkOverlap": 50 },
  "setupComplete": true
}
```

`configToEnv(config)` in `src/config/config.js` converts this to env vars when spawning child processes (crawl, ingest).

---

## 5. Ollama model recommendations

| Model | Speed | Quality | RAM | Notes |
|---|---|---|---|---|
| `qwen2.5:3b` | ⚡⚡⚡ | ⭐⭐⭐⭐ | 3.5GB | **Default. Best for tech docs.** |
| `phi3.5` | ⚡⚡ | ⭐⭐⭐⭐ | 4GB | Strong on structured content |
| `llama3.2` | ⚡⚡ | ⭐⭐⭐ | 3.5GB | Good general balance |
| `mistral` | 🐢 | ⭐⭐⭐⭐ | 5GB | Best quality, too slow on CPU |

Switch via wizard Step 4 LLM section or edit `app_config.json`. No re-ingestion needed.

---

## 6. Source types

### Web Portal (Playwright crawl)
- Portal URL + section slugs configured in wizard Step 2
- Auth0/Microsoft SSO supported (form or Microsoft auth type)
- `.article-next` button traversal — depth-first, visits all nested sub-pages
- **Upload-only mode:** Leave portal URL and sections blank — valid, uses uploaded docs only
- Incremental re-crawl via `--incremental` flag (MD5 hash comparison)

### Confluence
- REST API v2 — no crawling, structured page fetches
- Auth: API token (Basic auth) OR OAuth 2.0 (3LO flow via Atlassian)
- Fetches pages with `body-format=export_view` (rendered HTML)
- Saves to `docs/confluence-<spacekey>/NNN_slug.html`
- Supports `--incremental` with MD5 hashes in `data/confluence_hashes.json`
- Wizard Step 3 skipped when source = Confluence (auth configured in Step 2)

### Uploaded Documents
- Via Upload panel in chat UI (📎 Upload button)
- Formats: PDF, DOCX, TXT, MD, HTML, ZIP
- Saved to `docs/uploads/`, chunked+embedded inline (SSE progress)
- Tracked in `data/upload_index.json`

---

## 7. Ingestion pipeline

```
Source (HTML files from crawl / Confluence / uploads)
  → cleaner.js: HTML → markdown text (tables preserved as | col | col |)
  → cleaner.js: overlapping chunks (CHUNK_SIZE=400 tokens, CHUNK_OVERLAP=50)
  → embedder.js: nomic-embed-text via Ollama (768d) — one chunk at a time
  → store.js: upsert into data/vectors_<section>.json (per-section sharding)
  → data/ingest_meta.json: record provider + dims
```

**Per-section sharding (QW-2):** Each section gets its own `vectors_<section>.json`.
`store.js` loads all shards into one in-memory `_data` array for search.
Upserts write only the affected shard.
Auto-migrates from legacy single `vectors.json` on first startup.

**Incremental mode:** `ingest_hashes.json` tracks file → MD5 hash.
Unchanged files skip parsing + embedding entirely.

**Critical — nomic context limit:**
`NOMIC_MAX_CHARS = 20000` chars. Embed one chunk at a time.
Failed chunks: zero-vector assigned, excluded from search, logged to `data/skipped_chunks.log`.

---

## 8. Vector store + retrieval

### Hybrid search (BM25 + cosine + RRF)
1. **Cosine similarity** on nomic embeddings (semantic meaning)
2. **BM25** keyword frequency scoring (`k1=1.5`, `b=0.75`)
3. **Reciprocal Rank Fusion:** `score = Σ 1/(60 + rank)` — weighted by `HYBRID_WEIGHT`
4. `store.setQuery(queryText)` must be called before `store.search()` to enable BM25

### Confidence gate (dual)
```
passesGate = semScore >= 0.15  OR  (rrfScore >= 0.014 AND semScore >= 0.05)
```
Prevents blocking BM25-found content that has low cosine similarity (e.g. filename queries).
If gate fails: return "not found" + suggest sections where related content was found.

### Context compression (before LLM call)
1. Drop chunks below `MIN_CHUNK_SCORE` (semScore)
2. Trigram Jaccard dedup (>55% overlap → keep higher-scored chunk)
3. Greedy budget fill up to `CTX_TOKEN_BUDGET` tokens

### Query expansion
Before retrieval: LLM generates 2 rephrased versions of the question.
Run retrieval for all 3, deduplicate, re-sort. Falls back silently if LLM unavailable.

---

## 9. Streaming + SSE

All LLM responses stream via Server-Sent Events:
- `POST /api/chat/stream` — SSE endpoint; retrieval first, then tokens streamed
- Token events: `data: {"type":"token","message":"word"}`
- Done event: `data: {"type":"done","message":{"sources":[...],"debug":{...},"sessionId":"..."}}`
- Blinking cursor `▋` shown in UI during streaming

Build pipeline (crawl + ingest) also streams progress via SSE to the setup wizard and rebuild panel.

---

## 10. Session memory

- Sessions in `data/sessions.json` — survive server restarts
- `sessionId` in browser `localStorage` — survives page refreshes
- Max 30 messages per session; sidebar shows last 40 sessions
- **History sent to LLM:** clean Q&A pairs only — no prior context blobs
  (`messages = [{role:"user",content:"Q"},{role:"assistant",content:"A"},...]`)

---

## 11. REST API endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/chat/stream` | SSE streaming chat (query gate enforced) |
| `GET` | `/api/sections` | List indexed sections with chunk counts |
| `GET` | `/api/stats` | Index stats (chunks, provider, model) |
| `GET` | `/api/session/:id` | Restore session messages + title |
| `GET` | `/api/sessions` | List all sessions |
| `DELETE` | `/api/session/:id` | Delete a session |
| `POST` | `/api/chunks/search` | Search chunks without LLM |
| `POST` | `/api/docs/upload` | Upload + index documents (SSE, gate-checked) |
| `GET` | `/api/docs/list` | List uploaded documents |
| `DELETE`| `/api/docs/:id` | Delete an uploaded document |
| `GET` | `/api/analytics` | Query analytics from eval.jsonl |
| `GET` | `/api/license` | Current license status + usage |
| `POST` | `/api/license/activate` | Activate a license key |
| `DELETE`| `/api/license` | Remove license |
| `POST` | `/api/stripe/webhook` | Stub — wire to payment provider webhook |
| `POST` | `/api/confluence/test` | Test Confluence connection |
| `GET` | `/api/confluence/spaces` | List available Confluence spaces |
| `POST` | `/api/confluence/oauth/start` | Start OAuth 2.0 flow |
| `GET` | `/api/confluence/oauth/callback` | OAuth callback (Atlassian redirects here) |
| `GET` | `/api/confluence/oauth/status` | Poll OAuth completion |
| `GET` | `/api/setup/test-vllm` | Test vLLM server connectivity |
| `POST` | `/api/setup/build` | Run full crawl+ingest pipeline (SSE) |
| `POST` | `/api/setup/rebuild` | Rebuild knowledge base (SSE) |
| `POST` | `/api/setup/reset` | Wipe data + reset to pre-setup state |
| `GET` | `/api/app/status` | setupComplete flag + app name |

---

## 12. Licensing

- **Free tier:** 200 queries/month, 5 uploaded documents, no Confluence, no Analytics
- **Pro / Lifetime:** Unlimited queries + uploads, all features
- License key format: `XXXX-XXXX-XXXX-XXXX` (alphanumeric)
- Offline mode: `LTM-`/`LIFE-` prefix → Lifetime; anything else → Pro
- Machine ID: `sha256(hostname + platform + cpu).slice(0,32)`, cached in `data/machine_id.txt`
- `checkQueryGate()` has a 60-second cache to avoid full `eval.jsonl` scan on every request
- Stripe stubs exist in `server.js`; **Lemon Squeezy** is the recommended future payment provider

---

## 13. UI features

- **Chat tab** — streaming AI responses with source chips + follow-up suggestions
- **Chunk Explorer tab** — search chunks, see S/B/RRF scores, expand full text
- **Upload panel** — drag-drop PDF/DOCX/TXT/MD/HTML/ZIP, live SSE progress
- **Analytics panel** — query stats from eval.jsonl (answer rate, top unanswered, etc.)
- **Pinning** — pin chunks from Explorer → next answer uses only pinned chunks
- **License modal** — tier info, usage bars, pricing plans, key activation
- **Sidebar footer (3 zones):**
  1. Stats line (N chunks · model) + mode badges
  2. Action buttons: Upload / Analytics / Settings gear (dropdown: Reconfigure / Rebuild / Reset)
  3. License badge + Upgrade link
- **Session history** — sidebar list, click to restore any past conversation
- **Out-of-scope badge** — shown when confidence gate fires (no hallucination)
- **Debug line** — chunks used, tokens, dropped counts, latency

---

## 14. Known dependency constraints

| Removed | Replaced with | Reason |
|---|---|---|
| `better-sqlite3` | plain JSON file | node-gyp / C++ on Windows |
| `tiktoken` | char/4 estimate | Native binary, same reason |
| `marked` | inline renderer | Overkill for chat bubbles |

All remaining deps are pure JavaScript — `npm install` works on Windows without build tools.
**Future:** LanceDB (embedded vector store with prebuilt Windows binaries) for Phase 2.

---

## 15. Long-term tech stack (approved plan)

| Layer | Current | Target | When |
|---|---|---|---|
| Language | CommonJS JS | **TypeScript** (incremental, `allowJs:true`) | Phase 2 |
| Frontend | Vanilla JS SPA | **Vite + React 19 + Zustand + TanStack Query** | Phase 2 |
| API layer | Express REST | **Express + Zod schemas** | Now |
| Vector store | Per-section JSON | **LanceDB** (embedded, prebuilt Windows binaries) | Phase 2 (>20k chunks) |
| App data | JSON + eval.jsonl scan | **sql.js** for analytics | Phase 2 |
| Desktop | Electron | **Keep Electron** (IPC improvements) | Phase 2 |
| LLM orchestration | Custom `ask*Stream` | **Keep custom** (optionally Vercel `ai` SDK) | Phase 2 |
| Testing | Zero | **Vitest** + **Supertest** + **Playwright** (already dep) | Now |
| Package manager | npm | **pnpm** | Now |
| Linting | None | **ESLint** + **Prettier** | Now |
| Payments | Stripe stub | **Lemon Squeezy** (Merchant of Record) | Phase 2 |
| License API | Offline only | **Vercel Edge Function** | Phase 2 |
| Auth (multi-user) | N/A | **Clerk** | Phase 3 |
| Cloud DB | N/A | **Supabase** + pgvector | Phase 3 |
| Deployment | .exe only | **Docker + Railway** | Phase 2 |

**Do NOT adopt:** LangChain.js (fights the confidence gate + BM25+RRF), Next.js (wrong for desktop), Tauri (Playwright crawler won't work), better-sqlite3 (node-gyp).

---

## 16. What's done vs what's next

### Done ✅
- Electron app with multi-step setup wizard
- Generic Playwright crawler (any portal, any auth type)
- Confluence integration (API token + OAuth 2.0)
- Document upload (PDF, DOCX, TXT, MD, HTML, ZIP)
- HTML cleaning with table preservation
- Nomic semantic embeddings (768d)
- Per-section vector store sharding (QW-2)
- Hybrid BM25 + semantic + RRF search
- Dual confidence gate (prevents hallucination)
- Smart "not found" suggestions (QW-3) — suggests sections with related content
- SSE streaming responses
- Multi-turn conversation with session memory
- Session persistence (browser + server)
- Incremental re-crawl + re-ingest (MD5 hashes)
- Query expansion (3 search angles)
- Analytics dashboard (eval.jsonl + `/api/analytics`)
- Chunk viewer + pinning UI
- Follow-up question suggestions
- Debug telemetry per answer
- Diagnose + Inspect CLI tools
- vLLM / OpenAI-compatible LLM support (QW-4)
- Licensing system (Free/Pro/Lifetime, offline activation)
- License modal with plan cards + usage bars
- Query gate + upload gate enforcement
- Sidebar footer redesign (3-zone: stats / actions / license)
- Portal URL optional (upload-only mode)
- OAuth TTL cleanup, upload orphan cleanup, license cache

### Not done / Phase 2 next
- TypeScript migration (start with `tsconfig.json` + `tsx` + `src/types/index.ts`)
- Vitest unit tests (`compressContext`, `BM25.scores`, `chunkText`)
- Zod `AppConfigSchema` runtime validation
- ESLint + Prettier setup
- pnpm migration
- Lemon Squeezy payment integration (replace Stripe stub)
- Vercel Edge Function for `LICENSE_API_URL`
- Vite + React migration (setup wizard first)
- LanceDB vector store adapter
- sql.js for eval analytics
- Answer citations inline `[1]`, `[2]` linked to sources
- Smart document sync (chokidar file watcher)
- Answer feedback (👍/👎) logged to eval.jsonl
- GitHub Actions CI/CD

---

## 17. Session continuity instructions

At the start of every new Claude session:
1. Read this file (`CLAUDE.md`)
2. Read `project-docs/session-log.md` for the full history
3. Do NOT re-explain what's in these files — build on top of it

At the end of every session:
1. Update `project-docs/session-log.md` with what was built, changed, and fixed
