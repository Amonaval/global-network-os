# Glossary

Engineering and platform concepts used throughout the project.

---

## Intelligence Density Score (IDS)

The north star metric. A computed score (0–100) per organization representing how much compounding intelligence the platform has accumulated from their usage. IDS > 70 is the moat threshold — at that point the accumulated query memory, decision history, gap evolution, and risk history make the platform practically irreplaceable. Every product decision should optimize the speed at which customers reach IDS > 0.7.

---

## MOAT

The switching cost that grows with every week of use. Specifically: the intelligence generated from an organization's behavior — query memory, decision archaeology, gap evolution, risk history — is readable only by this platform. A customer switching to a competitor starts from zero on intelligence, even if they take their documents. The moat is not the documents. The moat is the accumulated intelligence layer built from how those documents were used.

---

## Regulated Professional

A customer category — doctors, lawyers, financial advisors, consultants, researchers — whose work files cannot legally or ethically be sent to cloud AI (HIPAA, attorney-client privilege, client NDAs, IRB agreements, pre-publication research clauses). For these users, local-first is not a preference — it is the only viable architecture. They represent the largest addressable market beyond engineering teams and have the highest privacy requirement.

---

## Confidence Gate

The dual-threshold filter applied before any LLM response is returned. Answer only when `topSemScore >= 0.35` OR (`topRrfScore >= 0.014` AND `topSemScore >= 0.05`). All other queries return "I don't know." This is a trust signal, not a quality limitation — especially critical for regulated professionals where a hallucinated answer creates professional liability.

---

## Hybrid Retrieval

The combination of BM25 (keyword matching), cosine similarity (semantic matching), and Reciprocal Rank Fusion (RRF) score merging at a 0.5 weight. Used because pure semantic search misses exact technical terms; pure BM25 misses conceptual questions. Hybrid consistently outperforms either method alone.

---

## Knowledge Graph

The structured relationship map extracted from organizational documents — decisions, gaps, risk items, topics — stored alongside the raw chunk store. Not a graph database; the term refers to the connected intelligence layer (eval.jsonl + decisions.json + gap state + risk history) that constitutes the organizational memory.

---

## Decision Graph

The subgraph of the Knowledge Graph focused on architectural decisions: the extracted record of what was decided, why, what alternatives were rejected, and what constraints it created. Built from documents and queries that contain decision language. Queryable to surface relevant past decisions during new engineering sessions.

---

## Documentation Intelligence

The set of capabilities that analyze documentation quality, coverage, and freshness: gap detection (questions that couldn't be answered), health scoring (chunk count and coverage by section), staleness detection (content changed since last ingestion), and autonomous maintenance suggestions (LLM diff of current vs. indexed content).

---

## Organizational Memory

The accumulated query history — every question asked, section used, confidence score, soft-block status, and timestamp — stored in `eval.jsonl`. The foundation of the intelligence layer. All higher-order signals (gaps, topics, memory clusters, IDS) are derived from this single flat file.

---

## Soft-Block

A query that passes the confidence gate (retrieval scores are high enough) but where the LLM correctly identifies the retrieved content as irrelevant and deflects. Logged as `blocked: true, softBlocked: true`. Represents a gap in documentation that the confidence gate cannot catch — the document exists but doesn't answer the question.

---

## RRF (Reciprocal Rank Fusion)

The score merging algorithm used in hybrid retrieval. Combines BM25 and cosine similarity rankings into a single score by taking the reciprocal of each result's rank in each list and summing them. Produces more stable results than linear interpolation because it is rank-based, not magnitude-based — a BM25 score of 0.9 and a cosine score of 0.3 are treated symmetrically.

---

## Contextual Chunk Enrichment

An indexing technique (Anthropic's Contextual Retrieval, September 2024) where each chunk is enriched at ingestion time by prepending LLM-generated context summarizing where the chunk sits in the broader document. Solves the isolated chunk problem: a fragment like "this amount increased by 12%" is meaningless without knowing which client, which engagement, which year. With contextual enrichment, the chunk becomes "This excerpt is from Aarav's 2022 fintech integration proposal, Section 3, discussing API cost projections — [original chunk text]." Produces a 67% reduction in retrieval failures. Adopted in KH via Decision 12.

---

## Cross-Encoder Reranking

A post-retrieval precision improvement step where a cross-encoder model re-scores all retrieved candidates (typically 20–50) by jointly processing the query and each candidate together, then selects the top 5–10 for LLM context. Bi-encoders (used in vector retrieval) embed query and document independently — fast but coarse. Cross-encoders process them jointly — slower but significantly more accurate. For regulated professionals, this additional precision layer reduces the probability of an irrelevant chunk reaching the LLM with high confidence. KH's roadmap adoption via Decision 13.

---

## CRAG (Corrective RAG)

A retrieval quality pattern that wraps any existing RAG system with a lightweight evaluator that grades retrieved documents as Correct, Incorrect, or Ambiguous. Correct: use retrieved content. Ambiguous: use retrieved content plus trigger supplementary search. Incorrect: discard retrieval, fall back to web search. Does not require training the generator model. KH's existing dual confidence gate (Decision 4) implements the core CRAG principle — answer only when retrieval quality is demonstrably sufficient — without the web-search fallback (which is not appropriate for private local-first deployments).

---

## Multimodal RAG

Retrieval that spans text and visual content — images, charts, tables, PDF pages, and (in some systems) audio and video frames — using multimodal embedding models that represent all modalities in the same vector space. Highly relevant to Knowledge Hub's regulated professional segments: medical professionals have imaging and charts; lawyers have PDF exhibits with tables; CAs have financial statements with multi-column tabular data; researchers have figures and diagrams. Treating all document pages (including chart-heavy ones) as embeddable units removes the failure mode where key information lives in a chart that text-only RAG cannot retrieve. Future KH capability for Stage 2+ professional segments.

---

## Document-Type Chunking

The principle that different professional document types require different chunking strategies (Decision 14). Legal documents: hierarchical/parent-child (preserve section hierarchy, retrieve parent for full clause context). Medical notes: recursive character split with high overlap (preserve diagnostic narrative across boundaries). Research papers: semantic chunking (respect topic transitions). Consulting deliverables and ADRs: standard recursive split. This is distinct from AST-based code chunking, which is a code intelligence technique outside KH's scope (Decision 15).

---

## Deployment Model

The spectrum of how the platform runs for different customer types:
- **Local-First**: everything on the user's machine; Ollama provides the LLM; no data leaves the device
- **Self-Hosted**: organization runs KH on their own infrastructure (private VPC or on-premise)
- **KH Managed Cloud**: KH hosts isolated instances per customer
- **Pay-Per-Query**: shared infrastructure, charged per document and query

Sequence matters: local-first proven first, then self-hosted, then KH managed cloud, then pay-per-query. Never build deployment model N+1 before N is proven.
