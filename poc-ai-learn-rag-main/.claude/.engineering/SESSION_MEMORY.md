# Session Memory

Permanent engineering knowledge only. No chronological logs. No raw conversation history.

---

## Anti-Pattern: The Enhancement Spiral

**Lesson:** Engineering attention defaults to minor improvements unless product strategy actively redirects it.

**Evidence:** 17 consecutive sessions delivered incremental work — retry logic, UI tweaks, chunk explorer, incremental sync, MFA handling, Confluence improvements. Each individually justified. Collectively, zero movement toward the Engineering Intelligence Platform vision.

**Root cause:** Sessions started with a bug or UX complaint, not a strategic question. Claude optimized for the immediate problem because no session-opening frame pointed higher.

**How to prevent:**
- Start every session by reading the CEO Dashboard and Next Mission before any implementation
- If a request is purely a bug fix or minor enhancement, ask: "Is this the highest ROI use of this session?"
- Escalate to product strategy if three consecutive sessions produce no capability advancement

---

## Discovery: Confidence Gate Is a Trust Asset

**Lesson:** The "I don't know" response is the product's most important feature, not a limitation.

**Evidence:** Users consistently cited hallucination prevention as the reason they trusted the system over general-purpose LLMs. Every time we considered loosening the confidence threshold to improve answer rate, users pushed back.

**Strengthened by customer personas:** For regulated professionals — a doctor recalling a treatment decision, a lawyer checking case precedent, a financial advisor citing compliance rules — a hallucinated confident answer is not just a trust failure. It is a professional liability event. The confidence gate is not a retrieval quality problem to solve. It is a professional safety guarantee that must hold regardless of answer rate pressure.

**Constraint:** Never treat low answer rate as a bug. Treat it as a signal that the underlying documentation needs improvement.

---

## Rule: Mission Completion Requires Product Owner Sign-off

**Rule:** Before updating any progress doc to mark a mission complete:
1. Answer these four questions yourself with concrete assessments — do not just list them:
   - Is this actually solving the problem? (assess whether the feature addresses the stated pain)
   - Is it enough? (assess whether v1 scope is sufficient or needs more)
   - Does it really add value? (assess measurable customer benefit)
   - Is it readable and actionable at scale? (assess UX at realistic data volumes)
2. Present your answers to the product owner for judgment.
3. Create a product doc in `project-docs/features/<FEATURE_NAME>.md` with: what it is, how it works, examples of good/bad inputs, limitations, and how to act on it. The doc must end with a **## Mission Completion Assessment** section containing Claude's concrete answers to the four questions. This section serves as a permanent record — future sessions can read it to understand what was known, assumed, and left unresolved at ship time.

**Why:** Shipping code and completing a mission are different things. Presenting empty questions to the product owner transfers the thinking burden back to them — Claude should do the analysis, humans should do the judgment.

**Failure mode observed:** Decision Graph was marked complete after code shipped without asking the product owner whether it produced useful results. It didn't. Two sessions wasted on progress docs that weren't earned.

---

## Pattern: Signal vs Noise Threshold Is the Feature

**Lesson:** Showing all data is not intelligence. The threshold that filters noise *is* the product decision.

**Evidence:** Organizational Memory v0 showed every answered query as a cluster — technically correct, but unreadable and unactionable at scale. The feature only became useful when a minimum frequency threshold (3+ asks) was applied, transforming a query dump into a list of genuine recurring needs.

**Rule to apply to every future intelligence feature:** Before shipping, ask "what would this look like with 10,000 entries?" If the answer is noise, the threshold logic is the missing feature — not the display.

---

## Pattern: Intelligence Layer Built on eval.jsonl

**Lesson:** `eval.jsonl` is the foundation of the entire intelligence layer — it records every query, score, section used, and blocked status. New intelligence features cost near-zero to build because the data is already there.

**Evidence:** Documentation Gap Intelligence, soft-block detection, and Organizational Memory were all built without schema changes, new data sources, or new infrastructure. All three read the same flat file.

**Pattern to reuse:** Every future intelligence feature (Documentation Health Score, Decision Graph analytics) should start by asking "what is already in eval.jsonl?" before adding new data collection.

---

## Discovery: Soft-Block Gap — LLM Deflections Are Invisible to the Confidence Gate

**Lesson:** The confidence gate only catches queries where retrieval scores are low. It misses a second failure mode: queries where retrieval scores pass, but the LLM correctly identifies the content is irrelevant and says "I can't find this."

**Evidence:** "What is the temperature in Jalgaon today?" passed the gate (matched "temperature" in LLM docs) but the LLM responded with a deflection. Logged as `blocked: false` — invisible to gap analytics.

**Fix applied:** Post-LLM response check via `DEFLECTION_PATTERNS` regex in `src/rag/query.js`. Deflections now log `blocked: true, softBlocked: true`.

**Constraint:** Deflection patterns must stay conservative. Over-matching creates false gaps for legitimate partial answers.

---

## Discovery: Zero-Infrastructure Is a Distribution Moat

**Lesson:** The Electron `.exe` + local Ollama setup removes the single biggest barrier to adoption across two different user types.

**Evidence (engineering teams):** No firewall exceptions, no cloud accounts, no data governance review. Engineers installed it the same day they heard about it.

**Evidence (regulated professionals):** Doctors, lawyers, and consultants cannot run `npm start`. They have no terminal, no Node.js, no package manager. The Electron `.exe` is not a convenience — it is the only installation path that works for non-technical professional users. Without it, the regulated professional market is entirely unreachable regardless of product quality.

**Constraint:** Any feature that requires external infrastructure (cloud DB, hosted API required for core functionality) must be approved as a product tier decision, not an engineering choice.

---

## Pattern: IDS Visibility Converts a Metric Into a Moat

**Lesson:** An intelligence score that users cannot see does not create switching cost. Once it's visible — with a trend line, a moat threshold marker, and delta KPIs — users develop an emotional relationship with their score. They don't want to lose it.

**Evidence:** IDS was computed for several sessions but never shown to users. The Intelligence Dashboard session made it the centerpiece. The moat principle became tangible: users can now watch their score compound from first upload (~12) toward the threshold (70).

**Pattern:** Every key platform metric should be visible to users with: (1) current value, (2) trend direction, (3) a named threshold to work toward. The threshold is the hook — it turns a number into a goal.

---

## Pattern: Server-Side Filtering Keeps Intelligence Dimensions Coherent

**Lesson:** When multiple dimensions (topics, gaps, risk, memory) must respond to the same filter state, apply filters server-side before any dimension computation — not client-side after.

**Evidence:** Dashboard Filters passes all 5 filter dimensions as query params to `/api/insights`. The server filters `eval.jsonl` once and all 4 dimensions derive from the filtered set. Client-side filtering would require passing filter state to 4 separate hooks and keeping them synchronized.

**Rule:** Any time 2+ intelligence dimensions must be filtered together, server-side is correct. Client-side filtering is only correct when filtering display data that doesn't change computed values.

---

## Lesson: Dead States Are Created by Missing Conditional Branches

**Lesson:** "Nothing shows" bugs are almost always caused by an off-by-one in a conditional — the true case and false case don't cover all possible states.

**Evidence:** Snapshot trend banner showed when `snapshots.length >= 2`. Snapshot prompt showed when `snapshots.length === 0`. With exactly 1 snapshot, neither branch triggered — complete silence in the UI, and no button to create a second snapshot.

**Fix pattern:** After writing a conditional UI, enumerate all possible states explicitly: 0, 1, 2, 2+. Write the branch for each. The edge case is always the middle value.

---

## Lesson: Code-Aware RAG Is the Wrong Track for Knowledge Hub

**Lesson:** RAG for code repositories (AST chunking, function call graphs, code graph traversal) is a code intelligence product competing with Cursor and GitHub Copilot — not an organizational memory product. Conflating the two leads to wasted engineering effort in a category we cannot win.

**Evidence:** A full RAG trends analysis (August 2026) surfaced "code-aware RAG" as a 2026 trend, including AST-based chunking, function call graph augmentation, and three-layer code indexes. Initially framed as relevant to Knowledge Hub's engineering beachhead. On examination against the customer strategy and GTM playbook, this was wrong. Sarah (Head of Engineering) needs "why did we make this architectural decision?" — the answer lives in a PDF ADR or Confluence page, not in the code's AST. Aarav (IT consultant), Anjali (CA/Doctor), and Marcus (lawyer) — the actual first customers — have no code traversal need at all.

**The distinction that matters:** Indexing code files as documents is correct and appropriate. Treating code as a traversable structural graph requiring AST analysis is code intelligence, not organizational memory. The GTM playbook explicitly names "engineering intelligence platform" as a dangerous label (Jellyfish/LinearB territory). The Founders Compass states: "Not a better code generator. We do not compete here."

**Rule:** Before pursuing any RAG pattern, ask: "Which paying customer persona does this directly improve, and is it in the document intelligence layer or the code intelligence layer?" If code intelligence, stop and re-route to product strategy. See DECISIONS.md D.15.

---

## Lesson: RAG Strategy Must Map to Customer Segment First, Technology Second

**Lesson:** RAG is a landscape of 20+ distinct patterns (Agentic, GraphRAG, Multimodal, CRAG, HyDE, AST-chunking, etc.). Not all are relevant to Knowledge Hub. Evaluating RAG patterns by industry trendiness rather than by which customer segment they improve leads to misaligned engineering effort.

**Evidence:** A comprehensive RAG trends document correctly identified that Agentic RAG, GraphRAG, Multimodal, and code-aware RAG are all 2026 trends. For Knowledge Hub's actual customer base — regulated professionals querying professional documents — the relevance map looks very different from the general industry map.

**The correct relevance map for Knowledge Hub:**
- **Critical now:** Contextual chunk enrichment (67% failure reduction, wraps existing system)
- **Critical now:** RAGAS evaluation pipeline (every future change becomes measurable)
- **High priority:** Cross-encoder reranking (precision-over-recall mandate for regulated professionals)
- **High priority:** Multimodal RAG for professional documents (PDFs with charts, tables, medical imaging)
- **Future:** GraphRAG for enterprise legal/medical (rich entity graphs in case law and clinical records)
- **Future:** Agentic/multi-hop RAG for complex professional queries
- **Out of scope:** Code-aware RAG, AST chunking, code graph traversal

**Rule:** When a new RAG capability is proposed, start with: "Which of our customer personas — Aarav, Anjali, Marcus, Sarah — does this directly improve? What specific query does it make answerable that currently fails?" If the answer isn't immediate, the capability is not a current priority.

---

## Lesson: Documentation Debt Accumulates Silently and Compounds

**Lesson:** When shipping moves faster than documentation, future sessions start with an incorrect model of the platform's current state — leading to wrong architectural decisions, missed reuse opportunities, and re-explaining context the documents should have captured.

**Evidence:** Multiple features shipped across 3+ sessions were not reflected in `03_CURRENT_STATE.md`, `05_WORK_QUEUE.md`, `06_PROGRESS.md`, `07_FEATURE_BACKLOG.md`, or `08_WEEKLY_REVIEW.md`. A full session was required to restore context.

**Rule:** Documentation is part of the definition of done. After every Build session: update `CURRENT_STATE.md` (add capability), `PROGRESS.md` (add to Completed, update version), `WORK_QUEUE.md` (move from NOW to COMPLETED), and create `project-docs/features/<FEATURE>.md`. This is not optional cleanup — it is what makes the next session possible.
