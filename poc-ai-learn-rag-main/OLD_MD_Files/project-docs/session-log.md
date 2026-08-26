# Session Log — Knowledge Hub RAG

> **Every session's work is logged here** — what was discussed, what was built, what changed.
> Update this file at the end of every session. Future sessions read it to understand history.

---

## Session Log Format

Each session entry includes:
- Date and what was requested
- Files created or changed (with a one-line description of each change)
- Issues encountered and how they were resolved
- What's left / what comes next

---

## Session 1 — Initial Build (before 2026-07-30)

**Context:** User had a hand-written `auth0_crawler.js` for the xyz_org portal. Goal was to
build a full RAG system around it.

**What was built:**
- `src/crawler/crawl.js` — Generic Playwright crawler (replaced hardcoded `auth0_crawler.js`)
- `src/ingestion/cleaner.js` — HTML → markdown text extractor with table preservation
- `src/ingestion/embedder.js` — pluggable embedder (nomic / TF-IDF / OpenAI)
- `src/ingestion/ingest.js` — full ingestion pipeline with dimension-mismatch detection
- `src/vectorstore/store.js` — JSON vector store with BM25 + cosine + RRF hybrid search
- `src/rag/query.js` — retrieval engine with query expansion, confidence gate, Jaccard dedup
- `src/api/server.js` — Express REST API + session persistence
- `public/` — Chat UI with sessions, chunk explorer, pinning, sources, debug line
- `CLAUDE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`

**Key bugs found and fixed:**
- Element not attached to DOM crash → use `page.evaluate(() => btn.click())`
- Table content missing → cleaner now converts `<table>` to markdown
- nomic context length crash → cap at 20000 chars, embed one at a time
- Session lost on page refresh → `localStorage` persistence
- History bloating context → send clean Q&A pairs only

---

## Session 2 — Electron + Setup Wizard (before 2026-07-30)

**Context:** User wanted to package the app as a Windows `.exe` and make it configurable
for any documentation portal (not just xyz_org).

**What was built:**
- `electron.js` — Electron main process, spawns server, serves UI
- `src/config/config.js` — reads/writes `data/app_config.json`, `configToEnv()` for child processes
- `public/setup.html` + `public/js/setup.js` — 5-step setup wizard
- `public/css/setup.css` — wizard styles
- Genericized `crawl.js` — all config from env vars, no hardcoded xyz_org values

**Auth flows added to crawler:**
- `AUTH_TYPE=none` — public portals
- `AUTH_TYPE=form` — standard email/password form
- `AUTH_TYPE=microsoft` — Microsoft SSO (fills credentials, waits up to 5 min for any MFA)
- `AUTH_TYPE=browser` — opens non-headless browser, user logs in manually (handles any SSO)
- `CRAWL_MODE=prelogin` — dedicated pre-login mode, saves session to `user_data/`

---

## Session 3 — Bug Fixes: Browser Login, Retry, MFA Timeout (before 2026-07-30)

**Context:** Three bugs reported during Electron testing:
1. Need a "browser login" option in setup wizard
2. "A build is already running" error when retrying after a failed build
3. Microsoft MFA timing out before user could complete OTP

**What was fixed:**

| Bug | Root cause | Fix |
|---|---|---|
| "Build already running" on retry | `buildJob = true` never reset on failed build | Added `POST /api/setup/cancel` endpoint; `retryBuild()` calls it first |
| MFA timeout | `loginMicrosoft()` tried to find specific "Call me" button; failed for OTP | Simplified to fill email+password then `waitForSelector(CONTENT_SELECTOR, { timeout: 300000 })` — works for any MFA |
| Browser login option | Didn't exist | Added `AUTH_TYPE=browser` radio card in wizard; `CRAWL_MODE=prelogin` flow via new `/api/setup/prelogin` SSE endpoint |
| `req.on('close')` false positive | Express emits `close` on request immediately after JSON body consumed in Electron localhost | Removed ALL `req.on('close')` handlers from build/prelogin endpoints |
| SIGTERM → exit code null | Signal handlers registered AFTER `chromium.launchPersistentContext()` (async) | Moved handlers to BEFORE any async operation in `main()` |

**Working version:** User fixed remaining ingest issue independently in a separate folder
and has a working Electron `.exe`.

---

## Session 4 — Phase 1 Enhancements (2026-07-30)

**Context:** Phase 1 enhancements from the approved roadmap.

### Enhancement 1: Streaming Responses (Leap 1)

**Files changed:**
- `src/rag/query.js` — Added `askOllamaStream(systemPrompt, messages, onToken)`: reads Ollama NDJSON stream, fires `onToken` callback per token. Added `askClaudeStream()`: reads Anthropic SSE stream. Added `queryStream(question, options, onToken)`: full RAG pipeline with streaming LLM. Exported `queryStream`.
- `src/api/server.js` — Added `POST /api/chat/stream` SSE endpoint: does retrieval (non-streaming), then streams tokens as `{type:"token", message:"word"}` events, ends with `{type:"done", message:JSON}` containing sources/debug/sessionId.
- `public/js/app.js` — `sendMessage()` replaced to use `/api/chat/stream`. Added `appendAIMessageStreaming()` (creates live bubble), `finalizeAIMessage()` (attaches sources+debug after stream ends).
- `public/css/app.css` — Added `.message.ai.streaming::after` blinking cursor (`▋`, `animation: blink`).

**How it works:** User asks question → typing dots appear → replaced by live bubble with blinking cursor → words stream in as tokens arrive → cursor disappears → source chips and debug line appear.

### Enhancement 2: Rebuild Index Live Log (QW-1)

**Files changed:**
- `src/api/server.js` — `/api/setup/rebuild` completely rewritten from JSON response to full SSE crawl+ingest pipeline. Also removed the accidental debug `console.log('delay')` code and restored `--force` flag to ingest spawn in `/api/setup/build`.
- `public/js/app.js` — `rebuildIndex()` replaced: was `fetch + alert`. Now shows inline dark log panel above messages with live SSE output; calls `/api/setup/cancel` first to handle stuck state; refreshes stats and sections after completion.
- `public/css/app.css` — Added rebuild panel styles (`.rebuild-panel`, `.rebuild-header`, `.rebuild-log-wrap`, `.rebuild-ok`, `.rebuild-err`).

### Enhancement 3: Incremental Re-crawl (Leap 3)

**Files changed:**
- `src/crawler/crawl.js` — Added `crypto` require. Added `INCREMENTAL_CRAWL` flag (from `--incremental` arg). Added `loadCrawlHashes()`, `md5()`. Changed `crawlSection()` signature to accept `crawlHashes` and `newHashes` params. For each page: computes MD5 of scraped HTML; if `--incremental` and hash matches saved hash and file exists → skip write, set status `'unchanged'`. Saves `data/crawl_hashes.json` after run.
- `src/ingestion/ingest.js` — Added `crypto` require. Removed debug `console.log(DATA_DIR, ...)`. Added `INCREMENTAL` flag, `INGEST_HASHES_PATH`, `loadIngestHashes()`, `md5()`. In parse loop: computes MD5 of each HTML file; if `--incremental` and hash matches → skip (don't add to `allChunks`). Early exit if all pages unchanged. Saves `data/ingest_hashes.json` after run.
- `scripts/sync.js` — NEW FILE. Reads `data/app_config.json` via `config.js`, calls `configToEnv()`, spawns `crawl.js --incremental` then `ingest.js --incremental` as child processes with correct env vars. Fixes the `DOCS_BASE_URL not set` error when running from terminal. Supports `--force` flag for full rebuild.
- `package.json` — Added scripts: `crawl:incremental`, `ingest:incremental`, `sync` (→ `scripts/sync.js`), `sync:force`.

**Issue found and fixed:** `npm run sync` errored with `DOCS_BASE_URL is not set` because the npm scripts ran the crawler directly without loading `app_config.json`. Fixed by creating `scripts/sync.js` wrapper.

---

## Session 5 — Phase 2: Document Upload + Analytics (2026-07-30)

**Context:** User started Phase 2 as planned in `phase2-roadmap.md`.

### Leap 2: Local Document Upload

**New files:**
- `src/ingestion/extractors/pdf.js` — extracts text from PDF via `pdf-parse`
- `src/ingestion/extractors/docx.js` — extracts text from DOCX via `mammoth`
- `src/ingestion/extractors/zip.js` — unpacks ZIP and extracts .txt/.md/.html entries via `adm-zip`
- `src/ingestion/extractors/text.js` — reads plain text files

**Modified files:**
- `package.json` — added `pdf-parse`, `mammoth`, `adm-zip`, `multer` deps; added `eval` script
- `src/api/server.js` — added multer, `extractTextFromFile()`, upload helpers, `POST /api/docs/upload` SSE endpoint, `GET /api/docs/uploads`, `DELETE /api/docs/upload/:name`
- `public/index.html` — upload panel HTML (drag-drop zone, file list), upload button in sidebar
- `public/js/app.js` — `toggleUploadPanel()`, `uploadFiles()`, `loadUploadedFiles()`, `deleteUpload()`
- `public/css/app.css` — upload panel, drop zone, file list styles

**How it works:** User clicks "📎 Upload Documents" in sidebar → panel appears → drag-drop or browse files → SSE streams extraction + embedding progress → chunks indexed in-place to uploads section → panel shows indexed file list with delete option.

### Leap 5: Eval Harness + Analytics Dashboard

**New files:**
- `src/rag/eval.js` — CLI: `npm run eval -- --summary|--blocked|--tail N|--section name`

**Modified files:**
- `src/vectorstore/store.js` — `search()` now returns `semScore` (cosine similarity) alongside `score` (RRF)
- `src/rag/query.js` — added `const fs, path`; added `CONF_GATE`, `EVAL_PATH`, `logEval()` function; added confidence gate in both `query()` and `queryStream()` (blocks queries below `CONFIDENCE_GATE` threshold before calling LLM); added `logEval()` call after every query (blocked or not) to `data/eval.jsonl`
- `src/api/server.js` — added `GET /api/analytics` endpoint (reads eval.jsonl, aggregates KPIs)
- `public/index.html` — analytics panel HTML (KPI cards, sections bar chart, unanswered questions, recent queries table), analytics button in sidebar
- `public/js/app.js` — `showAnalytics()`, `hideAnalytics()`, `loadAnalytics()`, `kpiCard()` helpers
- `public/css/app.css` — analytics panel, KPI cards, bar chart, unanswered questions list, recent queries table styles

**How it works:** Every query (answered or blocked) is appended to `data/eval.jsonl`. Clicking "📊 Analytics" in sidebar replaces chat area with analytics dashboard. Dashboard shows: total queries, answer rate, avg confidence score, avg latency, most-used sections bar chart, top unanswered questions (documentation gaps), last 20 queries table.

**Issues fixed:** Confidence gate was described in CLAUDE.md but not actually implemented in query.js. Now implemented using `semScore` (cosine similarity) from store.search(). `store.search()` previously only returned RRF scores — modified to also expose per-chunk `semScore`.

---

## Session 6 — Upload Fix + QW-2, QW-3, QW-4 (2026-07-30)

**Context:** Two bug reports from Session 5 testing, then user approved Phase 2 enhancements QW-2 + QW-3 + QW-4.

### Bug Fix 1: `pdfParse is not a function`

- `src/ingestion/extractors/pdf.js` — `pdf-parse` may export the function directly or as `.default` depending on npm version. Fixed by checking `typeof _pdfModule === 'function'` before use, with `.default` fallback.

### Bug Fix 2: Uploaded Documents Not Answering

Root causes (three independent bugs):

1. **Confidence gate used semScore only** — filename queries have low cosine similarity (~3%) even when BM25 finds a perfect keyword match. Fixed in `src/rag/query.js`: dual-gate logic — pass if `semScore >= 0.15` OR `(rrfScore >= 0.014 AND semScore >= 0.05)`.
2. **Silent bad embeddings** — `embedder.embed()` returning empty array stored `undefined` vectors. Fixed in `src/api/server.js`: explicit embedding validation throws a descriptive error if vectors are missing or have < 64 dims.
3. **Doc title not in BM25 index** — chunks had no filename reference so BM25 couldn't match "what is in readme" to README.md content. Fixed in `src/api/server.js`: prepend `[Document: docname]` label to every uploaded chunk's text before indexing.
4. **LLM prompt ambiguity** — SYSTEM prompt rule 4 was hedging. Rewrote to explicitly say: do NOT say "I couldn't find this" when relevant context is present.

### QW-2: Per-Section Vector Store Sharding

- `src/vectorstore/store.js` — Complete rewrite. Each section now has its own `data/vectors_<section>.json`. Auto-migration: on first load with new code, legacy `vectors.json` is split per-section and renamed to `.migrated`. `upsert()` only saves affected sections (performance). New `clearSection(section)` method. `clear()` deletes all section files.
- `src/ingestion/ingest.js` — `--section --force` now calls `store.clearSection()` instead of wiping the entire index.

### QW-3: Smart "Not Found" Suggestions

- `src/rag/query.js` — When confidence gate blocks a query, extracts section names from the top retrieved chunks (which were close but not close enough) and returns them as `suggestions[]` alongside `blocked: true`.
- `src/api/server.js` — `/api/chat/stream` done event now passes `suggestions` and `blocked`.
- `public/js/app.js` — `finalizeAIMessage()` accepts 5th `suggestions` param. When blocked and suggestions exist, renders clickable section buttons below the "not found" message. Added `formatSectionName()` (slug → title case) and `selectSectionSuggest()` (sets section filter).
- `public/css/app.css` — Added `.not-found-suggestions`, `.nf-label`, `.nf-section-btn` styles.

### QW-4: vLLM / OpenAI-Compatible Server Support

- `src/rag/query.js` — Added `askVllm(systemPrompt, messages)` (non-streaming) and `askVllmStream(systemPrompt, messages, onToken)` (SSE streaming via `res.body.on('data')`). Both use `VLLM_BASE_URL` + `VLLM_MODEL` env vars. Provider selection updated in both `query()` and `queryStream()`.
- `src/config/config.js` — Added `vllmUrl` and `vllmModel` to `DEFAULT_CONFIG.llm`. Added `VLLM_BASE_URL` and `VLLM_MODEL` to `configToEnv()`.
- `public/setup.html` — Added vLLM radio card in Step 4 LLM section. Added `#vllmSettings` div with URL + model inputs and a Test button.
- `public/js/setup.js` — `onLlmChange()` now toggles `#vllmSettings`. `buildConfig()` includes `vllmUrl` and `vllmModel`. `buildSummary()` shows vLLM URL+model in review. New `testVllm()` function hits `/api/setup/test-vllm`. Exported `testVllm`.
- `src/api/server.js` — Added `GET /api/setup/test-vllm` endpoint: hits `/v1/models` on the configured URL, returns `{ ok, models }`.

**Left for next session:**
- Phase 3: Confluence OAuth adapter (Leap 4)
- Phase 4: licensing + Stripe
- User should re-upload any previously uploaded files (old chunks may have bad embeddings from before the validation fix)
- Bug fixing / testing pass

---

## Session 7 — Phase 3: Confluence Integration (2026-07-30)

**Context:** User approved Phase 3 — Confluence integration (Leap 4 from the roadmap). Both API token and OAuth 2.0 auth methods as user choice.

### Architecture
Confluence pages are fetched and saved as HTML to `docs/confluence-<spacekey>/` by `confluence-fetch.js`. The existing ingest pipeline (`ingest.js`) picks them up unchanged — no modifications to the embedder or vector store needed.

### New files
- `src/integrations/confluence.js` — `ConfluenceClient` class (API token + OAuth auth), `buildOAuthUrl()`, `exchangeOAuthCode()`, `refreshOAuthToken()` helpers
- `src/integrations/confluence-fetch.js` — standalone script: fetches all pages from configured Confluence spaces, saves as HTML, updates manifest.json, supports `--incremental`

### Modified files
- `src/config/config.js` — added `source: { type }` block and full `confluence: {}` block to DEFAULT_CONFIG; added all Confluence env vars to `configToEnv()` (`SOURCE_TYPE`, `CONFLUENCE_URL`, `CONFLUENCE_SPACES`, `CONFLUENCE_AUTH_METHOD`, `CONFLUENCE_EMAIL`, `CONFLUENCE_API_TOKEN`, `CONFLUENCE_ACCESS_TOKEN`, `CONFLUENCE_CLOUD_ID`)
- `src/api/server.js`:
  - Added `ConfluenceClient`, `buildOAuthUrl`, `exchangeOAuthCode` imports
  - New `runFetchPhase(res, childEnv, sourceType)` helper — dispatches to `confluence-fetch.js` or `crawl.js` based on source type
  - `/api/setup/build` and `/api/setup/rebuild` updated to use `runFetchPhase()` and handle `sourceType === 'confluence'` validation
  - New endpoints: `POST /api/confluence/test`, `GET /api/confluence/spaces`, `POST /api/confluence/oauth/start`, `GET /api/confluence/oauth/callback`, `GET /api/confluence/oauth/status`
  - In-memory `oauthPending` store for OAuth state management
- `public/setup.html` — Step 2 redesigned as "Knowledge Source": source type radio (Web Portal | Confluence); Confluence fields: URL, space keys, auth method radio (API Token | OAuth 2.0); API token fields (email + token); OAuth fields (Client ID + Secret + Connect button + status)
- `public/js/setup.js`:
  - `oauthConnected`, `oauthPollTimer` state vars
  - `next()` and `prev()` skip Step 3 when source is Confluence (auth handled in Step 2)
  - Step 2 validation branches on source type
  - New helpers: `getSourceType()`, `getConfluenceAuthMethod()`, `confluenceSpacesArray()`
  - `buildConfig()` includes `source` and `confluence` blocks
  - New handlers: `onSourceTypeChange()`, `onConfluenceAuthChange()`
  - New functions: `testConfluence()`, `startConfluenceOAuth()` (opens auth URL + polls `/oauth/status`)
  - `buildSummary()` shows Confluence source details
  - OAuth callback URL hint auto-populated from `window.location.origin`
- `package.json` — added `confluence:fetch` and `confluence:fetch:incremental` scripts

**Left for next session:**
- Phase 4: licensing + Stripe
- Bug fixing / testing pass (all phases together)

---

## Session 8 — Phase 4: Licensing + Stripe (2026-07-30)

**Context:** User approved Phase 4 — licensing, feature gating, and Stripe payment integration.

### Architecture
Licensing is purely local. `data/license.json` stores the activated tier. Validation hits `LICENSE_API_URL` if configured; otherwise accepts any correctly-formatted key in offline/dev mode (key prefix `LTM-`/`LIFE-` → lifetime, anything else → pro). No cloud backend built — the Stripe webhook stub and license validation endpoint are hooks the user can wire to a real service when ready to sell.

### New files
- `src/license/license.js` — full license module: tier definitions (free/pro/lifetime), machine ID fingerprint, key activation (online + offline), monthly query counting from `eval.jsonl`, upload counting from `upload_index.json`, `checkQueryGate()` and `checkUploadGate()` for enforcement

### Modified files
- `src/api/server.js`:
  - Imported license module
  - `/api/chat/stream` — query gate check at top: returns `limitReached: true` SSE done event if monthly limit exceeded
  - `/api/docs/upload` — upload gate check: returns 402 JSON if file upload limit exceeded
  - New endpoints: `GET /api/license`, `POST /api/license/activate`, `DELETE /api/license`, `POST /api/stripe/webhook` (stub)
- `src/config/config.js` — added `LICENSE_API_URL`, `STRIPE_PRO_MONTHLY_URL`, `STRIPE_PRO_ANNUAL_URL`, `STRIPE_LIFETIME_URL`, `STRIPE_WEBHOOK_SECRET` to `configToEnv()`
- `public/index.html` — license tier badge in sidebar footer, "✦ Upgrade to Pro" link, full license modal (plan info, usage bars, pricing grid, key activation, deactivation)
- `public/js/app.js`:
  - `loadLicenseStatus()` — fetches `/api/license`, updates sidebar badge
  - `showLicenseModal()` / `hideLicenseModal()` / `renderLicenseModal()` — full modal rendering with usage bars and dynamic plan visibility
  - `openStripeCheckout(plan)` — opens Stripe payment link URL in browser
  - `activateLicenseKey()` — submits key to `/api/license/activate`
  - `deactivateLicenseKey()` — DELETE `/api/license`
  - `appendLimitReachedMessage()` — shows upgrade prompt in chat when query limit hit
  - Stream done handler updated to detect `limitReached` flag
  - `loadLicenseStatus()` called on page load
- `public/css/app.css` — license badge/footer, modal backdrop, plan cards, usage bars, key input, limit-reached bubble, upgrade button

### Tier limits
| Tier     | Queries/month | Uploads | Confluence | Analytics |
|----------|---------------|---------|------------|-----------|
| Free     | 200           | 5       | No         | No        |
| Pro      | Unlimited     | Unlimited | Yes      | Yes       |
| Lifetime | Unlimited     | Unlimited | Yes      | Yes       |

### Stripe integration
- Env vars: `STRIPE_PRO_MONTHLY_URL`, `STRIPE_PRO_ANNUAL_URL`, `STRIPE_LIFETIME_URL` — paste Stripe Payment Link URLs
- Plan cards in modal only show when the corresponding URL is configured
- `POST /api/stripe/webhook` stub ready to receive events when a real Stripe account is wired

### License key format
`XXXX-XXXX-XXXX-XXXX` (alphanumeric, case-insensitive). Offline mode: `LTM-` / `LIFE-` prefix → lifetime, others → pro.

**Left for next session:**
- Bug fixing / testing pass (all phases: Sessions 5–8)

---

## Session 9 — UX Polish + Bug Fixes + Planning (2026-07-30)

**Context:** User raised 4 immediate issues from `Next_action.txt` and asked for planning answers on 4 future topics plus a 20/80 feature brainstorm. All immediate fixes implemented in this session; planning answers logged below.

### Fix 1 — Portal URL Not Mandatory (`public/js/setup.js`, `public/setup.html`)
Upload-only mode: if both URL and sections are empty, wizard proceeds without error and shows a hint. URL is only required when sections are provided (can't crawl without it). Removed hard `required` behaviour from URL field.

### Fix 2 — Plan Cards Always Visible (`public/js/app.js`)
Plan cards (`planProMonthly`, `planProAnnual`, `planLifetime`) are now always rendered in the license modal regardless of whether Stripe URLs are configured. When no URL: button reads "Request Access" and opens a `mailto:sales@xyz_org.com` link. When URL is configured: opens Stripe checkout. Button label stored in `data-label` attribute so it survives re-renders.

### Fix 3 — Sidebar Footer UI Redesign (`public/index.html`, `public/css/app.css`, `public/js/app.js`)
Replaced 7 stacked items with 3 clean zones:
1. **Stats line** — "N chunks · model" (compact one-liner)
2. **Action buttons** — Upload / Analytics / Settings gear (opens dropdown with Reconfigure / Rebuild Index / Reset Knowledge Base)
3. **License row** — tier badge + Upgrade link (unchanged)
New JS: `toggleSettingsMenu()`, `resetKnowledgeBase()`. Settings menu closes on outside click.

### Fix 4 — Self-Reviewed Bugs
- **Upload orphaned files** (`server.js`): Deleted multer temp files with `fs.unlinkSync()` on 402 gate rejection.
- **vLLM URL validation** (`setup.js`): Step 4 now validates vLLM URL is non-empty when vLLM provider is selected.
- **OAuth memory leak** (`server.js`): `oauthPending[state]` now gets a 10-minute TTL `setTimeout(() => delete oauthPending[state], 600000)` on creation.
- **Query count cache** (`license.js`): `getMonthlyQueryCount()` caches result for 60 seconds in `_queryCountCache { count, month, ts }` — avoids full eval.jsonl scan on every chat request.
- **Confluence pagination cursor** (`confluence.js`): `_nextPath()` now handles absolute URLs in `_links.next` using `new URL(next).pathname + search` before the regex.
- **vLLM model display** (`app.js`): `loadStats()` now shows `vllmModel` in sidebar stats line when `llmProvider === 'vllm'`.

### Files changed this session
| File | Change |
|------|--------|
| `public/js/setup.js` | Fix 1: URL optional (upload-only); Fix 4: vLLM URL validation in step 4 |
| `public/setup.html` | Fix 1: updated `*` label tooltip |
| `public/js/app.js` | Fix 2: plan cards always visible with Request Access fallback; Fix 3: toggleSettingsMenu + resetKnowledgeBase; loadStats vLLM support |
| `public/index.html` | Fix 3: new 3-zone sidebar footer HTML |
| `public/css/app.css` | Fix 3: new .sidebar-stats-line, .sidebar-badges, .sidebar-actions, .sidebar-action-btn, .sidebar-settings-menu styles |
| `src/api/server.js` | Fix 4: upload orphan cleanup; OAuth TTL |
| `src/license/license.js` | Fix 4: 60s query count cache |
| `src/integrations/confluence.js` | Fix 4: absolute URL handling in _nextPath() |

---

## Planning Answers (Q4–Q7 from Next_action.txt)

### Q4 — Stripe actual payment gateway timeline
**When:** After beta validation. The app-side code (server.js license endpoints, modal UI, Stripe URL env vars) is already fully built.
**Recommended sequence:**
1. Deploy a lightweight cloud function (Vercel/Railway, ~2 hrs):
   - Receive `checkout.session.completed` Stripe webhook
   - Generate signed license key: `HMAC-SHA256(customerId + tier + timestamp, privateSecret)`
   - Email key to customer via Resend/SendGrid
2. Set `LICENSE_API_URL` env var to point at that function's `/validate` endpoint
3. Paste Stripe Payment Link URLs into `.env` (`STRIPE_PRO_MONTHLY_URL`, etc.)
**Status:** All wiring complete. Only missing: the cloud function + real Stripe account.

### Q5 — Signup / Login
**Recommended approach (progressive):**
- **Phase A (local):** Optional user profiles — multiple `data/` dirs per named profile, switchable in Electron. Zero auth overhead. Good enough for beta.
- **Phase B (cloud sync):** Supabase Auth (free tier) — email/password + Google OAuth. Each user gets isolated S3/R2 bucket or Supabase storage for vectors. JWT stored in Electron keychain. ~1 day of integration.
- **Not recommended:** Building auth from scratch (3–4 weeks, security risk, maintain burden).

### Q6 — Testing strategy
**Recommended stack:**
- **Unit:** Vitest (fast, zero-config, ESM-native) — `license.js`, `store.js`, `cleaner.js`, `query.js`
- **Integration:** Supertest against `server.js` for all API endpoints
- **E2E:** Playwright (already in deps) — wizard flow + chat flow
- **Pre-commit:** Husky + lint-staged — runs `vitest --run` on changed files, blocks commit on failure
- **Self-review:** `REVIEW.md` checklist Claude reads at session start to audit against known patterns
- **CI:** GitHub Actions — `npm test` on every PR

### Q7 — React SPA restructure for long-term scalability
**Why now is the right time:** `app.js` is ~1100+ lines; state is global vars; components are copy-paste. Adding 3 more features makes refactoring painful.
**Recommendation — Vite + React (incremental, NOT a rewrite):**
- Keep Express backend unchanged (it's solid)
- Replace `public/` with a `client/` Vite app
- State: React Query (server state) + Zustand (local state)
- Migration: start with license modal and analytics panel as isolated React components, mount via `ReactDOM.createRoot()` into the existing page, then expand
- TypeScript strict from day 1 for all new components
- Pre-commit: ESLint + TypeScript + Vitest + Playwright
**Timeline:** 1 sprint (~2 weeks) to migrate UI with zero feature regressions.
**Key enablers for new developers:** folder-per-feature layout, REVIEW.md checklist, typed API layer (openapi-fetch), Storybook for component docs.

---

## 20% Features → 80% Impact Brainstorm

Ranked by impact × effort ratio:

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| 1 | Cross-encoder re-ranking (ms-marco-MiniLM via Ollama) | ★★★★★ | Medium |
| 2 | Collapsible debug panel — show which chunks were used + scores | ★★★★ | Low |
| 3 | Smart document sync — chokidar file watcher on `docs/`, auto-ingest | ★★★★ | Low |
| 4 | **Answer citations inline** — `[1]`, `[2]` footnotes linked to source URLs | ★★★★ | Medium |
| 5 | Conversation export — download as PDF or Markdown | ★★★ | Low |
| 6 | Multi-KB switching — multiple named knowledge bases, sidebar switch | ★★★★ | Medium |
| 7 | Suggested questions on first load — LLM generates 5 "ask me" starters | ★★★ | Low |
| 8 | Rebuild complete OS notification (Electron) | ★★★ | Low |
| 9 | **Answer feedback (👍/👎)** — logged to eval.jsonl, surface in analytics | ★★★ | Low |
| 10 | "Ask about this page" browser bookmarklet | ★★★ | Medium |

**Top 3 to implement next (highest 20/80 ratio):**
1. **Answer citations inline** — trust signal + enterprise requirement, differentiates from generic chatbots
2. **Smart document sync (chokidar watcher)** — eliminates biggest operational pain point, very low effort
3. **Answer feedback (👍/👎)** — data flywheel for quality improvement, completes the analytics loop

---

## Session 10 — Ideal Long-Term Tech Stack Plan + Full Documentation Rewrite (2026-07-31)

**Context:** Session picked up from a context-compacted previous session (S9). Two major streams:
1. User asked for the "most ideal complete suite" for long-term tech stack strategy.
2. User approved the plan and requested: Phase 1 tooling implementation + full top-level `.md` rewrite + session log entry.

S9 had also applied 4 bug fixes (portal URL optional, plan cards always visible, sidebar footer redesign,
upload orphan cleanup / vLLM validation / OAuth memory leak / query count cache / Confluence pagination).

---

### Ideal Long-Term Tech Stack — Full Plan

**Status:** Approved by user. Phase 1 tooling implemented in this session.

#### Complete recommended stack

| Layer | Current | Recommended | When |
|---|---|---|---|
| Language | CommonJS JS | **TypeScript** (`allowJs:true`, incremental) | Now → Phase 2 |
| Frontend | Vanilla JS SPA | **Vite + React 19 + Zustand + TanStack Query** | Phase 2 |
| API layer | Express (untyped) | **Express + Zod schemas** | Now (Zod) |
| Vector store | Per-section JSON | **LanceDB** (embedded, prebuilt Windows binaries) | Phase 2 (>20k chunks) |
| App data | JSON + eval.jsonl | **sql.js** for analytics | Phase 2 |
| Desktop | Electron | **Keep Electron** (IPC improvements) | Phase 2 |
| LLM orchestration | Custom ask*Stream | **Keep custom** (optionally Vercel `ai` SDK) | Phase 2 |
| Testing | Zero | **Vitest + Supertest + Playwright** | Now |
| Package manager | npm | **pnpm** | Now |
| Linting | None | **ESLint + Prettier** | Now |
| CI/CD | None | **GitHub Actions** | Phase 2 |
| Payments | Stripe stub | **Lemon Squeezy** (Merchant of Record) | Phase 2 |
| License API | Offline only | **Vercel Edge Function** | Phase 2 |
| Auth (multi-user) | N/A | **Clerk** | Phase 3 |
| Cloud DB | N/A | **Supabase + pgvector** | Phase 3 |
| Deployment | .exe only | **Docker + Railway** | Phase 2 |

#### Key rationale decisions

- **TypeScript incremental:** `allowJs:true, checkJs:false` — zero immediate code changes, full TS toolchain on day 1.
- **Vite not Next.js:** SSR/SEO irrelevant for desktop auth-gated UI. Vite builds `dist/` that Express serves — zero server architecture change.
- **LanceDB not Chroma/Qdrant:** Chroma uses hnswlib-node (C++ / node-gyp). Qdrant has no embedded JS. LanceDB has prebuilt Windows binaries.
- **Keep custom LLM orchestration:** LangChain would bypass confidence gate, re-inject context blobs (violates D-10), use semantic-only retrieval (bypasses BM25+RRF).
- **Lemon Squeezy not Stripe:** Stripe requires building webhook verification, license keys, EU VAT, dunning. Lemon Squeezy is a Merchant of Record — all built-in.
- **Keep Electron not Tauri:** Playwright Auth0 crawler is incompatible with Tauri. Localhost-Express architecture enables Docker deployment unchanged.
- **sql.js not better-sqlite3:** sql.js is SQLite compiled to WASM — pure JS, no node-gyp.

---

### Phase 1 Tooling — Implemented This Session

**Files created:**
- `tsconfig.json` — `allowJs:true, checkJs:false, strict:false, noEmit:true, module:commonjs`
- `vitest.config.js` — node environment, `tests/**/*.test.{js,ts}` glob
- `eslint.config.js` — ESLint 9 flat config, commonjs globals, `no-var`, `prefer-const`
- `.prettierrc` — single quotes, no semi, 100 print width, ES5 trailing commas
- `src/types/index.ts` — TypeScript interfaces: `Chunk`, `ScoredChunk`, `Session`, `Message`, `AppConfig`, `LicenseRecord`, `IngestMeta`, `QueryDebug`, `ChatResponse`
- `tests/unit/compressContext.test.js` — 6 tests for compressContext + jaccardSim (pure functions, no mocking)
- `tests/unit/bm25.test.js` — 8 tests for BM25 class: scoring, deduplication, edge cases, tokenisation

**Files updated:**
- `package.json` — added `test`, `test:watch`, `test:ui`, `typecheck`, `lint`, `format` scripts; added devDeps: `typescript`, `tsx`, `vitest`, `@vitest/ui`, `supertest`, `zod`, `eslint`, `@eslint/js`, `prettier`

---

### Documentation Rewrite — Completed This Session

All five top-level `.md` files fully rewritten to reflect current state (10 sessions of development):

- `CLAUDE.md` — full rewrite: updated repo layout (added integrations/, license/, setup wizard files), updated commands, all env vars, new sections 15 (Long-term tech stack table) and 16 (session continuity), updated Done/Not-done
- `ARCHITECTURE.md` — full rewrite: updated component diagram with Electron, SSE streaming flow, upload pipeline, incremental crawl, Confluence OAuth flow, per-section sharding, dual confidence gate, license system, analytics schema
- `DECISIONS.md` — added D-13 through D-25: per-section sharding, Electron+localhost, incremental crawl, SSE streaming, upload SSE, OAuth TTL, offline license, query count cache, upload-only mode, Lemon Squeezy rationale, LangChain rejection, TypeScript incremental, LanceDB selection
- `KNOWN_ISSUES.md` — marked KI-10 (stale pages) as FIXED (incremental crawl implemented); added KI-11 through KI-20 (upload orphan files, OAuth leak, query count scan, Confluence pagination, vLLM validation, plan cards, Ollama CPU speed, no payment backend, no cross-encoder, no feedback)
- `README.md` — full rewrite: reflects Electron app, setup wizard, all source types (portal/Confluence/upload), current feature set, updated troubleshooting

---

### What was NOT changed (intentionally)
- `CONVERSATION_HISTORY.md` — early scratch building history, kept for reference
- `CLAUDE_CODE_GUIDE.md` — Claude Code documentation, accurate as-is

---

### Left for next session
- Run `npm install` to pull the new devDependencies (pnpm migration is Phase 2)
- Run `npm test` to verify Vitest tests pass
- Run `npx tsc --noEmit` to verify tsconfig works
- Add Zod `AppConfigSchema` in `src/config/config.js` (first real Phase 1 code change)
- Answer citations inline `[1][2]` — top 20/80 feature from S9 brainstorm
- Smart document sync (chokidar file watcher)
- Answer feedback 👍/👎

---

## Session 11 — Zod AppConfigSchema + Vite + React Frontend Migration (2026-07-31)

**Context:** Continued from S10 which ended at context limit. Three work streams this session:
1. Fix failing `jaccardSim` test + silence Vite CJS deprecation warning
2. Add Zod `AppConfigSchema` to `src/config/config.js` for runtime validation
3. Full Vite + React 19 + Zustand + TanStack Query frontend migration — 30 new files

---

### Stream 1 — Test fixes + Vite config

**Issues fixed:**
- `jaccardSim` partial overlap test failed — short 5-word sentences produce zero shared trigrams. Fixed by using 9-word sentences that share multiple trigrams.
- Vite CJS deprecation warning — `vitest.config.js` used `require('vitest/config')` in a CJS module. Fixed by renaming to `vitest.config.mjs` and converting to ESM `import`/`export default`.

---

### Stream 2 — Zod AppConfigSchema

**Files changed:**
- `src/config/config.js` — Added Zod `AppConfigSchema` with all config sections. `readConfig()` now calls `safeParse` and warns on bad fields without throwing. `AppConfigSchema` exported for future API validation.
- `package.json` — Moved `zod` from devDependencies to dependencies (runs at server startup).

**Discovery:** Zod immediately caught a real issue — `auth.type: 'browser'` was in `app_config.json` but missing from the initial enum. Confirmed `'browser'` is a valid auth type in `crawl.js` (pre-cached session mode). Added to enum.

---

### Stream 3 — Vite + React 19 Frontend Migration

**Architecture decision:** Parallel migration — React app in `frontend/`, old `public/` stays intact. Express serves `frontend/dist/` when built, falls back to `public/` at all times. Zero developer blockers during migration.

**New files created (30 total):**

| File | Purpose |
|------|---------|
| `vite.config.mjs` | Vite MPA config (2 HTML entries: index + setup). Dev server proxies `/api` and `/css` to Express at :3000 |
| `frontend/index.html` | Chat app HTML shell — links CSS, mounts to `#root` |
| `frontend/setup.html` | Setup wizard HTML shell |
| `frontend/src/types.ts` | All TypeScript interfaces: ChatMessage, Source, DebugInfo, SessionSummary, StatsData, SectionData, LicenseData, UploadedFile, AnalyticsData, WizardForm |
| `frontend/src/store/appStore.ts` | Zustand store — sessionId (localStorage), selectedSection, loading, activePanel, sidebarCollapsed, rebuildPanelOpen, convTitle, startNewSession() |
| `frontend/src/store/wizardStore.ts` | Zustand store — step, form (full WizardForm), oauthConnected, preloginDone, buildState, buildLog, buildPhase, errorMessage, successMessage |
| `frontend/src/hooks/useStream.ts` | `readStream(response, handlers)` — SSE parser shared across chat/upload/rebuild/wizard |
| `frontend/src/hooks/useApi.ts` | TanStack Query hooks for all API endpoints + mutations (deleteSession, deleteUpload, activateLicense, deactivateLicense) |
| `frontend/src/utils/format.ts` | escHtml, formatAgo, formatDate, formatBytes, fileIcon, formatSectionName |
| `frontend/src/utils/markdown.ts` | renderMarkdown — same algorithm as vanilla app.js |
| `frontend/src/main.tsx` | Chat app entry — createRoot with QueryClient provider |
| `frontend/src/setup-main.tsx` | Wizard entry — createRoot with QueryClient provider |
| `frontend/src/App.tsx` | Main chat app — useState<ChatMessage[]>, sendMessage() SSE streaming, session restore/switch, conditional panel rendering |
| `frontend/src/SetupApp.tsx` | Wizard root — StepIndicator + current step component |
| `frontend/src/components/chat/Sidebar.tsx` | Session history list, section filter, TanStack Query |
| `frontend/src/components/chat/SidebarFooter.tsx` | Stats, mode badges, settings dropdown, license row |
| `frontend/src/components/chat/TopBar.tsx` | Conv title, status indicator, section filter pill |
| `frontend/src/components/chat/MessageList.tsx` | Maps to MessageItem, scroll-to-bottom, welcome screen |
| `frontend/src/components/chat/MessageItem.tsx` | Handles user/typing/streaming/error/limitReached/normal message types |
| `frontend/src/components/chat/InputArea.tsx` | Auto-resize textarea, keyboard shortcuts |
| `frontend/src/components/panels/UploadPanel.tsx` | Drag-drop, SSE upload progress, file list with delete |
| `frontend/src/components/panels/AnalyticsPanel.tsx` | KPI cards, section bars, unanswered questions, recent queries |
| `frontend/src/components/panels/RebuildPanel.tsx` | SSE rebuild with auto-start on mount |
| `frontend/src/components/shared/LicenseModal.tsx` | React Portal, usage bars, plan cards, activate/deactivate |
| `frontend/src/components/wizard/StepIndicator.tsx` | Step dots with active/done CSS classes |
| `frontend/src/components/wizard/Step1Welcome.tsx` | Hero screen |
| `frontend/src/components/wizard/Step2Source.tsx` | Portal/Confluence, all fields, OAuth flow, URL tests |
| `frontend/src/components/wizard/Step3Auth.tsx` | Auth type, credentials, browser prelogin SSE |
| `frontend/src/components/wizard/Step4AI.tsx` | LLM + embeddings with test buttons |
| `frontend/src/components/wizard/Step5Build.tsx` | Summary grid, SSE build progress, success/error states |

**Files updated:**
- `src/api/server.js` — Added parallel-migration static serving: checks for `frontend/dist/index.html` at startup, serves from React build when present, always falls back to `public/` for CSS assets. Updated `/setup` and `*` catch-all routes similarly.
- `package.json` — Added React 19, react-dom, @tanstack/react-query, zustand to dependencies; vite, @vitejs/plugin-react, @types/react, @types/react-dom to devDependencies; added `dev`, `build:ui`, `preview:ui` scripts.

**Build result:**
- `npm run build:ui` → 118 modules transformed, 2.33s. Clean output in `frontend/dist/`.
- `npm test` → 17/17 pass.
- CSS served from `public/css/` via Express; Vite dev server proxies `/css` to :3000.

---

### What's next
- Answer citations inline `[1]` `[2]` linked to source URLs (top 20/80 feature)
- Smart document sync — chokidar file watcher on `docs/`
- Answer feedback 👍/👎 logged to eval.jsonl
- pnpm migration (Phase 2)
- Lemon Squeezy payment integration (replace Stripe stub)
- LanceDB vector store adapter (when >20k chunks)
- GitHub Actions CI/CD

---

## Session 12 — CSS Layout Fix + Single-Command Dev (2026-07-31)

**Context:** Two bugs found after the S11 React migration:
1. Layout completely broken — sidebar and main were stacked vertically instead of side-by-side
2. `npm run dev` alone caused ECONNREFUSED for CSS because it proxied `/css` to Express which wasn't running

---

### Fix 1 — `#root { display: contents }` (layout fix)

**Root cause:** `public/css/app.css` has `body { display: flex; height: 100vh }`. In the original HTML, `<aside>` and `<main>` were direct `<body>` children, so flex layout worked. React mounts into `<div id="root">` — that wrapper div was not flex, so the sidebar and main stacked vertically.

**Fix:** Added `#root { display: contents }` to both `public/css/app.css` and `public/css/setup.css`. `display: contents` makes `#root` invisible to the layout engine — its children participate directly in `body`'s flex context. Zero change to existing vanilla JS fallback (which has no `#root`).

---

### Fix 2 — CSS bundling + single-command dev

**Root cause:** `vite.config.mjs` proxied `/css` to Express at :3000. If the user ran `npm run dev` without also running `npm run server`, every CSS request failed with ECONNREFUSED.

**Fix:**
- Import CSS directly in React entry points — Vite bundles it into `dist/assets/*.css`
- Remove `/css` proxy from `vite.config.mjs`
- Add `concurrently` devDep + `dev:all` script for single-command full-stack dev

**Files changed:**
| File | Change |
|------|--------|
| `frontend/src/main.tsx` | Added `import '../../public/css/app.css'` at top |
| `frontend/src/setup-main.tsx` | Added `import '../../public/css/setup.css'` at top |
| `frontend/index.html` | Removed `<link rel="stylesheet" href="/css/app.css">` (Vite injects it) |
| `frontend/setup.html` | Removed `<link rel="stylesheet" href="/css/setup.css">` (Vite injects it) |
| `vite.config.mjs` | Removed `/css` proxy entry |
| `public/css/app.css` | Added `#root { display: contents }` |
| `public/css/setup.css` | Added `#root { display: contents }` |
| `package.json` | Added `concurrently` devDep + `dev:all` script |

**Build result after fix:** `dist/assets/` now contains `main-*.css` (25KB) and `setup-*.css` (7KB) — CSS is self-contained in the build.

---

### Developer workflows (current state)

| Goal | Command |
|---|---|
| Full web dev (HMR + API) | `npm run dev:all` |
| Styles-only dev (no API) | `npm run dev` |
| Production web server | `npm run server` |
| Electron desktop app | `npm run electron` |
| Build React bundle | `npm run build:ui` |

---

### What's next
- Answer citations inline `[1]` `[2]` linked to source URLs (top 20/80 feature)
- Smart document sync — chokidar file watcher on `docs/`
- Answer feedback 👍/👎 logged to eval.jsonl
- pnpm migration (Phase 2)
- Lemon Squeezy payment integration (replace Stripe stub)
- LanceDB vector store adapter (when >20k chunks)
- GitHub Actions CI/CD

---

## Session 13 — Answer Citations Inline [1][2] (2026-07-31)

**Context:** Top-priority 20/80 feature from Session 9 brainstorm. LLM answers now include
inline citation markers `[1]`, `[2]` that render as clickable superscript links pointing to
source URLs.

### Architecture

Three parts working together:
1. **Backend** — context already numbered `[1]`, `[2]` in `compressContext`. System prompt updated
   to instruct the LLM to use those numbers inline. Sources array now 1:1 with selected chunks
   so `[1]` in text reliably maps to `sources[0]`.
2. **Renderer** — `renderMarkdownWithCitations(md, sources)` converts `[N]` markers to
   `<sup><a class="citation-link">` links (skips `<pre>`/`<code>` blocks to avoid mangling code).
3. **Source chips** — deduplicated by URL so the same page doesn't appear as multiple chips.

### Files changed

| File | Change |
|------|--------|
| `src/rag/query.js` | System prompt Rule 2: use `[1]`, `[2]` citation numbers. `compressContext` returns `selectedChunks`. `query()` and `queryStream()` build sources 1:1 from `selectedChunks` (no dedup, preserving citation-number alignment) |
| `frontend/src/utils/markdown.ts` | Added `renderMarkdownWithCitations(md, sources)` — replaces `[N]` with `<sup><a class="citation-link">` links, skips code/pre blocks |
| `frontend/src/components/chat/MessageItem.tsx` | Uses `renderMarkdownWithCitations` instead of `renderMarkdown`. Deduplicates source chips by URL |
| `public/css/app.css` | Added `.citation-link` styles (brand-colored superscript, dark-mode aware) |
| `public/js/app.js` | Added `renderMarkdownWithCitations` function. Updated `appendAIMessage` and `finalizeAIMessage` to use it. Deduplicated source chips by URL in both functions |

### What's next
- Smart document sync — chokidar file watcher on `docs/`
- Answer feedback 👍/👎 logged to eval.jsonl
- pnpm migration (Phase 2)
- Lemon Squeezy payment integration (replace Stripe stub)
- LanceDB vector store adapter (when >20k chunks)
- GitHub Actions CI/CD

---

## Session 14 — Generic "Web Page / URL" Source Mode (2026-07-31)

**Context:** User wanted the app to work with any public webpage — not just structured doc portals.
Three problems to fix: (1) no single-URL mode, (2) content selector required (should be optional with smart auto-detection), (3) pre-login crashes with "profile already in use" when Chromium lock file from previous unclosed session is left behind.

### New feature: CRAWL_MODE=url

A new source type `url` that fetches arbitrary public URLs without crawling or navigation.
User pastes one or more URLs (one per line) in the wizard. No sections, no auth, no next-button needed.
Saved to `docs/web-pages/` section, ingested and searchable alongside all other sources.

### Files changed

| File | Change |
|------|--------|
| `src/crawler/crawl.js` | Added `smartExtractContent(page)` (13 CSS candidates + body-minus-chrome fallback). Added `URL_FETCH_URLS` / `URL_FETCH_SELECTOR` constants. Added `fetchUrls()` function using headless Chromium (not persistent context). Fixed pre-login crash: delete `user_data/SingletonLock` before `launchPersistentContext`. Added `CRAWL_MODE === 'url'` dispatch branch |
| `src/config/config.js` | Zod schema: added `'url'` to source.type enum. Added `urlFetch` schema. Added `urlFetch: { urls: [], contentSelector: '' }` to DEFAULT_CONFIG. `configToEnv()` now passes `URL_FETCH_URLS` and `URL_FETCH_SELECTOR` to child processes |
| `src/api/server.js` | `runFetchPhase()`: added `url` branch passing `CRAWL_MODE: 'url'`. Build/rebuild validation: added `url` source type guards (not rejected for missing portal.baseUrl) |
| `public/setup.html` | Added third source-type radio card: "🌐 Web Page / URL". Added `#urlSection` div with URL textarea + content selector input |
| `public/js/setup.js` | `onSourceTypeChange()`: toggles `#urlSection`. `next()`: skips auth step for `url` mode. `validate()`: validates URL list for `url` mode. `buildConfig()`: includes `urlFetch`. `buildSummary()`: shows page count + first URL |
| `frontend/src/types.ts` | `WizardForm.sourceType` extended to `'portal' \| 'confluence' \| 'url'`. Added `urlList: string`, `urlSelector: string` fields |
| `frontend/src/store/wizardStore.ts` | Added `urlList: ''`, `urlSelector: ''` to `DEFAULT_FORM` |
| `frontend/src/components/wizard/Step2Source.tsx` | Added `url` RadioCard. Conditional URL textarea + selector input. `validate()` checks URL list. `next()` skips step 3 for `url` type |
| `frontend/src/components/wizard/Step5Build.tsx` | `buildConfig()`: added `urlFetch` section. `buildSummaryRows()`: added `url` branch showing page count + first URL |

### Issues encountered

- **Pre-login "Opening in existing browser session"**: `user_data/SingletonLock` file left from unclosed Chromium. Fixed: delete lock file before `launchPersistentContext`.
- **Upload-only mode conflict**: server.js rejected builds with no `portal.baseUrl`, conflicting with `url` mode. Fixed: `if (sourceType !== 'url')` guard around the portal.baseUrl check.

### Left for next session
- Smart document sync — chokidar file watcher on `docs/`
- Answer feedback 👍/👎 logged to eval.jsonl
- pnpm migration (Phase 2)
- Lemon Squeezy payment integration (replace Stripe stub)
- LanceDB vector store adapter (when >20k chunks)
- GitHub Actions CI/CD

---

## Session 15 — Multi-Source Selector + Confluence Quality + OAuth Clarity (2026-07-31)

**Context:** Porting the "remarkable" multi-space selector feature from the older `confluence-page`
project into the current knowledge hub. Also fixing Confluence ingestion quality (missing breadcrumbs,
dropped link text) and clarifying the OAuth admin-permission issue in the wizard.

### OAuth root cause (no code bug)
The OAuth 2.0 flow code is correct. Atlassian platform policy requires an **org admin** to approve
any 3LO app requesting `read:confluence-content.all` before users can connect. API Token auth
(email + personal API token) works for any user with space access — no admin needed.
**Fix:** Added clear warning + recommended badge in the wizard.

### Confluence ingestion improvements
- `confluence-fetch.js` now builds page breadcrumbs from `parentId` hierarchy (e.g. `Root > API Docs > Auth`)
- Manifest entries now include `pageId`, `spaceKey`, `spaceName`, `breadcrumb`, `depth`, `updatedAt`
- `data/confluence_spaces.json` written at fetch time: `{ "ENG": "Engineering Wiki", ... }`
- `cleaner.js`: `<a>` link text preserved (replace anchors with their text before DOM traversal)
- `cleaner.js`: breadcrumb prefix prepended to chunk text for self-locating retrieval context

### Multi-section selector (core feature)
- `store.js`: `search()` now accepts `filter.sections: string[]` alongside legacy `filter.section: string`
- `query.js`: `options.sections[]` threading in both `query()` and `queryStream()`
- `server.js`: `/api/sections` returns `displayName` + `type` per section; chat endpoints accept `sections[]`
- React `appStore.ts`: `selectedSections: string[]` replaces `selectedSection: string`; adds `toggleSection`, `clearSections`, backward-compat `setSelectedSection`
- React `Sidebar.tsx`: full grouped multi-select picker — sections grouped by type (🔵 Confluence / 📚 Portal / 🌐 Web Pages / 📎 Uploads), live filter, checkboxes, all/none controls
- React `TopBar.tsx`: active section tags with × dismissal, max 2 visible + "+N more", "All sources" when none selected
- React `InputArea.tsx`: context bar shows "Searching in: Name" (1 source) or "Searching in: N sources"
- React `App.tsx`: sends `sections[]` array in chat POST body

### Files changed
| File | Change |
|------|--------|
| `src/integrations/confluence-fetch.js` | Build breadcrumbs from parentId; write `confluence_spaces.json`; add `pageId`/`spaceKey`/`breadcrumb`/`updatedAt` to manifest |
| `src/ingestion/cleaner.js` | Preserve `<a>` link text; prepend breadcrumb prefix to chunks |
| `src/vectorstore/store.js` | `search()` supports `filter.sections: string[]` |
| `src/rag/query.js` | Thread `options.sections[]` through in both `query()` and `queryStream()` |
| `src/api/server.js` | `/api/sections` adds `displayName`+`type`; chat endpoints accept `sections[]` |
| `frontend/src/types.ts` | `SectionData.displayName/type` fields |
| `frontend/src/store/appStore.ts` | Multi-select `selectedSections[]` replaces single-select |
| `frontend/src/components/chat/Sidebar.tsx` | Grouped, searchable, multi-checkbox source picker |
| `frontend/src/components/chat/TopBar.tsx` | Active section tags with × dismissal |
| `frontend/src/components/chat/InputArea.tsx` | Multi-section context bar |
| `frontend/src/App.tsx` | Send `sections[]` in chat POST |
| `frontend/src/components/wizard/Step2Source.tsx` | OAuth org-admin warning + API Token "Recommended" badge |
| `public/css/app.css` | New source picker, active-tag, and recommended-tag CSS |

### Left for next session
- Smart space recommendations when confidence gate fires (suggest other sections to try)
- Smart document sync — chokidar file watcher on `docs/`
- Answer feedback 👍/👎 logged to eval.jsonl
- pnpm migration (Phase 2)
- Lemon Squeezy payment integration

---

## Session 16 — Adopting Features from confluence-rag-multi-level (2026-07-31)

**Context:** Deep review of `D:\AI\Syndigo AI\confluence\confluence-rag-multi-level` (a third,
Syndigo-specific project) to identify high-value features not yet in the knowledge hub.
Session implemented four major improvements.

### Priority 1 — Confluence Storage Format Converter (`storageToMd`)
The knowledge hub previously fetched Confluence pages as `export_view` (pre-rendered HTML).
This lost code block fidelity (CDATA), macro output was garbage, and `ri:page` cross-links
had no text. New approach: fetch `body-format=storage` (raw Confluence XML) and convert with
`storageToMd()` — a 60-line converter that handles all Confluence-specific XML.

**Result:** Confluence pages are now saved as `.md` files with proper fenced code blocks,
clean macro stripping, pipe tables with equal column widths, and `ri:page` link text.

### Priority 2 — `cfApi()` Retry/Backoff for Production Reliability
Previous `_get()` in `confluence.js` had no retry logic. Confluence Cloud rate-limits at 10 req/s.
New retry wrapper: exponential backoff (1s/2s/3s), 429 respects `Retry-After` header, 401 exits
with clear message, 403 soft-skips (returns null, caller handles gracefully).

### Priority 3 — React Chunk Explorer Tab + Pinning System
The Chunk Explorer feature existed in `public/js/app.js` (vanilla) but was missing from the
React frontend. Now fully ported:
- New `ChunkExplorer.tsx` panel: search input, sort by RRF/Semantic/BM25, result cards with
  scores, expand/collapse chunk text, pin button per chunk
- `pinnedChunkIds[]` in app store — `togglePin(id)` / `clearPins()`
- Pin bar above composer: shows when chunks are pinned, includes Manage + Clear buttons
- Pinned chunk IDs sent with chat POST — `query.js` bypasses retrieval + confidence gate
- `POST /api/chunks/search` endpoint added to `server.js`
- "🔍 Chunks" button added to sidebar footer actions

### Priority 4 — Confirmed Already Done (no new work needed)
- Dimension mismatch detection: already in `ingest.js` (Sessions 1-5)
- Per-section CLI flag `--section`: already in `ingest.js` (Sessions 1-5)

### Files changed
| File | Change |
|------|--------|
| `src/integrations/confluence.js` | `_get()` retrofit with retry/backoff (429/401/403); `getPagesInSpace()` → `body-format=storage` |
| `src/integrations/confluence-fetch.js` | Added `storageToMd()` + `_strip()` helpers; saves `.md` files using `page.body.storage.value` |
| `src/ingestion/ingest.js` | `.md` extension detection (skip HTML parsing); passes full manifest metadata (`breadcrumb`, `spaceKey`, `pageId`) to `chunkText()` |
| `src/rag/query.js` | `pinnedChunkIds` bypass in `queryStream()` — skips retrieval + confidence gate |
| `src/api/server.js` | Added `POST /api/chunks/search` endpoint; `pinnedChunkIds` threaded through to `queryStream()` |
| `frontend/src/types.ts` | Added `ChunkResult` interface |
| `frontend/src/store/appStore.ts` | Added `pinnedChunkIds[]`, `togglePin()`, `clearPins()`; `ActivePanel` type extended with `'chunks'` |
| `frontend/src/components/chat/ChunkExplorer.tsx` | **New** — full Chunk Explorer panel with search, sort, pin/unpin |
| `frontend/src/App.tsx` | Renders `<ChunkExplorer>` panel; includes `pinnedChunkIds` in chat POST body |
| `frontend/src/components/chat/InputArea.tsx` | Pin bar above composer (appears when chunks pinned) |
| `frontend/src/components/chat/SidebarFooter.tsx` | Added "🔍 Chunks" action button |
| `public/css/app.css` | New CSS for `.pin-bar`, `.chunk-explorer`, `.ce-*` components |

### Build status
- `npm run build:ui` → 121 modules, 0 TypeScript errors ✅
- `npm test` → 17/17 tests pass ✅

### Left for next session
- Smart space recommendations when confidence gate fires (suggest sections by keyword match)
- Smart document sync — chokidar file watcher on `docs/`
- Answer feedback 👍/👎 logged to eval.jsonl
- `CONFLUENCE_SPACES=auto` discovery mode in wizard + `confluence-fetch.js`
- pnpm migration (Phase 2)
- Lemon Squeezy payment integration

---

## Session 17 — UI Usability Overhaul (2026-07-31)

**Context:** Chunk Explorer and Analytics were rendering as small panels (~50-100px) inside the
chat flex column because MessageList and InputArea were still present as siblings. User requested
full-screen tabs, dark/light theme, collapsible sidebar sections, and collapsible sources.

### 1. Full-screen tab navigation (Chat | Chunks | Analytics | Upload)
**Root cause:** Panels were rendered BEFORE TopBar in JSX (`activePanel === 'chunks' && <ChunkExplorer />`),
yet MessageList + InputArea still rendered below them. All competed for flex space in `.main`.

**Fix:** Added a `<nav className="main-nav">` tab bar between TopBar and content, and wrapped all
panel/chat content in `<div className="panel-content">` that uses `flex: 1; overflow: hidden`.
Only the active panel renders — all others unmount. Chat shows MessageList + InputArea; other panels
take the full height with proper scroll.

Sidebar footer "Upload / Analytics / Chunks" navigation buttons removed (replaced by top nav tabs).
Settings dropdown kept in sidebar (Reconfigure / Rebuild / Reset).

### 2. Dark / Light theme toggle
- `theme: 'light' | 'dark'` and `toggleTheme()` added to Zustand store
- Persisted in `localStorage('kh_theme')`, applied immediately in `main.tsx` (before React mounts)
  to prevent flash-of-wrong-theme
- `☀️/🌙` toggle button added to TopBar (right side)
- `.dark` CSS class on `<html>` overrides all CSS vars — ~80 lines of dark overrides covering
  topbar, nav, messages, input, analytics, chunk cards, upload, modals, sidebar, etc.

### 3. Collapsible sidebar sections
- "Recent conversations" section header made into a `<button>` with `›/⌄` chevron — clicks toggle
  visibility
- `history-list` now has `max-height: 240px; overflow-y: auto` with thin scrollbar so long session
  lists scroll instead of pushing content off-screen
- Source groups were already collapsible (unchanged)

### 4. Collapsible sources in message bubbles
- Sources area in `MessageItem.tsx` now has a toggle button showing `› Sources (N)` with
  rotating chevron — defaults open, click to collapse

### 5. TopBar source filters — context-aware
- Active-source-filter pills now only render when `activePanel === 'chat'` — they're irrelevant
  when viewing Chunks/Analytics/Upload tabs

### Files changed
| File | Change |
|------|--------|
| `frontend/src/main.tsx` | Apply saved theme class before React mounts (no flash) |
| `frontend/src/store/appStore.ts` | Added `theme`, `toggleTheme` |
| `frontend/src/App.tsx` | Restructured main area with `<nav.main-nav>` + `<div.panel-content>`; only active panel renders |
| `frontend/src/components/chat/TopBar.tsx` | Theme toggle button; source filters hidden on non-chat tabs |
| `frontend/src/components/chat/MessageItem.tsx` | Collapsible sources toggle (chevron + count) |
| `frontend/src/components/chat/Sidebar.tsx` | Collapsible "Recent conversations" header + chevron |
| `frontend/src/components/chat/SidebarFooter.tsx` | Removed Upload/Analytics/Chunks nav buttons (moved to top nav) |
| `public/css/app.css` | `.main-nav`, `.panel-content`, `.dark` theme overrides (~200 new lines); history-list max-height scroll; sources-toggle styles; upload-panel full-screen fix |

### Build status
- `npm run build:ui` → 121 modules, 0 TypeScript errors ✅
- `npm test` → 17/17 tests pass ✅

### Left for next session
- Smart space recommendations when confidence gate fires (suggest sections by keyword match)
- Smart document sync — chokidar file watcher on `docs/`
- Answer feedback 👍/👎 logged to eval.jsonl
- `CONFLUENCE_SPACES=auto` discovery mode
- pnpm migration (Phase 2)
- Lemon Squeezy payment integration

---

## How to Update This Log

At the end of each session, add a new entry:

```markdown
## Session N — Brief Title (YYYY-MM-DD)

**Context:** What the user asked for / what problem was being solved.

**Files changed:**
- `path/to/file.js` — what changed and why

**Issues encountered:**
- Problem → solution

**Left for next session:**
- Item 1
- Item 2
```
