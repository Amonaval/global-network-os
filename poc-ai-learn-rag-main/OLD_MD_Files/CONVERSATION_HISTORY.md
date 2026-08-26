# Conversation History — XYZ_ORG Doc Portal RAG
# This file captures the full design conversation so the chat can be deleted.
# Feed this to Claude Code at session start if you need full context.

## Project origin
Started as a question: "How can I crawl docx.XYZ_ORG.com (Auth0 protected) and build a
private RAG assistant for internal use?"

## Decision log (chronological)

### Decision 1: RAG over fine-tuning
Fine-tuning was considered and rejected because:
- Docs change frequently — RAG auto-updates, fine-tuning requires full retraining
- Fine-tuning improves style/format, not knowledge recall
- RAG gives citations (source page shown to user)
- RAG is cheaper and faster to iterate

### Decision 2: Auth0 crawler approach
docx.XYZ_ORG.com is behind Microsoft SSO + Auth0. Three options considered:
1. Playwright persistent context (CHOSEN) — logs in once, caches session in user_data/
2. CMS bulk export — portal is not easily exportable
3. API token — no public API exposed

The `.article-next` navigation correctly traverses the full page tree depth-first.
We initially suspected nested pages were missing, but this was wrong — the crawler
WAS getting them. The real problem was the HTML cleaner dropping table content.

### Decision 3: Embedding provider progression
1. Started with TF-IDF (pure JS, no install) — worked for basic tests
2. Upgraded to nomic-embed-text via Ollama — 768d semantic vectors, ~274MB download
3. OpenAI text-embedding-3-small available as cloud option
Key learning: TF-IDF scores are in range 0.03-0.15. Nomic scores are 0.20-0.60+.
MIN_CHUNK_SCORE and CONFIDENCE_GATE must be tuned per provider.

### Decision 4: Vector store — no SQLite
Initially used better-sqlite3 for the vector store. Caused build failures on Windows
because it requires Visual Studio C++ build tools (node-gyp).
Replaced with plain JSON file. For the scale of this project (<50k chunks), JSON
with linear cosine search is fast enough (<100ms). At 100k+ chunks, switch to Pinecone.

### Decision 5: Hybrid BM25 + semantic search
Pure semantic search missed exact API endpoint names and error codes.
Pure BM25 missed conceptual/paraphrase questions.
RRF fusion of both: sem_rank and bm25_rank combined with 1/(k+rank) formula.
HYBRID_WEIGHT=0.5 means equal contribution. Tunable in .env.

### Decision 6: Context compression pipeline
Problem: sending all 6 chunks raw to Ollama used ~2400 tokens each query.
Solution: 3-stage pipeline:
1. Drop chunks below MIN_CHUNK_SCORE
2. Trigram Jaccard dedup (>55% overlap = duplicate, drop lower-scored one)
3. Greedy budget fill up to CTX_TOKEN_BUDGET
Result: 30-40% fewer tokens per query, faster Ollama responses.

### Decision 7: Query expansion
Before hitting vector store, ask LLM to generate 2 alternative phrasings.
Then retrieve for all 3 queries and deduplicate results.
Improves recall significantly for conceptual questions.
Falls back silently to original query if LLM unavailable.

### Decision 8: Model recommendations
Tested models (in order tried):
- gemma2:2b — too small, poor quality for technical docs
- mistral — good quality but 1.5+ minutes per response on CPU
- llama3.2 — decent balance
- qwen2.5:3b — RECOMMENDED: fastest, best quality for technical content
- phi3.5 — good alternative, strong on structured content

### Decision 9: Memory/session persistence
Bug: page refresh lost conversation.
Root cause: sessionId generated fresh on every page load.
Fix: localStorage persistence + sessions.json on server.
History sent as clean Q&A pairs, NOT with prior RAG context blobs.
(Prior context blobs caused Ollama to slow down exponentially over multi-turn)

### Decision 10: Confidence gate
Problem: out-of-scope questions (e.g., "UI framework tech stack") retrieved weak
chunks and LLM hallucinated plausible-sounding but wrong answers.
Fix: if best semantic score < CONFIDENCE_GATE (0.22), don't call LLM at all.
Return explicit "not in knowledge base" message with instructions.

## UI features implemented
- Dark sidebar with session history list
- Section filter (filter search to one product section)
- Chunk viewer tab — shows retrieved chunks with S/B/RRF scores
- Pin chunks — force specific chunks into next answer (bypass retrieval)
- Follow-up question suggestions
- Source citations with relevance %
- Debug line: chunks used, tokens, dropped low/dupes, latency
- Out-of-scope badge when confidence gate fires
- Restore banner when session loaded from history

## What was NOT implemented (deliberately deferred)
- Streaming responses
- Confluence integration (separate project)
- Per-user access control
- Docker deployment
- Pinecone (cost not justified yet)
- OpenAI embeddings (cost not justified for POC)

## Files that should exist
After a successful crawl + ingest, you should have:
- docs/manifest.json — list of all crawled pages
- docs/<section>/NNN_page-title.html — raw HTML per page
- data/vectors.json — all embedded chunks
- data/ingest_meta.json — provider, dims, timestamp
- data/sessions.json — conversation history
- data/tfidf_model.json — only if EMBEDDING_PROVIDER=tfidf
- user_data/ — Playwright browser session (don't delete, re-login required)

## Pending issues as of conversation end
1. Table content retrieval — tables ARE being extracted now, but if answers seem to miss
   tabular data, run: npm run inspect docs/<section>/<file>.html
   to verify the cleaner is producing the correct markdown table output.
2. Ollama speed — qwen2.5:3b takes 15-25s on CPU. For faster responses:
   - Use phi3:mini (smaller, less capable)
   - Switch to Claude API (fastest, costs money)
   - Run Ollama on GPU if available
