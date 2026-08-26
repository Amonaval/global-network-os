# Knowledge Hub RAG — Complete Strategic Briefing for AI Assistants

> **Purpose:** Feed this document to any AI assistant (Claude, GPT-4o, Gemini, etc.) to get
> high-quality strategic, product, and technical advice without re-explaining the project from scratch.
> This is a living document. Update it when major decisions change.

---

## What This Project Is

**Knowledge Hub RAG** is a self-hosted, desktop-first AI assistant that crawls private documentation
portals, builds a local knowledge base, and answers questions grounded in those docs —
without sending any data to external services.

**One-sentence pitch:** "ChatGPT for your internal docs, running entirely on your laptop."

**Distribution:** Ships as a Windows `.exe` (Electron). A five-step setup wizard handles
configuration. No terminal required for end users.

**Privacy guarantee:** All documents, embeddings, queries, and answers stay on the user's machine.
Cloud LLM/embedding providers are optional opt-in.

**Tech stack (current):**
- Runtime: Node.js (CommonJS)
- Desktop shell: Electron 43
- Crawler: Playwright (auth-aware, handles Auth0/Microsoft SSO)
- Embeddings: `nomic-embed-text` via Ollama (local, 768-dimensional)
- LLM: Ollama (default: `qwen2.5:3b`), vLLM/OpenAI-compatible also supported
- Vector store: custom JSON-based per-section shards with BM25 + cosine + RRF
- API: Express REST + SSE streaming
- Frontend: Vanilla JS SPA (React 19 migration in progress)
- Payments: stub only (Lemon Squeezy planned)

**Tech stack (Phase 2 target):**
TypeScript · Vite + React 19 + Zustand + TanStack Query · LanceDB · Lemon Squeezy ·
Vercel Edge Function for license API · Docker + Railway (server mode)

---

## Technical Architecture (Current)

### Ingestion Pipeline

```
Source (HTML/PDF/DOCX/MD)
  → cleaner.js     : HTML → markdown, table-aware, removes boilerplate
  → cleaner.js     : Overlapping chunk splitting (400 tokens, 50 overlap)
  → embedder.js    : nomic-embed-text via Ollama (768d, 1 chunk at a time)
  → store.js       : Upsert into data/vectors_<section>.json
  → ingest_meta.json: Records provider + dims
```

**Incremental mode:** MD5 hashes in `data/ingest_hashes.json`. Unchanged files skip entirely.

**Nomic limit:** 20,000 chars max per embed call. Chunks that fail get a zero-vector, logged to
`data/skipped_chunks.log`, excluded from search.

### Retrieval Engine (Hybrid Search)

Three signals fused via Reciprocal Rank Fusion:

1. **Cosine similarity** on nomic embeddings (semantic meaning, 768d)
2. **BM25** keyword frequency scoring (`k1=1.5`, `b=0.75`)
3. **RRF:** `score = Σ 1/(60 + rank)`, weighted by `HYBRID_WEIGHT` (default 0.5)

`store.setQuery(queryText)` must be called before `store.search()` to prime BM25.

### Confidence Gate (Anti-Hallucination)

```
passesGate = (semScore >= 0.15)
          OR (rrfScore >= 0.014 AND semScore >= 0.05)
```

If gate fails: return "not found" message + suggest sections where related content was found
(soft suggestions based on top-scoring section even below gate). **The LLM is never called
if the gate fails.**

### Context Compression (Before LLM Call)

1. Drop chunks below `MIN_CHUNK_SCORE` on semantic score
2. Trigram Jaccard dedup (>55% overlap → keep higher-scored chunk)
3. Greedy budget fill up to `CTX_TOKEN_BUDGET` tokens

### Query Expansion

LLM generates 2 rephrased versions of the question. Retrieval runs for all 3 versions,
results are deduplicated and re-sorted. Falls back silently if LLM is unavailable.

### Session Memory

Clean Q&A pairs sent to LLM:
```json
[
  {"role": "user",      "content": "How do I reset 2FA?"},
  {"role": "assistant", "content": "Navigate to Admin → Users…"},
  ...
]
```
No raw context blobs re-injected. Sessions persist in `data/sessions.json`.

### Streaming

SSE at `POST /api/chat/stream`. Events: `{type:"token",message:"word"}` then
`{type:"done",message:{sources:[…],debug:{…},sessionId:"…"}}`.

Build pipeline (crawl + ingest) also streams progress via SSE to the setup wizard.

---

## Features Built (Complete Inventory)

### Source Connectors
- **Web portal crawl** via Playwright (generic, any structure)
  - Auth0 / Microsoft 365 / form-based login supported
  - `.article-next` button traversal (depth-first, all sub-pages)
  - Upload-only mode: leave portal URL blank, valid config
- **Confluence** (REST API v2)
  - Auth: API token (Basic) OR OAuth 2.0 (3-legged Atlassian flow)
  - `body-format=export_view` (rendered HTML)
  - Saves to `docs/confluence-<spacekey>/`
- **Document upload** (PDF, DOCX, TXT, MD, HTML, ZIP)
  - Processed inline via SSE progress stream
  - Tracked in `data/upload_index.json`

### Indexing
- Per-section JSON sharding (`vectors_<section>.json`)
- Hybrid BM25 + semantic + RRF
- Incremental re-ingest (MD5 hash comparison)
- Auto-migration from legacy single `vectors.json`

### RAG Quality
- Dual confidence gate (prevents all hallucination)
- Context compression (dedup + budget fill)
- Query expansion (3 search angles via LLM)
- Smart "not found" with section suggestions

### UI Features (Chat App)
- SSE streaming responses with blinking cursor
- Source chips (clickable) per answer
- Follow-up question suggestions (3 per answer)
- Debug line (chunks used, tokens, latency, dropped count)
- Out-of-scope badge when confidence gate fires
- Session history sidebar (last 40 sessions, restorable)
- Chunk Explorer tab (BM25/semantic/RRF scores visible)
- Pinning (pin chunks from Explorer → used for next query)
- Analytics panel (query stats from `eval.jsonl`)
- Upload panel (drag-drop, SSE progress)
- License modal (tier info, usage bars, plan cards)
- Settings dropdown: Reconfigure / Rebuild / Reset
- 3-zone sidebar footer: stats / actions / license badge

### Licensing System
- **Free tier:** 200 queries/month, 5 uploads, no Confluence, no Analytics
- **Pro:** $19/month — unlimited everything
- **Lifetime:** $299 one-time — unlimited, offline activation
- License key format: `XXXX-XXXX-XXXX-XXXX` (alphanumeric)
- Offline mode: `LTM-`/`LIFE-` prefix = Lifetime; else = Pro
- Machine ID: `sha256(hostname + platform + cpu).slice(0,32)`
- Query gate cache: 60 seconds (avoids full `eval.jsonl` scan per request)

### Developer/Admin Tools
- `npm run diagnose "question"` — retrieval debugger (shows raw scores)
- `npm run inspect docs/<file>.html` — HTML → extracted text viewer
- `npm run eval -- --summary` — query analytics CLI
- `npm run eval -- --blocked` — shows unanswered questions (doc gaps)

---

## Business Model

### Current (Phase 1)

| Tier | Price | Limits | Who |
|------|-------|--------|-----|
| Free | $0 | 200 queries/mo, 5 uploads | Individual try-before-buy |
| Pro | $19/month | Unlimited | Power users |
| Lifetime | $299 once | Unlimited | Early adopters, price-sensitive |

**Payment:** Not yet wired. Stripe stubs exist. **Lemon Squeezy is the planned provider**
(Merchant of Record — handles VAT, license keys, dunning; `license_key_created` webhook
maps directly to existing `activateLicense()` function).

### Planned (Phase 2)

| Tier | Price | Notes |
|------|-------|-------|
| Team SaaS | $49/seat/month | Shared knowledge base, role-based access, cloud sync |
| Enterprise | Custom | SOC 2 path, SSO, dedicated support |

### Revenue Projections (Back-of-Envelope)

- 1,000 free → 5% convert = 50 Pro users × $19 = **$950 MRR**
- Team SaaS at 20 teams × 5 seats × $49 = **$4,900 MRR**
- Path to $10k MRR: ~210 Pro users OR ~40 Team subscriptions

---

## Market Context

### Problem Size
- Knowledge workers spend 2.5 hours/day searching for information (IDC)
- 85% of enterprise employees can't find what they need with current tools
- Enterprise knowledge management market: $47B by 2030, 12% CAGR

### Existing Solutions and Why They Fail

| Solution | Problem |
|----------|---------|
| ChatGPT / Claude | Doesn't know private docs. Hallucinations on internal content. |
| Notion AI, Confluence AI | Only works within their own product. No cross-source. |
| Glean | Enterprise-only. $50k+/year. 6-month implementation. |
| Guru, Tettra | Knowledge base tools, not AI. Still manual curation. |
| Perplexity for Teams | Cloud-based. Private docs = data egress problem. |
| Open-source RAG (LangChain) | No confidence gate → hallucinations. Complex setup. |

### Our Positioning

"Private AI for your documentation" — the intersection of:
- **Local-first** (vs. cloud-based tools that can't handle private docs)
- **AI-native** (vs. search tools that return links, not answers)
- **Zero-infrastructure** (vs. enterprise tools that require DevOps teams)

### Ideal Customer Profile (ICP)

**Primary:** Individual developer or DevOps engineer at a company with:
- 10–500 employees
- Active Confluence or internal documentation portal
- A real documentation problem (onboarding time, runbook search, support queries)
- Privacy or compliance constraints that make cloud AI unsuitable

**Secondary:** Compliance/legal teams with offline document review requirements.

**Tertiary:** Customer success teams at software companies with complex products.

---

## Constraints and Principles

### Hard Technical Constraints
- **No C++ native builds** — `node-gyp` doesn't work reliably on Windows; no `better-sqlite3`,
  no `tiktoken`. All deps must be pure JavaScript or have prebuilt Windows binaries.
- **Playwright must work** — the auth-aware crawler is a core differentiator; Tauri is out.
- **Single-binary distribution** — Electron `.exe` is the target; Docker optional but secondary.

### Product Principles (non-negotiable)
- **Privacy by default** — nothing external unless user opts in
- **No hallucination** — confidence gate always runs before LLM
- **Clean Q&A history** — no context blobs re-injected to LLM
- **Custom BM25 + RRF** — do NOT adopt LangChain (bypasses gate + uses semantic-only)
- **Factory pattern** — `getVectorStore()` / `getEmbedder()` abstract backend; migrations slot in

### What NOT to Adopt
- **LangChain.js** — fights the confidence gate and BM25+RRF; calls LLM unconditionally
- **Next.js** — SSR is irrelevant for a desktop auth-gated chat UI
- **Tauri** — Playwright won't work; breaks server-mode portability
- **better-sqlite3** — node-gyp / C++ on Windows
- **Qdrant, Chroma** — no embedded JS mode or native build problems on Windows

---

## Current State (As of 2026-07-31)

### Completed
All features listed in "Features Built" above are working in production.

### In Progress
- **React 19 frontend** migration started: `frontend/` directory, Vite config, Zustand store
  scaffolded. `npm run dev:all` starts both Vite (5173) and Express (3000) together.
  CSS bundling through Vite (no proxy dependency). Plan exists at
  `.claude/plans/how-electron-works-peppy-dawn.md`.

### Immediate Next (Phase 2 Start)
1. Complete React frontend (chat UI, then setup wizard)
2. Wire Lemon Squeezy + Vercel Edge Function for license API
3. Add Vitest tests for `compressContext()`, `BM25.scores()`, `chunkText()`
4. Zod `AppConfigSchema` runtime validation on config load
5. ESLint + Prettier

### Phase 2 (Medium-term)
- LanceDB adapter (when any install exceeds 20k chunks)
- macOS + Linux support
- Team sharing + role-based access
- Docker deployment mode
- Answer feedback (👍/👎) logged to `eval.jsonl`
- Inline citations `[1]` `[2]` in answers

---

## Open Questions for Strategic Advice

Use these questions to prompt an LLM for targeted advice:

### Go-to-Market
1. What is the fastest path to 100 paying customers for a developer tool with no marketing budget?
   What channels (HN, GitHub, Product Hunt, dev communities) work best and in what sequence?
2. Should we launch as a "private" tool (no public GitHub, waitlist) or go fully open-source
   to drive adoption? What are the trade-offs for this type of tool?
3. The free tier drives adoption but delays revenue. Should the free limit be 200 queries/month
   or something else (e.g., 50 queries, 1 section, time-limited trial)?

### Pricing
4. Is $19/month the right Pro price? What do comparable self-hosted developer tools charge?
   Would $29/month hurt conversion significantly?
5. The Lifetime plan at $299 is popular with early adopters but cannibalizes recurring revenue.
   At what MRR should we remove or phase out the Lifetime option?
6. What feature would make an enterprise team pay $500+/month? (SSO integration? Audit logs?
   API access? Multi-user shared index?)

### Product Priorities
7. What is the single feature most likely to move someone from "interesting demo" to
   "can't work without this"? (Answer citations? Slack bot? Scheduled re-indexing?)
8. How important is cross-platform support (macOS, Linux) before Team SaaS? Many DevOps
   engineers use macOS. Does Windows-only kill the ICP?
9. Should we build a "smart sync" feature (file watcher + auto re-index on change) before
   or after the Team SaaS tier?

### Technical Strategy
10. At what chunk count does the JSON vector store become a real problem? (We estimate 20k
    chunks = ~80MB file, ~200ms search latency). Is that actually where LanceDB migration
    becomes urgent, or should we migrate sooner for other reasons?
11. The hybrid BM25 + semantic + RRF approach is genuinely differentiating. How should we
    communicate this technically vs. competitively? Does "better retrieval" resonate with buyers?
12. Cross-encoder re-ranking (e.g., `ms-marco-MiniLM`) would improve answer quality. At
    what latency cost is this worth adding? What's the right threshold?

### Competition and Positioning
13. Who are the most dangerous near-term competitors? Is there an open-source project likely
    to add an auth-aware crawler and confidence gate, eliminating our moat?
14. Between "Private AI for documentation" and "Documentation that answers questions" —
    which framing resonates more with the ICP (developers, DevOps)? Should we lean into
    the privacy angle or the productivity angle?
15. If a larger company (Notion, Atlassian, Linear) adds AI chat to their product, how
    does this tool differentiate? (Multi-source, privacy, Windows desktop, non-SaaS pricing?)

### Risks
16. What are the top 3 risks to this project succeeding as a business?
17. How dependent is the value proposition on Ollama + local LLMs? If OpenAI's pricing
    drops further, does the local-first angle matter less?
18. The Playwright crawler is a genuine technical differentiator but also a maintenance burden
    (sites update their auth flows). How do we manage this sustainably?

### Adjacent Opportunities
19. Are there adjacent products that could be built on this infrastructure?
    (e.g., "Documentation gap detector", "Onboarding assistant", "Changelog summarizer")
20. Should this eventually become an API product (REST/SDK) that other developers embed
    into their tools? What would the developer experience look like?

---

## Key Files for Technical Context

| File | What it contains |
|------|-----------------|
| `CLAUDE.md` | Full project overview, architecture, decisions, tech stack |
| `ARCHITECTURE.md` | Deep technical detail on all components |
| `DECISIONS.md` | Every design decision with rationale |
| `KNOWN_ISSUES.md` | Bugs found, fixes applied, current status |
| `project-docs/session-log.md` | Full 12-session build history |
| `src/vectorstore/store.js` | BM25 + cosine + RRF implementation |
| `src/rag/query.js` | Retrieval engine, confidence gate, LLM call |
| `src/api/server.js` | Express REST API, all endpoints |
| `src/config/config.js` | Config R/W, `configToEnv()` factory |
| `src/license/license.js` | Tier system, activation, usage gates |

---

## How to Use This Document

**For product advice:** Share sections "What This Project Is", "Market Context",
"Business Model", and the relevant "Open Questions".

**For technical advice:** Share sections "Technical Architecture", "Constraints and Principles",
and the relevant "Open Questions".

**For competitive analysis:** Share "Market Context", "What This Project Is",
and "Open Questions 13–15".

**For roadmap prioritization:** Share "Current State", "Business Model",
"Open Questions 7–12", and "Features Built".
