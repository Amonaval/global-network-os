# Phase 2 Roadmap — Product Differentiation

> **Status: NOT STARTED** (planned after Phase 1 completion)
> Phase 2 adds the features that differentiate Knowledge Hub as a product worth paying for.

---

## Phase 2 Items

| Enhancement | Effort | Priority | Status |
|---|---|---|---|
| Local Document Upload (Leap 2) | ~2.5 days | P1 | 🔜 Next |
| Eval Harness + Analytics (Leap 5) | ~2 days | P1 | 🔜 Next |
| Per-Section Vector Store (QW-2) | ~1 day | P2 | 📋 Planned |

---

## Leap 2 — Local Document Upload (PDF, DOCX, ZIP, MD)

### Why This Matters
The crawling requirement (portal URL + auth + sections) is the biggest barrier to adoption.
Someone with a folder of API specs, runbooks, onboarding docs, or exported PDFs should be
able to index them in 30 seconds. This is the "Notion AI for your own files" use case —
no portal config required.

### User Flow
1. In the chat UI sidebar, click **+ Add Documents**
2. Drag and drop PDF / DOCX / MD / TXT / ZIP files onto a drop zone
3. Progress bar shows upload + indexing status
4. "Indexed 847 chunks from 3 files" confirmation
5. Ask questions — the uploaded docs are included in all searches

Or during setup wizard: Step 2 gets a new option — "Upload files" alongside "Web portal".

### New Files / Dependencies

| File | Purpose |
|---|---|
| `src/ingestion/extractors/pdf.js` | PDF text extraction using `pdf-parse` (pure JS) |
| `src/ingestion/extractors/docx.js` | DOCX extraction using `mammoth` (pure JS) |
| `src/ingestion/extractors/zip.js` | ZIP unpacking using `adm-zip` (pure JS) |
| `src/ingestion/extractors/text.js` | Plain text / markdown passthrough |
| `src/api/server.js` | New `POST /api/docs/upload` multipart endpoint |

**New npm deps (all pure JS, no node-gyp):**
```bash
npm install pdf-parse mammoth adm-zip multer
```

### API Design

```
POST /api/docs/upload
Content-Type: multipart/form-data
Body: files[] (multiple files allowed)

Response: text/event-stream
Events:
  {type:"progress", message:"Extracting filename.pdf..."}
  {type:"progress", message:"Indexing 342 chunks from filename.pdf"}
  {type:"done", message:"Indexed 847 chunks from 3 files"}
  {type:"error", message:"..."}
```

### Storage
- Uploaded files saved to: `docs/uploads/<original-filename>/`
- Manifest entry added: `{ section: 'uploads', title: filename, url: null, file: 'uploads/...', status: 'ok' }`
- Same `ingest.js` pipeline picks them up — no changes to embedder/store needed
- `data/upload_index.json`: tracks which files have been uploaded and their chunk counts

### Files to Change
- `src/api/server.js` — new `/api/docs/upload` endpoint + `multer` middleware
- `src/ingestion/ingest.js` — detect `uploads/` section and route to extractors instead of `cleaner.js`
- `public/index.html` — "+ Add Documents" button in sidebar, upload drop zone
- `public/js/app.js` — `uploadDocs()` function with SSE progress display
- `public/css/app.css` — upload drop zone, file list styles
- `package.json` — add `pdf-parse`, `mammoth`, `adm-zip`, `multer`

---

## Leap 5 — Evaluation Harness + Analytics Dashboard

### Why This Matters
Without analytics, there's no way to know if the knowledge base is actually good.
Enterprise buyers need metrics. The most valuable insight: **what questions people asked
that the system couldn't answer** — those are the documentation gaps.

### What Gets Logged
Every query to `queryStream()` or `query()` appends a line to `data/eval.jsonl`:
```json
{"ts":"2026-07-30T10:00:00Z","question":"...","topSemScore":0.43,"latencyMs":2100,
 "blocked":false,"sectionsUsed":["mdm","pim"],"chunkIds":["mdm__title__0"],"usedChunks":3}
```

### New Analytics Tab in Chat UI
The chat UI gets a third tab: **Analytics**

**KPI row:**
- Total queries
- Answer rate % (unblocked / total)
- Avg semantic score
- Avg latency (ms)

**Top 10 unanswered questions** (blocked by confidence gate):
- Listed with frequency count
- These = documentation gaps

**Most-referenced sections** (horizontal bar chart, CSS only):
- Which sections get used most often

**Last 20 queries** (table):
- Question, score, latency, sections used, blocked badge

### CLI Eval Tool (`src/rag/eval.js`)
Port from cr2 project (already built there):
```bash
npm run eval -- --summary           # KPI overview
npm run eval -- --blocked           # all blocked queries = documentation gaps
npm run eval -- --tail 20           # last 20 queries
npm run eval -- --section mdm       # queries that used the mdm section
```

### Files to Change
- `src/rag/query.js` — append to `data/eval.jsonl` after every query
- `src/rag/eval.js` — NEW: CLI analysis tool (port from cr2)
- `src/api/server.js` — new `GET /api/analytics` endpoint (reads eval.jsonl, aggregates)
- `public/index.html` — Analytics tab button and panel
- `public/js/app.js` — `loadAnalytics()` function
- `public/css/app.css` — analytics tab, KPI cards, bar chart styles
- `package.json` — add `"eval": "node src/rag/eval.js"` script

---

## QW-2 — Per-Section Vector Store Isolation

### Why This Matters
Currently all vectors are in a single `data/vectors.json` file. For large portals this
file can be 500MB+, parsed on every server start. Per-section isolation allows:
- Faster startup (only load sections being queried)
- Per-section re-ingest without touching other sections
- Per-section deletion

### Implementation
Port the `SpaceVectorStore` pattern from the cr2 project.

Instead of `data/vectors.json`, each section gets:
- `data/vectors_mdm.json`
- `data/vectors_pim-syndication-data-exchange.json`
- etc.

`getVectorStore(section)` returns the store for that section.
For cross-section queries (no section filter), load and search all stores, merge results.

### Files to Change
- `src/vectorstore/store.js` — add `getVectorStore(section?)` that returns per-section store
- `src/ingestion/ingest.js` — call `getVectorStore(section)` per section
- `src/api/server.js` — pass section to store for filtered queries
- `src/rag/query.js` — load section-specific store when `options.section` is set

---

## Phase 2 Verification

| Feature | Test |
|---|---|
| PDF upload | Upload a PDF → chunk count increases → ask about its content |
| DOCX upload | Upload a DOCX → same |
| ZIP upload | Upload a ZIP of markdown files → same |
| Analytics tab | After 5+ queries → Analytics tab shows KPI row, query history |
| Blocked queries | Ask out-of-scope questions → they appear in "Top Unanswered" |
| Per-section store | Start server → `data/vectors_<section>.json` files exist instead of one big `vectors.json` |
| Section re-ingest | `npm run ingest -- --section mdm` → only mdm store updated, others untouched |
