# DECISIONS.md — Knowledge Hub RAG

Every significant design decision made during development, with full rationale.
Read this before changing any core component.

---

## D-01: RAG over fine-tuning

**Decision:** Use RAG, not fine-tuning.

**Rationale:**
- Docs change frequently. RAG auto-updates when you re-index; fine-tuning needs full retraining.
- Fine-tuning improves style, not knowledge accuracy.
- RAG produces citations — users can verify the source.
- Fine-tuning Claude is not available via standard API.

---

## D-02: Playwright persistent context for Auth0

**Decision:** Use `launchPersistentContext()` with `user_data/` dir.

**Rationale:**
- Portal is behind Microsoft SSO + Auth0 MFA. No public API exists.
- Persistent context = login once, session cached until token expires.
- Alternative (headless from scratch) = re-login + MFA on every crawl.

**Trade-off:** `user_data/` is ~50MB, must not be committed.
**Risk:** If Microsoft session expires, next crawl requires manual login.

---

## D-03: `.article-next` navigation (not sidebar parsing)

**Decision:** Follow `.article-next` button for depth-first traversal.

**Rationale:**
- Correctly visits all nested sub-pages (confirmed by testing).
- Sidebar link extraction is fragile — CSS selectors change with portal updates.
- Early bug was misattributed to "missing nested pages" — actual cause was table content
  being dropped by the cleaner. The crawler was correct.

---

## D-04: JSON file over SQLite for vector store

**Decision:** Store vectors as per-section JSON arrays in `data/vectors_<section>.json`.

**Rationale:**
- `better-sqlite3` requires C++ build tools (Visual Studio on Windows) — kills Windows install.
- For <100k chunks, JSON + linear cosine search is <200ms.

**Scale threshold:** At ~20k+ chunks, switch to LanceDB (prebuilt Windows binaries, embedded).
LanceDB adapter will slot into the `getVectorStore()` factory without changing retrieval logic.

---

## D-05: nomic-embed-text as default embedder

**Decision:** Default to `nomic-embed-text` via Ollama, 768d semantic vectors.

**Rationale:**
- TF-IDF misses semantic relationships: "authenticate" ≠ "login".
- OpenAI embeddings cost money + require API key.
- nomic is free, local, 274MB one-time download, high quality.

**Fallback:** `EMBEDDING_PROVIDER=tfidf` for zero-dependency operation.

---

## D-06: BM25 + cosine hybrid search with RRF

**Decision:** Combine BM25 keyword scoring with semantic cosine similarity via Reciprocal Rank Fusion.

**Rationale:**
- Pure semantic: misses exact API endpoint names, error codes, version numbers.
- Pure BM25: misses paraphrase questions ("how do I log in" ≠ "authentication").
- RRF = Σ 1/(60+rank): well-studied, robust to outliers, no score normalization needed.
- `HYBRID_WEIGHT=0.5` tunable without code changes.

---

## D-07: Per-chunk breadcrumb injection

**Decision:** Prepend `**Page:** ...\n**Section:** ...\n\n` to every chunk.

**Rationale:**
- LLM sees which page each chunk came from → better citations, less cross-context confusion.
- Chunk is self-contained — useful for debugging/inspection.
- Cost: ~50-80 extra chars per chunk (accounted for in budget calculations).

---

## D-08: NOMIC_MAX_CHARS = 20 000

**Decision:** Hard-truncate chunks at 20 000 chars before sending to nomic.

**Rationale:**
- nomic limit: 8192 tokens ≈ 32 768 chars for plain English. Technical docs tokenize higher.
- 20 000 chars ≈ 5 000 tokens — safe headroom.
- Earlier 28 000 char limit still crashed. This one has not.
- Embed one-at-a-time: one bad chunk can't crash others.

**History:** This error crashed ingest multiple times. A second fix attempt introduced literal `\n`
inside JS string literals (syntax error), silently prevented the fix from running, and required
a full file rewrite to resolve.

---

## D-09: Dual confidence gate (not single-threshold)

**Decision:** `passesGate = semScore >= 0.22 OR (rrfScore >= 0.014 AND semScore >= 0.05)`

**Rationale:**
- Original single gate (`semScore >= 0.22`) falsely blocked BM25-found content where the exact
  term appears in titles/headings (high keyword score, lower cosine — e.g. filename-based queries).
- Dual gate: strong semantic OR BM25-boosted weak semantic.
- Gate fires before LLM call — zero cost for out-of-scope questions.
- 0.22 calibrated for nomic: below this = genuinely unrelated.

**Not-found enhancement:** When gate fires, scan all chunks for the best weak matches and
suggest which sections are most likely to contain related content.

---

## D-10: Clean Q&A history (no context blobs in history)

**Decision:** Pass only `{role, content}` Q&A pairs to LLM — no prior context chunks.

**Rationale:**
- Re-injecting context blobs per turn: by turn 5, 10 000+ chars of repeated context.
- Ollama slows exponentially with context window size.
- Fresh context is retrieved for every new question — old context blobs are never needed.

**Implementation:** `history = session.messages.slice(-8).map(m => ({role, content}))`

---

## D-11: Query expansion (3 search angles)

**Decision:** Ask LLM to rephrase query 2 additional ways, run all 3 retrievals, deduplicate.

**Rationale:**
- "How do I connect to the API" may miss chunks titled "Authentication".
- 3× more chances to find the right chunk.
- Falls back silently if LLM unavailable.

**Cost:** One extra LLM call (~2-4s on qwen2.5:3b).

---

## D-12: Session persistence in JSON, not in-memory

**Decision:** `data/sessions.json`, `sessionId` in browser `localStorage`.

**Rationale:**
- In-memory sessions disappear on server restart.
- `localStorage` ensures same session ID survives page refresh.
- Bug fixed: `sessionId = randomUUID()` ran on every page load → new session on every refresh.

---

## D-13: Per-section vector store sharding

**Decision:** One `data/vectors_<section>.json` file per section, all loaded into a single in-memory array.

**Rationale:**
- Single `vectors.json` would lock the file during writes — incremental updates for one section
  would require rewriting all sections.
- Sharding: a section update writes only that shard.
- In-memory merge is free at current scale (<20k chunks).
- LanceDB migration (Phase 2) will mirror this with partition-aware upserts.

---

## D-14: Electron + localhost Express (not direct Electron IPC)

**Decision:** Electron `mainWindow.loadURL('http://localhost:3000')` — Express handles all logic.

**Rationale:**
- Zero duplication: same Express server works for Electron app AND `npm run server` (browser mode).
- No IPC protocol needed for the chat UI — it's just HTTP.
- Docker deployment (Phase 2) requires no changes to server code.
- Trade-off: spawning a child process adds ~300ms to app launch.

**IPC kept for:** system actions (open external URL, close window, get app name).

---

## D-15: Incremental crawl via MD5 hash comparison

**Decision:** Store MD5(innerHTML) per URL in `data/crawl_hashes.json`; skip unchanged pages.

**Rationale:**
- Full re-crawl + re-embed is expensive (30-60 min for a large portal).
- MD5 is fast, deterministic, and detects any content change.
- Alternative (timestamp-based) requires the portal to surface `updatedAt` — it doesn't.

---

## D-16: SSE streaming (not WebSocket, not polling)

**Decision:** Server-Sent Events (`text/event-stream`) for all streaming: chat, build, upload.

**Rationale:**
- WebSocket is bidirectional — chat and build are inherently unidirectional (server → client).
- SSE is native browser API, zero client library needed.
- Fetch API with SSE works correctly from Electron's Chromium.
- Polling: 10× more HTTP requests, 2-3s latency on each token.

---

## D-17: Document upload with inline SSE progress

**Decision:** `POST /api/docs/upload` returns `text/event-stream` — progress events emitted
during chunk+embed, then a final done event.

**Rationale:**
- Large PDF uploads (50-200 pages) take 30-120 seconds to embed.
- Without progress: user sees blank spinner, assumes it hung.
- SSE: same pattern as build streaming — reused existing logic.
- Orphan cleanup: if upload gate (402) fires after multer has written files to disk,
  files are explicitly deleted before returning the error.

---

## D-18: Confluence OAuth TTL (10-minute cleanup)

**Decision:** `setTimeout(() => delete oauthPending[state], 10 * 60 * 1000)` after creating OAuth state.

**Rationale:**
- `oauthPending` map accumulates state entries that are never cleaned up if users abandon the flow.
- TTL ensures memory bounded. 10 minutes is enough for any realistic OAuth flow.
- This is a server-side memory leak fix — not a security gate (the state nonce itself is validated).

---

## D-19: Offline-first license validation

**Decision:** License tier resolved locally from `data/license.json` without a network call.

**Rationale:**
- Privacy guarantee: license check must not phone home for every query.
- Key prefix convention (`LTM-`/`LIFE-` = Lifetime) works offline.
- `LICENSE_API_URL` env var (unset by default) enables server-side validation when set.
- Future: Vercel Edge Function handles key invalidation when user cancels subscription.

---

## D-20: 60-second query count cache

**Decision:** Cache `getMonthlyQueryCount()` result for 60 seconds.

**Rationale:**
- `eval.jsonl` grows over time. O(n) scan on every chat request is unacceptable at volume.
- 60s cache: a user at exactly the limit can send 1-2 extra queries. Acceptable for a free tier.
- Cache invalidated on month boundary (new month resets the count).

---

## D-21: Upload-only mode (portal URL optional)

**Decision:** Leave portal URL and sections empty → valid configuration, upload-only mode.

**Rationale:**
- Many knowledge bases are built entirely from uploaded documents (no portal to crawl).
- Original validation required portal URL — blocked this use case.
- Upload-only message shown in wizard to confirm intent (not an error).
- `sections.length && !url` still errors — sections require a portal URL.

---

## D-22: Lemon Squeezy over Stripe (planned)

**Decision:** Use Lemon Squeezy as payment provider when monetizing (Phase 2).

**Rationale:**
- Stripe requires building: webhook verification, license key generation, EU VAT compliance,
  customer portal, dunning emails — substantial engineering work.
- Lemon Squeezy is a Merchant of Record: all of the above is built-in.
- `license_key_created` webhook returns exactly `{key, tier, expiry}` — matches `activateLicense()`.
- EU VAT handled automatically — avoids legal liability for international sales.

---

## D-23: Keep custom LLM orchestration (not LangChain.js)

**Decision:** Keep the custom `ask*Stream`, `expandQuery`, `compressContext`, `generateFollowUps` pipeline.

**Rationale:**
- LangChain's `RetrievalQAChain` calls LLM unconditionally → bypasses the confidence gate.
- LangChain re-injects context blobs into history → violates D-10.
- LangChain uses semantic-only retrieval → bypasses BM25+RRF.
- The five deliberate algorithmic choices (gate, clean history, query expansion, trigram dedup,
  hybrid RRF) are product differentiators. No framework replicates this combination.
- Optional: add Vercel `ai` SDK to replace the buffer-parsing `ask*Stream` with typed `streamText()`.

---

## D-24: TypeScript incremental migration (not big-bang rewrite)

**Decision:** `tsconfig.json` with `allowJs: true, checkJs: false` + `tsx` runner. New files in TS,
existing files migrated on meaningful touch.

**Rationale:**
- Big-bang rewrite of 3 000+ LOC with zero tests would introduce regressions.
- `allowJs` = zero immediate code changes, full TS toolchain available.
- Define types in `src/types/index.ts` first → shared across all files from day one.
- `strict: false` initially → enable per-file as each file is migrated.

---

## D-25: LanceDB over Chroma / Qdrant (planned)

**Decision:** LanceDB for Phase 2 vector store, not Chroma or Qdrant.

**Rationale:**
- Chroma: uses `hnswlib-node` (C++ native, node-gyp) → same constraint that killed `better-sqlite3`.
- Qdrant: no embedded JS mode — requires a separate Docker/binary process.
- LanceDB: ships prebuilt Node.js binaries for Windows x64/macOS/Linux, embedded like SQLite,
  ANN indexing (IVF-PQ), <20ms at 1M vectors, pure Rust under the hood.
- Custom BM25+RRF logic stays unchanged on top of LanceDB's semantic results.
