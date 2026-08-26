# Deployment

How to run, configure, and distribute Knowledge Hub.

---

## Prerequisites

| Dependency | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Ollama | Latest | Local LLM + embeddings |

### Required Ollama models
```bash
ollama pull qwen2.5:3b         # default LLM
ollama pull nomic-embed-text   # embeddings (768d)
```

---

## Running in CLI Mode

```bash
npm run server                 # start the API server (http://localhost:3000)
npm run crawl                  # full crawl
npm run crawl:incremental      # skip unchanged pages
npm run ingest                 # ingest all crawled content
npm run ingest:incremental     # skip unchanged content
npm run ingest -- --force      # force re-ingest everything
npm run sync                   # incremental Confluence sync
npm run confluence:fetch       # fetch Confluence pages
npm run diagnose               # 7-step retrieval debug
npm run inspect                # inspect vector store contents
npm run eval                   # run evaluation over stored queries
```

---

## Setup Wizard

On first run (no `data/app_config.json`), the app loads `public/setup.html`.

**5 wizard steps:**
1. **App name** — display name for this knowledge base instance
2. **Source type** — Portal (crawler), Confluence, or Uploads only
3. **Auth config** — credentials for the selected source type
4. **LLM selection** — Ollama (local), Claude API, or vLLM endpoint
5. **Build** — triggers crawl + ingest, shows live progress via SSE

Config is written to `data/app_config.json` and injected as env vars into all child processes.

---

## LLM Options

| Option | Model | Setup |
|--------|-------|-------|
| Ollama (default) | qwen2.5:3b | Pull model locally, zero API cost |
| Claude API | claude-sonnet-5 or similar | Requires `ANTHROPIC_API_KEY` in config |
| vLLM | Any OpenAI-compatible endpoint | Provide base URL + model name |

LLM selection affects only the generation step. Embeddings always use the locally configured embedder (default: Ollama nomic-embed-text).

---

## Electron Desktop App

`electron.js` at the project root is the Electron main process.

**How it works:**
1. Electron starts → reads `data/app_config.json`
2. If config missing → loads `public/setup.html` (first-run wizard)
3. If config present → spawns `src/api/server.js` as child process, loads `public/index.html`
4. All config passed to child via `configToEnv()` as environment variables
5. IPC channel available for window management (minimize, close, tray)

**Building the `.exe`:**
```bash
npm run build:electron         # produces dist/<AppName>-Setup.exe
```

The distributable is a single installer. Users need Ollama installed separately — no other dependencies.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Ollama not running | `ollama serve` in terminal |
| Model not found | `ollama pull qwen2.5:3b` and `ollama pull nomic-embed-text` |
| 0 chunks indexed | Check `AUTH_TYPE` config, run `npm run crawl` first |
| Wrong / hallucinated answers | Run `npm run diagnose` — check gate scores |
| Query limit hit (Free tier) | Upgrade to Pro or reset monthly counter |
| Slow first response | BM25 index rebuilding on startup — normal for large corpora |
| MFA blocking crawl | Use `AUTH_TYPE=browser` for manual login, then `CRAWL_MODE=prelogin` |

---

## Configuration Reference (`data/app_config.json`)

Key fields set by the wizard:

```json
{
  "APP_NAME": "My Knowledge Hub",
  "SOURCE_TYPE": "portal",
  "AUTH_TYPE": "microsoft",
  "PORTAL_URL": "https://portal.company.com",
  "LLM_PROVIDER": "ollama",
  "LLM_MODEL": "qwen2.5:3b",
  "EMBEDDER": "nomic",
  "CONFIDENCE_GATE": 0.35,
  "HYBRID_WEIGHT": 0.5
}
```
