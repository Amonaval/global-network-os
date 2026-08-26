# Engineering Copilot

*Shipped: 2026-08-21*

---

## What It Is

Engineering Copilot is the transition from "knowledge tool I search" to "engineering partner I open at session start."

Phase 1 is an **Implementation Plan Generator**. Given a one-line feature spec, it reads both the uploaded codebase and the documentation knowledge base, then streams back a five-section structured plan — before any code is written.

The core problem it solves: code generation fails because generation happens before understanding. The model receives semantic fragments and imitates them. The Copilot inserts a mandatory reasoning step between "I want to build X" and "here is the code for X."

---

## How It Works

**Input:** A feature spec — one sentence or a short paragraph describing what to build or change.

**Retrieval:** Queries the full vector store (both `uploads` section for code AND all documentation sections for decisions, runbooks, ADRs). Uses 80 chunks at TOP_K, 25,000 token context budget, MIN_SCORE 0.04 — wider than codegen because decisions live in docs, not code.

**Planning prompt:** The system prompt forbids code generation. It instructs the model to produce exactly five sections, referencing only identifiers that appear in the provided context.

**Output:** Five structured sections streamed in real time:

1. **Affected Modules** — files to CREATE or MODIFY with one-line rationale each
2. **Reuse Opportunities** — existing functions/patterns/abstractions that must not be reimplemented
3. **Implementation Order** — numbered steps from lowest layer (data/API) to highest (UI)
4. **Decision References** — relevant architectural decisions with their constraints
5. **Flagged Risks** — unknowns, gaps, or potential breakage the developer should resolve before coding

**Handoff:** "Generate Code →" button passes the spec directly to BuildPanel, so the builder can move from plan to code generation in one click.

---

## Files Shipped

| File | Purpose |
|---|---|
| `src/rag/copilot.js` | Backend module — retrieval + streaming + plan prompt |
| `src/api/server.js` | `POST /api/copilot/plan` route (SSE streaming) |
| `frontend/src/components/chat/CopilotPanel.tsx` | Copilot UI — spec input, streamed plan, → Build button |
| `frontend/src/store/appStore.ts` | `ActivePanel` type extended with `'copilot'` |
| `frontend/src/App.tsx` | 🧭 Copilot added as 3rd primary nav tab; panel wired |
| `data/copilot_log.jsonl` | Audit log (spec, chunks used, latency) — auto-created |

---

## Differences from Build (Code Generation)

| | Copilot | Build |
|---|---|---|
| Output | Structured plan (markdown) | Code |
| Context | Code + documentation | Code only (default) |
| Temperature | 0.1 (deterministic reasoning) | 0.2 |
| Purpose | Understand before building | Generate after understanding |
| When to use | Start of every engineering session | After Copilot plan is ready |

---

## Mission Completion Assessment

**Did we solve the right problem?** Yes. The platform already has code generation. The missing step was structured reasoning before generation — the plan that makes generated code fit the architecture rather than invent a new one.

**Is there a larger opportunity?** Phase 2 (PR Summary) and Phase 3 (Session Kickoff) extend the same copilot infrastructure toward full session-level participation. The Copilot is the entry point to a daily habit; the plan generator is the first reason to open it.

**Does this strengthen the MOAT?** Yes. The plan output references real decisions and real file inventory from the user's own knowledge base. A new tool cannot reproduce that context. The more the codebase and docs grow, the more grounded the plans become.
