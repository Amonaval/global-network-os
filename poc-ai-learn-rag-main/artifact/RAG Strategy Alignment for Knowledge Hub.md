╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Plan: RAG Strategy Alignment for Knowledge Hub                                                                               │
│                                                                                                                              │
│ Context — What Prompted This                                                                                                 │
│                                                                                                                              │
│ The RAG_TRENDS_2025_2026.md document (just created) included a full section (§16) on                                         │
│ "Engineering Intelligence Code-aware RAG" covering AST-based chunking, function call graphs,                                 │
│ class hierarchy traversal, and positioning Knowledge Hub alongside Cursor/Copilot. The user                                  │
│ correctly challenged this: is that framing on-track for the actual product?                                                  │
│                                                                                                                              │
│ Answer: No. It is largely off-track. The engineering docs need to permanently capture                                        │
│ which RAG patterns are relevant to Knowledge Hub's actual customers and which are not.                                       │
│                                                                                                                              │
│ ---                                                                                                                          │
│ The Verdict, In Full                                                                                                         │
│                                                                                                                              │
│ Knowledge Hub's actual customers (priority order):                                                                           │
│                                                                                                                              │
│ 1. Aarav — IT consultant querying CLIENT DELIVERABLES (NDAs prevent cloud AI)                                                │
│ 2. Anjali — CA/Doctor querying PROFESSIONAL WORK FILES (HIPAA/ethics)                                                        │
│ 3. Marcus — Law firm partner querying CASE FILe)                                                 │
│ 4. Sarah — Head of Engineering querying ADRs, runbooks, post-mortems — DOCUMENTS, not code                                   │
│                                                                                                  │
│ Even Sarah's problem is a document intelligence problem, not code traversal. She needs                                       │
│ "why did we make this architectural decision?" — which lives in an ADR PDF, not the AST.                                     │
│                                                                                                                              │
│ What is explicitly off-track:                                                                                                │
│                                                                                                  │
│ - AST-based code chunking (Tree-sitter, function-boundary splits) — Cursor/Copilot territory                                 │
│ - Function call graph / class inheritance traversal — Cursor/Copilot territory                                               │
│ - "Shadow Workspace" / code prediction pattern                                                   │
│ - Code generation quality improvements — not our moat                                                                        │
│ - Positioning as competitor to GitHub Copilot/ category                                          │
│                                                                                                                              │
│ The GTM playbook already states this directly: not "an engineering intelligence platform"                                    │
│ (Jellyfish/LinearB own that label). The Founders Compass is unambiguous: "Not a better code                                  │
│ generator. We do not compete here."                                                                                          │
│                                                                                                  │
│ What RAG patterns ARE relevant, mapped to actual use cases:                                                                  │
│                                                                                                                              │
│ ┌────────────────────────┬─────────────────┬──────────────────────────────────────────────────── │──┐                                                                                                                          │
│ │      RAG Pattern       │    Relevance    │                                       Why                                       │
│  │                                                                                               │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────────┤                                                                                                                          │
│ │ Contextual RAG         │                 │ A by 12%" is meaningless without context —          │identical │                                                                                                                  │
│ │ (Anthropic)            │ Critical        │  to the chunk isolation problem Anthropic solved. 67% failure reduction. Wraps   │                                                                                               │
│ │                        │                 │ existing system.                                                                 │                                                                                                                           │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────── │──┤                                                                                                                          │
│ │ Confidence Gate /      │ Already         │ Existing dual-threshold IS CRAG. Must never be loosened — for regulated          │                                                                                               │
│ │ CRAG-style grading     │ implemented     │ professionals, wrong answer = professional liability event.                      │                                                                                                                           │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────── │
│ ──┤                                                                                              │
  │  before LLM context. Critical for precision-over-recall mandate.                 │                                                                                                                           │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────────┤                                                                                                                          │
│ │                        │ High (future    │ Medical (imaging, charts), Legal (PDF tables, exhibits), CA (financial           │                                                                                                                           │
│ │ Multimodal RAG         │ moat)           │ srch (figures, diagrams). No local-first competitor │  │                                                                                                                           │
│ │                        │                 │ does this.                                                                      │
│  │                                                                                               │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────────┤                                                                                                                          │
│ │                        │                 │ Different professional documents need different strategies:                      │                                                                                                                           │
│ │ Document-type chunking │ High            │ hierarchical/parent-child for legal briefs; semantic for research papers;       │
│  │                                                                                               │
│ │                        │                 │ recursive-overlap for medical notes. NOT AST.                                    │                                                                                                                           │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────── │──┤                                                                                                                          │                        │                 │ Fion map to the confidence gate philosophy. IDS     │  │                                                                                                                           │
│ │ RAGAS evaluation       │ High            │ metric should eventually incorporate these. Makes every future change            │                                                                                                                           │
│ │                        │                 │ measurable.                                                                      │                                                                                                                           ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────── │──┤                                                                                                                          │
│ │ Hybrid retrieval       │ Already         │ Correct. Never replace with single-method.                                       │                                                                                               │
│ │ (BM25+Dense+RRF)       │ implemented     │                                                                                 │
│  │                                                                                               │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────────┤                                                                                                                          │
│ │ HyDE (selective)       │ Medium          │ Useful when CAs/consultants ask vague recall questions. Risky given confidence   │                                                                                                                           │
│ │                        │                 │ gate philosophy — hallucinated hypothesis must not weaken gate.                 │
│  │                                                                                               │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────────┤                                                                                                                          │
│ │ GraphRAG               │ Low (Stage 3+)  │ Lges/precedents) and medical notes have dense       │entity │                                                                                                                     │
│ │                        │                 │  graphs. Not for v1 — premature. Note for enterprise legal/medical expansion.    │                                                                                               │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────────┤                                                                                                                          │
│ │ Agentic RAG /          │                 │ "What strategy worked for clients with this profile AND how did the 2022         │                                                                                                                           │
│ │ Multi-hop              │ Low (future)    │ regulation affect it?" is multi-hop. Future capability after single-hop is       │                                                                                               │
│ │                        │                 │ irreplaceable.                                                                   │                                                                                               │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────── │
│ ──┤                                                                                              │
│ │ AST code chunking      │ NOT RELEVANT    │ Wrong product category entirely.                                                 │                                                                                                                           │
│ ├────────────────────────┼─────────────────┼──────────────────────────────────────────────────────────────────────────────────┤                                                                                                                          │
│ │ Code graph traversal   │ NOT RELEVANT    │ Cursor/Copilot territory.                                                       │
│  │                                                                                               │
│ └────────────────────────┴─────────────────┴──────────────────────────────────────────────────────────────────────────────────┘                                                                                                                          │
│                                                                                                  │
│ ---                                                                                                                          │
│ Files to Create and Update                                                                       │
│                                                                                                                              │
│ 1. CREATE: .claude/.engineering/RAG_STRATEGY.md (new file)                                                                   │
│                                                                                                                              │
│ The authoritative document on RAG architecture decisions for Knowledge Hub.                                                  │
│ Content:                                                                                                                     │
│ - What KH is (private professional document ingence)                                             │
│ - Relevant RAG patterns with rationale mapped to actual customer segments                                                    │
│ - Explicitly out-of-scope patterns with ration                                                   │
│ - Current implementation status vs. roadmap                                                                                  │
│ - Evolution path: current → contextual retriev                                                   │
│                                                                                                                              │
│ 2. UPDATE: .claude/.engineering/DECISIONS.md                                                                                 │
│                                                                                                                              │
│ Add four new decisions after existing D.11:                                                                                  │
│ - D.12: Contextual chunk enrichment adopted — why (67% failure reduction, wraps existing system, no retraining, directly     │
│ solves professional document chunk isolation p                                                   │
│ - D.13: Cross-encoder reranking as next retrieval improvement — why (precision-over-recall mandate for regulated professionals; retrieve 20-50, rerank to 5-10)                                                                               │
│ - D.14: Document-type chunking strategy by proerent types need different strategies (NOT         │AST-based)                                                                                                                   │
│ - D.15: Code-aware RAG, AST chunking, and codetly out of scope — why (Cursor/Copilot territory;  │engineering beachhead is a DOCUMENT problem not code traversal; GTM positioning)                                             │
│                                                                                                                              │
│ 3. UPDATE: .claude/.engineering/SESSION_MEMORY.md                                                                            │
│                                                                                                                              │
│ Add two new lessons:                                                                                                         │
│ - Lesson: Code-Aware RAG Is the Wrong Track — e intelligence competing with Cursor/Copilot; KH's │ engineering customer (Sarah) needs document intelligence about engineering decisions, not AST traversal                      │
│ - Lesson: RAG Strategy Must Map to Customer Sey RAG pattern decision must start from "which      │customer segment does this improve?" not "is this a 2026 trend?"                                                             │
│                                                                                                  │
│ 4. UPDATE: .claude/.engineering/GLOSSARY.md                                                                                  │
│                                                                                                                              │
│ Add KH-specific definitions for: Contextual RAG, Cross-encoder reranking, CRAG/confidence grading, Multimodal RAG, Document-type chunking — each with "why it matters for KH" framing (not generic definitions).                                │
│                                                                                                                              │
│ 5. UPDATE: .claude/.engineering/README.md                                                        │
│                                                                                                                              │
│ Add RAG_STRATEGY.md to the reading order (after MODULE_INDEX, before ARCHITECTURE).                                          │
│                                                                                                  │
│ ---                                                                                                                          │
│ What Is NOT Changing                                                                             │
│                                                                                                                              │
│ - artifact/RAG_TRENDS_2025_2026.md — this is a general knowledge reference document,                                         │
│ not a KH-specific doc. The code RAG section is correct as general industry knowledge.                                        │
│ The Knowledge Hub relevance section (§ at the bottom) already frames what's relevant.                                        │
│ No changes needed — it serves its purpose as a                                                   │
│ - None of the existing DECISIONS.md entries are reverted. All existing decisions are sound.                                  │
│ - The existing retrieval implementation (hybrid BM25+Dense+RRF, confidence gate, JSON sharding)                              │
│ is validated and correct. These changes only Aange the code.                                     │
│                                                                                                                              │
│ ---                                                                                              │
│ File Paths                                                                                                                   │
│                                                                                                                              │
│ All in: D:\AI\AI_Learning_Projects\poc-ai-learn-rag\.claude\.engineering\                                                    │
│                                                                                                                              │
│ - .claude/.engineering/RAG_STRATEGY.md — CREATE                                                                              │
│ - .claude/.engineering/DECISIONS.md — UPDATE (                                                   │
│ - .claude/.engineering/SESSION_MEMORY.md — UPDATE (append 2 lessons)                                                         │
│ - .claude/.engineering/GLOSSARY.md — UPDATE (append 5 terms)                                                                 │
│ - .claude/.engineering/README.md — UPDATE (1 l                                                   │
│                                                                                                                              │
│ ---                                                                                                                          │
│ Verification                                                                                     │
│                                                                                                                              │
│ After implementation:                                                                            │
│ 1. Open .claude/.engineering/RAG_STRATEGY.md — should give a clear answer to "which RAG                                      │
│ patterns should we invest in?" without reading the full trends document                                                      │
│ 2. Open DECISIONS.md D.15 — should explicitly prevent a future session from pursuing                                         │
│ AST-based code chunking without a deliberate reversal of the decision                                                        │
│ 3. Open SESSION_MEMORY.md — the code RAG lessont warning                                         │
│ 4. The four .engineering files together should make the answer to the user's original                                        │
│ question self-evident to any future session th