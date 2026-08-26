# Knowledge Hub RAG

A private, self-hosted AI knowledge assistant. Connect any documentation portal, Confluence space,
or uploaded documents — then ask questions and get answers grounded in your actual content.

**Privacy:** All data stays on your machine. No documents, embeddings, or queries are sent
externally unless you opt into cloud LLM or cloud embeddings in the setup wizard.

---

## What it does

- **Crawls** Auth0/Microsoft SSO-protected documentation portals (Playwright, persistent session)
- **Connects** to Confluence via API token or OAuth 2.0
- **Accepts uploads**: PDF, DOCX, TXT, Markdown, HTML, ZIP
- **Indexes** content locally with semantic embeddings (nomic-embed-text via Ollama)
- **Searches** with hybrid BM25 + cosine + Reciprocal Rank Fusion
- **Chats** via streaming AI responses grounded in retrieved context
- **Guards** against hallucination via a dual confidence gate (rejects out-of-scope questions)
- **Ships** as a Windows `.exe` via Electron with a multi-step setup wizard

---

## Quick start

### Prerequisites

1. **Node.js 18+** — [nodejs.org](https://nodejs.org)
2. **Ollama** — [ollama.com](https://ollama.com)

```bash
# Install and pull models
ollama pull qwen2.5:3b          # recommended LLM (~3.5 GB)
ollama pull nomic-embed-text    # embedder (~274 MB)
```

### Install and launch

```bash
npm install
npm run electron        # opens the setup wizard
```

The wizard walks through:
1. App name
2. Source type (portal / Confluence / upload-only)
3. Auth configuration (Auth0, Microsoft SSO, or none)
4. LLM selection (Ollama / Claude / vLLM)
5. Build (crawl + ingest)

After setup, the chat UI opens automatically at `http://localhost:3000`.

---

## Running without Electron

```bash
# Server mode (browser at http://localhost:3000)
npm run server

# CLI pipeline
npm run crawl                   # crawl configured portal
npm run crawl:incremental       # only re-crawl changed pages
npm run ingest                  # embed + index
npm run ingest:incremental      # only re-embed changed files
npm run sync                    # incremental crawl + ingest together
npm run ingest -- --force       # wipe index, rebuild from scratch

# Confluence
npm run confluence:fetch
npm run confluence:fetch:incremental

# Debug tools
npm run diagnose "your question"
npm run inspect docs/<section>/<file>.html
npm run eval -- --summary
npm run eval -- --blocked       # show unanswered questions (doc gaps)
```

---

## Features

| Feature | Detail |
|---|---|
| **Semantic search** | nomic-embed-text (768d), Ollama-local |
| **Keyword search** | BM25 (k1=1.5, b=0.75) |
| **Hybrid fusion** | Reciprocal Rank Fusion, configurable weight |
| **Hallucination guard** | Dual confidence gate — no LLM call if gate fails |
| **Streaming** | Token-by-token SSE from Ollama / Claude |
| **Session memory** | Multi-turn, persists across restarts |
| **Incremental sync** | MD5-based, only re-indexes changed content |
| **Analytics** | Query success rate, top unanswered questions |
| **Chunk Explorer** | Inspect retrieved chunks, pin for next query |
| **Upload** | PDF / DOCX / TXT / MD / HTML / ZIP |
| **Confluence** | API token + OAuth 2.0 |
| **Licensing** | Free / Pro / Lifetime tiers with usage gates |

---

## LLM options

| Provider | Config | Notes |
|---|---|---|
| Ollama (default) | `OLLAMA_MODEL=qwen2.5:3b` | Local, free, ~15s on CPU |
| Claude API | `LLM_PROVIDER=claude` | Fastest quality, requires API key |
| vLLM | `LLM_PROVIDER=vllm` + `VLLM_URL=...` | Any OpenAI-compatible endpoint |

Switch in the wizard (Step 4) or in `data/app_config.json`. No re-indexing needed.

---

## File layout

```
knowledge-hub-rag/
├── electron.js                 ← Desktop shell
├── src/
│   ├── crawler/crawl.js        ← Playwright crawler
│   ├── ingestion/              ← Cleaner, embedder, pipeline
│   ├── vectorstore/store.js    ← BM25 + cosine + RRF, per-section shards
│   ├── rag/query.js            ← Retrieval + streaming LLM
│   ├── api/server.js           ← Express REST API
│   ├── config/config.js        ← app_config.json R/W
│   ├── integrations/           ← Confluence client + OAuth
│   └── license/license.js      ← Tier system + usage gates
├── public/                     ← Chat UI + setup wizard
├── docs/                       ← Crawled HTML (git-ignored)
├── data/                       ← Vectors + sessions + config (git-ignored)
└── project-docs/               ← Session logs + roadmaps
```

---

## Troubleshooting

**"Ollama is not running"**
→ Run `ollama serve` in a terminal and keep it open.

**"model not found"**
→ `ollama pull qwen2.5:3b` (or whichever model is configured).

**"0 chunks indexed"**
→ Run `npm run ingest`. Make sure `docs/` has HTML files from the crawler first.

**Slow answers (~15-25s)**
→ Normal on CPU. Switch to `phi3:mini` (faster) or Claude API (fastest).

**MFA keeps triggering on crawl**
→ After first successful login, session is cached in `user_data/`. If it expires, delete
`user_data/` and log in fresh.

**Answer is wrong / hallucinated**
→ Run `npm run diagnose "your question"` — shows exact scores, gate check, and which chunks
would reach the LLM.

**"Query limit reached" on Free tier**
→ 200 queries/month. Activate a Pro or Lifetime key in the license modal.

---

## Architecture summary

```
Source → Playwright/Confluence/Upload
  → cleaner.js (HTML → markdown chunks)
  → nomic-embed-text (semantic 768d vectors)
  → per-section JSON shards (data/vectors_<section>.json)
  → BM25 + cosine + RRF hybrid search
  → dual confidence gate (hallucination prevention)
  → streaming LLM response (SSE)
  → browser chat UI
```

See `ARCHITECTURE.md` for the full technical diagram.
See `DECISIONS.md` for every design decision and rationale.
See `project-docs/session-log.md` for the full development history.
