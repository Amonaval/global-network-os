# Plan: Fix ZIP upload, server.js upload, and missing file extensions

## Context

Three issues reported after the Code Generation Mode (Level 2) was shipped:

1. **ZIP upload → "No chunks produced"**: Hard-coded `SUPPORTED_EXTS` in `zip.js` only allows `.txt .md .html .htm .csv`. All code extensions are silently discarded — the loop hits `if (!SUPPORTED_EXTS.has(ext)) continue` and returns `[]`. The upload handler gets an empty array and logs "Indexed 0 chunks from 1 file(s)."

2. **Direct code file upload (e.g. server.js) → nothing shown**: The running server process was started before the new code was built. Old server has the old multer `fileFilter` which rejects `.js` with a 500 error. Fix: restart the server after `npm run build:ui`. The code logic itself is correct — confirmed by tracing the full path through `extractTextFromFile → extractFromCode → chunkText`.

3. **Missing .css and other extensions**: `CODE_EXTENSIONS` in `server.js` and `EXT_TO_LANG` in `code.js` are both missing `.css`, `.scss`, `.less`, `.vue`, `.svelte`, `.graphql`, `.xml`, `.toml`, `.env`, `.ini`, `.env.example`.

---

## Root Causes

| Issue | File | Line | Root Cause |
|---|---|---|---|
| ZIP drops code files | `src/ingestion/extractors/zip.js` | 4, 13 | `SUPPORTED_EXTS` = `{.txt, .md, .html, .htm, .csv}` only |
| Code files not routed in ZIP | `src/ingestion/extractors/zip.js` | 15-17 | Plain `readAsText` used — no `[File:]\n[Language:]` metadata prefix, no block splitting |
| Missing CSS/Vue/etc | `src/api/server.js` | 54-61 | `CODE_EXTENSIONS` set incomplete |
| Missing CSS/Vue/etc | `src/ingestion/extractors/code.js` | 3-17 | `EXT_TO_LANG` map incomplete |

---

## Implementation Plan

### 1. Refactor `code.js` — extract `formatCodeContent()` as a pure function

Split `extractFromCode` into two functions:
- `formatCodeContent(rawContent, filename)` → `[{name, content}]` — pure, works on raw string
- `extractFromCode(filePath)` → reads file, calls `formatCodeContent` (backward-compatible)

This lets `zip.js` call `formatCodeContent` without file I/O.

**File:** `src/ingestion/extractors/code.js`

Also add missing `EXT_TO_LANG` entries:
```
'.css': 'css', '.scss': 'scss', '.less': 'less', '.sass': 'sass',
'.vue': 'vue', '.svelte': 'svelte',
'.graphql': 'graphql', '.gql': 'graphql',
'.xml': 'xml', '.toml': 'toml', '.ini': 'ini', '.env': 'env',
'.tf': 'terraform', '.proto': 'protobuf',
```

### 2. Fix `zip.js` — expand allowlist and route code files properly

Replace the narrow `SUPPORTED_EXTS` with a broader combined set. For code files, call `formatCodeContent()` (function-level block splitting + metadata prefix). For text/doc files, use plain `readAsText` as before.

**File:** `src/ingestion/extractors/zip.js`

```javascript
const { formatCodeContent, EXT_TO_LANG } = require('./code');

const TEXT_EXTS = new Set(['.txt', '.md', '.html', '.htm', '.csv', '.rst', '.log']);
const CODE_EXTS = new Set(Object.keys(EXT_TO_LANG));  // derives from code.js — stays in sync

// In the loop:
if (!TEXT_EXTS.has(ext) && !CODE_EXTS.has(ext)) continue;  // skip true binaries
const raw = zip.readAsText(entry);
if (!raw || raw.trim().length <= 20) continue;
if (CODE_EXTS.has(ext)) {
  results.push(...formatCodeContent(raw, entry.entryName));  // block split + metadata
} else {
  results.push({ name: path.basename(entry.entryName), content: raw });
}
```

### 3. Add missing extensions to `CODE_EXTENSIONS` in `server.js`

**File:** `src/api/server.js` — the `CODE_EXTENSIONS` Set (~line 54)

Add: `.css`, `.scss`, `.less`, `.sass`, `.vue`, `.svelte`, `.graphql`, `.gql`, `.xml`, `.toml`, `.ini`, `.env`, `.tf`, `.proto`

### 4. Update `UploadPanel.tsx` — accept attribute and hint text

**File:** `frontend/src/components/chat/UploadPanel.tsx`

- `accept` attr: add `.css,.scss,.less,.vue,.svelte,.graphql,.xml,.toml,.ini,.env,.tf,.proto`
- Hint text: Update to show CSS, Vue, Svelte, GraphQL, etc.

### 5. Note for user — server restart required

The direct code file upload issue (server.js showing nothing) is caused by the server process running old code. After `npm run build:ui`, the user must also restart the Node server (`npm run server` or the Electron app) for backend changes to take effect.

---

## Files Changed

| File | Change |
|---|---|
| `src/ingestion/extractors/code.js` | Add `formatCodeContent()` export; expand `EXT_TO_LANG` |
| `src/ingestion/extractors/zip.js` | Replace `SUPPORTED_EXTS` with `TEXT_EXTS + CODE_EXTS`; route code entries through `formatCodeContent` |
| `src/api/server.js` | Add CSS/Vue/Svelte/GraphQL/etc to `CODE_EXTENSIONS` |
| `frontend/src/components/chat/UploadPanel.tsx` | Update `accept` and hint text |

---

## Verification

1. **ZIP with code files**: Upload a ZIP containing `.js`, `.ts`, `.py` files → should produce chunks and show `✅ N chunks indexed`
2. **Direct CSS upload**: Upload a `.css` file → should be accepted and chunked
3. **ZIP with mixed types**: Upload a ZIP with `.js`, `.css`, `.md`, `.png` files → `.js`, `.css`, `.md` indexed; `.png` silently skipped
4. **Restart server**: Run `npm run server` and confirm new file types are accepted before testing
5. **Build**: `npm run build:ui` passes without TypeScript errors
