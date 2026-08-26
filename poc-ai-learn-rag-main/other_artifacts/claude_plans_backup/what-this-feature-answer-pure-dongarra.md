# Plan: Session 16 — Adopting Features from confluence-rag-multi-level

---

## Context

After fully exploring `D:\AI\Syndigo AI\confluence\confluence-rag-multi-level`, four features
stand out as high-value additions to the knowledge hub that don't duplicate anything already built.
The rest of that project's features (hybrid search, query expansion, confidence gate, analytics
panel, session persistence, follow-up questions, multi-section selector, breadcrumbs) are already
implemented.

**Already in knowledge hub — do NOT re-implement:**
- Hybrid BM25 + cosine + RRF search, query expansion, confidence gate
- Multi-section selector (Session 15), breadcrumbs/pageId in manifest (Session 15)
- Analytics panel (React), session persistence, follow-up suggestions
- `buildBreadcrumbs()` equivalent already in `confluence-fetch.js`

---

## What to Adopt (Prioritized)

### Priority 1 — `storageToMd()`: Confluence Storage Format Converter

**Why:** The knowledge hub fetches Confluence pages using `body-format=export_view` (pre-rendered
HTML). This loses code blocks (rendered as `<pre>`s with whitespace), macro output becomes garbage,
and `ri:page` cross-links show no text. The `confluence-rag-multi-level` project fetches using
`body-format=storage` (raw Confluence XML) then converts with a custom `storageToMd()` function.
This gives:
- CDATA code blocks extracted verbatim (fenced ``` blocks)
- `ac:structured-macro` noise stripped cleanly  
- `ri:page` links rendered as their content title
- Tables with equal-width padding and pipe-escaping
- Zero-width non-joiners stripped

**Files to change:**
- `src/integrations/confluence-fetch.js` — change `body-format=export_view` → `body-format=storage`
  in the page fetch URL; add `storageToMd()` function; call it before saving the HTML file
- `src/integrations/confluence.js` — change the `getPagesInSpace()` URL param likewise

**Port the exact `storageToMd()` from the source project** — it's 35 lines and handles all
Confluence XML elements. After the function converts Storage Format to Markdown, write it as
`.md` files instead of `.html` files (or keep `.html` extension but write markdown inside — the
cleaner already handles both since it strips HTML tags).

Actually, simpler: keep saving as `.html` but wrap the output of `storageToMd()` in a basic
`<html><body><pre>` tag so the downstream cleaner continues to work with minimal change.
Or better: save as `.md` and teach `cleaner.js` to skip HTML parsing for `.md` files.

**Recommended approach:** Save as `.md` files and update `cleaner.js` to detect `.md` extension
and skip cheerio HTML parsing — return text directly with existing `chunkText()`. One line change
in `cleaner.js`.

---

### Priority 2 — React Chunk Explorer Tab + Pinning

**Why:** The Chunk Explorer tab exists in `public/js/app.js` (vanilla) but is missing from the
React frontend. The `confluence-rag-multi-level` project shows the full feature set: sort by
RRF/Semantic/BM25, pin any chunk to force it into the next answer, pin bar above composer,
`pinnedChunkIds[]` sent with the chat POST request.

The backend already supports everything needed:
- `POST /api/chunks/search` exists in `server.js` (lines around chunk search)
- `pinnedChunkIds` in `query.js` (bypasses retrieval + confidence gate if provided)
- `src/rag/query.js` already has the pinning bypass logic

**Files to add/change:**

**New:** `frontend/src/components/chat/ChunkExplorer.tsx`
- Search input + Search button
- Sort toggle: RRF | Semantic | BM25 (three buttons, one active at a time)
- Result cards: per chunk shows breadcrumb/section, text excerpt (collapsible), 
  sem score %, BM25 score, RRF score × 1000, Pin button (📍/📌)
- State: `lastChunks`, `sortMode`, rendered sorted copy

**New:** `frontend/src/store/appStore.ts` additions
- `pinnedChunkIds: Set<string>` (or `string[]`)
- `togglePin(id: string)` — add/remove from set
- `clearPins()` — clear all

**Modify:** `frontend/src/App.tsx`
- Add `activePanel === 'chunks'` case to render `<ChunkExplorer />`
- Include `pinnedChunkIds` in the chat POST body (alongside `sections`)

**Modify:** `frontend/src/components/chat/InputArea.tsx`
- Add pin bar above composer: appears when `pinnedChunkIds.size > 0`, shows count + clear button
- Style: `<div class="pin-bar">📌 N chunks pinned — <button>Clear</button></div>`

**Modify:** `frontend/src/components/chat/Sidebar.tsx`
- Add "Chunk Explorer" link/button in sidebar footer actions (alongside Upload, Analytics)

**Modify:** `frontend/src/types.ts`
- Add chunk type: `interface ChunkResult { id: string; text: string; section: string; semScore: number; bm25Score: number; score: number; meta: Record<string,unknown> }`

**Pin ID format** (must match server-side):
In the knowledge hub, chunk IDs are not yet standardized. In `confluence-rag-multi-level` they
are `space__pageId__chunkIndex`. Check `src/vectorstore/store.js` to confirm the chunk `id`
field format and use that in the React pin state.

---

### Priority 3 — `cfApi()` Retry/Backoff in Confluence Fetch

**Why:** The current `confluence-fetch.js` makes raw `fetch()` calls with no retry logic.
Confluence Cloud rate-limits at 10 req/s. On large spaces, the crawl silently fails on 429s.

**Port the `cfApi()` wrapper** (12 lines from the source project):
- Retry up to 3 times with exponential backoff (1s, 2s, 3s)
- 429: respect `Retry-After` header before retrying
- 401: log error + `process.exit(1)` (wrong credentials — no point retrying)
- 403: log warn + return null (space access denied — soft skip, not a crash)
- Network errors: exponential back-off, throw on 3rd failure

**File:** `src/integrations/confluence-fetch.js` — replace direct `fetch()` calls with `cfApi()`.

---

### Priority 4 — Dimension Mismatch Detection in Ingest

**Why:** If the user switches embedding provider (e.g., nomic → openai, or nomic-embed-text →
nomic-embed-text-v1.5), the stored 768-dim vectors silently produce garbage cosine scores against
new 1536-dim vectors. The fix is a pre-check before ingest begins.

**Port 10 lines from `ingest.js`** (lines 199-209 in the source project):
```js
const storedDims = vectors[0]?.embedding?.length;
const expectedDims = provider === 'nomic' ? 768 : provider === 'openai' ? 1536 : 2048;
if (storedDims && storedDims !== expectedDims) {
  console.warn('Dimension mismatch — forcing rebuild');
  forceRebuild = true;
}
```

**File:** `src/ingestion/ingest.js` — add this check after loading existing vectors, before the
incremental skip logic.

---

### Priority 5 — Per-Section Ingest CLI Flag

**Why:** With many Confluence spaces, a full re-ingest after updating one space takes minutes.
Adding `--section confluence-eng` (or `--space ENG`) allows rebuilding just one section's
`vectors_confluence-eng.json` without touching other sections' files.

**Port the pattern from the source project's `ingest.js`** (lines 24-26, 281-292):
```js
const ONLY_SECTION = args[args.indexOf('--section') + 1] || null;
// Then filter the section list to just [ONLY_SECTION] if provided
```

**File:** `src/ingestion/ingest.js` — add `--section` flag handling. Also add `ingest:section`
npm script shorthand:
```json
"ingest:section": "node src/ingestion/ingest.js --section"
```
So: `npm run ingest:section -- confluence-eng` or `npm run ingest:section -- confluence-eng --force`

---

## What NOT to Port

| Feature | Reason |
|---|---|
| `discoverSpaces()` / `CONFLUENCE_SPACES=auto` | Useful but wizard already has "Leave blank for all spaces" — lower priority |
| `TFIDFEmbedder` | Already exists in knowledge hub as provider option; verify existing impl |
| `buildTree()` | Already done in Session 15 via `buildBreadcrumbs()` in `confluence-fetch.js` |
| `savePage()` YAML frontmatter | Knowledge hub uses HTML files; different pipeline |
| Lazy space cache (`_storeCache`) | Knowledge hub loads all sections at once; fine for typical scale |
| `addAIBubble` / `loadEval` / `updateActiveSpaceBar` | Already covered by React components |
| Claude API LLM support | Already have OpenAI-compatible endpoint support |

---

## Files Changed Summary (9 total)

| File | Change |
|---|---|
| `src/integrations/confluence-fetch.js` | Add `cfApi()` retry wrapper; switch to `body-format=storage`; add `storageToMd()` |
| `src/integrations/confluence.js` | Switch page fetch to `body-format=storage` |
| `src/ingestion/cleaner.js` | Detect `.md` extension → skip HTML parsing, return text directly |
| `src/ingestion/ingest.js` | Dimension mismatch check; `--section` CLI flag |
| `package.json` | Add `ingest:section` script |
| `frontend/src/components/chat/ChunkExplorer.tsx` | New — full Chunk Explorer component |
| `frontend/src/store/appStore.ts` | Add `pinnedChunkIds`, `togglePin`, `clearPins` |
| `frontend/src/App.tsx` | Render `<ChunkExplorer>` panel; include `pinnedChunkIds` in chat POST |
| `frontend/src/components/chat/InputArea.tsx` | Pin bar above composer |
| `frontend/src/types.ts` | Add `ChunkResult` interface |
| `project-docs/session-log.md` | Session 16 entry |

---

## Verification

1. `npm run confluence:fetch` on a test space → check `.md` files are created with proper code
   blocks (look for ` ``` ` fences, not `<pre>` tags)
2. `npm run ingest` → check no dimension mismatch warning on first run; switch to a different
   embedding provider → verify it detects mismatch and forces rebuild
3. `npm run ingest:section -- confluence-eng` → only `data/vectors_confluence-eng.json` is
   updated; other section files unchanged
4. `npm run build:ui` → TypeScript clean (0 errors)
5. Chat UI → Sidebar → "Chunk Explorer" → search a term → see cards with RRF/sem/bm25 scores
6. Pin a chunk → pin bar appears above composer → ask a question → answer uses pinned chunk only
7. Clear pins → next question uses normal retrieval again
8. `npm test` → all tests pass
