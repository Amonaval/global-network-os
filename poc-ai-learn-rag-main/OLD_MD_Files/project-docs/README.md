# Knowledge Hub — Project Documentation Hub

> **This is the master index.** Start here every time you open a new session.
> All project history, decisions, and future work is linked from this file.

---

## Quick State (as of 2026-07-30)

| Item | Status |
|---|---|
| Core RAG app | ✅ Complete |
| Setup wizard (Electron) | ✅ Complete |
| Phase 1 enhancements | ✅ Complete |
| Phase 2 (doc upload, analytics) | 🔜 Next |
| Phase 3 (integrations) | 📋 Planned |
| Phase 4 (licensing/payments) | 📋 Planned |

The app is a **fully working Electron desktop app** that crawls any web-based documentation
portal, indexes it locally, and provides a private AI chat assistant. The setup wizard
walks through portal URL, auth, LLM, and embeddings. Everything runs locally — no data
leaves the machine.

---

## Document Index

| File | What it contains | When to read |
|---|---|---|
| **[new-session-context.md](./new-session-context.md)** | Paste this into any new Claude session to resume work | Every new conversation |
| **[session-log.md](./session-log.md)** | Chronological log: what was discussed and built, session by session | When you need history |
| **[phase1-enhancements.md](./phase1-enhancements.md)** | Deep detail of everything built in Phase 1 (streaming, rebuild UI, incremental crawl) | Before touching Phase 1 code |
| **[phase2-roadmap.md](./phase2-roadmap.md)** | Phase 2 detailed plan (doc upload, analytics, per-section store) | Before starting Phase 2 |
| **[phase3-4-roadmap.md](./phase3-4-roadmap.md)** | Phase 3 (integrations) and Phase 4 (licensing, payments) | Future planning |
| **[validation-guide.md](./validation-guide.md)** | How to test every feature end-to-end | After making changes |
| **[quick-commands.md](./quick-commands.md)** | All npm scripts and CLI commands in one place | Daily reference |

---

## Existing Core Docs (don't duplicate — read before changing)

| File | What it contains |
|---|---|
| [`CLAUDE.md`](../CLAUDE.md) | Auto-loaded project instructions for Claude Code. Complete config reference, crawler details, API endpoints. |
| [`ARCHITECTURE.md`](../ARCHITECTURE.md) | Data flow diagrams, vector store internals, search algorithm, chunk structure. |
| [`DECISIONS.md`](../DECISIONS.md) | Every design decision with rationale (D-01 through D-12). Read before changing core components. |
| [`KNOWN_ISSUES.md`](../KNOWN_ISSUES.md) | Bugs found, fixes applied, current status. |

---

## Repository Layout (key paths)

```
xyz_org-docs-rag/
├── project-docs/          ← YOU ARE HERE — session logs and roadmaps
├── src/
│   ├── crawler/crawl.js   ← Playwright crawler (--incremental added in Phase 1)
│   ├── ingestion/
│   │   ├── cleaner.js     ← HTML → markdown + chunker
│   │   ├── embedder.js    ← nomic / TF-IDF / OpenAI
│   │   └── ingest.js      ← pipeline orchestrator (--incremental added)
│   ├── vectorstore/store.js  ← JSON + BM25 + cosine + RRF
│   ├── rag/
│   │   ├── query.js       ← retrieval + LLM caller (queryStream added in Phase 1)
│   │   └── diagnose.js    ← CLI debugger
│   ├── config/config.js   ← reads/writes data/app_config.json, configToEnv()
│   └── api/server.js      ← Express REST API + SSE endpoints
├── public/
│   ├── index.html         ← Chat UI
│   ├── setup.html         ← Setup wizard
│   ├── js/app.js          ← Chat frontend (streaming sendMessage added)
│   ├── js/setup.js        ← Wizard frontend
│   └── css/app.css        ← Styles (streaming cursor + rebuild panel added)
├── scripts/
│   ├── setup.js           ← First-run setup
│   └── sync.js            ← NEW: incremental re-crawl + re-ingest from saved config
├── data/                  ← GITIGNORED — runtime data
│   ├── app_config.json    ← Wizard-saved config (portal, auth, LLM, embeddings)
│   ├── vectors.json       ← Embedded chunks (main index)
│   ├── sessions.json      ← Conversation history
│   ├── crawl_hashes.json  ← NEW: per-file MD5 hashes for incremental crawl
│   └── ingest_hashes.json ← NEW: per-file MD5 hashes for incremental ingest
├── docs/                  ← GITIGNORED — crawled HTML files
└── user_data/             ← GITIGNORED — Playwright browser session
```

---

## How to Continue in a New Session

1. Share [`new-session-context.md`](./new-session-context.md) with Claude at the start
2. Tell Claude which phase/feature you want to work on
3. After the session, Claude should **update `session-log.md`** with what was done
4. If a new phase is started, Claude should **create a new phase doc** and link it here

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| UI | Vanilla JS, HTML, CSS (no framework) |
| Server | Node.js + Express |
| Crawler | Playwright (Chromium persistent context) |
| Embeddings | nomic-embed-text via Ollama (local, 768d) |
| LLM | Ollama (qwen2.5:3b default) or Claude API |
| Vector store | JSON file + BM25 + cosine + RRF fusion |
| Desktop | Electron (packaged as .exe for Windows) |
| Config | `data/app_config.json` (wizard-written) |
