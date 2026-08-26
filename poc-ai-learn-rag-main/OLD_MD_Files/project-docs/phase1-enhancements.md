# Phase 1 Enhancements — Complete Reference

> **Status: COMPLETE** (implemented 2026-07-30)
> Phase 1 covers the three highest-impact changes before moving to product differentiation features.

---

## What Was in Phase 1

| Enhancement | Type | Effort | Status |
|---|---|---|---|
| Streaming Responses | Leap 1 | ~1 day | ✅ Done |
| Rebuild Index Live Log | QW-1 | ~4 hours | ✅ Done |
| Incremental Re-crawl | Leap 3 | ~1.5 days | ✅ Done |

---

## Enhancement 1: Streaming Responses

### The Problem Before
`askOllama()` in `query.js` used `stream: false`. The full LLM response was buffered
server-side before any response was sent to the browser. For a typical answer this meant
15–90 seconds of silence while the user saw only the typing indicator dots.

### What Changes

#### `src/rag/query.js`

**New function: `askOllamaStream(systemPrompt, messages, onToken)`**
```
- Calls Ollama /api/chat with stream: true
- Reads response as NDJSON stream (res.body is a Node.js Readable)
- Each line is a JSON object: { message: { content: "token" }, done: false }
- Fires onToken(token) callback for each non-empty token
- Returns Promise<fullText> when stream ends
```

**New function: `askClaudeStream(systemPrompt, messages, onToken)`**
```
- Calls Anthropic /v1/messages with stream: true
- Reads SSE events: data: {"type":"content_block_delta","delta":{"text":"token"}}
- Fires onToken(token) for each text_delta event
- Returns Promise<fullText>
```

**New function: `queryStream(question, options, onToken)`**
```
- Same retrieval path as query() — embeds question, BM25+cosine search, RRF, compressContext()
- Calls askOllamaStream or askClaudeStream instead of the non-streaming variants
- Returns same { answer, sources, chunks, debug } shape
- onToken fires for each token as it arrives from the LLM
```

**Export change:** `module.exports = { query, queryStream, compressContext }`

#### `src/api/server.js`

**New endpoint: `POST /api/chat/stream`**
```
Request:  { question, sessionId, section }
Response: text/event-stream

Events sent:
  data: {"type":"token","message":"word or phrase"}    ← one per LLM token
  data: {"type":"done","message":"{sources, debug, sessionId, title}"}  ← final
  data: {"type":"error","message":"{error, isOllamaError}"}   ← on failure

Flow:
  1. Set SSE headers, flushHeaders()
  2. Load session history
  3. Call queryStream() with onToken = (token) => sendSse(res, 'token', token)
  4. Save messages to session
  5. Send done event with sources/debug/sessionId
  6. res.end()
```

The existing `POST /api/chat` (non-streaming) is untouched — kept for CLI tools.

#### `public/js/app.js`

**`sendMessage()` rewritten:**
```
Before: fetch('/api/chat') → await res.json() → appendAIMessage()
After:  fetch('/api/chat/stream') → ReadableStream loop:
          token events → contentEl.innerHTML = renderMarkdown(accumulated)
          done event  → finalizeAIMessage() (attaches sources + debug line)
          error event → appendOllamaError() or appendError()
```

**New function: `appendAIMessageStreaming()`**
```
Creates an AI message bubble with an empty .answer-content div.
Returns { el, contentEl } so sendMessage() can update content in-place.
The .streaming CSS class is set — triggers blinking cursor via CSS ::after.
```

**New function: `finalizeAIMessage(el, answer, sources, debug)`**
```
Removes .streaming class (stops cursor).
Re-renders final answer via renderMarkdown().
Appends source chips and debug line to the bubble.
```

#### `public/css/app.css`

```css
.message.ai.streaming .answer-content::after {
  content: '▋'; animation: blink .7s step-end infinite; color: var(--brand);
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
```

### How to Validate
1. Start server: `npm run server`
2. Open `http://localhost:3000`
3. Ask any question
4. **Expected:** typing dots disappear after ~1–2 seconds, replaced by a bubble with blinking `▋` cursor, words appear progressively, cursor disappears, source chips appear below the answer
5. Try a long question ("explain all the steps to...") on a slower model to see streaming clearly

### Known Behaviour
- Fast GPU + small model (qwen2.5:3b): tokens arrive so quickly it looks near-instant — this is correct
- If Ollama is not running: error bubble appears with instructions to run `ollama serve`
- Sources appear only AFTER the full answer streams — this is intentional (they're not known until retrieval completes)

---

## Enhancement 2: Rebuild Index Live Log

### The Problem Before
`/api/setup/rebuild` returned `{ config: readConfig() }` — a JSON blob that told the
client nothing had actually happened. `rebuildIndex()` in `app.js` called `fetch` then
showed `alert("Rebuild started successfully.")` even if nothing ran. There was no way
to know if it succeeded or what it was doing.

The `/api/setup/build` endpoint also had this debug code left behind accidentally:
```js
console.log('delay')
const delay = ms => new Promise(resolve => setTimeout(resolve, 50000));
```
And the `--force` flag had been accidentally removed from the ingest spawn.

### What Changes

#### `src/api/server.js`

**`/api/setup/rebuild` completely rewritten:**
```
Before: synchronous handler, returns JSON { config }
After:  async SSE handler, same flow as /api/setup/build:
          1. Guard: 409 if buildJob already running
          2. Validate: 400 if no saved config
          3. Set SSE headers
          4. buildJob = true
          5. spawnAndStream(crawl.js) → streams output as 'log' events
          6. If crawl fails: send 'error', return
          7. spawnAndStream(ingest.js --force) → streams output
          8. If ingest fails: send 'error', return
          9. writeConfig({ setupComplete: true })
          10. Reload vector store
          11. Send 'done' with chunk count
          12. finally: res.end(), buildJob = null
```

**`/api/setup/build` cleaned up:**
- Removed `console.log('delay')` and `const delay = ...`
- Restored `--force` flag to ingest spawn: `spawnAndStream('node', [ingestScript, '--force'], ...)`

#### `public/js/app.js`

**`rebuildIndex()` rewritten:**
```
Before: fetch('/api/setup/rebuild') → alert(...)
After:
  1. Confirm dialog
  2. Call POST /api/setup/cancel (clears any stuck state)
  3. Create/reset inline .rebuild-panel above messages
  4. Start SSE stream from /api/setup/rebuild
  5. 'phase' events → update panel header + appendLog
  6. 'log' events → appendLog (live scrolling)
  7. 'done' → show ✅ status, call loadStats() + loadSections()
  8. 'error' → show ❌ status
```

#### `public/css/app.css`

New styles:
```
.rebuild-panel         — dark container (background: #1C1E26)
.rebuild-header        — flex row with phase title and × button
.rebuild-close         — × close button
.rebuild-log-wrap      — max-height: 200px, overflow-y: auto
.rebuild-log-wrap pre  — monospace, #A6ADC8 color (terminal look)
#rebuildStatus         — ok/error message row
.rebuild-ok            — green (#A6E3A1)
.rebuild-err           — red (#F38BA8)
```

### How to Validate
1. Start server: `npm run server`
2. Sidebar footer → click **🔄 Rebuild Index**
3. Click OK on confirm dialog
4. **Expected:** dark terminal panel appears above chat messages with "Rebuilding knowledge base…" header and live scrolling log output
5. After completion: `✅ Knowledge base rebuilt! N chunks indexed.` — chunk count in sidebar footer updates
6. Click × to dismiss the panel

---

## Enhancement 3: Incremental Re-crawl

### The Problem Before
Every time `npm run crawl` ran, it re-fetched every page from the portal (slow, puts load on the server). Every `npm run ingest` run re-embedded every chunk (extremely slow — hours for large portals). No way to do a quick "just pick up what changed" sync.

Also: `npm run sync` (new script added) failed immediately with `DOCS_BASE_URL is not set` because npm scripts ran the crawler directly without loading `data/app_config.json`.

### What Changes

#### `src/crawler/crawl.js`

```
Added: require('crypto')
Added: INCREMENTAL_CRAWL = process.argv.includes('--incremental')
Added: HASHES_PATH = path.join(DATA_DIR, 'crawl_hashes.json')
Added: loadCrawlHashes() → reads HASHES_PATH or returns {}
Added: md5(str) → crypto.createHash('md5').update(str).digest('hex')

crawlSection() signature: (page, item, manifest, crawlHashes, newHashes)

For each page after extracting HTML:
  fileKey = item + '/' + filename
  htmlHash = md5(html)
  if (INCREMENTAL_CRAWL && crawlHashes[fileKey] === htmlHash && fs.existsSync(filePath)):
    → log SKIP, manifest entry status: 'unchanged', save hash, continue
  else:
    → write file, manifest entry status: 'ok', save hash

After all sections:
  fs.writeFileSync(HASHES_PATH, JSON.stringify(newHashes, null, 2))

main() changes:
  - loads crawlHashes (empty if not --incremental)
  - creates newHashes = {}
  - passes both to crawlSection()
  - logs unchangedCount in summary
```

#### `src/ingestion/ingest.js`

```
Added: require('crypto')
Removed: console.log(DATA_DIR, APP_ROOT, ...) [debug line]
Added: INCREMENTAL = process.argv.includes('--incremental')
Added: INGEST_HASHES_PATH = path.join(DATA_DIR, 'ingest_hashes.json')
Added: loadIngestHashes(), md5()

useIncremental = INCREMENTAL && !forceRebuild

Parse loop changes:
  For each page:
    html = readFileSync(...)
    fileHash = md5(html)
    newHashes[page.file] = fileHash

    if useIncremental && ingestHashes[page.file] === fileHash:
      skippedPages++
      continue  ← no parsing, no embedding
    
    ... normal parse + chunk ...

Early exit if useIncremental && allChunks.length === 0:
  → print "All pages unchanged — index is up to date."
  → save newHashes, exit 0

After ingest:
  fs.writeFileSync(INGEST_HASHES_PATH, JSON.stringify(newHashes, null, 2))
```

#### `scripts/sync.js` (NEW FILE)

```
Purpose: run incremental crawl + ingest using config from app_config.json.
         Fixes "DOCS_BASE_URL not set" error when running from terminal.

Flow:
  1. readConfig() from data/app_config.json
  2. Validate portal.baseUrl exists
  3. childEnv = { ...process.env, ...configToEnv(cfg) }
  4. Print portal URL and sections
  5. spawnSync crawl.js [--incremental or nothing if --force]
     - stdio: 'inherit' (output goes directly to terminal)
  6. If crawl exit code !== 0: exit with that code
  7. spawnSync ingest.js [--incremental or --force]
  8. If ingest exit code !== 0: exit with that code
  9. Print "✅ Sync complete."
```

#### `package.json`

```json
"sync":               "node scripts/sync.js",
"sync:force":         "node scripts/sync.js --force",
"crawl:incremental":  "node src/crawler/crawl.js --incremental",
"ingest:incremental": "node src/ingestion/ingest.js --incremental"
```

### How to Validate

```bash
# Step 1: Do a full crawl first (establishes the baseline hashes)
npm run crawl

# Step 2: Immediately run incremental crawl
npm run crawl:incremental
# Expected output includes lines like:
# ⏭️  [section #5] Unchanged: 005_page-title.html
# Total: 0 pages saved, 0 skipped, 47 unchanged

# Step 3: Run incremental ingest
npm run ingest:incremental
# Expected output:
# Mode      : incremental
# Skipped (unchanged): 47 pages
# New/updated chunks: 0
# All pages unchanged — index is up to date.

# Step 4: Test the sync wrapper
npm run sync
# Expected: reads app_config.json, runs crawl --incremental then ingest --incremental
# No "DOCS_BASE_URL not set" error

# Step 5: Test full rebuild
npm run sync:force
# Expected: runs full crawl (no --incremental) then ingest --force (clears and rebuilds)
```

### Important Limitation
In `--incremental` mode, if a page is changed the NEW chunks are upserted into the store
but the OLD chunks for that page are not automatically removed. The `store.upsert()` call
updates chunks by ID — if the page's chunk IDs are deterministic (based on section/title/index),
the update is clean. If content shifts cause chunk boundaries to change, old orphaned chunks
may remain. Use `npm run sync:force` (full rebuild) to completely clean this up.

---

## Files Changed Summary

| File | Type | What changed |
|---|---|---|
| `src/rag/query.js` | Modified | Added `askOllamaStream`, `askClaudeStream`, `queryStream`; exported `queryStream` |
| `src/api/server.js` | Modified | Added `/api/chat/stream`; rewrote `/api/setup/rebuild`; removed debug code from build endpoint |
| `public/js/app.js` | Modified | Rewrote `sendMessage()` for streaming; added `appendAIMessageStreaming`, `finalizeAIMessage`; rewrote `rebuildIndex()` |
| `public/css/app.css` | Modified | Added streaming cursor; rebuild panel styles |
| `src/crawler/crawl.js` | Modified | Added `--incremental` flag; MD5 hash tracking; hash file save |
| `src/ingestion/ingest.js` | Modified | Added `--incremental` flag; removed debug log; MD5 hash tracking |
| `scripts/sync.js` | New | Config-aware incremental sync wrapper |
| `package.json` | Modified | Added 4 new npm scripts |
