# Integrations

How Knowledge Hub connects to external content sources.

---

## 1. Generic Web Crawler (`src/crawler/crawl.js`)

Playwright-based crawler that handles SSO-protected portals.

### Auth Types

| `AUTH_TYPE` | How it works |
|-------------|-------------|
| `none` | Public portals — no auth |
| `form` | Standard email/password form — fills credentials from config |
| `microsoft` | Microsoft SSO — fills credentials, waits up to 5 min for MFA completion |
| `browser` | Opens a visible browser window — user logs in manually (handles any SSO) |

### Crawl Modes

| `CRAWL_MODE` | Use case |
|--------------|---------|
| `full` | Crawl everything from the start URL |
| `incremental` | Skip pages whose MD5 hash matches the last crawl |
| `prelogin` | Pre-login only — saves session to `user_data/` for later reuse |

### Smart Content Detection
The crawler detects portal type (Confluence, generic portal, plain HTML) and adjusts content extraction selectors accordingly. Avoids re-crawling nav, sidebars, and repeated boilerplate.

### Running
```bash
npm run crawl                  # full crawl
npm run crawl:incremental      # skip unchanged pages
```

---

## 2. Confluence (`src/integrations/confluence.js`, `confluence-fetch.js`)

Two auth methods supported:

### API Token
Simple token-based access. User provides:
- Confluence base URL
- Email address
- API token (from Atlassian account)

### OAuth 2.0 (3LO)
Full three-legged OAuth flow:
1. Server generates state nonce + redirect URI
2. User is sent to Atlassian authorization page
3. Atlassian redirects back with auth code
4. Server exchanges code for access token (10-minute TTL on state nonce)
5. Browser polls `/api/confluence/status` until token is stored
6. Access token used for all subsequent API calls

### Sync Behavior
- Fetches all spaces and pages the authenticated user can access
- Converts Confluence Storage Format to clean markdown via cleaner.js
- Incremental sync supported: compares page version numbers before re-ingesting
- Attachments (PDFs, DOCX) are extracted and ingested via the upload extractors

### Running
```bash
npm run confluence:fetch       # fetch pages from Confluence
npm run sync                   # incremental sync
```

---

## 3. File Uploads (`src/ingestion/extractors/`)

Drag-and-drop or file picker in the UI triggers the upload pipeline:

```
Browser → POST /api/upload (multer disk write)
        → gate check (license tier: Free = 5 docs, Pro/Lifetime = unlimited)
        → extractor (by MIME type)
        → cleaner.js
        → ingest.js
        → embedder.js
        → upsert to 'uploads' section shard
```

### Supported File Types

| Type | Extractor | Notes |
|------|-----------|-------|
| PDF | `extractors/pdf.js` (pdf-parse) | Text extraction only, no OCR |
| DOCX | `extractors/docx.js` (mammoth) | Preserves headings and tables |
| TXT / MD / HTML | `extractors/text.js` (fs) | Direct read |
| ZIP | `extractors/zip.js` | Extracts and processes each supported file inside |

---

## 4. License Gating (`src/license/license.js`)

Feature gates enforced at the integration level:

| Tier | Query limit | Upload docs | Confluence |
|------|-------------|-------------|------------|
| Free | 200/month | 5 docs | No |
| Pro | Unlimited | Unlimited | Yes |
| Lifetime | Unlimited | Unlimited | Yes |

Gate failures return HTTP 402. Machine ID is derived via sha256 — no external call required for local validation.
