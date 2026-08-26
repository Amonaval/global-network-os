# Intelligence Persistence Health Fix

**Status:** Shipped  
**Priority:** P2  
**Date:** 2026-08-05

---

## Problem

`avgHealthScore` in intelligence snapshots was hardcoded to `50` — the default fallback was never replaced with a real computation. This meant every weekly snapshot reported a mid-range health score regardless of actual documentation coverage, making the IDS trend line misleading for teams that use snapshots to track progress.

## Solution

Extracted a `computeAvgHealthScore(entries)` helper in `src/api/server.js` that mirrors the exact per-section formula from `GET /api/health`:

- For each answered eval entry, tracks `queryCount` and `lastHitTs` per section
- Builds `covScore` (coverage) and `recScore` (recency, 7/30/60/90+ day buckets) per section  
- Combines as `covScore * 0.4 + recScore * 0.6`, averages across all known sections
- Returns `0` if no answered queries exist (honest, not inflated)

The helper is called in two places that were hardcoded:
1. `maybeWriteSnapshot()` — auto-snapshot triggered weekly from `/api/insights`
2. `POST /api/intelligence/snapshot` — force-snapshot endpoint

Both now read eval.jsonl once and derive cluster count + health score from the same dataset, eliminating a redundant file read.

## Files Changed

| File | Change |
|------|--------|
| `src/api/server.js` | Added `computeAvgHealthScore()` helper; replaced hardcoded `50` in two snapshot write paths |

## Architecture Notes

The formula in `computeAvgHealthScore` is intentionally kept in sync with `GET /api/health`. If the health formula ever changes, both places must be updated together — the helper function makes this a single-point change.

---

## Mission Completion Assessment

**Did we solve the right problem?**  
Yes. IDS trend lines derived from fake health scores are worse than no trend at all — they create false confidence. This fix makes snapshots reflect reality, which is the foundation for any meaningful week-over-week tracking.

**Is there a more transformative opportunity?**  
The underlying opportunity is making IDS a reliable enough signal that teams act on it. One fix alone doesn't do that — but without accurate component scores, IDS is just decoration. This was a prerequisite for the IDS moat strategy to work.

**Should the roadmap change?**  
No. This was correctly prioritized as P2 (small fix, high accuracy impact). The P1 Multi-user feature is where the next compounding value lies.

**What is the highest ROI next step?**  
Multi-user team mode is now shipped alongside this fix. The combined effect — per-user intelligence tracking + accurate health scores — means the intelligence store starts reflecting real team behavior rather than a single-person approximation.
