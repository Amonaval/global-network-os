# Pre-Alpha Family Feedback — Value / Cost Prioritization

Date: 2026-08-23

This document converts the latest family-user feedback into a durable roadmap. A feature is not considered complete merely because related code exists; existing capabilities are marked **verify/refine** where appropriate.

## Release blocker implemented now

| # | Feedback | Value | Cost | Decision |
|---|---|---:|---:|---|
| 0 | New family creation must be approved by the platform owner(s) | Very High | Medium | **Implemented in 029.** Normal users request a family; platform owners approve/reject; approved requester becomes Family Owner. Direct `create_family` is platform-owner-only at DB level. |
| — | Mobile app occupies only part of phone width | Critical | Low | **Fixed now.** Explicit device-width viewport + full-width/overflow hardening. Must still be device-verified. |

## High-value near-term work

| # | Feedback | Current reality | Value | Cost | Roadmap decision |
|---|---|---|---:|---:|---|
| 1 | Family creator becomes Family Admin/Owner | Approval flow now assigns requester as `owner` | Very High | Low | **Covered by #0 implementation; verify after 029.** |
| 2 | Co-admin cannot delete foundational parent hierarchy created/locked by Owner | Admin relationship editing exists, but no Owner-lock semantics | Very High | Medium–High | **C1.1 Foundational Relationship Protection.** Add relationship provenance/lock + Owner-only unlock/delete. |
| 3 | Back button from profile/relationship network | Not a formal guaranteed journey | High | Low | **B0-C.1 Navigation polish.** Do before broad pilot. |
| 4 | Members can view relationships but cannot manage them | UI already blocks shared relationship writes for non-admin; DB/RLS must be re-certified | Very High | Low verification | **V1 security matrix: verify, do not duplicate.** |
| 5 | Personal hierarchy view without cousins/side branches | Focused lineage exists but currently includes siblings of focused person's parents and spouses | Very High | Medium | **C1.2 Personal Lineage Mode.** Define strict direct ancestors + chosen descendant depth; no cousins by default. |
| 6 | “View family” highlights selected person + dark lineage | Focus/focused-lineage code already exists; visual emphasis may be insufficient | High | Low–Medium | **B0-C.2 Focused lineage visual refinement.** Verify selected-node highlight and dark ancestor line. |
| 7 | Mobile tree defaults to lineage only; whole tree on request | Lineage-only exists but is not the mobile default | Very High | Low–Medium | **B0-C.2 together with #5/#6.** Strong pre-pilot UX priority. |
| 8 | Printable family tree | Generic page Print/PDF exists, not a dedicated tree print layout | High | Medium | **C2.1 Tree Print / PDF.** Fit-to-page, selected lineage/full tree options, privacy-safe headers. |
| 12 | Notification scope: direct lineage / level 1–4 / all / none | Quiet digest exists; lineage scope missing | High | Medium | **C2.2 Scoped Notifications.** Build after strict lineage semantics (#5). |
| 13 | Memories: save/download, like, emojis | Memory saving exists; reactions/download UX incomplete | High | Medium | **C2.3 Memory Interaction.** Keep reactions lightweight, not social-feed behavior. |
| 14 | Contact viewable/not-viewable, member verifies | Existing privacy concepts are partial | Very High | Medium | **C1.3 Verified Contact Consent.** Member-owned visibility + verification + audit. |
| 15 | Admin cleanup | Admin/governance tools exist but cleanup workflow is fragmented | High | Medium | **C1.4 Family Cleanup Center.** Duplicates, orphan links/media, stale invites, incomplete records with reversible actions. |
| 16 | Memory audience: broadcast, lineage levels, selected people | Current memory visibility is broader/simple | Very High | High | **C2.4 Memory Audience Controls.** Depends on strict lineage engine + privacy model. |

## Valuable, but not before alpha usability/trust

| # | Feedback | Value | Cost | Decision |
|---|---|---:|---:|---|
| 9 | Family-wide messaging/chat | Medium–High | High | **D2 Communication**, after pilot proves demand. Significant moderation, notification, retention and privacy surface. |
| 10 | Personal messaging / sub-groups | Medium–High | Very High | **D2 Communication** with #9. Avoid becoming a WhatsApp clone prematurely. Start with structured family groups if evidence supports it. |
| 17 | Animated login/background video showcasing family | Medium | Medium | **Brand/Activation polish later.** Prefer lightweight static/short animation first because mobile performance matters more. |

## Monetization architecture — plan now, enable later

| # | Feedback | Value | Cost | Decision |
|---|---|---:|---:|---|
| 11 | Monetization | Strategic / Very High | High | **M0 Monetization Foundation** after first pilot usage data. Preserve entitlements in feature registry architecture. |
| 18 | Subscription plans: Free 50 MB / Plan 1 100 MB / Exclusive 500 MB / custom | Strategic / Very High | Medium–High | **M0.1 Plans & Entitlements.** Storage limits already provide a useful foundation. Do not lock exact prices/limits until real usage is measured. |

### Recommended plan shape

**Before first broader family sharing:** migration 029 + mobile device verification + V1 certification + B0-C.1/#3 if real-user navigation shows friction.

**Next trust/usability bundle (C1):** #2, #5, #14, #15 plus existing A3/A7 trust/recovery leftovers.

**Next family-delight bundle (C2):** #6, #7, #8, #12, #13, #16 plus existing remembrance/share completion items.

**Later communication bundle (D2):** #9–#10 only after pilot demand is proven.

**Monetization foundation (M0):** #11/#18 after alpha usage reveals storage and feature value; architecture should support Free / Standard / Premium / Custom without hard-coding UI everywhere.
