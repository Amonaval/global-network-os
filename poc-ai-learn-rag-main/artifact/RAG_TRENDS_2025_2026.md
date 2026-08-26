# RAG System Trends, Architecture, and Tech Stacks — 2025 through July 2026

> **Last Updated:** August 2026  
> **Purpose:** Permanent knowledge reference for the Knowledge Hub engineering team  
> **Scope:** RAG architectural shifts, evaluation, security, production stacks, and engineering-specific patterns

---

## Table of Contents

1. [The Defining Shift: From Static Pipelines to Reasoning Loops](#1-the-defining-shift)
2. [Agentic RAG vs Naive RAG](#2-agentic-rag)
3. [GraphRAG and Knowledge Graph Hybrid](#3-graphrag)
4. [Vector Database Landscape in 2026](#4-vector-databases)
5. [Reranking: The Underappreciated Precision Layer](#5-reranking)
6. [Corrective RAG (CRAG) and Self-RAG](#6-crag-self-rag)
7. [Multimodal RAG (Text + Images + Video)](#7-multimodal-rag)
8. [Chunking Strategies: 2026 Best Practices](#8-chunking)
9. [RAG Evaluation Frameworks (RAGAS and Beyond)](#9-evaluation)
10. [HyDE and HyPE: Query Expansion Approaches](#10-hyde-hype)
11. [Long-Context LLMs vs RAG — The Hybrid Answer](#11-long-context)
12. [Production RAG Tech Stacks: LangChain vs LlamaIndex vs Custom](#12-tech-stacks)
13. [Contextual RAG from Anthropic](#13-contextual-rag)
14. [Security and Privacy in Enterprise RAG](#14-security)
15. [Leading Embedding Models in 2026](#15-embeddings)
16. [RAG for Code and Engineering Intelligence](#16-code-rag)
17. [Multi-Hop RAG](#17-multi-hop)
18. [POC vs Production: What Changes](#18-poc-vs-production)
19. [Notable Open-Source RAG Frameworks](#19-frameworks)
20. [The 2026 Reference Production Stack](#20-reference-stack)

---

## 1. The Defining Shift: From Static Pipelines to Reasoning Loops {#1-the-defining-shift}

The field crossed a clear inflection point in 2025. Three major transitions define this era:

**Dense + Sparse Hybrid Retrieval became the default.** Nearly every 2025 benchmark showed that BM25 (keyword sparse) fused with dense vector search via Reciprocal Rank Fusion (RRF) outperforms either alone. Pure vector retrieval lost its status as the obvious default.

**Modular RAG replaced monolithic RAG.** Each pipeline component — chunker, embedder, retriever, reranker, generator — is now treated as an independently replaceable module. This enables teams to upgrade one stage without breaking others.

**Agentic RAG absorbed naive RAG.** The retrieve-once-then-generate pattern is now considered "naive RAG" and is insufficient for complex queries. Production systems in 2026 embed retrieval inside a reasoning loop.

**Why it matters for Knowledge Hub:** Teams that built POC systems in 2023-2024 on naive single-shot retrieval are finding those systems fail on real-world queries requiring synthesis, comparison, or multi-source answers.

**Resources:**
- [RAG Architecture 2026: Patterns, Code, and Eval — FutureAGI](https://futureagi.com/blog/rag-architecture-llm-2025/)
- [Standard RAG Is Dead: Why AI Architecture Split in 2026](https://ucstrategies.com/news/standard-rag-is-dead-why-ai-architecture-split-in-2026/)
- [10 RAG Architectures in 2026 — Techment](https://www.techment.com/blogs/rag-architectures-enterprise-use-cases-2026/)
- [Reasoning Agentic RAG Survey — arxiv 2506.10408](https://arxiv.org/pdf/2506.10408)

---

## 2. Agentic RAG vs Naive RAG {#2-agentic-rag}

### Naive RAG
```
User query → embed query → retrieve top-k chunks → stuff into prompt → generate answer
```
One retrieval call. No feedback loop. Fails on multi-part and comparative questions.

### Agentic RAG
The LLM acts as an orchestrating agent that decides:
- **When** to retrieve
- **What** to retrieve
- **Whether the retrieved content is sufficient**
- **Whether to retry with a different query**

Retrieval is a tool the agent calls, not a fixed pipeline step.

**Key agentic behaviors:**
- **Iterative retrieval** — retrieve, read, decide if sufficient, re-retrieve with refined queries
- **Tool-augmented search** — web search, database lookup, code execution alongside vector search
- **Self-grading** — evaluate retrieved context quality before generating
- **Stateful memory** — retrieval results persist across conversation turns

**Real-world example:** A customer support agent answering "Why was my order delayed AND what is the refund policy?" — naive RAG retrieves one answer; agentic RAG issues two sub-queries, retrieves from two knowledge sources, then synthesizes.

**Resources:**
- [Agentic RAG in 2026 — FutureAGI](https://futureagi.com/blog/agentic-rag-systems-2025/)
- [Agentic RAG Survey — arxiv 2501.09136](https://arxiv.org/abs/2501.09136)

---

## 3. GraphRAG and Knowledge Graph Hybrid {#3-graphrag}

### What It Is
Microsoft Research's GraphRAG (open-sourced July 2024, widely adopted through 2025) converts unstructured text corpora into a knowledge graph before querying.

### How It Works
1. GPT-4 extracts entities and relationships from every document
2. Entity co-occurrence and semantic similarity build a graph
3. Leiden algorithm detects communities (clusters) and generates hierarchical summaries
4. At query time: *local* entity-level queries OR *global* thematic queries that traverse the whole graph

### Problem It Solves
Standard vector RAG fails at "What are the main themes across all 500 of these research papers?" — no single chunk contains that global view. GraphRAG's community summaries answer holistic questions. Also excels at multi-hop relationship queries: "Who funded the researchers who developed the technique used in Project X?"

### LightRAG — Production Alternative
LightRAG (October 2024) achieves comparable accuracy to GraphRAG at **10x lower token cost** through dual-level (entity + relationship) retrieval. It is the production-preferred alternative for cost-sensitive deployments.

### Production Architecture
```
Raw docs → LLM entity extraction → Neo4j graph
         → Vector embedding    → Qdrant/pgvector

Query → [Router] → Simple factual: vector retrieval
                 → Relationship/thematic: graph traversal
                 → Complex: both, fused
```

**Real-world result:** LinkedIn used graph-augmented RAG to reduce internal ticket resolution time from 40 hours to 15 hours (63% improvement).

**Resources:**
- [Microsoft GraphRAG Project](https://www.microsoft.com/en-us/research/project/graphrag/)
- [Neo4j GraphRAG Labs](https://neo4j.com/labs/genai-ecosystem/graphrag/)
- [ROGRAG — Robustly Optimized GraphRAG — arxiv 2503.06474](https://arxiv.org/pdf/2503.06474)
- [Knowledge Graph-Guided RAG — arxiv 2502.06864](https://arxiv.org/pdf/2502.06864)

---

## 4. Vector Database Landscape in 2026 {#4-vector-databases}

| Database | Best For | Scale Sweet Spot | Notes |
|---|---|---|---|
| **pgvector** | PostgreSQL-native teams | < 5M vectors | Free; production-grade with HNSW tuning |
| **Qdrant** | Performance-critical self-hosted | 5M–500M vectors | 5–30ms p99 latency; 3–10x cheaper than managed |
| **Pinecone** | Zero-ops managed cloud | Any scale | Added built-in inference + BYOC in 2025 |
| **Weaviate** | Hybrid search + modular embeddings | 10M–1B vectors | Strong OSS + cloud options |
| **Milvus** | Largest scale, self-hosted | 1B+ vectors | Most performant at extreme scale |
| **Chroma** | Local dev / POC | < 1M vectors | Best developer experience for prototyping |

**Key 2025-2026 developments:**
- pgvector is now production-grade for most teams under 50M vectors with proper HNSW index tuning
- All major databases now support hybrid (dense + sparse) search natively
- Pinecone added BYOC (Bring Your Own Cloud) — critical for enterprise data residency

**Resources:**
- [Top 15 Vector Databases 2026 — Medium](https://medium.com/@pratik-rupareliya/top-15-vector-databases-in-2026-a-production-decision-guide-from-100-enterprise-deployments-dd58a04f51a5)
- [pgvector vs Pinecone vs Qdrant vs Weaviate — KalviumLabs](https://www.kalviumlabs.ai/blog/vector-databases-compared-pgvector-pinecone-qdrant-weaviate/)

---

## 5. Reranking: The Underappreciated Precision Layer {#5-reranking}

**The role:** Initial vector retrieval casts a wide net (top 20–100 chunks). Reranking uses a more expensive, more accurate model to re-score those candidates and select the best 5–10 for the LLM context.

**Why it matters:** Vector similarity is a coarse proxy for relevance. A cross-encoder that jointly processes query and document catches semantic nuances that bi-encoders miss. Reranking typically delivers **10–25% additional precision** and measurably reduces hallucinations by filtering irrelevant context.

### Reranker Options

| Option | Cost | Latency | Best For |
|---|---|---|---|
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | Free / self-hosted | Fast (~5ms) | Default self-hosted |
| Cohere Rerank API | ~$2 / 1,000 requests | Managed | 100+ languages, strong quality |
| LLM-as-reranker | High | Slow | Highest accuracy, research scenarios |
| FlashRank | Free / self-hosted | Ultra-fast | Latency-sensitive production |

**Best practice:** Retrieve 20–50, rerank to 5–10, feed to LLM.

**2025 research finding:** Multi-criteria reranking (relevance + freshness + authority + diversity) significantly outperforms single-dimension relevance scoring in enterprise settings (arxiv 2504.07104).

**Resources:**
- [Reranking for RAG — Ailog](https://app.ailog.fr/en/blog/guides/reranking)
- [Multi-Criteria Reranking — arxiv 2504.07104](https://arxiv.org/pdf/2504.07104)

---

## 6. Corrective RAG (CRAG) and Self-RAG {#6-crag-self-rag}

### Self-RAG
Fine-tunes the generator model to output special "critic tokens" that signal when retrieval is needed, whether retrieved content is relevant, and whether the generated answer is supported. Requires instruction-tuning with annotated data.

### Corrective RAG (CRAG) — arxiv 2401.15884
Adds a lightweight retrieval evaluator (T5-Large fine-tuned) that classifies retrieved documents as **Correct**, **Incorrect**, or **Ambiguous**:

```
Correct   → use retrieved content
Ambiguous → use retrieved content + trigger web search supplement  
Incorrect → discard retrieval, fall back entirely to web search
```

**Key advantage over Self-RAG:** CRAG does NOT require training the generator. It wraps any existing RAG system. CRAG outperforms Self-RAG on several benchmarks without the training cost.

**2025 production status:** CRAG's pattern is now integrated into LangGraph natively. The web-search fallback mechanism has become a standard design pattern in agentic RAG.

**Resources:**
- [Corrective RAG with LangGraph — DataCamp](https://www.datacamp.com/tutorial/corrective-rag-crag)
- [CRAG Paper — OpenReview](https://openreview.net/forum?id=JnWJbrnaUE)
- [Doctor-RAG: Failure-Aware Repair — arxiv 2604.00865](https://arxiv.org/pdf/2604.00865)

---

## 7. Multimodal RAG (Text + Images + Video) {#7-multimodal-rag}

**Status:** No longer experimental — production-grade multimodal RAG is achievable with current tooling.

### How It Works
Images, chart screenshots, video frames, and PDF pages are embedded alongside text using multimodal embedding models. At query time, the system retrieves the most relevant visual assets alongside text chunks and feeds them to a vision-language model (VLM).

### Key Enabling Models (2025-2026)

| Model | Capability | Context |
|---|---|---|
| **Cohere Embed v4** (April 2025) | Text + images + raw PDF pages | 128K |
| **Voyage-multimodal-3.5** (Jan 2026) | Text + images + video frames | Matryoshka dims |
| **Google Gemini Embedding 001** | Text + images + video + audio + PDF | 3,072-dim |

### Production Use Cases
- Technical manuals with circuit diagrams and annotated photos
- Financial reports where key insight is in charts (not text)
- E-commerce catalogs where product appearance drives retrieval
- Video tutorials: 1Hz frame sampling indexed as image sequences

**Resources:**
- [Multimodal RAG in 2026 — BigData Boutique](https://bigdataboutique.com/blog/multimodal-rag-retrieval-over-images-pdfs-and-text)
- [State of the Art Multimodal RAG 2026 — Ailog](https://app.ailog.fr/en/blog/news/multimodal-rag-state-of-art)

---

## 8. Chunking Strategies: 2026 Best Practices {#8-chunking}

Chunking — how documents are split before embedding — has outsized impact on retrieval quality.

| Strategy | Description | Best For |
|---|---|---|
| **Recursive character split** | Split at paragraph/sentence/word boundaries; 400-512 tokens; 10-20% overlap | General-purpose default |
| **Semantic chunking** | Split where embedding similarity drops sharply between sentences | Documents with clear topic shifts |
| **Hierarchical / parent-child** | Small chunks for retrieval precision; retrieve parent for full context | Long documents |
| **Late chunking** (Jina AI) | Embed full document first (long-context), THEN split token embeddings | Preserving cross-reference context |
| **AST-aware** (code) | Split at function/class boundaries using Tree-sitter | Code corpora |
| **Agentic / adaptive** | LLM determines chunk boundaries per content | Complex heterogeneous documents |

**Key 2025 research finding (NAACL 2025):** Semantic chunking's 9% recall improvement over fixed-size chunks is not consistently justified by computation cost — fixed-size chunking with proper overlap matched or beat semantic chunking on many benchmarks.

**Late chunking** is the most innovative recent approach: by computing embeddings in full-document context, cross-references ("as mentioned in section 3") are preserved in the vector representation.

**Resources:**
- [Best Chunking Strategies for RAG 2026 — Firecrawl](https://www.firecrawl.dev/blog/best-chunking-strategies-rag)
- [FreeChunker: Cross-Granularity Chunking — arxiv 2510.20356](https://arxiv.org/pdf/2510.20356)

---

## 9. RAG Evaluation Frameworks {#9-evaluation}

### RAGAS (Most Widely Adopted)

| Metric | What It Measures |
|---|---|
| **Faithfulness** | Is the answer supported by retrieved context? (anti-hallucination) |
| **Answer Relevancy** | Is the answer relevant to the question? |
| **Context Precision** | Are retrieved chunks actually relevant to the question? |
| **Context Recall** | Did retrieval surface all necessary information? |

RAGAS metrics are LLM-based — a judge model scores each dimension, correlating better with human judgment than n-gram metrics. RAGAS also generates synthetic test data from your documents automatically.

### Other Frameworks

| Framework | Key Strength |
|---|---|
| **TruLens** (Trulera) | Observability + evaluation in production |
| **DeepEval** | Broader LLM testing with RAG-specific metrics (G-Eval, hallucination) |
| **LangSmith** | Tracing + evaluation tightly integrated with LangGraph |
| **Arize Phoenix** | Open-source ML observability with RAG tracing |

**Resources:**
- [RAGAS Official Site](https://www.ragas.io/)
- [RAGAS Available Metrics Docs](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/)
- [RAGXplain: Explainable Evaluation — arxiv 2505.13538](https://arxiv.org/pdf/2505.13538)
- [Systematic Review of RAG Systems — arxiv 2507.18910](https://arxiv.org/pdf/2507.18910)

---

## 10. HyDE and HyPE: Query Expansion Approaches {#10-hyde-hype}

### HyDE (Hypothetical Document Embeddings)
Instead of embedding the user's short query, an LLM generates a *hypothetical document* that would answer the query, then that hypothetical is embedded for retrieval.

**Works well:** Vague queries against rich descriptive text; vocabulary mismatch problems  
**Fails:** Factual corpora (hallucinated hypothesis drifts); tight latency budgets (25–60% latency increase)

### HyPE (Hypothetical Prompt Embeddings) — 2025 Alternative
Inverts the approach: generate hypothetical *questions* per document **at index time**, then match query to pre-generated questions. Avoids per-query hallucination risk.

**Resources:**
- [HyDE — emergentmind](https://www.emergentmind.com/topics/hypothetical-document-embeddings-hyde)

---

## 11. Long-Context LLMs vs RAG — The Hybrid Answer {#11-long-context}

### The Landscape (2025-2026)
Claude Sonnet 1M, Gemini 2.5 Pro 2M, Llama 4 Scout 10M context windows.

### The "Context Rot" Problem (discovered July 2025)
18 frontier models tested: performance degrades **30–50% long before the documented context limit**. At 1M tokens, multi-fact recall hovers around 60% — 40% of injected facts missed.

### Practical Constraints
- 1M-token context cache requires ~100GB GPU memory per session
- Latency: ~5 seconds at 100K tokens → 45+ seconds at 1M tokens
- Cost: well-tuned RAG pipeline costs ~1,250x less per query than brute-force long-context stuffing

### The 2026 Standard Pattern: Hybrid
**Retrieve 50K–200K tokens of targeted content with RAG, then reason over that retrieved set with a long-context model.**

Pure RAG alone misses in-document reasoning. Pure long-context alone rots on large corpora. The hybrid gives both: RAG's cost efficiency + long-context model's within-document reasoning.

**Resources:**
- [Context Rot, RAG, and Long Context — Glasp](https://glasp.co/articles/context-rot-rag-long-context-hybrid)
- [Long Context vs RAG: When 1M Windows Replace RAG — SitePoint](https://www.sitepoint.com/long-context-vs-rag-1m-token-windows/)

---

## 12. Production RAG Tech Stacks {#12-tech-stacks}

### Framework Comparison

| Framework | GitHub Stars | Core Strength | Best For |
|---|---|---|---|
| **LangChain / LangGraph** | 119K+ | Agent workflows, stateful multi-step reasoning | Complex agentic pipelines |
| **LlamaIndex** | 44K+ | Retrieval optimization, document indexing | Document-heavy RAG |
| **DSPy** (Stanford) | ~20K | Programmatic prompt optimization | Self-optimizing RAG |
| **Haystack** (deepset) | ~20K | Production-grade modular pipelines | Reliability-first enterprise |
| **Custom** | — | Maximum control, minimum overhead | High-scale, latency-sensitive |

### Performance Comparison
- LlamaIndex: ~6ms retrieval overhead, 35% accuracy boost for document-heavy apps
- LangGraph: ~14ms overhead but adds full stateful agent execution with checkpoint/resume
- LangChain needs 30–40% more code for equivalent RAG vs LlamaIndex

### The Winning Production Architecture (2026)
```
LlamaIndex handles indexing and retrieval
LangGraph handles agent orchestration that calls LlamaIndex as a tool
```

**Resources:**
- [LangChain vs LlamaIndex 2026 — Morph LLM](https://www.morphllm.com/comparisons/langchain-vs-llamaindex)
- [Production RAG in 2026 — rahulkolekar.com](https://rahulkolekar.com/production-rag-in-2026-langchain-vs-llamaindex/)
- [Engineering the RAG Stack — arxiv 2601.05264](https://arxiv.org/html/2601.05264)

---

## 13. Contextual RAG from Anthropic {#13-contextual-rag}

**Announced:** September 2024; widely adopted through 2025.

### The Core Innovation
Before embedding each chunk, Claude prepends LLM-generated *context* summarizing where this chunk sits in the broader document.

```
Standard chunk: "it increased by 12%"  (meaningless alone)

Contextualized chunk: "This chunk is from Section 3 of a Q3 financial report,
discussing regional revenue breakdown — [original chunk text]"
```

### Full Technique Stack (Anthropic's Recommended Combo)
1. Contextual chunk enrichment (LLM prepends context to each chunk)
2. Hybrid search (BM25 + dense embeddings)
3. Reranking (Cohere or cross-encoder)
4. Increase k (more chunks fed to the LLM)

**Result:** Anthropic reported a **67% reduction in retrieval failures** vs standard RAG.

**Resources:**
- [Enhancing RAG with Contextual Retrieval — Claude Cookbook](https://platform.claude.ai/cookbook/capabilities-contextual-embeddings-guide)
- [Magic Behind Anthropic's Contextual RAG — Analytics Vidhya](https://www.analyticsvidhya.com/blog/2024/11/anthropics-contextual-rag/)

---

## 14. Security and Privacy in Enterprise RAG {#14-security}

### Adoption Context
45% of enterprise AI implementations integrate RAG structures in 2025, up from 15% in 2023. Scale brings serious attack surface.

### Top Threat Vectors

**1. Indirect Prompt Injection via Retrieved Content**
Attackers embed hidden instructions in documents in the RAG corpus. The "EchoLeak" vulnerability (2025) demonstrated this against Microsoft 365 Copilot — a crafted email triggered retrieval of attacker-controlled content and exfiltrated sensitive corporate data without employee interaction.

**2. Retrieval-Layer Authorization Bypass**
If the vector store does not enforce per-document ACLs, a user can retrieve unauthorized documents by asking semantically related questions. ACL enforcement must happen *inside* the retrieval layer, not just at the application layer.

**3. Embedding Inversion Attacks**
Stored embeddings can be partially inverted to reconstruct original text — a data privacy concern for regulated industries.

**4. Data Residency and Compliance**
Enterprise RAG sending documents to cloud LLM APIs may violate GDPR, HIPAA, or SOC2. Response: private/on-premise RAG with self-hosted models + self-hosted vector databases.

### Mitigation Patterns
- Document-level ACLs enforced at retrieval time (not just ingestion)
- Separate vector stores per security clearance tier
- Private deployment (BYOC or fully on-premise)
- Output scanning to detect exfiltration patterns
- Prompt injection detection layers before LLM call

**Resources:**
- [What Is RAG Security? — witness.ai](https://witness.ai/blog/rag-security/)
- [Enterprise AI Security: RAG, Agents & Compliance 2025 — ragwalla.com](https://ragwalla.com/docs/guides/the-complete-guide-to-enterprise-ai-security-rag-agents-compliance-in-2025)

---

## 15. Leading Embedding Models in 2026 {#15-embeddings}

| Model | MTEB Score | Dimensions | Notes |
|---|---|---|---|
| Google Gemini Embedding 001 | 67.71 | 3,072 | Multimodal (text+image+video+audio) |
| Cohere embed-v4 | 65.2 | 1,024 | Multimodal, 100+ languages, 128K context |
| OpenAI text-embedding-3-large | 64.6 | 3,072 | Strong English default, well-supported |
| Voyage 3 Large | ~64 | 1,024 | Best pure retrieval quality |
| BGE-M3 | 63.0 | 1,024 | OSS, multilingual, MIT license |
| Qwen3-Embedding-8B | ~63 | variable | OSS, Apache 2.0, multilingual |
| Jina v4 | ~62 | 2,048 | OSS, multilingual |
| Nomic Embed | ~60 | 768 | Fully auditable, Apache 2.0 |

### Selection Guide
- **Default for English production:** OpenAI text-embedding-3-large
- **Maximum retrieval quality:** Voyage 3 Large
- **Cost-efficient pipeline with reranking:** Cohere embed-v4 + Cohere Rerank (same provider)
- **Self-hosted / open-source:** BGE-M3 (multilingual) or Nomic (auditable)
- **Multimodal corpus:** Cohere embed-v4 or Gemini Embedding 001

**Resources:**
- [Best Embedding Models for RAG 2026 — PremAI](https://www.premai.io/blog/best-embedding-models-for-rag-2026-ranked-by-mteb-score-cost-and-self-hosting/)
- [Best Embedding Models 2026 — Milvus Blog](https://milvus.io/blog/choose-embedding-model-rag-2026.md)

---

## 16. RAG for Code and Engineering Intelligence {#16-code-rag}

Code has structure that prose does not — function signatures, import graphs, class hierarchies, call chains. Naive text chunking ignores this structure.

### Production Patterns (2025-2026)

**AST-based chunking:** Split code at the Abstract Syntax Tree level (function/class boundaries) using Tree-sitter. Language-aware splitting for Python, TypeScript, Go, Rust, etc.

**Code graph augmentation:** Extract function call graphs, class inheritance, and module dependency graphs. These supplement vector similarity with structural navigation.

### Real-World Engineering Intelligence Uses

| Tool | RAG Approach |
|---|---|
| **GitHub Copilot** | RAG over indexed local codebase + workspace context; HNSW vector index with embedding cache invalidation |
| **Cursor** | Forks VS Code; indexes codebase with RAG + "Shadow Workspace" that predicts next edit |
| **Claude Code** | RAG over project files for context-aware code generation |
| **RagCode MCP** | Privacy-first semantic code navigation with deep AST support; 100% local (Ollama + Qdrant) |

### What Engineering Intelligence Platform RAG Looks Like in 2026

Indexed sources:
- Code (AST-aware chunking by file/function/class)
- PRs and commit messages (structured metadata + semantic)
- Architecture docs, ADRs, runbooks
- Tickets and issue history

Supported queries:
- "What changed in this module in the last 30 days?"
- "What tests cover this function?"
- "Show me all callers of this deprecated API"
- "Which PRs touched this file?"

Architecture layers:
- **Graph layer:** Dependency traversal queries
- **Vector layer:** Semantic queries
- **Structured SQL layer:** Metadata queries (date ranges, author, PR status)

**Resources:**
- [GitHub Copilot RAG Architecture 2026 — MarkAICode](https://markaicode.com/architecture/github-copilot-rag-architecture/)
- [Retrieval-Augmented Code Generation Survey — arxiv 2510.04905](https://arxiv.org/pdf/2510.04905)
- [RagCode MCP — GitHub](https://github.com/doitmagic/rag-code-mcp)

---

## 17. Multi-Hop RAG {#17-multi-hop}

**Definition:** Chaining multiple retrieval steps where each step depends on the result of the previous one.

Single-hop: "What is the capital of France?"  
Multi-hop: "What is the GDP of the country where the author of Hamlet was born?"

### When Multi-Hop Is Needed
- Questions requiring synthesis across multiple documents
- Temporal reasoning ("After the 2018 policy change, how did X affect Y?")
- Entity disambiguation requiring follow-up lookups
- Complex enterprise knowledge base analysis

### 2025-2026 Approaches

| Approach | Key Innovation |
|---|---|
| **ReD-RAG** | Decomposes questions into sub-questions with explicit rewriting markers |
| **HopRAG** | Logic-aware multi-hop retrieval using structured reasoning chains |
| **CoRAG** | Trains iterative retrieval via reformulated sub-queries; 10+ point EM gains on MuSiQue |
| **GDP-RAG** | Act-Review-Update: retrieve, cross-verify via secondary retrieval, commit to Trajectory Memory |
| **Only Ask What You Don't Know** | Grounded delta planning — tracks known facts, retrieves only for genuine gaps |

**Key challenge:** Each hop multiplies hallucination risk. Best practice: CRAG-style verification at each hop before committing the retrieved fact to the reasoning chain.

**Resources:**
- [Awesome RAG Reasoning — EMNLP 2025 — GitHub](https://github.com/DavidZWZ/Awesome-RAG-Reasoning)
- [Only Ask What You Don't Know — arxiv 2606.22681](https://arxiv.org/pdf/2606.22681)

---

## 18. POC vs Production: What Changes {#18-poc-vs-production}

| Dimension | POC | Production |
|---|---|---|
| **Architecture** | Monolithic (indexing + serving in one process) | Separated offline (indexing) + online (serving) pipelines |
| **Vector DB** | Chroma or FAISS in-process | Qdrant, Pinecone, or Weaviate — deployed, scaled, monitored |
| **Chunking** | Fixed-size, no overlap tuning | Domain-tuned strategy per content type |
| **Retrieval** | Dense-only, top-k = 3–5 | Hybrid (BM25 + dense), top-k = 20–50 with reranking to 5–10 |
| **Evaluation** | Vibes / manual spot-check | RAGAS metrics, automated regression test suite |
| **Caching** | None | Semantic query cache (Redis/Upstash) — 40–60% LLM API cost reduction |
| **Security** | Open access | Per-document ACLs enforced at retrieval time |
| **Observability** | None | Full distributed tracing (LangSmith, Arize Phoenix, TruLens) |
| **Updates** | Batch re-index manually | Streaming incremental index updates |
| **Cost control** | Ignored | Caching, reranker gating, LLM call batching |

### Most Critical Production Additions
1. Retrieval evaluation metrics (RAGAS) before and after every change
2. Semantic caching — reduces LLM API cost 40–60% for knowledge base applications
3. Per-document ACL enforcement in the vector store
4. Incremental indexing (documents updated without full re-index)

**Resources:**
- [Scaling RAG from POC to Production — Towards Data Science](https://towardsdatascience.com/scaling-rag-from-poc-to-production-31bd45d195c8/)
- [RAG at Scale — Redis Blog](https://redis.io/blog/rag-at-scale/)

---

## 19. Notable Open-Source RAG Frameworks (2025-2026) {#19-frameworks}

| Framework | Stars | Focus | Status |
|---|---|---|---|
| **LangChain + LangGraph** | 119K | Full-stack orchestration + agent loops | Very active; LangGraph is 2025 production agent standard |
| **LlamaIndex** | 44K | Retrieval optimization, document connectors | Very active; added multimodal + agent support |
| **DSPy** (Stanford) | ~20K | Programmatic prompt optimization for RAG | Added agentic signatures + MIPROv2 optimizer in 2025 |
| **Haystack** (deepset) | ~20K | Modular, production-grade, tech-agnostic | Stable enterprise choice |
| **R2R v3** | Growing | Full agentic RAG as an API | Hybrid search + knowledge graph + agents in one API |
| **RAGFlow** | Fast-growing | Document intelligence + RAG with OCR | Deep document parsing including charts, tables, formulas |
| **Flowise / FlowiseAI** | ~36K | No-code/low-code RAG builder | Rapid prototyping |
| **Kotaemon** | Growing | Document QA with evaluation built in | Research tool, easy local deployment |

### 2025-2026 Notable Updates
- **DSPy:** Added agentic module compositions, MIPRO optimizer (MIPROv2)
- **LangGraph:** Added persistent checkpointing (pause/resume mid-workflow — critical for human-in-the-loop)
- **RAGFlow:** Reached production-grade status with deep document parsing
- **R2R v3:** Hybrid search + knowledge graph + agent orchestration in a single API

**Resources:**
- [15 Best Open-Source RAG Frameworks 2026 — Firecrawl](https://www.firecrawl.dev/blog/best-open-source-rag-frameworks)
- [Best RAG Framework 2026 — iternal.ai](https://iternal.ai/blockify-rag-frameworks)

---

## 20. The 2026 Reference Production Stack {#20-reference-stack}

```
┌─────────────────────────────────────────────────────────────────┐
│                    INDEXING PIPELINE (offline)                  │
│                                                                 │
│  Raw Docs → Contextual Enrichment (Claude 3 Haiku)             │
│           → Domain-tuned Chunking (AST for code,               │
│             semantic or hierarchical for prose)                 │
│           → Embed: text-embedding-3-large or BGE-M3            │
│           → Store: Qdrant (dense) + BM25 index (sparse)        │
│           → Optionally: Neo4j (entity graph)                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    QUERY PIPELINE (online)                      │
│                                                                 │
│  User Query → Query Expansion (HyDE if domain suits)           │
│            → Hybrid Retrieval (dense + BM25, RRF fusion)       │
│            → Retrieve top 20–50 candidates                     │
│            → Rerank → select top 5–10                          │
│            → CRAG-style grading (accept / web-search fallback) │
│            → Agentic loop (LangGraph)                          │
│            → LLM generation (Claude Sonnet / GPT-4o)           │
│            → Log all traces (LangSmith / Arize Phoenix)        │
└─────────────────────────────────────────────────────────────────┘

Orchestration:   LangGraph (agent loop, state, checkpoint/resume)
                 calling LlamaIndex retrieval as a tool

Evaluation:      RAGAS (offline) + TruLens (production monitoring)

Security:        Per-document ACLs at retrieval time
                 Private deployment for sensitive corpora

Cost control:    Semantic cache (Redis/Upstash) → 40-60% API savings
                 Reranker gating (only rerank if retrieval score < threshold)
```

---

## Quick Reference: Key Papers (arxiv)

| Topic | arxiv ID | Title |
|---|---|---|
| Agentic RAG Survey | 2501.09136 | Agentic RAG: A Survey |
| Reasoning Agentic RAG | 2506.10408 | Reasoning Agentic RAG Industry Survey |
| RAG Stack Engineering | 2601.05264 | Engineering the RAG Stack |
| Systematic RAG Review | 2507.18910 | Systematic Review of RAG Systems |
| Multi-Criteria Reranking | 2504.07104 | Relevance Isn't All You Need |
| Multi-hop Retrieval | 2606.22681 | Only Ask What You Don't Know |
| Code Generation + RAG | 2510.04905 | Retrieval-Augmented Code Generation Survey |
| Knowledge Graph RAG | 2502.06864 | Knowledge Graph-Guided RAG |
| GraphRAG Optimization | 2503.06474 | ROGRAG |
| Chunking Research | 2510.20356 | FreeChunker |
| Doctor-RAG | 2604.00865 | Failure-Aware RAG Repair |
| CRAG | 2401.15884 | Corrective RAG |

---

## Relevance to Knowledge Hub

The shift from naive RAG to Agentic RAG mirrors Knowledge Hub's own evolution:

- **Today (Documentation Search):** Single-shot vector retrieval answers factual questions
- **Next (Knowledge Platform):** Multi-hop + graph RAG connects knowledge across documents
- **Future (Engineering Intelligence):** Code-aware RAG (AST chunking + call graph + semantic) serves engineering queries
- **Moat:** Contextual RAG enrichment + evaluation metrics (IDS score) compound with usage — customer intelligence becomes irreplaceable

The highest-ROI RAG investments for Knowledge Hub are:
1. Contextual chunk enrichment (67% retrieval failure reduction, wraps existing system)
2. RAGAS evaluation pipeline (makes every future change measurable)
3. Hybrid retrieval (BM25 + dense) replacing pure vector search
4. Reranking layer before LLM context construction
