# Validation Guide — How to Test Every Feature

> Use this after making any changes. Covers every feature end-to-end.

---

## Quick Smoke Test (2 minutes)

```bash
npm run server
# Open http://localhost:3000
# Ask: "What is MDM?"
# Expected: answer appears with streaming cursor, source chips show below
```

If that works, the core pipeline is healthy.

---

## Feature-by-Feature Tests

### 1. App Startup & Status

```
Open: http://localhost:3000
Expected:
  ✅ Chat UI loads (not redirected to /setup)
  ✅ Sidebar shows chunk count (e.g., "1,847 chunks indexed")
  ✅ LLM model shown (e.g., "qwen2.5:3b")
  ✅ Section buttons visible in "Filter by section" panel

If redirected to /setup: run full build (npm run sync:force) first
If chunk count is 0: run npm run ingest
```

### 2. Streaming Responses (Phase 1)

```
Test: Ask any question in the chat UI
Expected flow:
  1. Typing dots appear (retrieval phase, ~1–2 sec)
  2. Typing dots disappear, replaced by AI bubble with blinking ▋ cursor
  3. Words appear progressively (fast or slow depending on model + GPU)
  4. Cursor disappears
  5. Source chips appear below the answer
  6. Debug line shows: "📦 3/6 chunks  🪙 ~1240 ctx tokens"

Slow model test (to see token-by-token clearly):
  In .env or app_config.json, temporarily set OLLAMA_MODEL=mistral
  Ask a long question ("explain all the steps to configure...")
  Tokens should visibly stream one by one
```

### 3. Confidence Gate (Out-of-Scope Detection)

```
Test: Ask something unrelated to the docs
  "What is the capital of France?"
  "How do I bake a cake?"
  "Tell me about Salesforce"

Expected:
  ✅ Answer says: "I couldn't find this in the available documentation."
  ✅ No hallucinated answer about unrelated topics
  ✅ "Out of scope" badge visible (if implemented)

If hallucinating on out-of-scope: increase CONFIDENCE_GATE in .env (try 0.28)
Diagnose: npm run diagnose "What is the capital of France?"
  Look for: topSemScore < 0.22 (should be blocked)
```

### 4. Section Filter

```
Test: Select a specific section from sidebar → ask a question
Expected:
  ✅ Filter pill appears in topbar showing section name
  ✅ Answer references that section specifically
  ✅ Debug line shows fewer chunks (filtered search)

Test: Clear filter (click × on filter pill)
Expected:
  ✅ Filter pill disappears
  ✅ Next question searches all sections
```

### 5. Multi-Turn Conversation

```
Test: Ask 3 follow-up questions in the same conversation
  Q1: "What is MDM?"
  Q2: "How do I configure it?"
  Q3: "What are the limitations?"

Expected:
  ✅ Each answer is coherent and refers to prior context where relevant
  ✅ Session title in topbar updates to first question
  ✅ Conversation visible in history sidebar
```

### 6. Session Persistence

```
Test: Ask a question, then refresh the page (F5)
Expected:
  ✅ Same session restored (same sessionId from localStorage)
  ✅ Restore banner shows: "🔁 Restored N earlier messages"
  ✅ Prior Q&A visible

Test: Close browser entirely, reopen http://localhost:3000
Expected:
  ✅ Session still restored (sessions.json persists on server)
```

### 7. Session History Sidebar

```
Test: Ask questions across 3 different sessions (use "New conversation" button)
Expected:
  ✅ History sidebar shows all 3 sessions
  ✅ Clicking a session restores that conversation
  ✅ Delete button (×) removes a session
```

### 8. Rebuild Index Live Log (Phase 1, QW-1)

```
Test: Sidebar footer → 🔄 Rebuild Index → confirm
Expected:
  ✅ Confirm dialog appears (not an alert)
  ✅ Dark terminal panel appears above chat messages
  ✅ Phase header updates: "── Re-indexing Phase 1/2: Crawling..."
  ✅ Live log output scrolls in panel
  ✅ Phase 2 message appears when crawl succeeds
  ✅ Final: "✅ Knowledge base rebuilt! N chunks indexed."
  ✅ Chunk count in sidebar footer updates
  ✅ × button dismisses the panel

Failure test: Stop Ollama → try rebuild
Expected:
  ✅ Panel shows red ❌ with error message
  ✅ buildJob resets (can retry without "build already running" error)
```

### 9. Incremental Re-crawl (Phase 1, Leap 3)

```
# Terminal tests only — not visible in app UI

# Run full crawl first (establishes baseline)
npm run crawl

# Check hashes file was created
ls data/crawl_hashes.json   # should exist

# Run incremental crawl immediately
npm run crawl:incremental

Expected log output:
  ⏭️  [section #1] Unchanged: 001_page.html
  ⏭️  [section #2] Unchanged: 002_page.html
  ... (most pages should be "Unchanged")
  Total: 0 pages saved, 0 skipped, N unchanged

# Run incremental ingest
npm run ingest:incremental

Expected output:
  Mode      : incremental
  Skipped (unchanged): N pages
  New/updated chunks: 0
  All pages unchanged — index is up to date.
```

### 10. Sync Script (Phase 1 fix)

```
# Test the fixed sync command
npm run sync

Expected:
  ✅ No "DOCS_BASE_URL is not set" error
  ✅ Shows: "Portal: https://docx.xyz_org.com/docs"
  ✅ Shows: "Mode: incremental"
  ✅ Runs crawl phase, then ingest phase
  ✅ Exits with "✅ Sync complete."

# Test force rebuild
npm run sync:force

Expected:
  ✅ Runs full crawl (no --incremental flag)
  ✅ Runs ingest with --force (clears and rebuilds index)
```

### 11. Diagnose Tool

```bash
npm run diagnose "how do I configure MDM?"

Expected output:
  ① Vector Store — chunk count, section breakdown
  ② Query Embedding — dimensions shown
  ③ BM25 top 5 — keyword scores
  ④ Semantic top 5 — cosine scores (all should be >0.22 for a valid question)
  ⑤ Final hybrid — chunks that reach LLM
  ⑥ Recommendations — "No issues found" for a valid question

npm run diagnose "What is the capital of France?"

Expected:
  ④ Semantic top 5 — all scores <0.22 (red warning)
  ⑥ Recommendations — "Confidence gate will block this query"
```

### 12. Setup Wizard

```
Open: http://localhost:3000/setup

Step 1 (Welcome): Click "Get Started →"

Step 2 (Portal):
  ✅ Enter a URL → click "Test" → should show "✅ Reachable"
  ✅ Enter sections (one per line)
  ✅ Continue

Step 3 (Auth):
  ✅ Select "None" → no credentials shown
  ✅ Select "Username + Password" → email/password fields appear
  ✅ Select "Microsoft 365" → email/password fields appear
  ✅ Select "Open Browser" → "Launch Login Browser" button appears
  ✅ Click "Launch Login Browser" → browser window should open (Playwright)

Step 4 (AI):
  ✅ Select "Ollama" → URL + model fields shown
  ✅ Click "Test" → shows available models
  ✅ Select "Claude API" → API key field shown

Step 5 (Build):
  ✅ Summary grid shows configured values
  ✅ Click "Start Building" → live log panel appears (same as rebuild)
  ✅ On success → "✅ Knowledge Hub is ready!" shown
  ✅ "Launch Assistant →" redirects to /
```

---

## Regression Checklist (run after any significant change)

```
□ Server starts without errors: npm run server
□ Chat UI loads at localhost:3000
□ Asking a question returns an answer (streaming cursor visible)
□ Out-of-scope question is blocked (not hallucinated)
□ Session persists across page refresh
□ 🔄 Rebuild Index shows live panel (not alert)
□ npm run sync runs without DOCS_BASE_URL error
□ npm run diagnose "test question" shows full output
```

---

## Common Failures and Fixes

| Error | Likely cause | Fix |
|---|---|---|
| `DOCS_BASE_URL is not set` | Running crawl directly without config | Use `npm run sync` or pass env vars manually |
| `Ollama is not running` | Ollama process stopped | Run `ollama serve` in terminal |
| `model "qwen2.5:3b" not found` | Model not pulled | Run `ollama pull qwen2.5:3b` |
| `nomic-embed-text not found` | Embedding model not pulled | Run `ollama pull nomic-embed-text` |
| Chunk count is 0 | Ingest not run | Run `npm run ingest` |
| `manifest.json not found` | Crawl not run | Run `npm run crawl` first |
| "A build is already running" | Previous build stuck | Open DevTools → `fetch('/api/setup/cancel', {method:'POST'})` |
| Streaming shows nothing | Old browser cached JS | Hard refresh (Ctrl+Shift+R) |
| Session not restored | Different port/URL | Check `localStorage` key matches server URL |
| Dimension mismatch | Embedding provider changed | Run `npm run ingest -- --force` |
