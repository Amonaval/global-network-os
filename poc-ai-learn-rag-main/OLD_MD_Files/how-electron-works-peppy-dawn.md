# Plan: Generic Knowledge Hub — Setup Wizard + Full Genericisation

## Context

The current app is hardcoded for XYZ_ORG: the portal URL, section slugs, DOM selectors, auth flow, system prompt, UI branding, and package metadata all reference XYZ_ORG. The goal is to transform this into a fully generic, self-configuring Knowledge Hub that any organization can use. When the Electron `.exe` launches for the first time (no prior config), it shows a multi-step Setup Wizard UI. The user enters their portal details, credentials, and AI settings, then watches a live crawl + ingest pipeline run. When complete, the familiar chat UI launches — now branded and scoped to their own documentation. No pre-bundled data, no XYZ_ORG references anywhere.

---

## Architecture Overview

```
electron.js
  └─ checks DATA_DIR/app_config.json → setupComplete?
       NO  → loadURL(/setup)     ← multi-step wizard
       YES → loadURL(/)          ← chat UI (existing)

server.js adds:
  GET  /api/app/config           ← read stored config (passwords omitted)
  POST /api/app/config           ← save config to app_config.json
  GET  /api/app/status           ← {setupComplete, chunksIndexed, lastCrawled}
  POST /api/setup/crawl          ← spawn crawl child process
  GET  /api/setup/crawl/stream   ← SSE: live stdout from crawl
  POST /api/setup/ingest         ← spawn ingest child process
  GET  /api/setup/ingest/stream  ← SSE: live stdout from ingest
  POST /api/setup/reset          ← wipe data, set setupComplete=false

src/config/config.js (NEW)
  readConfig()   → app_config.json (or defaults)
  writeConfig()  → atomically saves config
  toEnv()        → flat env-var map for child-process spawning
```

---

## Config Schema (`data/app_config.json`)

```json
{
  "app": {
    "name": "Knowledge Hub",
    "description": "Internal documentation assistant"
  },
  "portal": {
    "baseUrl": "",
    "sections": [],
    "contentSelector": "#main-content",
    "nextButtonSelector": ".article-next"
  },
  "auth": {
    "type": "none",
    "email": "",
    "password": ""
  },
  "llm": {
    "provider": "ollama",
    "ollamaUrl": "http://localhost:11434",
    "ollamaModel": "qwen2.5:3b",
    "anthropicApiKey": "",
    "claudeModel": "claude-sonnet-4-20250514"
  },
  "embeddings": {
    "provider": "nomic",
    "nomicModel": "nomic-embed-text"
  },
  "retrieval": {
    "topK": 6,
    "hybridWeight": 0.5,
    "confidenceGate": 0.22,
    "chunkSize": 400,
    "chunkOverlap": 50
  },
  "setupComplete": false
}
```

---

## Setup Wizard UI (5 Steps)

### Step 1 — Welcome
- App logo (generic), headline "Set up your Knowledge Hub"
- Brief description: "Connect to your documentation portal, choose your AI model, and we'll build a searchable knowledge base for your team."
- Single "Get Started" button

### Step 2 — Portal Configuration
- **Portal Base URL** — text input, e.g. `https://docs.example.com/docs`
- **Sections to crawl** — textarea (one path per line) OR dynamic add/remove chips
- **Content selector** — advanced field, default `#main-content`, tooltip explains it
- **Navigation selector** — advanced field, default `.article-next`, tooltip explains it
- "Test Connection" button — hits `/api/setup/test-url` (HEAD request + checks if page loads)

### Step 3 — Authentication
- Radio: **None** / **Username + Password** / **Microsoft (Auth0)**
- If Username/Password: email + password fields, optional: email field selector, password field selector, submit selector (default to standard HTML form inputs)
- If Microsoft: email + password fields only (uses existing hardcoded Microsoft flow)

### Step 4 — AI Settings
- **LLM**: radio Ollama / Claude API
  - Ollama: URL field + model name field (default `qwen2.5:3b`)
  - Claude: API key field + model dropdown
- **Embeddings**: radio Ollama/Nomic (default) / OpenAI / TF-IDF (no network)
  - Nomic: model name field
  - OpenAI: API key field
- "Test Ollama" button — hits `/api/setup/test-ollama`

### Step 5 — Build Knowledge Base
- Summary card showing config values (read-only)
- Big "Start Building" button
- Below: live log panel (SSE stream from crawl then ingest)
  - Crawl phase: shows pages found, sections, progress
  - Ingest phase: shows chunks created, embedding progress
  - Status badge: Crawling... / Ingesting... / Ready!
- On completion: "Launch Assistant" button → `window.location = '/'`

---

## Files to Create

### `src/config/config.js` (NEW)
- `DEFAULT_CONFIG` object matching schema above
- `readConfig()` — reads `DATA_DIR/app_config.json`, merges with defaults
- `writeConfig(partial)` — deep-merges partial into existing, writes atomically
- `toEnv(config)` — returns flat object mapping config fields to env var names:
  - `portal.baseUrl` → `DOCS_BASE_URL`
  - `portal.sections` → `DOCS_SECTIONS` (JSON stringified)
  - `portal.contentSelector` → `CONTENT_SELECTOR`
  - `portal.nextButtonSelector` → `NEXT_BUTTON_SELECTOR`
  - `auth.type` → `AUTH_TYPE`
  - `auth.email` → `AUTH_EMAIL`
  - `auth.password` → `AUTH_PASSWORD`
  - `llm.*` → `LLM_PROVIDER`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, etc.
  - `embeddings.*` → `EMBEDDING_PROVIDER`, `NOMIC_MODEL`, etc.
  - `retrieval.*` → `TOP_K`, `HYBRID_WEIGHT`, etc.
  - `app.name` → `APP_NAME`

### `public/setup.html` (NEW)
- Single-page wizard, 5 steps, vanilla JS (no framework)
- Import `public/css/setup.css` and `public/js/setup.js`
- Wizard step indicator at top (1–2–3–4–5 with labels)
- Each step in its own `<div class="step" id="step-N">` — hidden/shown via JS
- Log panel in Step 5: `<pre id="log-output">` fed by EventSource

### `public/js/setup.js` (NEW)
- State: `currentStep`, `config` object
- `nextStep()` / `prevStep()` — validate current step fields first
- `saveConfig()` — `POST /api/app/config` with current state
- `testConnection()` — `GET /api/setup/test-url?url=...`
- `startBuild()` — POST crawl, open SSE stream → on crawl done, POST ingest, open SSE stream → on ingest done, show "Launch" button
- SSE handler: append each `data.message` line to log panel, auto-scroll

### `public/css/setup.css` (NEW)
- Clean, modern wizard styling
- Step indicator with active/complete states
- Log panel with monospace dark background
- Responsive layout

---

## Files to Modify

### `src/crawler/crawl.js`
Replace hardcoded values with env var reads:
- `BASE_URL` → `process.env.DOCS_BASE_URL` (required, throw if missing)
- `ITEMS` array → `JSON.parse(process.env.DOCS_SECTIONS || '[]')`
- `#main-content` → `process.env.CONTENT_SELECTOR || '#main-content'`
- `.article-next` → `process.env.NEXT_BUTTON_SELECTOR || '.article-next'`
- Auth type: `process.env.AUTH_TYPE || 'microsoft'`
  - `'none'` — skip `loginIfNeeded` entirely
  - `'form'` — generic: fill email selector, fill password selector, click submit
  - `'microsoft'` — existing flow (keep as-is)

### `src/api/server.js`
Add new endpoints (described above). For the SSE streaming endpoints:
- Spawn child process: `child_process.spawn('node', [scriptPath], { env: {...process.env, ...config.toEnv()} })`
- Pipe child stdout/stderr lines to SSE: `res.write('data: ' + JSON.stringify({type:'log', message: line}) + '\n\n')`
- On child close: write `data: {"type":"done"}` and end SSE
- Track job state (`let crawlJob = null`, `let ingestJob = null`) to prevent double-starts

### `src/rag/query.js`
Replace hardcoded system prompt:
```js
const APP_NAME = process.env.APP_NAME || 'Knowledge Hub';
const SYSTEM = `You are the ${APP_NAME} Documentation Assistant...
Answer questions using ONLY the documentation context provided.`
```
Remove "XYZ_ORG products (MDM, PIM, App SDK...)" — replace with generic "the documentation provided".

### `src/vectorstore/store.js`
- Change Pinecone default: `process.env.PINECONE_INDEX || 'knowledge-hub-docs'`

### `electron.js`
Add startup routing:
```js
const { readConfig } = require('./src/config/config.js');
const cfg = readConfig();
const startUrl = cfg.setupComplete ? `http://localhost:${PORT}` : `http://localhost:${PORT}/setup`;
mainWindow.loadURL(startUrl);
```
Change window title: `'Knowledge Hub'` (static generic, not from config — config not loaded when Electron starts... actually it is since we read it above)
Actually use: `title: cfg.app?.name || 'Knowledge Hub'`

### `package.json`
```json
"name": "knowledge-hub-rag",
"build": {
  "appId": "com.knowledgehub.rag",
  "productName": "Knowledge Hub",
  ...
}
```
Remove `extraResources` for `data/` and `.env` — no pre-bundled data in the generic version. The setup wizard generates data at runtime into `app.getPath('userData')/data`.

### `public/index.html`
- `<title>` → `<title>Knowledge Hub</title>` (JS updates it after config load)
- Logo: `<span class="logo-title">Knowledge Hub</span>` as default; JS updates from `/api/app/config`
- Welcome heading: "Ask anything about your docs"
- Input placeholder: "Ask a question…"
- Remove all hardcoded quick questions / chips — they're loaded from config (empty by default, user can add them in Step 2 advanced settings)
- On init: `fetch('/api/app/config')` → update `.logo-title`, `<title>`, welcome heading, placeholder

### `public/js/app.js`
- `STORAGE_KEY` → `'knowledge_hub_session_id'`
- On init: call `GET /api/app/status` first — if `!setupComplete`, redirect to `/setup`
- Replace "XYZ_ORG" in any user-visible strings

### `scripts/setup.js`
- Console output: `'Knowledge Hub — Setup'`
- Remove XYZ_ORG-specific step descriptions

---

## Detailed SSE Streaming Flow

```
Browser (setup.js)                    Server                     Child Process
     |                                   |                              |
     |-- POST /api/setup/crawl --------> |                              |
     |<-- {ok: true} ------------------- |                              |
     |                                   |                              |
     |-- GET /api/setup/crawl/stream --> |                              |
     |   (EventSource)                   |-- spawn node crawl.js -----> |
     |                                   |                         stdout/stderr
     |<-- data: {type:'log', msg:'...'}- |<-- pipe lines -------------- |
     |<-- data: {type:'log', msg:'...'}- |                              |
     |<-- data: {type:'done'} ---------- |<-- process exit 0 ---------- |
     |                                   |                              |
     |-- POST /api/setup/ingest -------> |                              |
     |<-- {ok: true} ------------------- |                              |
     |-- GET /api/setup/ingest/stream -> |                              |
     |                                   |-- spawn node ingest.js ----> |
     |<-- data: {type:'log', ...} ------ |                              |
     |<-- data: {type:'done'} ---------- |<-- process exit 0 ---------- |
     |                                   |                              |
     |  (show "Launch Assistant" btn)    | writeConfig({setupComplete:true})
```

---

## Verification Steps

1. `npm run electron` — app opens, no config exists → Setup wizard loads at `/setup`
2. Complete Step 1–4, click "Start Building" → live log appears, shows crawl output
3. After crawl completes, ingest starts automatically, log continues
4. "Launch Assistant" button appears → click → chat UI loads at `/`
5. Chat UI title/logo shows the configured app name
6. Ask a question → receives answer grounded in crawled docs
7. Close and reopen app → goes directly to chat UI (config is persistent)
8. `npm run dist` → new `.exe` has no `extraResources data/` → first launch shows setup wizard
9. No "XYZ_ORG" text visible anywhere in the UI, console output, or package metadata
