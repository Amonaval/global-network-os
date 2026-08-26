# RAGAS Evaluation + Cross-Encoder Reranking + Document-Type Chunking

**Shipped:** 2026-08-21
**Decisions:** D.13 (reranking), D.14 (chunking)
**Mission:** Retrieval Foundation — measure, rerank, chunk smarter

---

## What Was Built

Three features shipped together as a unified retrieval quality upgrade:

### 1. RAGAS Evaluation Pipeline

**What it is:** LLM-as-judge evaluation framework measuring three retrieval quality metrics.

**Why:** Without measurement, every retrieval change is guesswork. RAGAS gives numbers.

**Metrics:**
- **Faithfulness** — fraction of answer claims grounded in retrieved context (measures hallucination)
- **Context Precision** — fraction of retrieved chunks that are actually relevant (measures retrieval precision)
- **Context Recall** — fraction of ground-truth answer covered by retrieved context (measures coverage)

**How it works:**
1. `POST /api/eval/ragas/generate` — samples chunks from vector store, generates Q&A pairs via LLM, stores in `data/ragas_eval_set.jsonl`
2. `POST /api/eval/ragas/run` — runs each test question through the full retrieval pipeline, scores each with LLM judges
3. Results appended to `data/ragas_history.jsonl`
4. Intelligence Dashboard shows scores in the `⚡ Retrieval Quality` tile
5. `RagasPanel.tsx` provides full drill-down with history, progress, and run controls

**No Python dependencies.** Pure Node.js, uses existing LLM provider (Ollama/Claude/vLLM).

**Workflow:**
```
Ingest documents → Generate eval set (30 Q&As) → Run baseline evaluation
→ Enable reranking or enrichment → Re-run evaluation → Compare scores
```

### 2. Cross-Encoder Reranking (D.13)

**What it is:** After hybrid BM25+Dense+RRF returns top-20 candidates, a single batched LLM call re-scores them jointly with the query.

**Why:** Hybrid retrieval optimises for recall. The reranker optimises for precision. Together: broad retrieval + precise selection.

**How it works:**
- `src/rag/reranker.js` sends all top-N chunks + query in ONE LLM request
- LLM returns relevance scores 0.0–1.0 for each chunk
- Chunks reranked by joint (query, passage) score
- In-memory cache by (queryHash + candidatesHash) avoids redundant calls

**Environment variables:**
```
RERANKER_ENABLED=true      # off by default — enable after RAGAS baseline
RERANKER_CANDIDATES=20     # how many to feed the reranker
RERANKER_TOP_K=8           # how many to return after reranking
```

**Integrated into:** both `query()` and `queryStream()` in `query.js`, after priority multipliers.

### 3. Document-Type Chunking (D.14)

**What it is:** Automatic detection of legal and research documents, with specialized chunking strategies for each.

**Why:** Fixed-size chunking breaks at arbitrary boundaries. Legal clauses that span 200 words get split mid-sentence. Research section introductions get merged with unrelated conclusions.

**Document types:**
- **Legal** (`chunkLegal`): splits at Article/Section/Clause boundaries. Each chunk carries its heading context. Never splits mid-clause.
- **Research** (`chunkSemantic`): splits at heading boundaries first, then paragraph boundaries within sections. Maintains thematic coherence.
- **Standard**: falls through to existing `chunkText` (no change).

**Detection heuristics:**
- Legal: keywords like "whereas", "hereinafter", "notwithstanding", numbered section patterns
- Research: keywords like "abstract", "methodology", "hypothesis", "conclusion", "references"

**Environment variable:**
```
DOC_TYPE_CHUNKING=true     # off by default — enable for corpora with legal/research docs
```

**Integrated into:** `ingest.js` (main pipeline) and upload path in `server.js`.

---

## Mission Completion Assessment

### Did we solve the right problem?

Yes. The retrieval pipeline was the ceiling on all intelligence features. RAGAS now gives a number to every future improvement. Reranking adds precision. Document-type chunking adds coherence for professional corpora.

### Is there a more transformative opportunity?

The transformative opportunity is **using these numbers**. The infrastructure is now there. The next 30 days should be: ingest your real documents, generate an eval set, establish the baseline, enable each feature, measure the delta. The product improves from data, not intuition.

### Should the roadmap change?

Yes — the Founder's Compass says "retrieval quality is the product." We have now built the measurement-improvement loop. The roadmap shifts to **polish and depth**, not more features.

### What is the highest ROI next step?

Run RAGAS against real data. See the numbers. They will tell you exactly where to focus next.
