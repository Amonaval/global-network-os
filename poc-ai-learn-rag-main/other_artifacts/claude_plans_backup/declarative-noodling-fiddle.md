# Strategic Review — CRS Calculator Mission Queue Realignment

**Date:** August 2026
**Trigger:** Periodic strategic review requested by user
**Scope:** Validate all built features against product vision, constitution, and executive council. Critically evaluate Mission 7 (Shareable Score Report). Recommend mission queue changes. Add periodic review mechanism to CLAUDE.md.

---

## What The Review Found

### 1. Mission 7 is misaligned with the "million dollar PIM addon" goal

The current Mission 7 (Shareable Score Report) is a **consumer-grade sharing mechanic in a B2B tool**. The Growth Lead's argument for it was organic acquisition via link sharing. But our users are PIM operators inside enterprise organizations — they share via Slack, email, and Jira, not magic links. The URL-encoding approach also has a real privacy concern: encoding GTINs and product attributes in a sharable URL exposes competitive intelligence the brand manager may not intend to share broadly.

More importantly: the original Evolution Ladder in `00_PRODUCT_VISION.md` **does not include Shareable Score Report** in the critical path. It was inserted as a P2 feature by the Growth Lead's advocacy. The original ladder goes:

```
Category Rules → REST API → PIM Widget → SaaS Dashboard
```

The Shareable Report is a detour off the critical path, not a step on it.

### 2. The REST API is the gateway to everything

The REST API (Mission 8 in current queue) is:
- The gateway to the PIM Widget
- The thing that makes CRS Calculator a **dependency**, not a destination
- The foundation for enterprise licensing
- The path to the "million dollar addon"

Without the REST API, the PIM Widget cannot exist. Without the PIM Widget, we remain a standalone web tool that users have to visit rather than a capability embedded in their workflow.

**The REST API should be Mission 7, not Mission 8.**

### 3. The Syndigo home court opportunity is underweighted

The user works at Syndigo. Syndigo is a major content syndication platform serving hundreds of brands. If Syndigo embeds CRS Calculator as a native workflow capability, every brand on Syndigo gets scoring without visiting any external tool. This is a massive distribution event — and it's a home-court advantage no competitor can replicate.

The product documents treat PIM integration as a generic "future" goal. It should be the explicit target of Mission 8 (PIM Widget), with Syndigo named as the primary first integration target.

### 4. Shareable Report is NOT zero value — it's just 1 day of work, not a full mission

The B2B sharing use case is real. Brand managers do want to share scores with directors, agencies, and content teams. But the right implementation is:
- A **"Copy Score Summary"** button that copies a formatted text block (not a URL)
- Text format: "Product: [title chars] chars, Walmart: 74 (Needs Work), Amazon: 82 (Strong), Biggest Fix: Add 1 image to meet Walmart CPG minimum of 6"
- This is 30–60 minutes of engineering, not a 2-week mission
- No URL encoding, no privacy risk, works in Slack/email/Jira natively

### 5. Rules accuracy must be resolved before API launch

Target accuracy is 82%. Amazon Electronics rules are unverified. The REST API will expose these rules to programmatic consumers who will integrate them into automated workflows. A wrong rule in an API response is worse than a wrong rule on a web page — it propagates silently across every automated workflow that calls the API. The accuracy audit must complete before Mission 7 (REST API) ships.

### 6. Feature bloat check: PASS (with one exception)

Missions 1–6 are tight and ladder correctly. Every mission added capability that moved the product up the evolution ladder. The one feature bloat risk is **Score History's batch blind spot** (batch-scored products don't feed history) — this was called out in Progress.md and is a known enhancement, not a blocker.

The only true bloat candidate is Shareable Report as a full mission. As a quick enhancement, it earns its place.

---

## Recommended Changes

### Mission Queue Revision

| Old Queue | Revised Queue |
|---|---|
| Mission 7 — Shareable Score Report (full mission) | Mission 7 — REST API Foundation |
| Mission 8 — REST API Wrapper | Mission 8 — PIM Widget MVP (Syndigo first) |
| Mission 9 — Embedded PIM Widget | Mission 9 — SaaS Multi-Brand Dashboard |

**Shareable Score Report** → Demoted to a quick enhancement on the existing product. Implement as a "Copy Score Summary" clipboard button. No URL encoding. ~1 day effort. Fold into the current product before Mission 7 starts.

### Prerequisites Before Mission 7 (REST API)

- Target accuracy audit: bring from 82% → 90%+
- Amazon Electronics audit: complete 20-product manual verification
- These run as a parallel track, not as a numbered mission

### CLAUDE.md Addition

Add a **Strategic Review** conversation mode that triggers before every mission transition. The review asks six questions and should take 15 minutes, not 2 hours.

---

## Files To Update

### 1. `CLAUDE.md`
- Add "Strategic Review" to Conversation Modes section
- Add a "Periodic Review Trigger" instruction: run Strategic Review automatically at mission completion before updating `04_NEXT_MISSION.md`
- Add the six review questions as a checklist

### 2. `.product/04_NEXT_MISSION.md`
- Replace Shareable Score Report spec with REST API Foundation spec
- Include: scoring-engine.js extraction, `POST /score` endpoint, deploy as serverless function, accuracy audit prerequisite

### 3. `.product/01_CEO_DASHBOARD.md`
- Update current mission to REST API Foundation
- Update Biggest Opportunity to name Syndigo integration explicitly
- Update Biggest Risk to name API accuracy exposure as a new risk
- Update mission queue table

### 4. `.product/07_FEATURE_BACKLOG.md`
- Reorder: Mission 7 = REST API, Mission 8 = PIM Widget (Syndigo first), Mission 9 = SaaS Dashboard
- Shareable Report: demote to "Quick Enhancements" section, not a numbered mission
- Expand Mission 8 (PIM Widget) to name Syndigo as primary target

### 5. `.product/00_PRODUCT_VISION.md`
- Restore original Evolution Ladder with Shareable Report removed from the critical path
- Or add it as a "(quick win, pre-Mission 7)" annotation, not a full rung

---

## Verification

After changes:
- Read all five updated files to confirm consistency
- Check that the Evolution Ladder, Mission Queue table in CEO Dashboard, Feature Backlog, and Next Mission spec all show the same revised order
- Confirm CLAUDE.md has a Strategic Review mode with a clear trigger
- Confirm Shareable Report is not listed as a full mission anywhere
