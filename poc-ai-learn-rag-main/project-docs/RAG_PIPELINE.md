# RAG Pipeline

End-to-end documentation of how content goes from raw source to a grounded LLM answer.

---

## 1. Ingestion

### Cleaning (`src/ingestion/cleaner.js`)
Raw HTML from crawler or Confluence is converted to clean markdown:
- Strips nav, headers, footers, scripts
- Converts `<table>` to markdown table syntax (preserves structured data)
- Normalizes whitespace, removes empty sections

### Chunking (`src/ingestion/ingest.js`)
Clean markdown is split into chunks:
- Target size: ~500 tokens with overlap from previous chunk
- Tables and code blocks are atomic — never split mid-block
- Every chunk gets a breadcrumb prefix: `[Section > Page Title > Subsection]`
- Maximum chunk size: 20,000 characters (hard cap for embedder safety)

### Deduplication
Each page/file is MD5-hashed before chunking. If hash matches the stored hash, the page is skipped entirely. Incremental ingestion on a 5,000-page portal runs in minutes, not hours.

### Section Routing
Each source maps to a named section. Chunks from that source write to `data/vectors_<section>.json`. Sections allow isolated search (e.g., search only Confluence, not uploads).

---

## 2. Embeddings (`src/ingestion/embedder.js`)

Three providers, selectable at setup:

| Provider | Dimensions | Dependency | Default |
|----------|-----------|------------|---------|
| `nomic` (nomic-embed-text) | 768 | Ollama running locally | Yes |
| `tfidf` | 2048 | None (pure JS) | Fallback |
| `openai` (text-embedding-3-small) | 1536 | OpenAI API key | Optional |

Chunks are embedded one at a time (not batched) to avoid Ollama context length crashes.

---

## 3. Vector Store (`src/vectorstore/store.js`)

### Storage
One JSON file per section: `data/vectors_<section>.json`
Each record: `{ id, text, meta: { url, title, section }, embedding: float[768] }`

All sections load into a single in-memory `_data` array at startup. BM25 index is rebuilt from the loaded data. No database required.

### Search Algorithm
Given a query:
1. **Semantic search** — embed query → cosine similarity against all stored embeddings → top-K results with scores
2. **BM25 search** — keyword match against `text` field → top-K results with scores
3. **RRF fusion** — Reciprocal Rank Fusion merges both ranked lists:
   ```
   rrf_score = 1/(rank_semantic + 60) + 1/(rank_bm25 + 60)
   ```
   with `HYBRID_WEIGHT=0.5` balancing semantic vs. keyword contribution

---

## 4. Confidence Gate (`src/rag/query.js`)

The gate runs after retrieval and before the LLM is called.

```js
const passes =
  topSemScore >= CONFIDENCE_GATE        // strong semantic match alone
  || (topRrfScore >= 0.014 && topSemScore >= 0.05)  // moderate hybrid signal
```

- `CONFIDENCE_GATE` default: 0.35
- If the gate fails → return "I don't know based on available documentation" without calling LLM
- **This is intentional.** Recall is sacrificed for precision. A refused answer is better than a hallucinated one.

---

## 5. Context Compression (`src/rag/query.js`)

After gate passes, top chunks are compressed into a context window:
1. Filter by `MIN_CHUNK_SCORE` — drop low-relevance chunks
2. Trigram Jaccard deduplication at 0.55 threshold — remove near-duplicate chunks
3. Greedy fill within token budget — add chunks until budget exhausted

Result: a deduplicated, relevance-ranked context block sent to the LLM.

---

## 6. LLM Prompt (`src/api/server.js`)

System prompt instructs the model to:
- Scope answers to provided context only — no general knowledge gap-filling
- Cite sources inline
- Use senior-engineer tone
- Refuse to answer if context doesn't cover the question

---

## 7. Diagnose Tool (`src/rag/diagnose.js`)

Run `npm run diagnose` for a 7-step debug output:
1. Vector store stats (chunk count, sections)
2. Query embedding check (embedding generated successfully?)
3. BM25 top 5 results
4. Semantic top 5 results
5. Confidence gate check (pass/fail + scores)
6. Final context (what the LLM would receive)
7. Recommendations (if gate fails, explains why)
