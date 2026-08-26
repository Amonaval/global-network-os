# Plan: UI Platform Release Notes Automation Agent

## Context
The user wants a Python agent that automates the creation of monthly release notes for the `riversandtechnologies/ui-platform` GitHub repository. The agent must fetch all PRs merged between 2026-07-01 and 2026-07-28, extract structured metadata from each, synthesize a 10-section release notes document using Claude, and publish it to Confluence under `syndigo.atlassian.net`.

---

## MCP Architectural Decision

**Question asked:** "Is MCP needed for this? Would it be a better solution?"

**Short answer:** No — direct REST APIs are the right choice for a standalone Python script.

**Why:**

The Atlassian MCP tools visible in this Claude Code session (`mcp__claude_ai_Atlassian__*`) are part of Claude Code's **own authenticated session** with Atlassian. They cannot be called from a standalone `agent.py` — they live inside the Claude Code process, not as a separately addressable server your Python code can connect to.

For a standalone script to use MCP, you would need to:
1. Run a separate Atlassian MCP server process (with its own auth/OAuth)
2. Use the Anthropic SDK's MCP connector (`betas=["mcp-client-2025-11-20"]`) to proxy Claude through that server

This adds infrastructure complexity (a running MCP server) without any practical benefit over calling the Confluence REST API directly.

**There is also no GitHub MCP tool in this session** — so GitHub REST calls are unavoidable regardless.

**When MCP would be better:** If this were designed as a Claude Code slash command running inside this session, the Atlassian MCP tools could handle Confluence navigation and publishing without managing `CONFLUENCE_EMAIL`/`CONFLUENCE_API_TOKEN` credentials. That pattern makes sense for interactive one-off tasks, not for a schedulable automation script.

**Decision:** Keep direct REST API calls for both GitHub and Confluence. The Python script is self-contained, portable, and schedulable.

---

## Files to Create

```
Release_docs_creator/
├── agent.py          # main orchestration script (~250 lines)
├── requirements.txt  # 3 dependencies
├── .env.example      # credential template
└── .gitignore        # ignore .env
```

---

## Implementation Plan

### `requirements.txt`
```
anthropic>=0.92.0
requests>=2.31.0
python-dotenv>=1.0.0
```

### `.env.example`
```
GITHUB_TOKEN=ghp_your_token_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
CONFLUENCE_EMAIL=your.email@syndigo.com
CONFLUENCE_API_TOKEN=your_confluence_api_token_here
CONFLUENCE_BASE_URL=https://syndigo.atlassian.net
CONFLUENCE_SPACE_KEY=~61975593f241500072688952
```

---

### `agent.py` — Function Breakdown

#### Constants
- `DATE_FROM = "2026-07-01"`, `DATE_TO = "2026-07-28"`, `REPO = "riversandtechnologies/ui-platform"`
- `HAIKU_MODEL = "claude-haiku-4-5-20251001"` (per-PR extraction — cost-efficient)
- `OPUS_MODEL = "claude-opus-5"` (final synthesis — highest quality)

#### `fetch_merged_prs(repo, date_from, date_to) -> list[dict]`
- Query: `GET https://api.github.com/search/issues?q=is:pr+is:merged+merged:{date_from}..{date_to}+repo:{repo}`
- Paginate with `per_page=30`, loop until empty page
- For each result, fetch full PR: `GET https://api.github.com/repos/{repo}/pulls/{number}`
- Returns list of full PR dicts (including `body`, `labels`, `html_url`, `merged_at`)

#### `extract_pr_metadata(client, pr) -> dict`
- Calls `claude-haiku-4-5` with a JSON-extraction prompt
- If `pr["body"]` is None or <20 chars, substitute `"[No description. Infer from title.]"`
- Extracts 7 fields: `package`, `component`, `change_type`, `consumer_impact`, `breaking_change`, `migration_needed`, `summary`
- On JSON parse failure: falls back to defaults with `pr["title"]` as summary
- Returns dict with extracted fields + `pr_number`, `pr_title`, `pr_url`, `merged_at`

**Per-PR extraction system prompt key instructions:**
- Return ONLY a JSON object (no markdown fences)
- `change_type` must be one of: Feature, Bug Fix, Performance, Infrastructure, Accessibility, Breaking Change, Refactor, Docs, Other
- Default to "Unknown" / "No" for missing fields

#### `synthesize_release_notes(client, extracted_prs) -> str`
- Calls `claude-opus-5` (streaming, `max_tokens=8192`)
- Passes all extracted PR dicts as JSON in the user message
- Requests exactly 10 Markdown sections in order
- Returns the full Markdown document string

**10 sections:** Executive Summary, Package-wise Changes, New Features, Bug Fixes, Performance Improvements, Infrastructure Changes, Accessibility, Breaking Changes, Migration Guide, Notable PRs

#### `markdown_to_confluence_storage(md) -> str`
- Regex-based converter: `## ` → `<h2>`, `### ` → `<h3>`, `**x**` → `<strong>x</strong>`, `[text](url)` → `<a href>`, `- item` → `<ul><li>`
- Wraps plain text lines in `<p>` tags

#### `get_space_id(space_key) -> str`
- `GET /wiki/api/v2/spaces?keys={space_key}` → returns numeric space ID

#### `find_page_id(space_key, title) -> str`
- `GET /wiki/api/v2/pages?spaceKey={space_key}&title={title}` → returns page ID

#### `find_child_page(parent_id, title) -> str`
- `GET /wiki/api/v2/pages/{parent_id}/children` → finds child by title match

#### `publish_to_confluence(space_id, parent_id, title, html_body) -> str`
- `POST /wiki/api/v2/pages` with storage format body
- Returns the published page URL
- Handles 409 (already exists) by appending timestamp to title

#### `main()`
```
load credentials → fetch PRs → extract metadata (per PR) → synthesize doc
→ convert to storage HTML → get_space_id → find "UI Platform" page
→ find "Releases" child page → publish "July 2026" under Releases → print URL
```

---

## Page Hierarchy Navigation

Target path: personal space → **UI Platform** → **Releases** → **July 2026** (new)

1. `get_space_id(SPACE_KEY)` — resolves `~61975593f241500072688952` to numeric ID
2. `find_page_id(SPACE_KEY, "UI Platform")` — finds the UI Platform parent page
3. `find_child_page(ui_platform_id, "Releases")` — finds the Releases page
4. `publish_to_confluence(space_id, releases_id, "July 2026", html)` — creates new page

---

## Error Handling

| Scenario | Strategy |
|---|---|
| PR with empty description | Substitute sentinel string before Claude call |
| Claude returns malformed JSON | `except json.JSONDecodeError` → fallback defaults |
| GitHub 429 rate limit | `raise_for_status()` surfaces it; user can rerun after delay |
| Confluence 409 (page exists) | Detect, append ` (1)` suffix and retry once |
| Confluence 401 | Propagate with clear message to check `CONFLUENCE_API_TOKEN` |

---

## Verification Steps

1. Copy `.env.example` to `.env` and fill in real tokens
2. Run `pip install -r requirements.txt`
3. Run `python agent.py`
4. Verify console output shows PR count, per-PR extraction lines, and final Confluence URL
5. Open the Confluence URL to confirm the page rendered correctly with all 10 sections
