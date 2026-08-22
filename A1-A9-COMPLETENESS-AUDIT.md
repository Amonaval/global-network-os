# A1–A9 Completeness Audit — 2026-08-22

This audit compares the canonical A1–A9 mission documents and source against the binding family-product requirements and the earlier Alpha roadmap. It deliberately separates **source present**, **verification pending**, and **scope still missing**. A mission must not be called complete merely because a narrow implementation checkpoint exists.

## Status vocabulary
- **SOURCE COMPLETE / VERIFY** — intended source scope is present, but staging/device/security evidence is still required.
- **PARTIAL** — meaningful source exists, but accepted mission scope is still missing.
- **OPEN** — planned capability has not been implemented or proven.

## A1 — Multi-Family Foundation — SOURCE COMPLETE / VERIFY
Present: tenant tables/memberships, active family, network_id scoping, tenant-aware helpers/RLS foundation, migration/backfill.

Still required before VERIFIED:
- **A1.1 Tenant isolation proof** — clean + upgrade migration run and adversarial Family A↔B REST/RPC/storage/public-route tests.
- **A1.2 Regression proof** — Release 1/2/2A journeys after multi-family migration.
- **A1.3 Storage isolation proof** — tenant-prefixed paths and legacy-media compatibility exercised live.

These are verification gates, not new product features.

## A2 — Autonomous Onboarding — SOURCE COMPLETE / VERIFY, UX follow-up preserved
Present: Create Family, invitation preview/accept, claim, family switcher, create another family, tenant-scoped invite management.

Follow-up:
- **A2.1 Foolproof invite recovery** — explicitly validate and polish expired/revoked/used/already-claimed/wrong-account journeys with plain-language recovery actions.
- **A2.2 Demo-mode clarity** — local/demo persistence must be unmistakably labelled and never confused with the real family cloud.
- **A2.3 Duplicate-family prevention** — warn when a user may be creating a family that already exists; no automatic cross-family merge.

## A3 — Family Admin Center — PARTIAL
Present: overview, members/roles, approvals, privacy area, storage, settings, export/backup, family-scoped role changes and summary.

Accepted scope still incomplete:
- **A3.1 Ownership continuity & transfer** — A7 warns about a single admin, but there is no complete safe Owner transfer workflow. Add explicit transfer, confirmation, successor checks and no-owner prevention.
- **A3.2 Privacy preview** — implement real “View as Family Member” and “View Public Page” previews, not only links/help text.
- **A3.3 Friendly diagnostics** — convert common auth/RLS/storage/invite failures into non-technical explanations and recovery actions; no raw database errors in normal family administration.
- **A3.4 Leave family vs delete history** — account/member departure must be distinct from deleting historical family records.

## A4 — Lightweight Identity & Social Links — SOURCE COMPLETE / VERIFY
Present: storage-free avatars, optional social links, per-link public opt-in, HTTPS/host validation, safe external links, no social-image copying.

Follow-up:
- **A4.1 Accessibility/older-user profile pass** — larger tap targets/readability/plain-language validation on profile/social controls. This is a cross-product requirement and can ship with the broader accessibility batch.

## A5 — Family Storage Enforcement — PARTIAL
Present: 100 MB family accounting/quota, 100 KB hard image cap, tenant paths, server/storage enforcement, concurrency protection, browser compression, usage meter, ordinary cleanup.

Missing from original A5 roadmap:
- **A5.1 Thumbnail/derivative strategy** — list/tree views should avoid loading full-size media unnecessarily; prove lightweight rendering behavior.
- **A5.2 Orphan/replaced-media maintenance** — authenticated orphan sweep/maintenance for governed replacements and legacy leftovers.
- **A5.3 Live quota/security verification** — direct API >100 KB, concurrent near-quota uploads, delete accounting and cross-family media access.

## A6 — Remember, Connect, Celebrate — PARTIAL
Present: On This Day, birthday/anniversary sharing, multi-relative memories, privacy-safe memory share text, gathering attendees + post-event story, reunion directory, quiet preferences, contribution gratitude.

Original family-experience scope still under-delivered:
- **A6.1 Remembrance experience** — deceased relatives are represented in the tree, but dedicated remembrance/anniversary-of-passing semantics and invitation exclusion must be validated/polished as one coherent experience.
- **A6.2 WhatsApp-quality visual cards** — current sharing is primarily text/native-share. Add genuinely attractive birthday/anniversary/memory/reunion share cards suitable for WhatsApp.
- **A6.3 Gathering lifecycle completion** — strengthen event → RSVP → gathering → photos/stories → durable memories, including post-event prompts and clear linkage.
- **A6.4 Digest delivery loop** — preferences exist, but actual weekly/monthly digest generation/delivery behavior is not proven by the current source audit.
- **A6.5 Printable family material** — reunion directory exists; preserve printable tree/celebration/reunion outputs as a broader print-quality follow-up.

## A7 — Alpha Launch & Family Delight — PARTIAL
Present: activation checklist, simple family-health score, advisory exact-name+DOB duplicate candidate signal, continuity warning, backup guidance.

Missing/too shallow versus the accepted A7 scope:
- **A7.1 First-10-minute guided activation** — checklist alone is not the full contextual empty-state/template/invite-three journey. Make the path visible across setup/home, not only Admin Center.
- **A7.2 Duplicate-person resolution** — likely-match detection should be safer than exact name+DOB and provide governed compare/resolve/merge-later workflow without auto-merging.
- **A7.3 Reversible mistakes & history** — imports, relationships, approvals and future merges need audit/history and practical undo/recovery where safe.
- **A7.4 Ownership recovery** — complete A3.1 transfer/continuity behavior and recovery procedure.
- **A7.5 Older-user/mobile accessibility** — large targets, readable typography, plain language and forgiving navigation require a deliberate real-device pass and fixes.
- **A7.6 20-family pilot readiness evidence** — privacy regression, performance/mobile/deployment verification and lightweight feedback capture were planned but not implemented/proven by a checklist.

## A8 — Engagement & Sharing — PARTIAL
Present: Family Pulse counters/links, family native/WhatsApp text sharing, A6 sharing surfaces.

Missing for a real engagement mission:
- **A8.1 Meaningful family activity** — calm recent activity that answers “what changed in my family?” without becoming a social feed.
- **A8.2 Personalized return reasons** — contribution prompts, incomplete-relative prompts, celebrations/memories relevant to the signed-in member.
- **A8.3 Rich sharing** — visual privacy-safe share cards/templates and stronger invitation/share-to-WhatsApp journeys.
- **A8.4 Low-activity/empty-family loops** — useful prompts when there are no memories/events/updates rather than dead counters.
- **A8.5 Engagement measurement** — privacy-respecting product events for activation/return/share/contribution so pilot decisions are evidence-driven.

## A9 — 20 → 50 Family Scale — NOT COMPLETE; current work is Part 1
Present: per-family Owner-facing readiness score for continuity/storage/approvals/health/activation.

This is useful but is not actual 20→50-family operation. Required:
- **A9.1 Platform Alpha operations console** — platform-owner view across families: tenant status, activation stage, member count, storage, errors/health and last activity, without casual private-content browsing.
- **A9.2 Activation funnel** — family created → members imported/added → first invite → first claim → first return/memory/contribution.
- **A9.3 Scale/performance evidence** — test representative 100–300 member families plus aggregate 20→50-family workload and fix material regressions.
- **A9.4 Release privacy regression** — repeatable tenant-isolation/privacy suite on every Alpha release.
- **A9.5 Operational runbook** — deployment/migration/backup/export/recovery procedure for operating 50 families safely.
- **A9.6 Family feedback operations** — capture pilot feedback/friction and identify families needing help without inspecting private family content by default.
- **A9.7 20-family → 50-family gate** — do not call A9 complete until evidence from the first cohort meets defined privacy/usability/performance thresholds.

## Cross-mission requirements that must remain visible
1. No raw technical errors in normal family journeys.
2. Owner + Admin continuity and safe Owner transfer.
3. Duplicate-family and duplicate-person safety; later governed merge/recovery.
4. Privacy preview for member/public views.
5. Reversible mistakes/history for high-impact changes.
6. Leave-family/account semantics separate from historical-record deletion.
7. Deceased relatives never enter invitation/account flows; remembrance remains first-class.
8. Older-user/mobile accessibility is a product requirement.
9. Family Admin autonomy: no Supabase/Vercel/SQL for normal operation.
10. Portability/export/recovery are family-product requirements.

## Corrected completion position
A1, A2 and A4 are **source-complete with verification gates**. A3, A5, A6, A7 and A8 are **partial** against their broader accepted scope. A9 is **Part 1 only** and must not be represented as the completed 20→50 scale mission.

## Recommended next implementation packaging
Do not create one tiny mission per item. Use three substantial completion bundles:

### Bundle C1 — Trust, Recovery & Accessibility
A3.1–A3.4 + A7.3–A7.5: Owner transfer/continuity, privacy preview, friendly diagnostics, leave-vs-history semantics, reversible mistakes, older-user/mobile pass.

### Bundle C2 — Family Engagement Completion
A6.1–A6.5 + A8.1–A8.4: remembrance, rich WhatsApp cards, complete gathering lifecycle, digest loop, printable outputs, calm activity/return prompts and empty-state engagement.

### Bundle C3 — Real Alpha Scale
A7.6 + A8.5 + A9.1–A9.7: product instrumentation, platform Alpha console, activation funnel, performance/privacy regression, operational runbook and 20→50 evidence gate.

A2.1–A2.3, A5.1–A5.3 and any defects discovered during C1–C3 should be folded into the nearest shared-code bundle rather than shipped as micro-missions.
