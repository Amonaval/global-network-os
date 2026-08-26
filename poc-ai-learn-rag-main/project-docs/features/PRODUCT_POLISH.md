# Product Polish

*Shipped: 2026-08-21*

## What It Is

A set of focused UI and UX improvements that make the platform feel excellent from first use. No new capabilities — every layer was technically solid. This mission made the existing layers feel trustworthy and professional.

---

## What Was Built

### 1. Source Citation Quality

**Problem:** Source chips showed raw section slugs (e.g. `api-docs`), a meaningless relevance percentage, and always rendered as dead `<a href="#">` links when sources had no URL.

**Solution:**

- **Backend** (`src/rag/query.js`): both `query()` and `queryStream()` now include `nearHeading` and `snippet` (first 160 chars of chunk text) in every source object.
- **Types** (`frontend/src/types.ts`): `Source` interface extended with `nearHeading?: string` and `snippet?: string`.
- **Inline citations** (`frontend/src/utils/markdown.ts`): `[N]` citation tooltips now show `Title — snippet excerpt` on hover.
- **Source chips** (`frontend/src/components/chat/MessageItem.tsx`):
  - Primary line: document title (falls back to formatted section name)
  - Secondary line: `Section › Near Heading` breadcrumb
  - Relevance indicator: colored dot (green = score ≥ 0.5, amber = 0.3–0.5, gray = below 0.3) — replaces raw "73%" which users couldn't interpret
  - Clickable only when `url` exists; renders as `<div>` otherwise (no dead `href="#"` links)
  - Native tooltip on hover shows the snippet excerpt

### 2. Streaming Cursor Fix

**Problem:** Double cursor rendered during streaming. `MessageItem.tsx` appended `<span class="cursor">▋</span>` to the HTML, while CSS `::after` on `.message.ai.streaming .answer-content` also rendered a blinking `▋`. Result: two cursors, one static and one blinking.

**Fix:** Removed the JS span from `MessageItem.tsx`. CSS `::after` handles the cursor exclusively — it appears automatically when `.streaming` class is present and disappears when streaming ends.

### 3. IDS Meter Polish

**Problem:** The IDS progress bar was a flat single-color fill — color changed per score tier but the bar itself gave no visual context about where 70 (the moat threshold) was without reading the tiny tooltip.

**Solution** (`frontend/src/components/chat/IntelligenceDashboard.tsx` + `public/css/app.css`):
- **Gradient fill** (`id-ids-fill--gradient`): orange at 0% → yellow at 40% → lime at 65% → green at 100%. The spectrum is always visible; fill covers the left portion. Score tier is self-evident from bar position.
- **Taller bar**: 8px (was 6px) — more readable at a glance.
- **Threshold label**: the 70-point marker now shows a "70" label below it. Users immediately understand what the moat threshold means without reading copy.
- **Animated fill**: `cubic-bezier(0.25, 1, 0.5, 1)` easing on load — feels responsive, not static.

### 4. Onboarding Section Chips

**Problem:** The Welcome Flow Ready screen showed raw section slugs (e.g. `project-decisions`, `api-reference`) in section chips, which looked technical and unmemorable.

**Fix** (`frontend/src/components/chat/WelcomeFlow.tsx`): Section chips now use `formatSectionName()` — `project-decisions` → `Project Decisions`, `api-reference` → `Api Reference`. Small change, significant first impression improvement.

---

## Files Changed

| File | Change |
|---|---|
| `src/rag/query.js` | Add `nearHeading` + `snippet` to sources (both `query` and `queryStream`) |
| `frontend/src/types.ts` | Extend `Source` with `nearHeading?` and `snippet?` |
| `frontend/src/utils/markdown.ts` | Include snippet in citation tooltip |
| `frontend/src/components/chat/MessageItem.tsx` | Full citation chip redesign; remove double cursor |
| `frontend/src/components/chat/IntelligenceDashboard.tsx` | IDS fill class change + threshold label |
| `frontend/src/components/chat/WelcomeFlow.tsx` | Import + apply `formatSectionName` on section chips |
| `public/css/app.css` | Source chip styles, IDS gradient + threshold label, dark mode chip fix |

---

## Mission Completion Assessment

**Did we solve the right problem?** Yes. The retrieval pipeline was excellent; the UI was not communicating that quality to users. A professional looking at source chips showing `api-docs` and `73%` would not feel confident. Now they see document titles, breadcrumbs, and colored trust signals.

**Is there a larger opportunity?** The IDS meter gradient reveals something: users can now see at a glance that they're at 23/100 and the moat is at 70. That visualization creates a goal. This is a retention mechanic, not just polish.

**Should the roadmap change?** No. Answer Quality Audit (next mission) remains the right next step — the UI is ready to support that evaluation.

**What is the highest ROI next step?** Run 20 real queries. Every other improvement is speculation until we know which answer patterns fail.
