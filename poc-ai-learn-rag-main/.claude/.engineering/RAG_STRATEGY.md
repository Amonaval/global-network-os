# RAG Strategy for Knowledge Hub

*Read this before proposing any RAG architecture change, retrieval improvement, or new indexing capability.*

---

## What This Document Is

Knowledge Hub's RAG system is not a general-purpose retrieval engine. Every architectural
decision in the retrieval pipeline must be justified by one of our specific customer personas
and their specific document types.

This document maps the 2025–2026 RAG landscape to Knowledge Hub's actual use cases,
and draws a permanent boundary between what belongs in this product and what does not.

**Full RAG trends reference:** `artifact/RAG_TRENDS_2025_2026.md`

---

## The Question That Governs All RAG Decisions

> "Which paying customer persona does this improve, and what specific query does it make
> answerable that currently fails?"

If the answer is not immediate, the capability is not a current priority.

---

## Our Customers and Their Document Reality

| Persona | Documents They Query | What RAG Must Handle Well |
|---|---|---|
| **Aarav** (IT consultant) | Architecture docs, integration specs, client deliverables across NDAs | Dense technical prose; fragments that lose meaning without client/project context |
| **Anjali** (CA / Doctor) | Tax filings, client work papers, clinical notes, annotated research | Highly contextual fragments ("this strategy for this client profile"); PDFs with tables and figures |
| **Marcus** (Lawyer) | Case files, legal research memos, contracts, precedent documents | Hierarchical structure (clauses, sections); entity-rich (parties, judges, precedents) |
| **Sarah** (Engineering lead) | ADRs, runbooks, post-mortems, Confluence pages, design docs | Decision language ("why we chose X"); temporal context ("when this decision was made") |
| **Dr. Priya** (Researcher) | Papers, experiment logs, protocols, grant documents | Cross-reference between papers ("conflicting results"); figure/table content |

**The common thread:** All customers query private professional documents. None query code repositories as a structural graph.

---

## RAG Pattern Relevance Map

### Tier 1 — Critical (adopt now or next milestone)

**Contextual Chunk Enrichment** (Anthropic, September 2024)
- What: Prepend LLM-generated context to each chunk before embedding, describing where the chunk sits in the full document
- Why for KH: Aarav's fragment "it reduced latency by 40%" is meaningless without knowing which client engagement and which architecture decision. Anjali's note "switched to this protocol" is meaningless without the patient profile context. This directly fixes the most common KH retrieval failure mode.
- Result: 67% reduction in retrieval failures (Anthropic internal benchmark)
- Cost: LLM call per chunk at ingestion time — use a fast model (Claude 3 Haiku or local equivalent)
- Decision: D.12

**RAGAS Evaluation Pipeline**
- What: Automated evaluation suite measuring Faithfulness (is the answer supported by retrieved context?), Context Precision (are retrieved chunks relevant?), Context Recall (did retrieval surface all necessary information?)
- Why for KH: The confidence gate (D.4) is the right principle but currently has no measurement framework. RAGAS makes every future change to the retrieval pipeline measurable. Directly feeds the IDS metric — IDS should eventually incorporate retrieval quality scores alongside query volume.
- Cost: Requires synthetic test dataset generation from real documents. Worth the setup investment before first paying customer.

**Cross-Encoder Reranking**
- What: After hybrid retrieval returns 20–50 candidates, a cross-encoder re-scores them jointly with the query and selects top 5–10
- Why for KH: The precision-over-recall mandate (D.4) is the right principle. Reranking tightens it further. For regulated professionals, a wrong answer surfacing with high confidence is a professional liability event. An additional 10–25% precision gain directly reduces that risk.
- Implementation: Self-hosted `cross-encoder/ms-marco-MiniLM-L-6-v2` — free, ~5ms latency, zero infrastructure
- Decision: D.13

---

### Tier 2 — High Value (next major stage)

**Document-Type Chunking**
- What: Different chunking strategies per professional document type (hierarchical for legal, semantic for research, recursive for medical notes)
- Why for KH: Current fixed-size chunking is adequate but sub-optimal. Hierarchical chunking for Marcus's legal briefs and semantic chunking for Dr. Priya's research papers would measurably improve retrieval precision for those segments.
- Decision: D.14
- Note: This is NOT AST-based code chunking, which is out of scope (D.15)

**Multimodal RAG**
- What: Embed and retrieve images, charts, tables, PDF pages alongside text
- Why for KH: Anjali's financial statements have key data in charts and multi-column tables. Dr. Priya's papers have results in figures. Marcus's exhibits include PDF tables. Text-only RAG misses all of this — a significant failure mode for regulated professionals.
- Enabling models: Cohere embed-v4 (128K context, raw PDF pages), Google Gemini Embedding 001 (text+image+PDF)
- When: After contextual enrichment and reranking are proven. Requires local embedding model that supports multimodal — evaluate against zero-infrastructure constraint (D.1).

**HyDE for Vague Professional Recall Queries**
- What: When a user asks a vague recall question ("what strategy did I use for clients with this profile?"), generate a hypothetical answer document first, then embed the hypothesis for retrieval
- Why for KH: Aarav and Anjali frequently ask vague recall questions where the query vocabulary doesn't match the document vocabulary. HyDE bridges this gap.
- Caution: Hallucinated hypothesis must not weaken the confidence gate. Apply HyDE only when initial retrieval fails the confidence gate — as a fallback, not the default path. The gate must still evaluate the actual retrieved content, not the hypothesis.

---

### Tier 3 — Future Stages (validate earlier tiers first)

**GraphRAG for Enterprise Legal and Medical**
- Why eventually: Legal documents (cases, parties, judges, precedents, statutes) and medical records (conditions, drugs, procedures, outcomes) have dense entity-relationship graphs that vector RAG cannot traverse. Enterprise law firms (Marcus's firm at scale) and hospitals benefit from graph-augmented queries: "all cases where this precedent was cited alongside this contractual issue."
- Why not now: Premature for Stage 1–2. GraphRAG requires LLM entity extraction per document, graph database infrastructure, and community detection — incompatible with the zero-infrastructure constraint (D.1). Revisit when expanding to enterprise legal/medical with self-hosted deployment model.

**Agentic / Multi-Hop RAG**
- Why eventually: Complex professional queries often require multiple retrieval steps. "What strategy worked for clients with this profile AND how did the 2022 regulation change affect it?" is a multi-hop query — the second hop depends on the result of the first.
- Why not now: Single-hop retrieval quality must be proven irreplaceable first. Multi-hop adds latency and hallucination risk at each hop. The confidence gate must hold at every hop.

---

### Out of Scope — Do Not Pursue

| Pattern | Why Out of Scope |
|---|---|
| **AST-based code chunking** | Code intelligence technique for code repository traversal tools. KH indexes code files as documents — appropriate. Treating code as a traversable structural graph is Cursor/Copilot territory. Decision D.15. |
| **Function call graph traversal** | Same reason. Cursor/Copilot territory. |
| **Class inheritance indexing** | Same reason. |
| **Code generation quality improvements** | Cursor, Copilot, Windsurf own this. Not our moat. |
| **"Engineering intelligence platform" positioning** | GTM explicitly warns against this label — Jellyfish/LinearB territory. |
| **LangGraph agent orchestration at current stage** | Adds significant complexity and latency. Single-hop RAG quality must be proven irreplaceable first. |
| **GraphRAG at current stage** | Incompatible with zero-infrastructure constraint for Stage 1 customers. See Tier 3 above. |

---

## Current Implementation Status

| Component | Status | Notes |
|---|---|---|
| Hybrid BM25 + Dense + RRF | ✓ Implemented | `src/rag/query.js` · Decision D.2 |
| Dual Confidence Gate | ✓ Implemented | `src/rag/query.js` · Decision D.4 · Never loosen |
| Soft-block detection | ✓ Implemented | `DEFLECTION_PATTERNS` in `query.js` |
| Incremental ingestion | ✓ Implemented | MD5 hashing · Decision D.6 |
| Contextual chunk enrichment | ✓ Implemented | `src/ingestion/enricher.js` · D.12 · Enable via `CONTEXTUAL_ENRICHMENT=true` |
| Cross-encoder reranking | ✗ Not yet | Decision D.13 · After contextual enrichment |
| RAGAS evaluation | ✗ Not yet | Before first paying customer |
| Document-type chunking | ✗ Not yet | Decision D.14 · Stage 2 |
| Multimodal RAG | ✗ Not yet | Stage 2+ |
| GraphRAG | ✗ Not yet | Stage 3+ enterprise |

---

## The Evolution Path

```
Current (Hybrid BM25 + Dense + RRF + Confidence Gate)
    ↓
Stage 1 Milestone: Contextual Chunk Enrichment + RAGAS Evaluation
    ↓
Stage 1 Milestone: Cross-Encoder Reranking
    ↓
Stage 2: Document-Type Chunking per Professional Segment
    ↓
Stage 2: Multimodal RAG (PDF charts, medical imaging)
    ↓
Stage 3: GraphRAG for Enterprise Legal / Medical
    ↓
Stage 3: Agentic / Multi-Hop RAG for Complex Professional Queries
```

Every step in this path is justified by a specific customer segment and a specific failure mode
the previous step could not solve. No step is taken for technological novelty alone.

---

## What This Means for Engineering

When a session proposes a RAG capability:
1. Map it to a customer persona (Aarav / Anjali / Marcus / Sarah / Dr. Priya)
2. Identify the specific query it makes answerable that currently fails
3. Check whether it conflicts with the zero-infrastructure constraint (D.1)
4. Check whether it is explicitly out of scope (D.15)
5. If all clear, sequence it against the evolution path above

If step 1 or 2 cannot be answered immediately, the capability is not a current priority.
