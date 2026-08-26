# Feature: AI Documentation Reviewer

## What It Is

For every low-health section (score < 50), the AI Documentation Reviewer reads the section's indexed content and correlates it with unanswered gap queries — then generates 3–5 specific, actionable improvement suggestions.

It answers: *"What exactly should I write to fix this section?"*

## Where to Find It

**Health tab** (❤️) → any section card with score below 50 → **🔍 Review** button.

## How It Works

1. You click **🔍 Review** on a low-health section card
2. The server reads the section's indexed chunks from the vector store
3. It reads all blocked/soft-blocked queries from `data/eval.jsonl` (the gap history)
4. It finds related gap queries via keyword overlap (section name words + top content words vs. question text)
5. Both the section content and the related gap queries are sent to the LLM
6. The LLM returns 3–5 specific suggestions, each with a topic name and one concrete sentence
7. Suggestions appear inline below the card — no navigation required

## What a Suggestion Looks Like

| Field | Example |
|---|---|
| **Topic** | `OAuth token expiry and refresh flows` |
| **Detail** | `Users asked about token expiry 4 times but this section contains no mention of refresh tokens or token lifetime configuration.` |

## Example

A section named `authentication` scores 12 (Critical). A team lead clicks Review.

**Gap queries related to this section:**
- "how does token refresh work?"
- "what happens when my OAuth token expires?"
- "how long are sessions valid?"

**Suggestions returned:**
1. **Token expiry and refresh flows** — Users asked about token expiry 3 times but this section contains no documentation on token lifetime, refresh tokens, or what happens when a session expires.
2. **Session duration configuration** — No mention of how to configure session length; users have asked about session validity directly.
3. **OAuth scopes and permissions** — The section describes OAuth setup but omits which scopes are required and what permissions each scope grants.

The team lead now has a precise documentation backlog, not a generic "improve this section" instruction.

## What It Does NOT Do

- It does **not** write the documentation for you. AI advises; humans write.
- It does **not** edit or overwrite any existing content.
- It does **not** run automatically — review is on-demand, per section, at user discretion.

## Technical Notes

- Uses `POST /api/health/review/:section`
- Reads up to 5 chunks (first 400 chars each) for context
- Matches up to 15 gap queries via keyword overlap
- Calls the configured LLM provider (`LLM_PROVIDER` env var — claude, ollama, or vllm)
- Response format: `{ section, suggestions[], gapQueriesAnalyzed, chunksAnalyzed }`
- If no related gap queries exist, the LLM reviews content coverage alone

## Limitations

- Keyword matching for gap correlation is approximate. A gap query about "session invalidation" may not match a section named "auth-setup" even if it's the right section.
- Suggestions quality scales directly with LLM quality. Claude produces specific, referenced suggestions. Local models (qwen2.5:3b) produce more generic output.
- The LLM sees only a truncated view of the section (5 chunks × 400 chars). Long sections may have relevant content beyond what the reviewer sees.

---

## Mission Completion Assessment

*Claude's answers at time of shipping. For future sessions revisiting this feature.*

**Is this actually solving the problem?**
Yes. The gap before this: users knew a section scored 12 but had no system guidance on what to write. Now "🔍 Review" produces a specific answer. The best-case output — "Users asked about OAuth token expiry 4 times but this section contains no mention of token expiry or refresh flows" — is directly actionable in a way no generic health score ever could be. The bridge between "something is wrong" and "here is what to fix" is now closed.

**Is it enough?**
For v1, yes. The core promise — AI analyzes your section against actual user failures and tells you what to write — is fully delivered. What's deliberately deferred: bulk review of all sections at once (LLM cost, surface one at a time is right for v1), automatic triggering on new gap queries (premature — human initiates review when they're ready to act), and inline editing from the suggestion card (the gap between "suggestion" and "writing it" is where human judgment belongs).

**Does it really add value?**
Yes, with a clear ROI story: a team lead who would spend 30 minutes cross-referencing chat logs and section content to produce a documentation backlog can now do it in 30 seconds per section. The value compounds with gap history — the more queries the system has accumulated, the more specific and reference-linked the suggestions become. New deployments with few gap queries still get content-coverage analysis, which is useful even without gap data.

**Is it readable and actionable at scale?**
Yes. Suggestions appear inline below the card — no new panel, no navigation. The topic + detail format (two fields) keeps each suggestion scannable. At 5 suggestions the output fits in a card without scrolling. One future improvement: a "dismiss" button per suggestion so users can mark which ones they've acted on, preventing the same suggestions from appearing on every review run.
