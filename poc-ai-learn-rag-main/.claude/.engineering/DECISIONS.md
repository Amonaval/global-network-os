# Architectural Decisions

Permanent decisions. Do not re-debate. Challenge only if a constraint fundamentally changes.

---

## 1. Local-First, Privacy-First

**Decision:** All data stays on the user's machine by default. No cloud storage, no telemetry.
**Why:** Two distinct categories of customers make this a permanent requirement, not a preference. First: regulated professionals — doctors, lawyers, financial advisors, consultants, and researchers have a legal or ethical obligation not to send their work files to cloud AI (HIPAA, attorney-client privilege, client NDAs, pre-publication research agreements). For them, cloud AI is not a cost decision — it is a compliance violation. Second: enterprise engineering teams with proprietary codebases and data governance policies that prohibit external transmission. For both categories, local-first is the only architecture that works. This is a permanent competitive moat: no mainstream AI product can serve regulated professionals at scale.
**Constraint:** Every new feature must work fully offline. Cloud LLMs are opt-in only.

---

## 2. Hybrid Retrieval (BM25 + Cosine + RRF)

**Decision:** Combine BM25 (keyword), cosine similarity (semantic), and Reciprocal Rank Fusion weighting at 0.5.
**Why:** Pure semantic search misses exact technical terms (error codes, function names, config keys). Pure BM25 misses conceptual questions. Hybrid consistently outperforms either alone.
**Constraint:** Do not replace with a single-method retriever. Hybrid is the foundation of answer quality.

---

## 3. Per-Section JSON Sharding (No Database)

**Decision:** Vector store is flat JSON files sharded by section (`data/vectors_<section>.json`), loaded entirely into memory at startup.
**Why:** Zero infrastructure. No Postgres, no SQLite, no vector DB to install or maintain. Users run one `npm start`. This directly enables the Electron desktop distribution model.
**Constraint:** If data volume requires a real database, that is a product tier decision, not an engineering convenience upgrade.

---

## 4. Dual Confidence Gate (Hallucination Prevention Over Recall)

**Decision:** Answer only when `topSemScore >= 0.35` OR (`topRrfScore >= 0.014` AND `topSemScore >= 0.05`). Return "I don't know" otherwise.
**Why:** Users in high-stakes professions depend on this gate as a professional safeguard. For a doctor recalling a treatment protocol, a lawyer referencing case precedent, or a consultant citing a past deliverable — a confident hallucinated answer is not an inconvenience, it is a professional liability. The "I don't know" response is a trust signal that distinguishes this platform from a general-purpose LLM. One wrong answer in a clinical or legal context destroys the relationship permanently. Recall is sacrificed deliberately for precision.
**Constraint:** Never loosen the confidence gate to improve "answer rate." If users see too many "I don't know" responses, fix the documentation — not the gate.

---

## 5. Electron Shell (Zero-Infrastructure Distribution)

**Decision:** Ship as a Windows `.exe` via Electron. The Node server runs as a child process inside Electron.
**Why:** Zero-infrastructure installation is a hard requirement for two distinct user types. Engineering teams need it for IT approval — no firewall exceptions, no cloud accounts. Regulated solo professionals (doctors, lawyers, consultants) need it even more: they cannot run `npm start`, they have no DevOps background, and the install must be as simple as any desktop application. For Anjali (cardiologist) or Marcus (lawyer), the Electron `.exe` is not a convenience — it is the only installation model that works. A double-click install removes the single biggest barrier to adoption in non-technical professional segments.
**Constraint:** The app must remain runnable without Electron (CLI mode) for power users and CI environments.

---

## 6. Incremental Sync via MD5 Hashing

**Decision:** Skip re-ingesting pages/files whose content hash has not changed since last crawl.
**Why:** Full re-ingestion on 5,000-page portals takes hours. Incremental sync makes the product usable for large organizations.
**Constraint:** Hash is content-only. URL changes without content changes must still be detected separately.

---

## 8. Section Priority Multipliers (Not Separate Cache)

**Decision:** Section intelligence (boost/ignore) is implemented as retrieval score multipliers (1.3× boost, 0.4× ignore) applied after `store.search()`, not as a separate caching or storage tier.
**Why:** The entire vector store is already in memory. "Caching" would add complexity with no perf benefit. Multipliers integrate cleanly with the existing RRF scoring and re-sort chunks before the confidence gate — no new data structures, no new infrastructure.
**Constraint:** Multipliers affect all queries globally and take effect immediately (section_config.json is read per query). Per-user or per-session priority is a future product tier decision, not an engineering default.

---

## 9. Decision Graph JSON Extraction — Model-Agnostic Fallback Parser

**Decision:** `parseDecisionJson` first attempts direct JSON parse; if that fails, it extracts the first `{...}` block from anywhere in the raw LLM response.
**Why:** Qwen and other small local models consistently wrap JSON output in prose ("Here is the result: {...} This explains why..."). Strict parsing silently drops all these responses. The fallback makes the extractor model-agnostic with no quality cost for Claude (which returns clean JSON).
**Constraint:** If a model returns multiple JSON objects in one response, the first one wins. This is the correct behavior for single-decision extraction.

---

## 10. The LLM Is a Plug-In. The Intelligence Is Permanent.

**Decision:** The LLM, embedding model, and vector engine are interchangeable infrastructure. The intelligence layer (eval.jsonl, decisions.json, gap state, risk history) is the permanent product asset. These must never be coupled.

**Why:** Foundation models will be replaced. Embedding dimensions will change. Inference engines will be swapped for specialized models. If our prompts, parsers, or intelligence schema are tightly coupled to a specific model's output format, every infrastructure upgrade breaks the intelligence layer. The intelligence must outlive the model that helped generate it.

**Specific rules this creates:**
1. All LLM prompts must produce valid output from any instruction-following model, not just the one we tested against. Use the JSON fallback parser pattern (Decision 9) universally.
2. Intelligence schemas (eval.jsonl fields, decisions.json structure) must be versioned. Add `schemaVersion` field before the first paying customer.
3. Embeddings must store their model name and dimension with every vector. Re-indexing on model upgrade must be a documented, automatable migration path — not a manual disaster.
4. No intelligence field should depend on a specific model's reasoning quirk. If a field only works with Claude and breaks on Llama, that field's extraction logic must be fixed.

**Constraint:** When a new LLM or embedding model is added, run the full extraction + query validation suite against it. If the intelligence quality degrades, the model is not supported — not the intelligence format.

---

## 11. Foundation Vendor Threat — Local-First Is the Permanent Defense

**Decision:** OpenAI, Anthropic, Google, and Microsoft will continue expanding into knowledge management, organizational memory, and RAG. We will not compete with them on general intelligence. We compete on a dimension they structurally cannot win: private, local-first, organization-specific intelligence that never leaves the customer's infrastructure.

**Why:** Foundation model vendors are building cloud-first products requiring data transmission. Enterprise security policies, data sovereignty regulations, regulated industries (finance, legal, medical, government), and organizations with competitive-sensitive IP cannot use cloud-hosted intelligence systems. This is a permanent structural barrier that no feature from OpenAI or Anthropic removes.

**The second defense:** Our intelligence format is proprietary. Even if a foundation vendor builds local RAG, they cannot read, interpret, or port our eval.jsonl intelligence layer. The accumulated organizational memory is readable only by our product. A customer switching to a competitor starts from zero on intelligence — even with the same documents.

**Constraint:** Never build features that require cloud transmission of intelligence. Every capability must work fully offline. Cloud LLMs are opt-in for inference only — no intelligence is ever sent to a cloud provider's persistent storage.

---

## 7. Rejected: Rewrite to Vector Database

**Decision:** Rejected migration to Chroma, Pinecone, Weaviate, or similar.
**Why:** Adds an external dependency that breaks zero-infrastructure principle. Current JSON store handles tens of thousands of chunks without performance issues. No customer has reported scale problems.
**Constraint:** Revisit only if a paying customer's dataset demonstrably exceeds memory limits.

---

## 12. Contextual Chunk Enrichment — Adopt When Ready

**Decision:** Before embedding each chunk, prepend LLM-generated context describing where the chunk sits in the broader document (Anthropic's Contextual Retrieval pattern, September 2024).
**Why:** Professional documents produce isolated chunks that lose meaning out of context. A CA's note "this amount increased by 12%" or a lawyer's fragment "the court held in favour" is meaningless without knowing which client, which case, which year. Contextual enrichment solves this at index time by prepending 1–2 sentences of document context to each chunk before embedding. Anthropic reported a 67% reduction in retrieval failures vs standard RAG. This wraps the existing system — no retrieval architecture changes, no model retraining.
**When to adopt:** Before the first paying regulated professional customer. Index enrichment requires an LLM call per chunk at ingestion time — acceptable cost given the failure-reduction gain and the professional liability of a wrong answer.
**Constraint:** Enrichment must use a fast, cheap model (Claude 3 Haiku or equivalent local model) to keep ingestion time practical. Full document must be loaded into context to generate the prepended summary — chunk count per document determines feasibility.

---

## 13. Cross-Encoder Reranking — Next Retrieval Improvement

**Decision:** After hybrid BM25+Dense+RRF retrieval returns 20–50 candidates, add a cross-encoder reranking step that scores all candidates jointly with the query and selects the top 5–10 for LLM context.
**Why:** The confidence gate is precision-over-recall by design (Decision 4). Reranking tightens this further — a cross-encoder that jointly processes query and document catches semantic nuances that bi-encoders miss, delivering an additional 10–25% precision gain. For regulated professionals (doctors, lawyers, CAs), this precision gain directly reduces the probability of a wrong answer surfacing with high confidence. A self-hosted cross-encoder (`cross-encoder/ms-marco-MiniLM-L-6-v2`) adds ~5ms latency and zero infrastructure cost.
**Constraint:** Retrieve 20–50 candidates from hybrid retrieval, rerank to 5–10, then apply confidence gate. Do not reduce the hybrid retrieval pool — reranking is a filter, not a replacement for broad initial retrieval.

---

## 14. Document-Type Chunking by Professional Segment

**Decision:** Different professional document types require different chunking strategies. Chunking is not one-size-fits-all. The strategies, in order of applicability to KH's customer segments:
- **Legal briefs, case files, contracts:** Hierarchical / parent-child chunking. Small chunks for retrieval precision; retrieve parent section for full legal context. Legal documents have explicit structural hierarchy (sections, subsections, clauses) that must be preserved.
- **Medical notes, clinical records:** Recursive character split with 15–20% overlap. Medical notes are dense narrative — overlap preserves diagnostic context across chunk boundaries.
- **Research papers, academic documents:** Semantic chunking (split where embedding similarity drops). Research papers have clear topic transitions; semantic splits respect the logical argument structure.
- **Consulting deliverables, ADRs, runbooks:** Recursive character split (400–512 tokens, 10–20% overlap). Default strategy; works well for structured professional prose.
- **PDFs with tables and charts:** Treat tables as atomic — never split mid-row. Extract table structure separately. Tables in financial statements, legal exhibits, or research papers carry meaning that is destroyed by mid-row splits.

**What this is NOT:** AST-based chunking (splitting at function/class boundaries via Tree-sitter) is a code intelligence technique for code repository traversal tools. Knowledge Hub is not that product (see Decision 15).
**Constraint:** Chunking strategy must be configurable per section/source at ingestion time, not hard-coded globally.

---

## 15. Code-Aware RAG, AST Chunking, and Code Graph Traversal Are Out of Scope

**Decision:** AST-based code chunking, function call graph traversal, class inheritance indexing, and code-repository-traversal patterns are explicitly outside Knowledge Hub's scope and must not be pursued.

**Why — product positioning:** Knowledge Hub is a Professional Organizational Memory platform. The engineering team beachhead (Sarah, Head of Engineering) has a document intelligence problem — querying ADRs, runbooks, post-mortems, design documents, and Confluence pages. That is a text document retrieval problem, not a code traversal problem. Competing in code intelligence means competing with Cursor, GitHub Copilot, and Windsurf — tools with hundreds of engineers, deep IDE integration, billions in funding, and multi-year head starts. The GTM playbook explicitly flags "engineering intelligence platform" as a dangerous label because it overlaps Jellyfish/LinearB's Forrester category. The Founders Compass states directly: "Code generation quality — Cursor, GitHub Copilot, and Windsurf own this loop. We do not compete here."

**Why — customer segment:** Our first customers (Aarav, Anjali, Marcus) are querying consulting deliverables, medical records, and legal case files — not code repositories. Even Sarah (engineering customer) asks "why did we make this architectural decision?" — the answer lives in a PDF ADR, not in the code's AST.

**The distinction that matters:** Knowledge Hub indexes code files as documents (for teams that include code in their ingested corpus), which is appropriate. What is out of scope is treating code as a traversable graph requiring structural analysis — that is code intelligence, not organizational memory.

**Constraint:** If a future paying customer explicitly requests code graph intelligence and it is differentiated by our intelligence layer (not pure code generation), revisit this decision with product strategy sign-off before engineering begins.
