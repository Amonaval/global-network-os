# ARCHITECTURE.md — Knowledge Hub RAG

## End-to-end data flow

```
Source (Portal / Confluence / Upload)
        │
        ▼
  [crawl.js — Playwright]                    [confluence-fetch.js]           [server.js /upload]
  - persistent context (user_data/)          - REST API v2 paginated          - multer → disk
  - .article-next depth-first traversal      - body-format=export_view        - PDF/DOCX/TXT/MD/HTML/ZIP
  - per-page try/catch, skip on error        - OAuth 2.0 or API token         - inline cleaner+embedder
  - saves #main-content innerHTML            - saves to docs/confluence-*/    - SSE progress to browser
        │                                          │                                    │
        └──────────────────────────────────────────┴────────────────────────────────────┘
                                                   │
                                                   ▼
                                    docs/<section>/NNN_title.html
                                    docs/manifest.json
                                    docs/uploads/*.{pdf,docx,txt,...}
                                                   │
                                                   ▼
                                          [cleaner.js]
                                    - cheerio: strip nav/scripts/sidebar
                                    - headings → #/##/###
                                    - tables → | col | col | markdown
                                    - lists → bullet / numbered
                                    - code → fenced blocks
                                    - atomic block detection (tables, code)
                                    - hard-split at line boundary if >MAX_CHUNK_CHARS
                                    - inject breadcrumb prefix into every chunk
                                                   │
                                                   ▼
                                     [embedder.js — NomicEmbedder]
                                    - one chunk at a time (batch=1)
                                    - POST /api/embed to Ollama
                                    - truncate at NOMIC_MAX_CHARS=20000
                                    - skip-and-continue on errors
                                    - zero-vector for failed chunks
                                                   │
                                                   ▼
                                  [store.js — JSONVectorStore (per section)]
                                    - data/vectors_<section>.json
                                    - upsert by chunk id (idempotent)
                                    - BM25 index rebuilt in memory on startup
                                    - data/ingest_meta.json: provider, dims, ts
                                                   │
                                                   ▼  (query time)
                                                   │
                                          [query.js]
                                    1. expandQuery(q) → [q, q2, q3]
                                    2. for each qi:
                                       a. embedder.embedOne(qi) → vec
                                       b. store.setQuery(qi)
                                       c. store.search(vec, TOP_K) → ranked chunks
                                    3. deduplicate across queries
                                    4. passesGate check (dual confidence gate)
                                    5. compressContext(chunks) → contextStr + stats
                                    6. callLLMStream(SYSTEM, [...history, context+q])
                                    7. generateFollowUps(q, answer)
                                    8. log to data/eval.jsonl
                                                   │
                                    ┌──────────────┴─────────────┐
                                    ▼ (SSE tokens)               ▼ (done event)
                              browser streams                 browser shows
                              partial answer                  sources, debug, follow-ups
```

---

## Electron shell

```
electron.js (main process)
  ├── Creates BrowserWindow → loads http://localhost:3000
  ├── Spawns server.js as child_process via configToEnv()
  ├── On app-ready: reads data/app_config.json
  │     setupComplete=false → loadURL /setup
  │     setupComplete=true  → loadURL /
  └── IPC: app-name, open-external, close-window

server.js (child process, port 3000)
  ├── Serves public/ as static files
  ├── Spawns crawl.js, ingest.js as children with SSE piping
  └── All REST API handlers
```

---

## Per-section vector store sharding

```
data/
  vectors_mdm.json
  vectors_pim-syndication-data-exchange.json
  vectors_document-management-system.json
  vectors_confluence-DOCS.json
  vectors_uploads.json
  ...
```

`store.js` at startup:
1. Scans `data/` for `vectors_*.json`
2. Loads all into single `_data` array in memory
3. Builds BM25 index over full corpus
4. On upsert: writes only the shard for that chunk's section

Auto-migration: if legacy `data/vectors.json` exists with no shards, migrates in-place.

---

## SSE streaming (query + build)

### Chat streaming (`POST /api/chat/stream`)

```
Client                         Server                        Ollama
  │                               │                             │
  │── POST /api/chat/stream ──────►│                             │
  │                               │── retrieval + gate ─────────►│
  │                               │◄── passesGate ──────────────│
  │◄─ text/event-stream ──────────│                             │
  │◄─ {"type":"token","msg":"Hi"} │── streamText() ─────────────►│
  │◄─ {"type":"token","msg":" th"}│◄── token ───────────────────│
  │◄─ ...                         │                             │
  │◄─ {"type":"done","msg":{...}} │                             │
```

Token event: `data: {"type":"token","message":"word "}\n\n`
Done event:  `data: {"type":"done","message":{sources, debug, sessionId, followUps}}\n\n`

### Build streaming (`POST /api/setup/build`, `POST /api/setup/rebuild`)

Child process `stdout` piped to SSE. The `npm run crawl` / `npm run ingest` process writes
progress lines; server reads line-by-line and emits `{"type":"log","message":"..."}`.

---

## Document upload pipeline

```
Browser (drag-drop or file picker)
  │── POST /api/docs/upload (multipart, SSE response) ──►│
  │                                                       │ multer writes to disk
  │                                                       │ checkUploadGate()
  │                                                       │   if exceeded: delete files, 402
  │◄─ {"type":"log","message":"Processing file.pdf"} ────│
  │                                                       │ parse text (pdf-parse / mammoth / fs)
  │                                                       │ chunkText() → chunks[]
  │                                                       │ embedOne(chunk) × n
  │◄─ {"type":"log","message":"Embedded 42 chunks"} ─────│
  │                                                       │ store.upsert(chunks, 'uploads')
  │                                                       │ update upload_index.json
  │◄─ {"type":"done","message":{count, id}} ─────────────│
```

---

## Confidence gate (dual)

```js
const topSemScore = chunks[0]?.semScore / 100  // 0.0 – 1.0
const topRrfScore = chunks[0]?.score           // 0.0 – 0.02 typical

const passesGate =
  topSemScore >= CONFIDENCE_GATE            // strong semantic match
  || (topRrfScore >= 0.014 && topSemScore >= 0.05)  // BM25 boosted + weak semantic

if (!passesGate) {
  // Find sections that had even weak matches
  const suggestions = detectSuggestedSections(chunks)
  return "not found" response + section suggestions
}
```

Second condition prevents blocking queries where the exact term is in a filename/heading
(high BM25, low cosine) — e.g. "XYZ_ORG REST API endpoints".

---

## Vector store internals

### Chunk schema
```js
{
  "id": "mdm__MDM-Overview__0",         // section__slug__chunkIndex
  "text": "**Page:** MDM\n**Section:** Overview\n\n<content>",
  "meta": {
    "section": "mdm",
    "title": "MDM Overview",
    "url": "https://...",
    "nearHeading": "Overview",
    "chunkIndex": 0,
    "breadcrumb": "MDM > Overview",
    "tokens": 387
  },
  "embedding": [0.023, -0.041, ...]     // 768 floats (nomic)
}
```

### Search algorithm
```
Step 1: cosine(queryVec, chunk.embedding) → 0.0..1.0 for all chunks
Step 2: BM25(queryTerms, chunk.text) → 0.0..∞ for all chunks (k1=1.5, b=0.75)
Step 3: rank each list independently
Step 4: RRF score = (1-hw)/(60+semRank) + hw/(60+bm25Rank)
        hw = HYBRID_WEIGHT (default 0.5)
Step 5: sort by RRF score desc, return top TOP_K
```

### Context compression
```
Step 1: filter → drop chunks where semScore < MIN_CHUNK_SCORE*100
        (if all drop, keep top 2 as fallback)
Step 2: trigram Jaccard dedup
        trigrams(text) = all 3-word sequences as a Set
        jaccard(a, b)  = |intersection| / |union|
        if jaccard > 0.55: drop lower-scored chunk
Step 3: greedy fill
        budget = CTX_TOKEN_BUDGET * 4 chars
        add chunks in score order until budget exceeded
```

---

## Incremental crawl / ingest

```
crawl.js --incremental
  For each page:
    live_hash = MD5(fetched innerHTML)
    stored_hash = crawl_hashes.json[url]
    if live_hash == stored_hash: skip (write nothing)
    else: save HTML + update hash

ingest.js --incremental
  For each HTML file in docs/:
    file_hash = MD5(file contents)
    stored_hash = ingest_hashes.json[filepath]
    if file_hash == stored_hash: skip (no re-embed)
    else: chunk + embed + upsert + update hash
```

---

## Confluence OAuth 2.0 (3LO)

```
Browser → GET /api/confluence/oauth/start
  server generates `state` nonce
  oauthPending[state] = { done: false, ... }
  setTimeout(() => delete oauthPending[state], 10min)   ← TTL prevents memory leak
  server returns Atlassian authorize URL

Browser → opens Atlassian in popup
  user grants permission
  Atlassian → GET /api/confluence/oauth/callback?code=...&state=...
  server exchanges code for access_token
  oauthPending[state] = { done: true, result: { token, cloudId } }

Browser polls GET /api/confluence/oauth/status?state=...
  when done: returns token + cloudId to wizard
```

---

## License system

```
data/license.json
  { tier: "pro", key: "XXXX-XXXX-XXXX-XXXX", activatedAt: "...", machineId: "..." }

Machine ID = sha256(hostname + platform + cpus[0].model).slice(0, 32)
  cached in data/machine_id.txt

Tiers (offline check):
  undefined / missing license.json → Free
  key starts with "LTM-" or "LIFE-" → Lifetime
  otherwise → Pro

Gates:
  checkQueryGate()   → reads eval.jsonl, counts queries in current month
    ↳ cached for 60 seconds (QUERY_CACHE_TTL_MS = 60_000)
  checkUploadGate()  → reads upload_index.json, counts active uploads

Free tier limits:
  MONTHLY_QUERY_LIMIT = 200
  MAX_UPLOAD_DOCS    = 5

On gate failure:
  /api/chat/stream → 402 { error: "query_limit", tier: "free", ... }
  /api/docs/upload → delete uploaded files, 402 { error: "upload_limit" }
```

---

## Embedder provider matrix

| EMBEDDING_PROVIDER | Class | Dims | Requires | Quality |
|---|---|---|---|---|
| `nomic` (default) | NomicEmbedder | 768 | `ollama pull nomic-embed-text` | ★★★★★ |
| `tfidf` | TFIDFEmbedder | 2048 | nothing | ★★ |
| `openai` | OpenAIEmbedder | 1536 | `OPENAI_API_KEY` | ★★★★★ |

Changing provider requires a full `--force` rebuild. `ingest.js` auto-detects dim mismatch.

---

## Session storage schema

```js
// data/sessions.json
{
  "uuid": {
    "id": "uuid",
    "title": "First 60 chars of first question…",
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:05:00.000Z",
    "messages": [
      { "role": "user",      "content": "Q", "ts": "..." },
      { "role": "assistant", "content": "A", "ts": "..." }
    ]
  }
}
```

Max 30 messages per session (oldest pruned). Max 40 sessions in `/api/sessions`.

---

## Analytics — eval.jsonl

Every query appended as one JSON line:
```json
{"ts":"2026-01-15T10:00:00Z","q":"How do I...","answered":true,"semScore":0.42,"latencyMs":1820,"section":"mdm"}
```

`/api/analytics` aggregates: total queries, answer rate, avg latency, top unanswered, queries per section.

---

## System prompt (SYSTEM constant in query.js)

```
You are a Documentation Assistant for <APP_NAME>.
Answer questions using ONLY the provided context chunks.

Rules:
1. Scope-check first — if the topic is not in the context, say so clearly. Never fill gaps with general knowledge.
2. Lead with WHY — purpose and rationale before procedural steps.
3. Connect concepts — show how pieces relate across pages when relevant.
4. Be layered — one clear sentence first, then expand.
5. Cite sources — [Source: section > heading]
6. Use specific data — numbers, tool names, thresholds from the docs.
7. Flag gaps — note when the context is partial or may be outdated.

Tone: senior engineer explaining to a knowledgeable colleague.
```

---

## Chunk structure guarantees

1. No chunk exceeds `NOMIC_MAX_CHARS` (20 000) chars — hard-split enforced
2. Tables are atomic — never split mid-row (unless the table itself exceeds the limit)
3. Code blocks are atomic — never split mid-block
4. Every chunk includes breadcrumb prefix: `**Page:** ...\n**Section:** ...\n\n`
5. Overlap: last `CHUNK_OVERLAP` tokens of the previous chunk are repeated in the next

---

## Diagnose tool output

```
① Vector Store    — chunk count, section breakdown, embedding dims
② Query Embedding — vector generated, dimension check (MISMATCH = FATAL)
③ BM25 top 5      — keyword scores, chunk titles
④ Semantic top 5  — cosine scores (red if below MIN_CHUNK_SCORE)
⑤ Gate check      — dual confidence gate evaluation
⑥ Final context   — exact chunks that would reach LLM, full text
⑦ Recommendations — specific fix commands if issues found
```
