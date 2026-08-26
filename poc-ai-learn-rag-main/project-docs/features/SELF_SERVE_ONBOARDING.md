# Self-Serve Onboarding

**Shipped:** 2026-08-03  
**Mission:** Priority 2 — First value in under 5 minutes.

---

## Problem

A new user installs Knowledge Hub, opens it, and sees a blank chat interface. They don't know what to do, what value the product provides, or how to get started. They leave before uploading a single document.

The onboarding gap is the single biggest blocker to first-value delivery.

---

## Solution

A **Welcome Flow** that replaces the blank chat panel when `totalChunks === 0`. It guides the user through upload → insight → first question in one linear experience.

---

## The Flow

### Step 1 — Upload

A clean, focused drop zone with no other UI competing for attention.

- Drop a file or click to browse
- Accepted formats: PDF, DOCX, TXT, MD, HTML, ZIP
- Live indexing progress shown inline (the readStream log)
- On completion → automatically advances to Step 2

### Step 2 — First Insights (Ready)

After indexing, the user sees:

| Signal | What it shows |
|---|---|
| Chunk count | "47 knowledge chunks" — quantifies what was indexed |
| Section count | "3 sections" — shows structure was detected |
| IDS Score | "12/100 — intelligence layer activated" — north star made visible |
| IDS bar | Visual progress meter with 70-point moat threshold marker |
| Sections indexed | Chips showing detected section names |
| Suggested questions | 3 templated questions based on actual section names |

**The IDS display is deliberate.** The user sees the intelligence layer activate from 0 to a non-zero value on their first upload. That's the moat principle made tangible: the longer they use it, the higher this number climbs.

### Suggested Questions

Generated from section names (no LLM call — zero latency):
- `"Give me an overview of [section 1]."`
- `"What are the key concepts in [section 2]?"`
- `"What should I know about [section 3]?"`

Clicking a question sends it immediately as the first chat message.

---

## Trigger Logic

Show WelcomeFlow when ALL of:
1. `statsData !== undefined` (stats loaded — we know the state)
2. `statsData.totalChunks === 0` (no content indexed)
3. `localStorage.getItem('kh_welcome_dismissed') !== '1'`

Once the user starts a chat or clicks "Skip", `kh_welcome_dismissed = '1'` is set and the flow never shows again (even if they later delete all documents). This prevents re-triggering after intentional cleanup.

---

## Implementation

- **New component:** `frontend/src/components/chat/WelcomeFlow.tsx`
  - `WelcomeFlow`: root component, phase state (`upload` | `ready`)
  - `UploadStep`: drop zone + streaming upload, advances phase on success
  - `ReadyStep`: stats display + IDS bar + section chips + suggested questions
- **`App.tsx`:** imports `useStats`, computes `showWelcome`, renders `WelcomeFlow` instead of chat when triggered
- **CSS:** `.wf-*` namespace, dark mode variants, spinner animation

---

## IDS Starter Value

The starter IDS shown after first upload is: `min(12 + floor(chunks / 20), 25)`.

This is intentionally conservative — the real IDS grows through queries, memory clusters, and gap resolution. The number 12 reflects "you have content, intelligence layer is activated, but the compounding hasn't begun yet." This is honest and motivating, not inflated.

---

## Time to First Value

A user who drops a single PDF should reach their first answered question in under 3 minutes:
- 30 seconds: upload + indexing (small doc)
- 10 seconds: read the insight screen
- 5 seconds: click a suggested question
- 15 seconds: read the answer

First value: under 60 seconds from first upload for a small document.
