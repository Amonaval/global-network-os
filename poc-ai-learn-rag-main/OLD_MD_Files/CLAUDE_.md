# CLAUDE.md — XYZ_ORG Doc Portal RAG (XYZ_ORG-rag)

## What this project is
A private, self-hosted RAG (Retrieval-Augmented Generation) system that crawls the XYZ_ORG
documentation portal (docx.XYZ_ORG.com), indexes it locally, and serves a chat UI where
employees can ask questions and get answers grounded in the actual documentation.

**Everything runs locally. No data leaves the machine.**

---

## Current architecture (v4 — stable)

```
XYZ_ORG-rag/
├── src/
│   ├── crawler/
│   │   └── crawl.js          ← Playwright browser crawler (Auth0-aware)
│   ├── ingestion/
│   │   ├── cleaner.js        ← HTML → markdown text + smart chunker
│   │   ├── embedder.js       ← nomic (default) / TF-IDF / OpenAI
│   │   └── ingest.js         ← pipeline: chunk → embed → store + mismatch detection
│   ├── vectorstore/
│   │   └── store.js          ← JSON file store with BM25 + cosine hybrid search + RRF
│   ├── rag/
│   │   ├── query.js          ← retrieval engine + Ollama/Claude LLM + query expansion
│   │   └── diagnose.js       ← diagnostic tool for debugging retrieval
│   └── api/
│       └── server.js         ← Express API + session persistence
├── public/                   ← Chat UI (HTML/CSS/JS)
├── docs/                     ← Crawled HTML files (git-ignored)
├── data/                     ← vectors.json, sessions.json, tfidf_model.json, ingest_meta.json
├── user_data/                ← Playwright browser session cache (git-ignored)
└── .env                      ← Config (never commit)
```

---

## Key architectural decisions (DO NOT change without understanding why)

### Embedding
- **Default: `nomic-embed-text` via Ollama** — 768-dimensional semantic vectors
- Run once: `ollama pull nomic-embed-text`
- Falls back to TF-IDF if `EMBEDDING_PROVIDER=tfidf` in `.env`
- **Dimension mismatch auto-detection**: ingest.js checks stored dims vs expected dims.
  If you switch providers, it forces a full re-index automatically.
- `MAX_CHUNK_CHARS = 20000` — nomic's context limit is ~8192 tokens (~32768 chars).
  We cap at 20000 to be safe. This was set after hitting "input length exceeds context" errors.
- Batch size = 8 (not 32) — smaller batches so one oversized chunk can't crash the whole run.
  Each chunk embedded individually with skip-and-continue on error.

### Vector store
- Single `data/vectors.json` file — JSON array of `{id, text, meta, embedding}`
- **Hybrid search**: BM25 keyword + cosine similarity, fused with RRF (Reciprocal Rank Fusion)
- `HYBRID_WEIGHT=0.5` — balanced. Set to 0 for pure semantic, 1 for pure BM25.
- `store.setQuery(text)` must be called before `store.search()` to enable BM25 side.

### Chunking
- `CHUNK_SIZE=400` tokens, `CHUNK_OVERLAP=50` tokens
- Tables and code blocks are treated as **atomic** — never split mid-row or mid-block
- Oversized atomic blocks are hard-split at line boundaries (the fix for the nomic crash)
- Every chunk gets a breadcrumb prefix: `**Page:** <breadcrumb>\n**Section:** <heading>`
- This prefix is included in size budget calculation (was a bug in earlier versions)

### Retrieval
- `TOP_K=6` chunks retrieved per query
- `CONFIDENCE_GATE=0.22` — if best semantic score < 22%, reject before calling LLM.
  This prevents hallucination on out-of-scope questions.
- `MIN_CHUNK_SCORE=0.15` — chunks below this dropped from context
- Context compression: trigram Jaccard dedup (>55% overlap = drop), then budget fill
- `CTX_TOKEN_BUDGET=1800` tokens max context sent to LLM
- **Query expansion**: asks LLM to generate 2 extra search angles before retrieval
- History passed as clean Q&A pairs only — NOT with prior context blobs injected
  (this was the memory bug fix — prevents context window bloat over multi-turn)

### LLM
- **Default: Ollama** — `OLLAMA_MODEL=qwen2.5:3b`
- Recommended models (in order of quality/speed): `qwen2.5:3b` > `phi3.5` > `mistral` > `gemma2:2b`
- `temperature=0.1` — low for factual answers
- Switch to Claude: `LLM_PROVIDER=claude` + `ANTHROPIC_API_KEY=sk-ant-...`
- Note: Claude.ai subscription ≠ API access. API key from console.anthropic.com separately.

### Sessions
- Stored in `data/sessions.json` — survives server restarts
- `sessionId` persisted in browser `localStorage` — survives page refreshes
- Max 30 messages per session (older ones pruned)
- Session title auto-generated from first user message

---

## Crawler details

**Auth method**: Playwright persistent context (`user_data/` directory caches session)
**Login flow**: Microsoft SSO → password → MFA (phone call)
**After first login**: session cached, subsequent crawls are headless (no MFA)
**Navigation**: follows `.article-next` button — this does a depth-first traversal of the
full doc tree including nested sub-pages. This is correct — do NOT switch to sidebar parsing.

**Items crawled** (edit `ITEMS` array in `src/crawler/crawl.js`):
```
pqr, abc
```

**Known issue fixed**: `Element is not attached to the DOM` crash on next-button click.
Fix: `page.evaluate(() => btn.click())` instead of holding an ElementHandle.
Per-page try/catch — broken pages are skipped and logged, crawl continues.

**Output**: `docs/<section>/NNN_page-title.html` + `docs/manifest.json`

---

## Known issues & history

### The table content issue
- Problem: "Standard Offerings & Personalization Options" page wasn't answering correctly
- Root cause: The page content IS crawled correctly. The issue was in the HTML cleaner not
  preserving table structure properly. Fixed in `cleaner.js` — tables converted to markdown.
- If you hit this again: run `npm run inspect docs/<section>/<file>.html` to see extracted text

### The nomic crash (SOLVED)
- Error: `{"error":"the input length exceeds the context length"}`
- Root cause 1: Corrupted ingest.js file had literal newlines inside string literals
- Root cause 2: Chunk size limit was too lenient (28000 chars, not safe enough)
- Fix: Rewrote ingest.js from scratch, set `NOMIC_MAX_CHARS=20000`, embed one-at-a-time
  with skip-and-continue. Skipped chunks logged to `data/skipped_chunks.log`.

### Dimension mismatch (SOLVED)
- Error: retrieval works but answers are wrong/irrelevant
- Root cause: Ingested with TF-IDF (2048d), then switched to nomic (768d). Scores become
  meaningless but don't crash.
- Fix: `ingest.js` now auto-detects and forces rebuild. Also exposed in `npm run diagnose`.

### Memory not persisting across page refresh (SOLVED)
- Root cause: `sessionId` was `crypto.randomUUID()` on every page load
- Fix: `localStorage.getItem(STORAGE_KEY) || newSessionId()`

---

## NPM scripts

```bash
npm run setup           # create .env from .env.example, create required dirs
npm run crawl           # crawl docx.XYZ_ORG.com (opens browser first time)
npm run ingest          # chunk + embed + index all crawled docs
npm run ingest -- --force            # wipe + rebuild entire index
npm run ingest -- --section mdm      # rebuild one section only
npm run server          # start chat UI at http://localhost:3000
npm run query "question" # test retrieval from CLI
npm run diagnose "question" --section <key>  # debug retrieval pipeline
npm run inspect docs/<section>/<file>.html   # see what text is extracted from a file
npm run full-pipeline   # ingest + server
```

---

## Environment variables (`.env`)

```env
# LLM
LLM_PROVIDER=ollama           # or: claude
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b

# Embeddings
EMBEDDING_PROVIDER=nomic      # or: tfidf, openai
NOMIC_MODEL=nomic-embed-text

# Vector store
VECTOR_STORE_PROVIDER=json    # or: pinecone
VECTOR_DB_PATH=./data/vectors.json

# Crawler credentials
AUTH_EMAIL=amol.naval@XYZ_ORG.com
AUTH_PASSWORD=<password>

# Retrieval tuning
TOP_K=6
HYBRID_WEIGHT=0.5
CTX_TOKEN_BUDGET=1800
CONFIDENCE_GATE=0.22
MIN_CHUNK_SCORE=0.15
CHUNK_SIZE=400
CHUNK_OVERLAP=50

PORT=3000
```

---

## Dependency notes
- `better-sqlite3` was intentionally REMOVED — requires C++ / Visual Studio on Windows
- `tiktoken` was intentionally REMOVED — native binary
- `lowdb` was considered but `JSON file read/write directly` was simpler
- All deps are pure JavaScript — `npm install` works without build tools on Windows

---

## What works, what's next

**Working:**
- Full crawl of all 8 product sections
- Hybrid retrieval with RRF
- Multi-turn conversation with memory
- Session persistence across restarts
- Chunk viewer + pinning in UI
- Confidence gate prevents hallucination
- Debug line under each answer (chunks used, tokens, scores)

**Not yet done (future work):**
- Confluence integration into this same UI (separate project: confluence-rag-v2)
- Streaming responses (currently waits for full answer)
- Incremental re-crawl (only re-fetch changed pages)
- Role-based chunk filtering (Auth0 roles → chunk access levels)
- Docker container for one-command deployment
