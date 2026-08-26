# Fix: Single-Command Dev + CSS Bundling

## Context
`npm run dev` starts Vite at :5173. `vite.config.mjs` proxies `/css` → Express at :3000. If Express isn't running first, every CSS request fails with `ECONNREFUSED` — layout breaks completely. Users have to remember to run two commands in two terminals. This is worse than the old single-server setup.

Two problems to solve together:
1. **CSS must not depend on Express** — bundle it into Vite output instead of proxying it
2. **Single command** to start both Express + Vite for web dev; Electron already handles this internally

## Changes

### Part A — Bundle CSS into Vite (removes `/css` proxy dependency)

**`frontend/src/main.tsx`** — add at top before App import:
```ts
import '../../public/css/app.css'
```

**`frontend/src/setup-main.tsx`** — add at top before SetupApp import:
```ts
import '../../public/css/setup.css'
```

**`frontend/index.html`** — remove `<link rel="stylesheet" href="/css/app.css">` (Vite injects the bundled CSS link automatically). Keep all Google Fonts `<link>` tags.

**`frontend/setup.html`** — remove `<link rel="stylesheet" href="/css/setup.css">` same reason.

**`vite.config.mjs`** — remove the `/css` proxy entry. Keep `/api` proxy.

### Part B — Single command for web dev

**`package.json`** — install `concurrently` as devDep and add scripts:
```json
"dev:all": "concurrently -n \"server,vite\" -c \"blue,green\" \"npm run server\" \"vite\""
```
`concurrently` labels and color-codes the two output streams in one terminal window.

No changes to `npm run electron` — Electron already spawns Express internally and loads from `frontend/dist/`. It's already a single command.

## Developer workflows after this fix

| Goal | Command |
|---|---|
| Full web dev (HMR + API) | `npm run dev:all` |
| Styled-only dev (no API) | `npm run dev` |
| Production server mode | `npm run server` |
| Electron desktop app | `npm run electron` |
| Build React bundle | `npm run build:ui` |

## Verification
1. `npm install` — picks up `concurrently`
2. `npm run build:ui` — `dist/assets/` must contain a `.css` file alongside the `.js` files
3. `npm run dev` alone (no Express) → `localhost:5173` — page must be fully styled, no ECONNREFUSED in terminal
4. `npm run dev:all` → both servers start, API calls work at `localhost:5173`
5. `npm run server` → `localhost:3000` loads React app with styles from `dist/assets/*.css`
6. `npm test` — 17/17 pass

---

# Knowledge Hub — Ideal Long-Term Tech Stack

## Context
The current app works well at its current scale but carries structural debt that will hurt in Phase 2:
a 1100-line vanilla JS file, O(n) vector JSON scanning, no type safety, zero tests, and a Stripe stub that has never been wired. This plan gives a concrete, opinionated migration path — no big-bang rewrites, incremental per-area.

Three hard constraints that shape every decision:
1. **Windows-first desktop** — no `node-gyp` / C++ native builds (killed `better-sqlite3` and `tiktoken`)
2. **Privacy guarantee** — all data on-machine by default, cloud optional
3. **Single developer** — toolchain complexity has a real cost

---

## Complete Tech Stack — Recommended Suite

| Layer | Current | **Recommended** | When |
|---|---|---|---|
| **Language** | CommonJS JS | **TypeScript** (incremental via `allowJs:true`) | Now → Phase 2 |
| **Frontend** | Vanilla JS SPA | **Vite + React 19 + Zustand + TanStack Query** | Phase 2 (setup wizard first) |
| **API layer** | Express REST (untyped) | **Express + Zod schemas** (typed req/res, shared types) | Now (Zod) |
| **Vector store** | Custom JSON + BM25 + RRF | **LanceDB** (embedded, prebuilt Windows binaries) | Phase 2 (>20k chunks) |
| **App data** | JSON files + eval.jsonl scan | **sql.js** for analytics; keep JSON for config/sessions | Phase 2 |
| **Desktop shell** | Electron (localhost Express) | **Keep Electron** — IPC + custom protocol improvements | Phase 2 |
| **LLM orchestration** | Custom `ask*Stream` functions | **Keep custom** (optionally add Vercel `ai` SDK for types) | Phase 2 |
| **Testing** | Zero tests | **Vitest** (unit) + **Supertest** (API) + **Playwright** (E2E, already in deps) | Now |
| **Package manager** | npm | **pnpm** (drop-in, faster, strict `node_modules`) | Now |
| **Linting/Format** | None | **ESLint** (flat config) + **Prettier** | Now |
| **CI/CD** | None | **GitHub Actions** (lint + test + build `.exe` on tag) | Phase 2 |
| **Payments** | Stripe stub (unfinished) | **Lemon Squeezy** (Merchant of Record — handles VAT, license keys, dunning) | Phase 2 |
| **License validation** | Offline only | **Vercel Edge Function** for `LICENSE_API_URL` | Phase 2 |
| **Auth (multi-user)** | N/A | **Clerk** (React components, Electron-compatible, 10k MAU free) | Phase 3 |
| **Cloud DB** | N/A | **Supabase** (PostgreSQL + pgvector) for cloud/multi-tenant | Phase 3 |
| **Deployment** | Electron .exe only | **Docker + Railway** for server-mode; same Express server | Phase 2 |
| **Monorepo** | Single package | **Turborepo** only when `packages/desktop` ≠ `packages/server` | Phase 3+ |

---

## Key Decisions — Rationale

### TypeScript: incremental, not a sprint
Add `tsconfig.json` with `allowJs: true, checkJs: false` and install `tsx` — zero code changes, full TypeScript toolchain available. Define types for `Chunk`, `Session`, `AppConfig`, `LicenseRecord` in `src/types/`. New files in TypeScript; existing files converted on meaningful touch. The factory patterns (`getVectorStore()`, `getEmbedder()`) map perfectly to TypeScript `interface` definitions.

### Vite + React — not Next.js
Next.js is SSR-first and creates a second server alongside Express. The selling points of Next.js (SEO, SSR) are irrelevant for a desktop auth-gated chat UI. Vite builds a `dist/` static output that Express serves identically to the current `public/` — zero server architecture change. Migration order: **setup wizard first** (most complex, benefits most from components), then chat UI, then analytics dashboard (build green-field in React with no migration cost).

State: **Zustand** for UI state (session ID, section filter, streaming status) + **TanStack Query** for server state (session list, stats, analytics). Not Redux.

### LanceDB — not Qdrant, not Chroma
- **Chroma:** Uses `hnswlib-node` (C++ native, node-gyp — same constraint that killed `better-sqlite3`)
- **Qdrant:** No embedded JS mode — requires a separate Docker/binary process
- **LanceDB:** Ships prebuilt Node.js binaries for Windows x64/macOS/Linux, embedded like SQLite, ANN indexing (IVF-PQ), stays under 20ms at 1M vectors

Migration: add `LanceDBVectorStore` class alongside `JSONVectorStore` in `src/vectorstore/store.js` — same interface, factory selects it. The custom BM25 + RRF logic stays unchanged on top of LanceDB's semantic results.

### Keep custom LLM orchestration — not LangChain.js
The confidence gate, clean Q&A history, query expansion, trigram dedup, and hybrid RRF are five deliberate algorithmic choices. LangChain's `RetrievalQAChain`: calls LLM unconditionally (bypasses gate), re-injects context blobs (violates D-10), uses semantic-only retrieval (bypasses BM25+RRF). Don't adopt it.

Optionally: add Vercel `ai` SDK to replace the three ~50-line buffer-parsing `ask*Stream` functions with typed `streamText()` calls. Zero native dependencies.

### Lemon Squeezy — not Stripe
Stripe requires you to build: webhook verification, license key generation, EU VAT compliance, customer portal, dunning emails. **Lemon Squeezy is a Merchant of Record** — provides all of this out of the box. The `license_key_created` webhook returns exactly `{key, tier, expiry}` — the fields `activateLicense()` already expects. Replace `STRIPE_*_URL` env vars with Lemon Squeezy checkout links. Replace the Stripe webhook stub with a Lemon Squeezy handler (~20 lines).

### Keep Electron — not Tauri
Playwright (the Auth0 crawler) does not work inside Tauri. The crawler is a core product differentiator. Additionally, the `mainWindow.loadURL('http://localhost:3000')` architecture means the same Express server runs in Docker for server-mode — Tauri would break this. The 150MB → 10MB bundle size win does not justify a Rust rewrite.

### sql.js — not better-sqlite3
`sql.js` is SQLite compiled to WebAssembly — pure JavaScript, no native build, no `node-gyp`. Replace `eval.jsonl` line scanning (currently O(n) cached for 60s) with a `sql.js` database. Monthly query count becomes a single SQL query. Keep `app_config.json` and `sessions.json` as JSON — they are small and behave correctly as-is.

### API layer: Zod, not tRPC
tRPC requires sharing a router definition between frontend and backend. With Express + future Vite/React, tRPC runs as middleware and loses its main benefit. Zod schemas in `src/schemas/` serve three purposes: runtime validation in Express, TypeScript types via `z.infer<>`, and frontend form validation — all without any code generation step.

---

## What NOT to Change
These decisions are correct. Lock them in, never migrate away:

- **Custom BM25 + RRF** — `k1=1.5`, `b=0.75`, RRF `k=60` is a competitive differentiator
- **Confidence gate before LLM** — prevents hallucination; no framework replicates this
- **Clean Q&A history** — no context blobs re-injected; LangChain breaks this
- **`getVectorStore()` / `getEmbedder()` factory pattern** — all migrations slot in here
- **Playwright with persistent context** — only viable approach for Auth0 + MFA crawling
- **Per-section file sharding** — LanceDB should mirror this with partition-aware upserts

---

## Migration Sequence

### Do Now (zero risk, immediate value)
1. **pnpm** — drop-in `npm` replacement, regenerate lock file
2. **`tsconfig.json`** with `allowJs: true` + install `tsx` — zero code changes, TS toolchain available
3. **Vitest** — start with `compressContext()` and `BM25.scores()` (pure functions, no mocking needed)
4. **Zod `AppConfigSchema`** — replaces unvalidated `deepMerge(DEFAULT_CONFIG, raw)` in `config.js`
5. **ESLint + Prettier** — catch real bugs before TS migration amplifies them

### Phase 2 (foundation for selling)
6. **Lemon Squeezy** + **Vercel Edge Function** for `LICENSE_API_URL` — enables first paying customer
7. **sql.js** for `eval.jsonl` — prerequisite for analytics dashboard UI
8. TypeScript interfaces in `src/types/` (`Chunk`, `Session`, `LicenseRecord`)
9. **Vite + React** setup wizard — sets React patterns for the rest of the migration
10. **LanceDB** — when any installation approaches 20k chunks
11. **GitHub Actions** — lint + test + build `.exe` on release tag

### Phase 3+ (scale, multi-user)
12. Docker + Railway for server-mode deployment
13. Clerk auth for first multi-user customer
14. Supabase + pgvector for cloud/multi-tenant
15. Turborepo monorepo only when desktop and server packages genuinely diverge

---

## Critical Files for Phase 1 Implementation

| File | Change |
|---|---|
| `package.json` | Add devDeps: tsx, typescript, vitest, @vitest/ui, eslint, prettier, zod |
| `tsconfig.json` | New — `allowJs:true, checkJs:false, strict:false, module:commonjs` |
| `src/types/index.ts` | New — `Chunk`, `Session`, `AppConfig`, `LicenseRecord` interfaces |
| `src/config/config.js` | Add Zod `AppConfigSchema` for runtime validation on load |
| `src/rag/query.js` | First Vitest test: `compressContext()` pure function |
| `src/vectorstore/store.js` | Second Vitest test: `BM25.prototype.scores()` |
| `src/ingestion/cleaner.js` | Third Vitest test: `chunkText()` — most regression-prone function |

---

## Verification

| Change | How to verify |
|---|---|
| pnpm | `pnpm install` completes; `pnpm run server` starts normally |
| TypeScript | `npx tsc --noEmit` runs clean after adding `tsconfig.json` |
| Vitest | `pnpm run test` — `compressContext` and `BM25.scores` tests pass |
| Zod config | Start server with malformed `app_config.json` — readable error, not silent `undefined` |
| ESLint | `pnpm run lint src/` — all reported issues fixed before merge |

---

## Documentation Rewrite (same session as Phase 1 implementation)

Top-level `.md` files are out of date — they document the original 4-section RAG from Session 1. Eight sessions of development have added: Electron + setup wizard, streaming, document upload, incremental crawl, per-section sharding, analytics, Confluence, licensing. All docs need to reflect current reality.

### Files to rewrite

| File | What changes |
|---|---|
| **`CLAUDE.md`** | Full rewrite — update stack table, file layout (add all new files), add Electron/wizard sections, update all 8 sections, current architecture. This is the "always read first" file — it must be accurate. |
| **`ARCHITECTURE.md`** | Update component diagram, streaming SSE flow, upload pipeline, incremental crawl, per-section store, analytics, licensing system |
| **`DECISIONS.md`** | Add all Phase 1–4 decisions: per-section sharding (QW-2), SSE streaming, incremental crawl, document upload, Confluence OAuth, licensing offline mode, sidebar footer redesign, URL optional mode |
| **`KNOWN_ISSUES.md`** | Mark all fixed issues as FIXED; add new known limitations (no Stripe webhook backend yet, Analytics UI built but no cross-encoder re-ranking); remove resolved items |
| **`README.md`** | Update feature list, quickstart commands, and stack description to reflect current capabilities |
| **`project-docs/session-log.md`** | Add Session 10 entry: "Ideal Long-Term Tech Stack Plan" with full details |

### Files to keep unchanged
- `CONVERSATION_HISTORY.md` — early scratch building history, kept for historical reference
- `CLAUDE_CODE_GUIDE.md` — Claude Code documentation, relevant as-is
- `how-electron-works-peppy-dawn.md` — plan file that landed in project root; leave it (it's a reference artifact)

### CLAUDE.md rewrite priorities
CLAUDE.md is the most important file — future Claude sessions and new developers read it first. Key sections to fully update:
1. **Section 2 — Repository layout**: add `src/integrations/`, `src/license/`, `scripts/`, `public/setup.html`, `public/js/setup.js`
2. **Section 3 — Quick-start commands**: add `npm run sync`, `npm run crawl:incremental`, `npm run confluence:fetch`
3. **Section 14 — What's done vs next**: move all completed Phase 1–4 items to Done ✅; update Not done with current roadmap (Lemon Squeezy, LanceDB, Vite+React, Vitest, etc.)
4. **Add Section 15 — Long-term tech stack**: summary from this plan (TypeScript, LanceDB, Vite+React, Lemon Squeezy, Clerk, Railway)
5. **Add Section 16 — Session continuity note**: always read `project-docs/session-log.md` at session start
