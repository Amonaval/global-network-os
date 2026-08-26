# System Architecture

Knowledge Hub is a private, self-hosted AI knowledge assistant built on a RAG foundation.
All data stays on the user's machine unless a cloud LLM is explicitly opted into.

---

## High-Level Data Flow

```
Source (Portal / Confluence / Upload)
        ↓
   crawl.js / confluence.js / server.js (upload)
        ↓
   cleaner.js  ← HTML → clean markdown, preserve tables
        ↓
   ingest.js   ← chunk, hash (MD5), skip unchanged
        ↓
   embedder.js ← nomic-embed-text (768d) via Ollama
        ↓
   store.js    ← per-section JSON shards (data/vectors_<section>.json)
        ↓
   query.js    ← BM25 + cosine + RRF hybrid search
        ↓
   confidence gate → pass / reject
        ↓
   context compression → token budget fill
        ↓
   LLM (qwen2.5:3b / Claude API / vLLM)
        ↓
   server.js   ← SSE streaming to browser
        ↓
   public/index.html ← chat UI
```

---

## Module Responsibilities

| Module | File | Responsibility |
|--------|------|----------------|
| Crawler | `src/crawler/crawl.js` | Playwright-based, auth-aware web crawler |
| Cleaner | `src/ingestion/cleaner.js` | HTML → markdown, table preservation |
| Ingestion | `src/ingestion/ingest.js` | Chunk pipeline, MD5 dedup, section routing |
| Embedder | `src/ingestion/embedder.js` | Text → vector (nomic / TF-IDF / OpenAI) |
| Vector Store | `src/vectorstore/store.js` | JSON shards, BM25 index, hybrid search |
| RAG Query | `src/rag/query.js` | Retrieval, confidence gate, context compression |
| API Server | `src/api/server.js` | Express REST + SSE streaming |
| Config | `src/config/config.js` | Read/write `data/app_config.json`, env injection |
| Confluence | `src/integrations/confluence.js` | OAuth 2.0 + API token sync |
| License | `src/license/license.js` | Machine ID, tier gating, usage tracking |
| Diagnose | `src/rag/diagnose.js` | 7-step debug tool for retrieval quality |
| Eval | `src/rag/eval.js` | Query analytics → `data/eval.jsonl` |

---

## Storage Layout

```
data/
├── app_config.json        — setup wizard output, all runtime config
├── vectors_<section>.json — per-section vector shards (loaded into memory at startup)
├── sessions.json          — chat session history (max 40 sessions, 30 messages each)
├── eval.jsonl             — one JSON line per query: ts, question, topSemScore, latencyMs, blocked, softBlocked, sectionsUsed[], nearMissSections[], usedChunks, budgetUsed
└── license.json           — machine ID (sha256), tier, usage counters
```

---

## Electron Shell

`electron.js` (root) is the Electron main process:
- Spawns `src/api/server.js` as a child process
- Reads `data/app_config.json` to decide: load `setup.html` (first run) or `index.html` (chat)
- Passes all config as env vars to the child process via `configToEnv()`
- App distributes as a single Windows `.exe` — zero external infrastructure required

---

## Streaming Protocol (SSE)

Both chat and build processes use Server-Sent Events.

```
POST /api/chat/stream
  → event: data, payload: {"type":"token","message":"..."}   (one per LLM token)
  → event: data, payload: {"type":"done","message":{"sources":[...], "debug":{...}, "sessionId":"...", "followUps":[...]}}
```

---

## Security Boundaries

- All vector data stored locally in `data/`
- Crawler credentials stored in `data/app_config.json` (never transmitted)
- Cloud LLM (Claude API, vLLM) is opt-in — default is fully local Ollama
- License validation is machine-ID based (sha256 hash), no external call required for Free tier
- Confluence OAuth 2.0 uses state nonce with 10-minute TTL, browser polling
