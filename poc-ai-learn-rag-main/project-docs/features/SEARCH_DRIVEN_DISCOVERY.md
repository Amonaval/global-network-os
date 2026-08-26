# Feature: Search-Driven Knowledge Discovery

## What It Is

A web search panel built into the wizard's URL group cards. Users type a topic query, see top web results as selectable checkboxes, and add chosen URLs directly into the knowledge base with one click — no copy-pasting, no leaving the app.

It answers: *"I want to learn about X — find me the best pages to ingest."*

## Where to Find It

**Setup wizard → Source step → Web Page / URL mode → inside each URL group card.**

Each group card gains a collapsible "Discover from web" toggle below the section name input.

## How It Works

1. User selects "Web Page / URL" as their source type
2. Inside any URL group card, they click **"Discover from web ▸"**
3. A search input appears — user types a topic (e.g. "vector database explained")
4. The system proxies a DuckDuckGo search via `POST /api/search/discover`
5. Top 10 web results appear as checkboxes with title, URL, and a one-line snippet
6. User checks the pages they want
7. Clicking **"+ Add N selected"** appends those URLs to the group's textarea, deduplicating against what's already there
8. The panel collapses — the URLs are now ready to be ingested via the normal wizard build flow

## What a Search Result Shows

Each result card displays:
- **Title** — page title from search
- **URL** — the actual destination URL
- **Snippet** — one-line description from the search result

## Search Provider

**DuckDuckGo HTML endpoint** (`https://html.duckduckgo.com/html/?q=<query>`)

- No API key required
- No account or signup
- Free, no rate limit for personal/local use
- Privacy-respecting (aligns with Knowledge Hub's local-first principle — Decision #1)
- Server-side proxy avoids CORS; parsed with cheerio (already in the dependency tree)

## API

### `POST /api/search/discover`

**Request:**
```json
{ "query": "vector database explained", "maxResults": 10 }
```

**Response:**
```json
{
  "results": [
    { "title": "What is a vector database? — Pinecone", "url": "https://www.pinecone.io/learn/vector-database/", "snippet": "A vector database stores and queries data as high-dimensional vectors..." },
    ...
  ]
}
```

On error (network, DDG unavailable): returns `{ "results": [], "error": "Search unavailable" }` with HTTP 200 so the UI can show a friendly message.

## Edge Cases

| Case | Behaviour |
|---|---|
| DDG returns 0 results | "No results — try a different query" |
| URL already in the group's textarea | Skipped silently on add (deduplication) |
| Network error / DDG unreachable | Friendly error message; textarea unchanged |
| User queries for very broad term (1000s of results) | Capped at `maxResults` (default 10) |

## What This Enables

- **Faster knowledge base seeding** — go from "I want to understand X" to ingested docs in under 60 seconds
- **Discoverability** — users who don't know what URLs to add can now discover them without leaving the app
- **Named sections that make sense** — natural to name a group after the query topic you searched

## Shipped

Session 17 — part of the URL Section Groups + Search-Driven Discovery release.




How was this feature, do you think it was value addition ?

Yes — genuinely good value addition, for a specific reason: it closes the loop between intent and ingestion.

Before this, the workflow had an invisible tax. A user thinks "I want to understand RAG architectures" — then they have to leave the app, open a browser, search, evaluate results, copy URLs, come back, paste them. That's 5 steps outside the product before any value is created. The feature compresses that to: type query → pick results → done.

What makes it particularly strong:

- It fits naturally into the URL Section Groups feature shipped right before it. Groups gave users the structure; discovery fills those structures. The two features compose well.
- Zero infrastructure cost — DuckDuckGo HTML endpoint, no API key, no account. Most "search integration" features require the user to provision something. This one just works.
- The deduplication logic is a small detail that matters a lot in practice — users can search multiple queries and add results to the same section without thinking about what's already there.

The honest limitation:

DuckDuckGo HTML scraping is fragile. DDG can change their markup, add bot detection, or rate-limit server IPs. It's good for a local tool where the server IP is the user's own machine, but it's not a foundation you'd build a production SaaS feature on. If this product ever moves to a hosted model, this route would need a proper search API (Google CSE or SerpAPI).

Overall verdict: High value-to-effort ratio. The feature required no new dependencies, no new data models, and no new ingestion pipeline — just a proxy route and UI state. That's the best kind of feature: small surface area, real user friction removed.