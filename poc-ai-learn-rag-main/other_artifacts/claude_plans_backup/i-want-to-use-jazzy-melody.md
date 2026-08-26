# Plan: Search-Driven URL Discovery

## Context
Users currently add URLs to the knowledge base manually — they Google a topic, pick the best results, and paste those URLs one by one into the wizard. This is the exact friction the user described: "I googled LLM and then added all top results to the URL list." This feature automates that loop — a search bar in the wizard lets users type a query, previews top web results as checkboxes, and adds selected URLs directly into an existing URL group with one click. No API keys, no signup, no cost — powered by DuckDuckGo HTML search (free, privacy-respecting, no ToS issues for personal/local use).

---

## Product Document Updates (done first, no code)

### `.claude/.product/04_NEXT_MISSION.md`
Set this as the active next mission:
> **Mission: Search-Driven Knowledge Discovery**
> Users should be able to type a topic into the wizard and instantly discover, preview, and ingest top web results — eliminating the manual Google → copy → paste loop.

### `.claude/.product/05_WORK_QUEUE.md`
Move `Search-Driven Knowledge Discovery` from `ICEBOX` (it doesn't exist yet) to `NOW`. Push the current NOW item (`Knowledge Risk Analysis`) to `NEXT`.

### `project-docs/features/SEARCH_DRIVEN_DISCOVERY.md` (new file)
Full feature spec covering the user problem, solution, UX flow, API design, and search provider rationale. Template matches existing feature specs in that directory.

---

## Implementation — 3 files

### 1. `src/api/server.js` — new route `POST /api/search/discover`

Accepts `{ query: string, maxResults?: number }`.

Uses existing `node-fetch` (already in `package.json`) to fetch:
```
GET https://html.duckduckgo.com/html/?q=<encoded-query>
```

Parses result HTML with existing `cheerio` (already in `package.json`) to extract:
- `.result__title a` → title text
- `.result__url` → display URL
- Clean the URL: DuckDuckGo wraps hrefs in redirect URLs, so extract the `uddg=` param or use the visible `.result__url` text and reconstruct to a proper `https://` URL.
- `.result__snippet` → snippet/description text

Returns:
```json
{ "results": [{ "title": "...", "url": "https://...", "snippet": "..." }] }
```

Cap at `maxResults` (default 10). Strip any DuckDuckGo-internal links (those starting with `https://duckduckgo.com/`).

### 2. `frontend/src/hooks/useApi.ts`
Add `searchDiscover(query: string, maxResults?: number)` function that `POST`s to `/api/search/discover` and returns the results array. Pattern matches existing hooks in that file.

### 3. `frontend/src/components/wizard/Step2Source.tsx`

Inside each URL group card, below the section name input, add a collapsible **"Discover from web"** panel:

```
[ 🔍  large language model overview    ] [ Search ]  ← search input
─────────────────────────────────────────────────────
☐  Large language model — Wikipedia
   https://en.wikipedia.org/wiki/Large_language_model

☐  What is an LLM? — AWS
   https://aws.amazon.com/what-is/large-language-model/

☐  GPT-4 Technical Report — OpenAI
   https://openai.com/research/gpt-4

[ + Add 2 selected to this section ]
─────────────────────────────────────────────────────
```

**State to add** (local to the component per group index):
- `discoverQueries: Record<number, string>` — the search input value per group
- `discoverResults: Record<number, {title,url,snippet}[]>` — fetched results per group
- `discoverSelected: Record<number, Set<string>>` — which URLs are checked per group
- `discoverLoading: Record<number, boolean>` — loading state per group

**Actions:**
- Search button triggers `searchDiscover(query)` and stores results in `discoverResults[idx]`.
- Checkboxes toggle `discoverSelected[idx]`.
- "Add N selected" appends checked URLs (newline-joined) to the group's existing `urls` textarea value via `setUrlGroup(idx, 'urls', ...)`. Panel collapses after adding.

**Panel visibility:** Toggle with a small "Discover from web ▸" link below the section name. Keeps the card compact by default.

---

## Edge Cases
| Case | Handling |
|---|---|
| DuckDuckGo returns 0 results | Show "No results found — try a different query" |
| URL already in this group's textarea | Skip duplicates on add (check before appending) |
| Network error / DDG blocks request | Return `{ results: [], error: 'Search unavailable' }` with 200 status; UI shows friendly message |
| User adds same URL to two groups | Allowed — duplicate-group-name validation already covers section-level dedupe |

---

## Verification
1. Open wizard → Source step → select "Web Page / URL".
2. Click "Discover from web" inside a group card.
3. Type "what is a vector database" and click Search.
4. Verify 5–10 results appear as checkboxes with titles and URLs.
5. Check 3 results and click "+ Add 3 selected to this section".
6. Verify the URLs textarea for that group now contains the 3 URLs.
7. Complete the wizard build — verify those URLs appear in `docs/<section-name>/` after crawl.
8. Call `GET /api/sections` — verify the section appears with correct chunk count.
