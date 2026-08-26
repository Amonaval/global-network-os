# Plan: Evaluate "Real-Time Pricing Comparison" for Roadmap

## Context

The user has requested adding real-time pricing comparison to the CRS Calculator product roadmap. This plan evaluates that request against the product constitution, vision, and current mission priority before making any changes to roadmap documents.

---

## Evaluation Result: Do Not Add to Roadmap

The feature violates three non-negotiable principles:

### 1. No-backend constraint (Engineering Principles)
Real-time pricing requires fetching live data from retailer APIs or third-party pricing services. The Engineering Principles state: **"No backend in this codebase — all scoring is client-side forever."** There is no client-side path to real-time retail pricing data.

### 2. Product identity mismatch (Product Vision — What We Are Not Building)
The vision explicitly excludes: **"A social or competitive benchmarking tool."** Pricing comparison is competitive benchmarking. It also states the product does not push data to retailers or evaluate anything beyond content readiness. Pricing is not a content readiness attribute.

### 3. Wrong user job-to-be-done (User Advocate lens)
The primary user is a brand content manager preparing catalog content for syndication. Their job is getting content *accepted* by retailers. Pricing is managed by category managers and pricing analysts — a different role, a different workflow, a different tool. Building for this persona dilutes focus on the primary user.

### 4. Evolution Ladder mismatch
No pricing rung exists on the ladder. The roadmap climbs: Batch Upload → Score History → Category Rules → REST API → PIM Widget → SaaS Dashboard. Pricing comparison is a lateral move to a different product category, not an upward step.

---

## What to Do Instead

**Complete Mission 4.** The only remaining blocker is the CSV export (Download Results button). This is a single-session engineering task that closes the current mission and unlocks the P1 queue (Score History, Category-Specific Rules).

---

## Possible Reframe (Future Explore session, not a roadmap item today)

If there is genuine interest in connecting content quality to commercial outcomes, a future **Explore** session could investigate: *"Does a higher CRS score correlate with better search ranking or pricing power?"* This would be an educational insight layer — not a real-time data feature — and would stay fully client-side. It is speculative and should not be roadmapped without user validation first.

---

## Document Updates Required

None. No new knowledge warrants updating any OS document. The request is declined at the constitution level; that decision does not need to be persisted — it is derivable from existing principles on demand.

---

## Recommended Next Action

Implement the CSV export for Mission 4 (`app.js`, Blob API, wire to "Download Results" button). This is the highest-ROI use of engineering effort right now.
