# Contextual Chunk Enrichment

*Shipped: 2026-08-21 — Decision D.12*

---

## What Problem This Solves

Standard RAG splits documents into chunks and embeds each chunk independently. The result: fragments that lose meaning out of context.

- A CA's note "this amount increased by 12%" is meaningless without knowing which client and which filing year.
- A lawyer's fragment "the court held in favour" is meaningless without knowing which case and which party.
- An engineer's note "switched to this approach" is meaningless without the ADR context.

The embedding model encodes the fragment's local text. It cannot encode context it was never given.

**Contextual enrichment fixes this at index time.** Before embedding each chunk, an LLM generates 1–2 sentences describing where the chunk sits in the broader document. That context is prepended to the chunk text before embedding. The fragment becomes:

> "In Aarav's service mesh evaluation for Client X (Q3 2024), this discusses the latency reduction achieved. The latency reduced by 40% after switching to the new approach."

The enriched text is what gets embedded and indexed — so retrieval picks up the client, the project, and the decision context, not just the fragment.

**Anthropic benchmark (Sept 2024):** ~67% reduction in retrieval failures vs standard RAG.

---

## How It Works

**Step 1 — Prompt:** For each chunk, send the LLM:
- Document title, section, and first ~2000 chars (the overview)
- The chunk text
- Instruction: write 1–2 sentences situating this chunk within the document

**Step 2 — Prepend:** `<context sentence>\n\n<original chunk text>` → this is `enrichedText`

**Step 3 — Embed enrichedText:** The embedding captures the full context, not the isolated fragment.

**Step 4 — BM25 indexes enrichedText:** Keyword search also benefits — searching "Client X" or "service mesh" now matches even if those terms only appear in the prepended context.

**Step 5 — Display original:** Users see `text` in source citations, not the prepended context. The enrichment is invisible to the user — it only improves retrieval.

---

## Files Changed

| File | Change |
|---|---|
| `src/ingestion/enricher.js` | New module — LLM call per chunk, cache, concurrency pool |
| `src/ingestion/ingest.js` | Pass 1.5 added (between chunking and embedding); enrichment mode change auto-detected |
| `src/vectorstore/store.js` | `_indexBM25()` uses `enrichedText \|\| text` |
| `src/api/server.js` | Upload route enriches before embedding when enabled |
| `data/enrichment_cache.json` | Auto-created — persists context by chunk hash (incremental-safe) |

---

## Configuration

```env
# .env
CONTEXTUAL_ENRICHMENT=true          # Enable (default: false — backward compatible)
ENRICHMENT_CONCURRENCY=3            # Parallel LLM calls (default: 3)
ENRICHMENT_MAX_DOC_CHARS=2000       # How much of the document to send as overview
ENRICHMENT_MODEL=claude-haiku-4-5-20251001   # Claude users: override the model used for enrichment
```

When `LLM_PROVIDER=ollama`, uses `OLLAMA_MODEL` for enrichment calls.
When `LLM_PROVIDER=claude`, uses `ENRICHMENT_MODEL` (defaults to claude-haiku-4-5-20251001 — cheapest/fastest).
When `LLM_PROVIDER=vllm`, uses `VLLM_MODEL`.

---

## Incremental Safety

Chunk enrichment is cached in `data/enrichment_cache.json` keyed by `MD5(chunkText + documentTitle)`.

- Re-ingesting an unchanged file: all chunks served from cache (zero LLM calls).
- New or changed file: only new chunks make LLM calls.
- Enabling enrichment on an existing index: auto-detected via `enrichmentEnabled` flag in `ingest_meta.json` → forces full rebuild.

---

## Cost

| Provider | Cost per chunk | 1000-chunk knowledge base |
|---|---|---|
| Ollama (local) | Free, ~1–3s per chunk | ~16–50 min (sequential) |
| Claude Haiku | ~$0.00025/chunk | ~$0.25 total |
| vLLM (self-hosted) | Free, ~0.5–1s per chunk | ~8–16 min |

For most knowledge bases (200–500 chunks), Ollama enrichment takes 3–8 minutes on first ingest. Subsequent incremental ingests only process changed chunks.

---

## Mission Completion Assessment

**Did we solve the right problem?** Yes. Retrieval quality is the foundation every intelligence feature depends on. A wrong or incomplete retrieval degrades gap detection, health scoring, decision archaeology, and onboarding answers simultaneously.

**Does this strengthen the MOAT?** Directly. Enriched embeddings are private to this deployment. The context sentences encode organizational specifics — clients, projects, decisions, timelines — that are unique to the indexed knowledge base. A competitor starting fresh cannot replicate this without re-ingesting and re-enriching the same documents.

**Is this the right sequencing?** Yes. Contextual enrichment before RAGAS evaluation, so the evaluation baseline captures the enriched state. Then cross-encoder reranking for additional precision gain.
