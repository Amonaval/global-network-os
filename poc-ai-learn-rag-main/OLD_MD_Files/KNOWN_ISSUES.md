# KNOWN_ISSUES.md — Knowledge Hub RAG

Status legend: ✅ Fixed | ⚠️ Workaround | 🔲 Open

---

## ✅ KI-01: Element not attached to DOM (Playwright crash)

**Symptom:** `elementHandle.click: Element is not attached to the DOM`
**When:** During crawl, on any page navigation
**Root cause:** Code held a Playwright `ElementHandle` to `.article-next`, then the page started
navigating. By the time `.click()` was called, the DOM node was detached.
**Fix:** Replaced with `page.evaluate(() => document.querySelector('.article-next').click())`
**File:** `src/crawler/crawl.js` → `clickNextAndWait()`
**Status:** Fixed in current version.

---

## ✅ KI-02: Table content not retrieved

**Symptom:** Questions about tabular content returned "couldn't find this in documentation."
**Root cause:** `cleaner.js` extracted `<td>/<th>` cell text as isolated fragments. The resulting
text was meaningless to the embedder — no column context, no structure.
**False lead investigated:** Initially blamed "missing nested pages" — the page WAS crawled correctly.
**Fix:** Rewrote table extraction to produce `| col1 | col2 |` markdown format.
**File:** `src/ingestion/cleaner.js` → table handling section
**Verify:** `npm run inspect docs/<section>/<file>.html` should show markdown tables.
**Status:** Fixed.

---

## ✅ KI-03: Nomic context length crash (compound)

**Symptom:** `Error: Nomic error: {"error":"the input length exceeds the context length"}`
**Root causes (compound):**
1. `NOMIC_MAX_CHARS=28000` — too lenient, still crashed on some technical docs
2. Second fix introduced literal `\n` inside JS string literals — syntax error, fix never ran
3. Batch of 32 chunks — one oversized chunk crashed the entire batch
**Fix:**
- `NOMIC_MAX_CHARS = 20000` (conservative)
- Embed ONE chunk at a time (batch size = 1)
- Skip-and-continue: log to `data/skipped_chunks.log`, assign zero-vector
- Complete file rewrite from scratch (syntax corruption)
**Status:** Fixed. Skip log at `data/skipped_chunks.log` tracks any remaining failures.

---

## ✅ KI-04: Embedding dimension mismatch

**Symptom:** Retrieval works but answers are wrong/irrelevant after switching embedding provider.
**Root cause:** TF-IDF = 2048d, nomic = 768d. Switching provider without re-indexing = comparing
vectors in different spaces. No crash — silent wrong answers.
**Fix:** `ingest.js` checks `data/ingest_meta.json` on startup. Provider change OR dim mismatch
→ auto-forces `--force` rebuild.
**Detect:** `npm run diagnose "question"` → Section ② shows dim check.
**Status:** Fixed with auto-detection.

---

## ✅ KI-05: Session lost on page refresh

**Symptom:** Refreshing the browser started a new conversation.
**Root cause:** `state.sessionId = crypto.randomUUID()` ran at module load — every page load
generated a fresh session ID.
**Fix:** `localStorage.getItem(STORAGE_KEY) || newSessionId()`
**Status:** Fixed. Sessions persist across refreshes and browser restarts.

---

## ✅ KI-06: Ollama slowdown over multi-turn conversation

**Symptom:** Response time increased dramatically after 4-5 turns.
**Root cause:** Full RAG context blob re-injected into history per turn. By turn 5:
10 000+ chars of repeated context per entry in the history array.
**Fix:** History stored and sent as clean Q&A pairs only. Fresh context retrieved for each query.
**Status:** Fixed. Response time consistent across all turns.

---

## ✅ KI-07: Password exposed in uploaded file

**Symptom:** `auth0_crawler.js` uploaded to Claude.ai with hardcoded credentials.
**Impact:** Password visible in Anthropic's systems.
**Action:** Password changed at `https://myaccount.microsoft.com`.
**Mitigation:** Credentials in `.env` only; wizard config in `data/app_config.json` only.
Never upload source files or config files.

---

## ✅ KI-08: Hallucination on out-of-scope questions

**Symptom:** "NextGen Visualization" question returned fabricated answer from unrelated chunk
(8% semantic match allowed through with old `MIN_CHUNK_SCORE=0.03`).
**Fix:** Dual confidence gate: `semScore >= 0.22 OR (rrfScore >= 0.014 AND semScore >= 0.05)`.
Gate fires before LLM — zero hallucination possible when gate fires.
Not-found response includes section suggestions for related content.
**Status:** Fixed.

---

## ✅ KI-09: Single confidence gate blocked BM25-found content

**Symptom:** Queries with exact terms in page titles/headings returned "not found" despite the
content clearly existing (e.g., "XYZ_ORG REST API endpoints").
**Root cause:** These queries have high BM25 scores but lower cosine similarity. Single threshold
`semScore >= 0.22` falsely blocked them.
**Fix:** Dual gate: `semScore >= 0.22 OR (rrfScore >= 0.014 AND semScore >= 0.05)`
Second condition: BM25-boosted content with any non-trivial semantic match passes through.
**Status:** Fixed.

---

## ✅ KI-10: Stale pages after doc portal updates

**Symptom:** RAG answers based on outdated documentation after the portal was updated.
**Root cause:** No incremental sync — full re-crawl downloaded everything every time.
**Fix:** Incremental crawl + ingest via MD5 hash comparison.
- `data/crawl_hashes.json`: URL → MD5(innerHTML)
- `data/ingest_hashes.json`: filepath → MD5(file contents)
- Unchanged files skip download and re-embedding entirely.
- `npm run sync` or `npm run crawl:incremental && npm run ingest:incremental`
**Status:** Fixed.

---

## ✅ KI-11: Upload orphaned files on gate rejection

**Symptom:** Multer writes uploaded files to disk before the upload gate check fires.
On 402 (upload limit exceeded), files were written but never indexed — disk leak.
**Fix:** On 402 gate rejection, explicitly `fs.unlinkSync(f.path)` for each multer file.
**File:** `src/api/server.js` → `/api/docs/upload` handler
**Status:** Fixed.

---

## ✅ KI-12: OAuth state memory leak

**Symptom:** `oauthPending` object in `server.js` accumulated entries when users abandoned
the OAuth flow without completing it.
**Fix:** `setTimeout(() => delete oauthPending[state], 10 * 60 * 1000)` after creating each state.
**Status:** Fixed.

---

## ✅ KI-13: Query count O(n) scan on every request

**Symptom:** `/api/chat/stream` latency grew as `data/eval.jsonl` grew — full file scan per request.
**Fix:** 60-second in-memory cache: `_queryCountCache = { count, month, ts }`.
Cache invalidated when month changes.
**File:** `src/license/license.js` → `getMonthlyQueryCount()`
**Status:** Fixed.

---

## ✅ KI-14: Confluence pagination absolute URL bug

**Symptom:** Confluence pagination failed on some instances that returned absolute URLs
in `_links.next` instead of relative paths.
**Fix:** `_nextPath()` checks `next.startsWith('http')` → extracts pathname + search from `new URL()`.
**File:** `src/integrations/confluence.js` → `_nextPath()`
**Status:** Fixed.

---

## ✅ KI-15: vLLM URL not validated in setup wizard

**Symptom:** User could configure vLLM without providing a server URL — causing cryptic
"connection refused" errors at query time.
**Fix:** Wizard validation: if `llm === 'vllm' && !vllmUrl` → `showError('vllmUrl', ...)`
**File:** `public/js/setup.js` → `validateStep4()`
**Status:** Fixed.

---

## ✅ KI-16: Plan cards hidden when no Stripe URL configured

**Symptom:** Pricing plan cards (Pro Monthly, Pro Annual, Lifetime) were hidden entirely
when no Stripe checkout URL was configured — invisible to users.
**Fix:** Cards always visible. If Stripe URL missing: show "Request Access" button
(mailto: link) instead of hiding the card.
**File:** `public/js/app.js` → license modal rendering
**Status:** Fixed.

---

## ⚠️ KI-17: Ollama response speed on CPU (~15-25s)

**Symptom:** Every answer takes 15-25 seconds.
**Cause:** `qwen2.5:3b` on CPU — expected, not a bug.
**Workarounds:**
1. Switch to `phi3:mini` — faster, slightly lower quality
2. Switch to Claude API (`LLM_PROVIDER=claude`) — requires API key
3. Machine with NVIDIA GPU — Ollama auto-detects
**Status:** Known limitation.

---

## 🔲 KI-18: No Stripe / Lemon Squeezy webhook backend

**Symptom:** License activations currently use offline key-prefix detection only.
No real payment provider wired — license management is manual.
**Current state:** Stripe stub exists at `/api/stripe/webhook` but does nothing.
**Plan:** Replace with Lemon Squeezy (Phase 2). See D-22.
**Status:** Open — Phase 2 work.

---

## 🔲 KI-19: Analytics UI built but no cross-encoder re-ranking

**Symptom:** Some low-relevance chunks occasionally reach the context window despite
high BM25 rank but poor actual relevance.
**Context:** A cross-encoder re-ranker (e.g. a small local model that scores query-chunk pairs)
would improve context quality significantly at the cost of an extra inference step.
**Plan:** Evaluate after LanceDB migration (Phase 2).
**Status:** Open — post-LanceDB evaluation.

---

## 🔲 KI-20: No answer feedback mechanism

**Symptom:** No way to capture user satisfaction with answers for improving retrieval tuning.
**Plan:** Add 👍/👎 buttons per answer; log `{ts, sessionId, q, answered, feedback}` to
`eval.jsonl`. Surface in analytics.
**Status:** Open — Phase 2 (20/80 feature — high value, low complexity).
