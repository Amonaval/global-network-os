# Quick Commands Reference

> All npm scripts, CLI tools, and diagnostic commands in one place.

---

## Server & Pipeline

```bash
npm run server              # Start Express server at http://localhost:3000
npm run crawl               # Full crawl — all configured sections
npm run ingest              # Embed + index all crawled pages
npm run full-pipeline       # ingest + server (skips crawl)
```

---

## Sync (Recommended for Regular Updates)

```bash
npm run sync                # Incremental: crawl + ingest only changed pages
npm run sync:force          # Full rebuild: re-crawl everything, wipe + rebuild index
```

`sync` reads `data/app_config.json` automatically — no env var setup needed.

---

## Incremental (Manual)

```bash
npm run crawl:incremental   # Crawl — skip unchanged pages (needs baseline first)
npm run ingest:incremental  # Ingest — skip unchanged files
```

Force flags:
```bash
npm run ingest -- --force           # Wipe vectors.json and rebuild from scratch
npm run ingest -- --section mdm     # Rebuild one section only
```

---

## Debugging

```bash
npm run diagnose "your question"
npm run diagnose "your question" --section mdm

npm run inspect docs/section-name/003_page-title.html

npm run query "your question"    # Direct query (no server needed)
```

---

## First-Time Setup

```bash
npm install
node scripts/setup.js        # Creates .env, dirs, prints next steps
```

Then edit `.env` with at minimum:
```
AUTH_EMAIL=your-email@company.com
AUTH_PASSWORD=your-password
```

---

## Diagnose Output Guide

```
① Vector Store        — total chunks, section breakdown
② Query Embedding     — vector dimensions (768 for nomic)
③ BM25 top 5          — keyword frequency scores
④ Semantic top 5      — cosine similarity scores
                          < 0.22  →  unrelated (will be blocked)
                          0.22-0.30 → marginal
                          0.30-0.45 → relevant
                          0.45+    → strong match
⑤ Hybrid top 5        — RRF-merged scores (what LLM gets)
⑥ Recommendations     — issues found + suggestions
```

---

## Environment Variables (`.env`)

```env
# LLM
LLM_PROVIDER=ollama                    # or: claude
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b               # recommended
# ANTHROPIC_API_KEY=sk-ant-...
# CLAUDE_MODEL=claude-sonnet-4-20250514

# Embeddings
EMBEDDING_PROVIDER=nomic              # or: tfidf, openai
NOMIC_MODEL=nomic-embed-text
# OPENAI_API_KEY=sk-...
# EMBEDDING_MODEL=text-embedding-3-small

# Vector Store
VECTOR_STORE_PROVIDER=json
VECTOR_DB_PATH=./data/vectors.json

# Crawler
AUTH_EMAIL=amol.naval@xyz_org.com
AUTH_PASSWORD=<password>
DOCS_DIR=./docs

# Retrieval Tuning
TOP_K=6                   # chunks retrieved per query
HYBRID_WEIGHT=0.5         # 0=pure semantic, 1=pure BM25
CTX_TOKEN_BUDGET=1800     # max context tokens to LLM
CONFIDENCE_GATE=0.22      # below this = blocked (no LLM call)
MIN_CHUNK_SCORE=0.15      # drop chunks below this from context
CHUNK_SIZE=400            # target chunk size in tokens
CHUNK_OVERLAP=50          # overlap between consecutive chunks

# Server
PORT=3000
```

---

## REST API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/chat` | Non-streaming: question → answer + chunks + sources |
| `POST` | `/api/chat/stream` | **Streaming SSE**: token-by-token answer |
| `GET` | `/api/sections` | List indexed sections with chunk counts |
| `GET` | `/api/stats` | Index stats (chunks, provider, model) |
| `GET` | `/api/session/:id` | Restore session messages |
| `GET` | `/api/sessions` | List all sessions (sidebar) |
| `DELETE` | `/api/session/:id` | Delete a session |
| `POST` | `/api/chunks/search` | Search chunks without calling LLM |
| `POST` | `/api/setup/build` | Start full build (SSE) |
| `POST` | `/api/setup/rebuild` | Rebuild index (SSE, same as build) |
| `POST` | `/api/setup/cancel` | Reset stuck build job |
| `POST` | `/api/setup/prelogin` | Open browser for manual login (SSE) |
| `GET` | `/api/setup/config` | Read current config |

---

## Ollama Commands

```bash
ollama serve                     # Start Ollama server (if not auto-started)
ollama list                      # List downloaded models
ollama pull qwen2.5:3b           # Download recommended LLM
ollama pull nomic-embed-text     # Download embedding model
ollama pull phi3.5               # Alternative LLM
ollama pull mistral              # Best quality (slow on CPU)
```

---

## Data Files Reference

```
data/
  vectors.json          ← embedded chunks (main index, can be large)
  ingest_meta.json      ← provider, dims, timestamp
  sessions.json         ← all conversation history
  crawl_hashes.json     ← MD5 per page for incremental crawl
  ingest_hashes.json    ← MD5 per HTML file for incremental ingest
  app_config.json       ← wizard config (used by sync and server)
  tfidf_model.json      ← TF-IDF vocab (if EMBEDDING_PROVIDER=tfidf)
  skipped_chunks.log    ← chunks that failed to embed

docs/
  manifest.json         ← index of all crawled pages
  <section>/
    001_page-title.html ← raw innerHTML per page

user_data/              ← Playwright browser session cache (keeps auth)
```

---

## Troubleshooting One-Liners

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Force clear stuck build (from browser console)
fetch('/api/setup/cancel', {method:'POST'})

# Force full rebuild (wipes index)
npm run ingest -- --force

# Check what sections are indexed
curl http://localhost:3000/api/sections

# Check index stats
curl http://localhost:3000/api/stats
```

---

## Changing LLM Model (No Re-ingest Needed)

1. Edit `.env`: change `OLLAMA_MODEL=<model-name>`
2. Restart server: `npm run server`
3. No crawl or ingest needed — models are swappable at runtime

Or via `data/app_config.json`:
```json
{ "llm": { "provider": "ollama", "model": "phi3.5" } }
```
