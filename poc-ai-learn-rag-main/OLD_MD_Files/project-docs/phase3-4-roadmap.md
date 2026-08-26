# Phase 3 & 4 Roadmap — Integrations + Monetization

---

## Phase 3 — Multi-Source Integrations (Month 2)

| Enhancement | Effort | Priority |
|---|---|---|
| Confluence OAuth adapter (Leap 4) | ~1 week | P1 |
| Smart "not found" suggestions (QW-3) | ~0.5 day | P2 |
| vLLM / Llama.cpp support (QW-4) | ~0.5 day | P2 |
| Google Drive integration | ~1 week | P3 |
| Notion integration | ~1 week | P3 |

---

## Leap 4 — Confluence OAuth Adapter

### Why
Removes the "portal URL + credentials" requirement for enterprise users.
Users already use Confluence — connecting via OAuth is one click, no credentials stored.
Structured REST API data is better than crawled HTML (no nav noise, proper hierarchy).

### User Flow
1. Setup wizard Step 2: radio option "Confluence" (alongside "Web portal" and "Upload files")
2. User enters Confluence base URL + Space Key
3. Click "Connect Confluence" → OAuth browser window opens (Playwright or Electron shell)
4. User approves → OAuth token saved to `data/app_config.json`
5. Build runs using Confluence REST API (no crawling, much faster)

### Architecture
```
src/integrations/confluence.js
  - fetchSpacePages(spaceKey, accessToken) → { title, url, html, metadata }[]
  - Uses Confluence REST API v2: GET /api/v2/pages?spaceKey=...
  - Recursively fetches child pages via page tree API
  - Converts Confluence storage format → clean HTML → existing cleaner.js pipeline
  - Access token stored in app_config.json (encrypted if Electron keychain available)

src/integrations/gdrive.js  (Phase 3b)
  - OAuth flow via Google OAuth 2.0
  - List files in target folder
  - Export Docs as HTML, Sheets as CSV
  - Feed through existing pipeline

src/integrations/notion.js  (Phase 3c)
  - OAuth via Notion integration
  - Fetch all pages in workspace or specific database
  - Convert Notion blocks → HTML → existing pipeline
```

### Important Note
The cr2 project (confluence-rag-multi-level) already has a Confluence REST API adapter.
Check `D:\AI\xyz_org AI\confluence-rag-multi-level\src\` for existing implementation to port.

---

## QW-3 — Smart "Not Found" Suggestions

### What
When the confidence gate fires (no relevant content found), instead of just saying
"I couldn't find this", suggest which sections **might** have the answer based on
the semantic similarity distribution across sections.

### Implementation
Port `recommendSpaces()` from cr2 project.

```
When confidence gate fires:
  1. Search all sections individually with the query
  2. Find the section with the highest top score
  3. Return: "I couldn't find this in the current search scope.
             The [mdm] section may have relevant content — try filtering to it."
```

Files: `src/rag/query.js`, `src/api/server.js` (add `suggestions` to response),
`public/js/app.js` (render suggestion chips on "not found" responses)

---

## QW-4 — vLLM / Llama.cpp Support

### What
vLLM and llama.cpp both expose an OpenAI-compatible API. Since Ollama also uses the
same format, adding vLLM support is essentially one extra `if` branch.

```js
// In askOllama() / askOllamaStream():
if (provider === 'vllm' || provider === 'llamacpp') {
  baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000';
  // Same OpenAI-compatible API, different default port
}
```

### Files to Change
- `src/rag/query.js` — add vLLM/llamacpp branch
- `src/config/config.js` — add `vllmUrl` to config schema
- `public/js/setup.js` + `public/setup.html` — add "vLLM" radio card in AI settings step

---

## Phase 4 — Product Viability (Month 3)

| Feature | Approach | Priority |
|---|---|---|
| License key system | Local validation + lightweight cloud endpoint | P1 |
| Stripe payments | Stripe Checkout in Electron | P2 |
| Feature gating | Free tier limits, Paid = unlimited | P3 |
| Landing page | Static site with pricing | P3 |
| Beta program | Manual key distribution first | P1 |

---

## License Key System

### Design
No user accounts in Phase 4 — just license keys.

```
1. User purchases (or gets beta key)
2. User enters key in Electron settings
3. App validates key against: sha256(key + machine-id) compared to cloud endpoint
4. On success: writes { licenseKey, validUntil, tier } to data/license.json
5. App checks license.json on startup — shows "trial expired" UI if invalid
6. Cloud endpoint: lightweight Express server (Vercel/Railway), verifies key + logs activation
```

### Free Tier Limits (suggested)
- 1 knowledge base (1 configured portal)
- 500 queries/month
- No document upload
- No integrations

### Paid Tier ($X/month or $Y lifetime)
- Unlimited knowledge bases
- Unlimited queries
- Document upload
- All integrations
- Analytics dashboard
- Priority support

---

## Stripe Integration

### Flow (Electron)
```
1. "Upgrade" button → opens Stripe hosted payment page in system browser
   (NOT in Electron WebView — avoids PCI compliance issues)
2. On payment success → Stripe webhook fires → server generates license key
3. Key sent to user's email
4. User enters key in Electron settings
```

### Implementation
- No Stripe SDK in the Electron app itself
- Just `shell.openExternal(stripeCheckoutUrl)` in Electron
- All payment processing on the server side
- License key delivered by email (simple, no account system needed)

---

## Beta Program (Start Here — before Stripe)

Before wiring payments, start a manual beta:
1. Build license key validation (Phase 4, Step 1 only)
2. Generate keys manually for beta users
3. Collect feedback via email/form
4. Use feedback to prioritize Phase 2/3 features
5. Only add Stripe after you know which features people actually pay for
