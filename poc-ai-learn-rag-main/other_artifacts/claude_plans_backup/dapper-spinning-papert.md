# Fix: Documentation Gap Not Logged When LLM Says "Not in Docs"

## Context

The Documentation Gap Intelligence feature logs a query as `blocked: true` only when the **confidence gate fails** (semantic score < 0.15). But there is a second failure mode it misses:

- The confidence gate **passes** because some docs contain a matching keyword (e.g., "temperature" in LLM docs matches the word in "What is the temperature in Jalgaon today?")
- The LLM is called, retrieves those irrelevant chunks, and correctly responds: "The documentation does not contain any information about this."
- The system logs `blocked: false` anyway — unconditionally, with zero inspection of the answer text

This is the exact scenario the user hit. The gap is real, but it never shows up in the Gaps panel.

---

## Root Cause (precise)

In `src/rag/query.js`:

- Lines ~439–444 (`query()`) and ~526–531 (`queryStream()`): after the LLM call, `logEval({ ..., blocked: false })` is written **without checking the answer text at all**.
- The `SYSTEM` prompt (lines 39–49) permits the LLM to say "I couldn't find this" when all chunks are off-topic, but there is no structured signal back to the code — just natural language.
- So "LLM answered with real info" and "LLM said it couldn't help" are both logged identically as `blocked: false`.

---

## Fix: Soft-Block Detection

After each LLM call, inspect the response text for known deflection phrases. If matched, override `blocked: true` before logging. No change to confidence gate logic or retrieval.

### Step 1 — Add a deflection detector in `src/rag/query.js`

Add a small helper near the top of the file (after the `SYSTEM` constant, ~line 50):

```js
const DEFLECTION_PATTERNS = [
  /does not contain any information/i,
  /no information about/i,
  /cannot answer.*based.*documentation/i,
  /not.*found.*documentation/i,
  /i could not find/i,
  /no relevant.*documentation/i,
  /outside.*scope.*documentation/i,
];

function isDeflection(answer) {
  return DEFLECTION_PATTERNS.some(p => p.test(answer));
}
```

### Step 2 — Apply it at both happy-path logEval callsites

**In `query()` (~line 441):**
```js
// Before:
logEval({ ts, question, topSemScore, latencyMs, blocked: false, sectionsUsed, ... });

// After:
const softBlocked = isDeflection(answer);
logEval({ ts, question, topSemScore, latencyMs, blocked: softBlocked, softBlocked, sectionsUsed, ... });
```

**In `queryStream()` (~line 530):**
Same change — `answer` is the accumulated stream string at that point. Apply identical logic.

### Step 3 — No changes needed downstream

- `GET /api/gaps` reads `blocked === true` from eval.jsonl — soft-blocked entries will automatically appear in the Gaps panel with this fix.
- `GET /api/analytics` similarly counts `blocked` entries — no change needed.
- Frontend `GapsPanel.tsx` and `AnalyticsPanel.tsx` are untouched.

---

## Files to Modify

| File | Change |
|---|---|
| `src/rag/query.js` | Add `DEFLECTION_PATTERNS` + `isDeflection()` helper; update 2 `logEval` callsites |

---

## Expected Behaviour After Fix

| Scenario | Before | After |
|---|---|---|
| Gate fails (score < 0.15) | `blocked: true` ✓ | `blocked: true` ✓ |
| Gate passes, LLM gives real answer | `blocked: false` ✓ | `blocked: false` ✓ |
| Gate passes, LLM says "not in docs" | `blocked: false` ✗ | `blocked: true` ✓ → appears in Gaps |

---

## Verification

1. Start the server, ask a clearly out-of-scope question (e.g. "What is the temperature in Jalgaon today?" with LLM docs loaded).
2. Confirm the LLM responds with a deflection phrase.
3. Open the **Gaps** panel — the question should appear as a cluster.
4. Check `data/eval.jsonl` — the last entry should have `"blocked":true,"softBlocked":true`.
5. Ask an in-scope question — confirm it still logs `blocked: false` and does NOT appear in Gaps.
