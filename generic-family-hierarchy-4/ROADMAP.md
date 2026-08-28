# G9 UPDATE — NETWORK INTELLIGENCE LAYER IMPLEMENTED

G9 is implemented as deterministic, permission-aware intelligence across all five verticals. It adds network search, connection/path intelligence, network health/completeness, missing-link detection, connector analysis and evidence-backed Ask Network. Intelligence starts in Test for real networks and is enabled in Playground.

**Next gate:** G9 runtime/build verification and real buyer/pilot evaluation. G10 Commercial Platform Foundation remains evidence-gated; no sixth vertical.

---

# Family Product Roadmap — Platform Vision Preserved for Later

## Binding priority — ship to families first

The immediate product is **not an enterprise relationship platform**. It is a
lovely, fast, multilingual and mobile-first family space that ordinary relatives
can use without training. Platform extraction, second verticals, multi-network
SaaS, billing and enterprise operations remain in this document for future use,
but must not delay adoption by real families.

Every near-term deliverable must be visible in the UI or directly improve user
trust, speed or reliability. A backend-only capability is not a family-product
mission unless it is required to release safely.

## Family Release 1 — Create, Explore and Join ✅ source complete

Delivered in this source:

- warm premium family theme and consistent visual tokens;
- mobile-first application shell, icon navigation and responsive layouts;
- English, Hindi and Marathi language foundation across setup, Excel guidance,
  primary navigation, family home and key profile actions;
- two-step first-time family setup with platform/vertical terminology removed;
- downloadable guided Excel workbook with Family Members, Relationships,
  Read Me and realistic example data;
- guided upload, people preview, friendly relationship validation and explicit
  confirmation before import;
- family home hero, simple primary actions and family-first labels;
- refreshed sign-in, profiles, tree, directory and supporting states.

Release before inviting families: run the real-device visual checklist, apply
migrations `001`–`015` to staging, execute the role/privacy matrix, deploy and
complete a small non-technical family usability test. See `FAMILY-RELEASE-1.md`.

## Family Release 2 — Remember, Connect and Celebrate

After Release 1 is in family hands, deliver memories/stories, living activity,
birthdays and anniversaries, guided contributions, WhatsApp-first invitations
and sharing, QR/printable cards and a lightweight family-gathering experience.
Measure joining, completed profiles, contributions, sharing and return visits.

## Later — technical and commercial platform roadmap

The previous D2/D3 roadmap is retained below. Resume it only after real family
usage is observed and the founder deliberately reopens platform expansion.

## D1 — Production Participation Release ✅ source complete / live gate pending

P5.1 living-network UX and P5.2 participation/distribution are implemented through migration `016`. Bulk invitations, claiming, contributions, QR/deep links/embed, group/reunion validation and success metrics are included. See `D1-IMPLEMENTATION.md`; live closure follows `D1-RELEASE-GATE.md`.

## Binding execution packaging — three deliverables

1. **D1 Production Participation Release:** remaining P5-S0 staging/RLS gate, P5.1 family-experience baseline, and all P5.2 invitation, contribution, QR/public/embed, group and reunion validation work.
2. **D2 Vertical Proof & Commercial Validation:** P5.3 core/module architecture plus P5.4 family, alumni/association and one B2B willingness-to-pay experiment. The second vertical must have real semantics, not renamed family concepts.
3. **D3 Multi-Network SaaS:** P6 first-class tenancy, network roles/dashboard, plans/limits, branding/embed, observability, backup and tenant migration. Start only after D2 establishes a credible paid ICP.

## Current Position --- August 2026

P3 established the hierarchy product. P4 added trust/governance,
adoption, relationship intelligence, profiles, community/memories,
discovery, analytics/geography/export and scale foundations. Migration
`010` hardened major IDOR/ownership/audit issues.

Early P5 shipped: - configurable vocabulary/templates (`011`); - private
Storage + signed URL path (`012`); - shareable anonymous public page
(`013`).

Current caveats: - live staging migration and role-matrix verification remain; -
the platform is configurable vocabulary over a family-centric schema, not
yet a fully generic domain model.

# Immediate Roadmap

## P5-S0 --- Security & Baseline Closure

**Goal:** make the current baseline safe to extend.

Deliver: - tighten Storage object authorization so private/admin media
cannot be fetched merely by knowing an object path; - validate
signed-media access against entity/memory visibility; - clean
`npm install` / `npm run build`; - apply migrations 001--015 on clean
staging; - exercise anon/member/admin/invited-user RLS journeys; -
update production-readiness status.

**Exit:** no known P0 security/build/migration blocker.

## P5.1 --- Living Network

**Goal:** turn static hierarchy data into an ongoing human experience.

Deliver: - privacy-aware network-wide timeline; - upcoming
birthdays/anniversaries/milestones only for domains where those
semantics apply; - controlled member self-edit; - field-aware
governance: low-risk profile fields may direct-save when configured;
identity/relationship/governed fields remain reviewed; - mobile-complete
experience.

Family value: collective history and reasons to return. Platform value:
generic event-stream + ownership/edit primitives.

Delivered D1 UX baseline: family-first progressive setup, warm home context,
plain family language, mobile contribution access/navigation repair, large-tree
guidance, better profile/timeline states and rendered desktop/mobile validation.

## P5.2 --- Participation & Distribution ✅ source complete

**Goal:** make contribution and sharing self-propagating.

Deliver: - invitation/claim flow at scale; - QR/public profile cards
where visibility permits; - group connection view; - contribution
prompts for missing information; - public/embed hardening; - lightweight
reunion/event use-case validation.

Measure invite acceptance, contributed data, shares and return visits.

## P5.3 --- Modular Domain Architecture

**Goal:** evolve from labels to a real core + vertical-module
architecture.

Deliver: - define generic entity/edge/event capabilities; -
capability/module registry; - family module: genealogy,
deceased/in-memoriam, kinship, family milestones; - prove one second
vertical with real semantics; - prevent new family-specific assumptions
in generic services; - design a safe migration path away from `family_*`
persistence without a big-bang rename.

Candidate validation verticals: alumni/associations first; organization
or ownership depending customer evidence.

## P5.4 --- Commercial Validation

**Goal:** prove willingness to pay before expensive platformization.

Run parallel experiments for: - family premium; - alumni/association
paid network; - one B2B specialist vertical.

Add only minimal infrastructure needed to test pricing/limits. Track
activation, retained networks, invitations, contributions, admin effort,
usage, conversion intent and paid pilots.

**Exit:** at least one vertical has credible paid demand and a defined
ICP.

# Vision Roadmap

## P6 --- Multi-Network SaaS

Only after commercial evidence: - first-class `network_id` tenancy; -
network dashboard/switching; - network-scoped roles and tenant-safe
RLS; - plans/limits; - branded/public/embed options; -
observability/backups.

## P7 --- Focused Domain Products

**Family/Heritage:** genealogy-grade lineage, private circles,
stories/documents, reunions, heritage exports/books, geographic
journeys.

**Alumni/Associations:** directory, batches/chapters, mentorship,
events, contribution campaigns, branded portals.

**Organization/Relationship Mapping:** reporting structures, role
history, controlled directories and organizational insight.

**Ownership/Specialist Networks:** typed ownership edges, percentages,
control chains and historical ownership when market evidence justifies
it.

## P8 --- Relationship Intelligence

After data quality and permissions mature: - semantic/network-aware
search; - natural-language questions over authorized graph data; -
anomaly/suggestion engine; - relationship-aware recommendations; -
generated histories/summaries grounded in source records; -
domain-appropriate graph analytics.

AI must remain permission-aware and evidence-grounded.

## P9 --- Platform / Ecosystem

Only when multiple products repeatedly need it: - stable API; -
integrations/webhooks; - embeddable components; - import connectors; -
white-label; - partner/developer capabilities.

The platform should emerge from repeated product needs, not precede
them.

# Architectural North Star

                        Shared Product Platform
     Auth • Tenant • Privacy • Audit • Search • Storage • Notifications
                                  |
                     Relationship Intelligence Core
     Entity • Typed Edge • Path • Event • Media • Location • Contribution
                                  |
                 +----------------+----------------+
                 |                |                |
            Family Module     Alumni Module    Org/Other Module
            genealogy         batch/chapter    reporting semantics
            kinship           mentorship       role history
            in-memoriam       reunion          domain analytics
                 |                |                |
                 +----------------+----------------+
                                  |
                        Shared UI primitives

## Deliberately Postponed

Premature universal schema rewrite, complex enterprise RBAC, native
mobile apps, social feed/chat, broad AI assistant, marketplace/ecosystem
and full billing platform before paid-demand validation.

# 2026-08-22 Roadmap Addendum — Family Alpha Autonomy (Binding; preserves all roadmap above)

Nothing above is removed. This addendum changes execution order only. Earlier valuable missions remain queued behind explicit gates.

## Locked family-product decisions
- One application, one primary domain, many isolated family networks.
- Family creator authenticates and becomes Owner; Owner/Admin operates the family; invited relatives participate free.
- One account may legitimately belong to multiple families.
- Excel bootstraps large families; invitations and guided contributions maintain them.
- Public family/profile pages expose deliberately public-safe data only; slugs are not authorization.
- WhatsApp-first sharing, multilingual/mobile-first novice UX, privacy and family autonomy remain acceptance criteria.
- Alpha storage ceiling: 100 MB per family. Photo upload OFF by default; if enabled, each image is <=100 KB.
- Initials/selectable lightweight avatars are preferred; optional public Facebook/Instagram profile links may be shared instead of storing photos. Social images are never copied by the service.
- Memories remain useful without images.
- Alpha target: 20 families, then 50, without routine platform-owner/Supabase intervention.
- Paid Beta direction: family Owner/Admin pays; relatives participate free; plans combine member capacity, storage and premium family features.

## User-perspective requirements — must not be lost
1. Ownership continuity: Owner + additional Admins and safe ownership transfer.
2. Duplicate-family prevention and later safe merge/recovery.
3. Duplicate-person prevention with likely-match prompts.
4. Foolproof invitation/claiming: invited -> continue -> identify/claim -> done; hide technical jargon.
5. Multi-family membership and family switching are normal scenarios.
6. Privacy preview: View as Family Member / View Public Page.
7. Family-health language: completeness, missing details, unjoined relatives, relationships needing confirmation.
8. Reversible mistakes/history for imports, relationships, approvals and future merges.
9. Leaving a family/account is distinct from deleting historical family records.
10. Deceased relatives never enter account/invitation flows; support remembrance semantics.
11. Older-user accessibility: large targets, readable typography, plain language, forgiving navigation.
12. First-10-minute activation: Create -> Add/import -> See tree -> Invite 3 relatives -> Complete profile -> Share.
13. No raw permission/RLS/storage errors; show understandable recovery guidance.
14. Family Admin autonomy: no Supabase, Vercel or SQL required.
15. Data portability/export and safe family continuity are product requirements, not enterprise extras.

## Top three priorities
### Priority 1 — A1 True Multi-Family Foundation — IMPLEMENTED / VERIFICATION GATE OPEN
Minimum tenancy needed for the family Alpha. This is deliberately distinct from the mature P6 SaaS mission retained above.
- networks + network_memberships; Owner/Admin/Member roles.
- active-network context and multi-family account foundation.
- network_id ownership across family-domain data.
- tenant-aware RLS/RPC/storage foundation and cross-family isolation tests.
- migrate the existing family/data into Network #1 without deleting history.
- per-network settings foundation, including 100 MB quota metadata and photo policy.
- preserve current Release 1/2 functionality while tenant-scoping it.

Exit gate: Family A cannot read/write Family B through UI, direct REST, guessed UUIDs, RPCs or storage paths; existing family journeys still work.

### Priority 2 — A2 Autonomous Create / Join / Invite / Claim — NEXT AFTER A1 VERIFICATION
Create Family -> authenticate -> name family -> become Owner -> Excel/empty -> invite relatives. Invite -> authenticate -> validate token -> join correct family -> claim/link profile -> Home. Add family switching and make local persistence explicitly Demo mode.

### Priority 3 — A3 Family Admin Center — AFTER A2
Self-service members, invitations, approvals, privacy previews, Owner/Admin management and transfer, family health, import/export, photo policy, 100 MB storage meter/quota, friendly diagnostics and usage visibility.

## Family experience queue — resume immediately after Alpha autonomy foundation
Do not let SaaS machinery consume the product. Complete Release 2: On This Day, warm memories/stories, birthdays/anniversaries/remembrance, WhatsApp-quality cards, gatherings -> RSVP -> photos/stories -> memories, printable tree/reunion material, restrained notifications/digests, contribution gratitude, social-profile links and selectable avatars.

## Alpha operations gate
20-family pilot -> privacy/isolation/usability/performance evidence -> 50-family pilot. Product owner operates the service, not individual families.

## Future queue — preserve; do not implement until Alpha evidence
All earlier P5.3 modular-domain architecture, P5.4 commercial validation, family premium experiments, alumni/association validation, B2B specialist validation, generic entity/edge/event core, module registry and safe migration away from family-specific persistence remain queued.

## Far-future queue — preserve; reopen only after paid-demand/vertical milestones
All earlier P6 mature SaaS capabilities, P7 focused domain products, P8 relationship intelligence and P9 platform/ecosystem remain intact: mature plans/limits, branding/custom domains, observability/backups, tenant migration, alumni/org/ownership products, semantic/network search, permission-aware natural-language questions, anomaly/suggestion engine, recommendations, grounded generated histories, graph analytics, stable APIs, integrations/webhooks, embeddable components, import connectors, white-label and partner/developer capabilities.

Also retain deliberately postponed possibilities: premature universal schema rewrite, complex enterprise RBAC, native mobile apps, social feed/chat, broad AI assistant, marketplace/ecosystem and full billing platform. They are deferred, not rejected.

## Permanent roadmap preservation rule
Prioritization may reorder, gate, supersede or defer an accepted idea. It must never silently delete a valuable previously accepted capability. Use NOW / NEXT / FUTURE QUEUE / FAR FUTURE QUEUE and explicit milestone gates.

## 2026-08-22 A6 completion addendum
A6 — Release 2 Completion: Remember, Connect, Celebrate is **implemented in source / verification pending**. On This Day, birthday/anniversary sharing, privacy-safe memory cards, gathering attendee/story follow-up, printable reunion directory, quiet digests and explicit contribution-success feedback are now in the canonical source. See `A6-REMEMBER-CONNECT-CELEBRATE.md` and migration `024`. Next: A7 Alpha operations (20 → 50 families), after A6 staging/real-device verification.

## 2026-08-22 execution-size rule — bundle meaningful product work
From A7 onward, avoid spending a mission/release on one minor enhancement. Default to **2–4 related user-visible features in one implementation bundle**, chosen by complexity and shared code/data paths. A single-feature mission is reserved for high-risk foundations, migrations, security/privacy boundaries, or work large enough to stand alone.

### A7 — Alpha Launch & Family Delight Bundle (NEXT; 4 coordinated workstreams)
1. **Alpha onboarding polish & activation** — tighten the first-10-minute journey, contextual empty states, sample/template guidance, and invite-three-relatives activation cues.
2. **Family health & duplicate safety** — likely-person duplicate prompts, incomplete relationship/profile guidance, and clearer family-health actions without technical/admin jargon.
3. **Continuity, recovery & reversible mistakes** — practical ownership continuity/transfer polish, safer import/relationship recovery/history, and family export/backup usability.
4. **20-family pilot readiness** — friendly diagnostics, privacy/isolation regression checklist, performance/mobile pass, deployment verification and lightweight feedback capture needed to operate the first 20 real families.

**A7 exit gate:** a novice Owner can create/import a family, invite relatives, understand what needs improvement, recover from common mistakes, manage continuity/export, and run the family without Supabase/Vercel/SQL assistance; the product is ready for a measured 20-family pilot.

### A8 — Engagement & Sharing Bundle (after evidence from first pilot families)
Bundle 2–4 of the highest-value improvements revealed by A7/real-family usage, prioritizing family return loops, WhatsApp-quality sharing, reunion/celebration workflows, contribution participation and older-user/mobile usability. Do not pre-commit minor UI polish that pilot evidence may invalidate.

### A9 — 20 → 50 Family Scale Bundle
Combine operational hardening, highest-frequency pilot fixes, privacy/performance evidence and only the minimum product/admin capabilities required to move safely from 20 to 50 families. Commercial/Beta work remains gated behind evidence rather than displacing family-product quality.

## 2026-08-22 A7 implementation checkpoint
A7 Alpha Launch & Family Delight Bundle is **implemented in source / verification pending**: activation checklist, visible family-health/duplicate safety, continuity/backup guidance, and 20-family Owner operational readiness are combined in one Admin Center experience. Next: validate A6/A7 together, then execute A8 as another 2–4 feature engagement bundle informed by family usage.

## 2026-08-22 A8 + A9 combined implementation checkpoint
A8 Engagement & Sharing and A9 20→50 Family Scale are **combined and implemented in source / verification pending**. The product now exposes Family Pulse return loops, deliberate WhatsApp/native family sharing, and an Owner-facing Pilot Readiness gate covering continuity, storage, approvals, data health and activation. No new migration beyond 025 is required. The next milestone is not another small feature batch: validate A6→A9 end-to-end and begin real-family Alpha onboarding; subsequent product work should be driven by observed pilot friction and engagement.

## 2026-08-22 A1–A9 completeness correction — binding
A source checkpoint is not equivalent to full mission completion. `A1-A9-COMPLETENESS-AUDIT.md` is the current completeness ledger. Earlier checkpoint text remains as history but must be interpreted through this correction.

- **A1:** source complete / tenant-isolation + regression verification open (`A1.1–A1.3`).
- **A2:** source complete / onboarding recovery, Demo clarity and duplicate-family prevention follow-ups (`A2.1–A2.3`).
- **A3:** partial — Owner transfer, real privacy preview, friendly diagnostics and leave-vs-history semantics remain (`A3.1–A3.4`).
- **A4:** source complete / verify; accessibility follow-up preserved (`A4.1`).
- **A5:** partial — thumbnail/lightweight rendering, orphan maintenance and live quota/isolation evidence remain (`A5.1–A5.3`).
- **A6:** partial — remembrance, rich WhatsApp visual cards, gathering lifecycle, actual digest loop and broader print outputs remain (`A6.1–A6.5`).
- **A7:** partial — deeper activation, duplicate resolution, reversible history, ownership recovery, older-user/mobile pass and real 20-family evidence remain (`A7.1–A7.6`).
- **A8:** partial — calm activity, personalized return prompts, rich sharing, empty-state loops and engagement measurement remain (`A8.1–A8.5`).
- **A9:** **Part 1 only** — per-family readiness is not 20→50-family operations. Platform Alpha console, activation funnel, scale/privacy evidence, runbook, feedback operations and explicit 20→50 gate remain (`A9.1–A9.7`).

### Completion packaging from here
1. **C1 — Trust, Recovery & Accessibility**: A3.1–A3.4 + A7.3–A7.5.
2. **C2 — Family Engagement Completion**: A6.1–A6.5 + A8.1–A8.4.
3. **C3 — Real Alpha Scale**: A7.6 + A8.5 + A9.1–A9.7.

Fold A2/A5 follow-ups into the nearest shared-code bundle. Do not mark A3/A5/A6/A7/A8/A9 complete until their ledger items are implemented and their required evidence exists.

# 2026-08-22 — B0 Progressive Family Experience (Binding execution order)

Feature expansion is temporarily frozen. The product already contains substantial capability; the next release risk is perceived complexity and premature feature exposure.

## B0-A — Product Simplification Foundation — IMPLEMENTED / VERIFY

- Historical capability ledger from P3/P4/P5/D1/Family Releases/A1–A9.
- Canonical feature registry and stable feature keys.
- Three progressive member experiences: Simple, Connected, Explorer.
- Separate role-gated Family Admin / Manage family surface.
- Platform-owner identity separate from family Owner/Admin.
- Founder rollout model: Hidden / Test / Pilot / Released.
- Strict gating precedence: founder release × experience level × permission.
- Role-aware navigation and family-language terminology.
- Existing capabilities remain in source even when hidden.

See `B0-A-PRODUCT-SIMPLIFICATION-FOUNDATION.md` and `B0-HISTORICAL-CAPABILITY-LEDGER.md`.

## B0-B — Progressive Launch System — NEXT

Implement as one meaningful batch:
1. Founder Launch Console accessible only to `platform_owners`.
2. Bundle controls plus meaningful individual feature overrides.
3. Hidden/Test/Pilot/Released controls and explicit pilot-family targeting.
4. Family-level member feature preferences, bounded by founder rollout (Founder OFF always wins).
5. What's New / first-discovery cards / learned-or-dismissed state so release does not permanently clutter navigation.
6. Clear launch audit trail and safe defaults; no client-side privilege escalation.

## B0-C — Human-Friendly Family Experience

Implement as one meaningful batch:
1. Invitation → identify yourself → claim profile → photo/basic details → meet family.
2. Radical first-visit simplification with minimal typing and no platform terminology.
3. Simple Home/Family/Me refinement, one primary action per screen and progressive disclosure.
4. English/Hindi/Marathi family-language audit.
5. Large touch targets, readable text, back-navigation safety and unexplained-icon removal.
6. Empty/error/slow-network states suitable for older/non-technical users.
7. Real parent/grandparent/non-technical mobile usability gate.

## After B0

Resume bundled delivery only after initial family usage:
- **C1 Trust, Recovery & Accessibility** — absorbs open A3/A5/A7 trust and recovery follow-ups.
- **C2 Family Engagement Completion** — absorbs A6/A8 remembrance, sharing, gathering and return-loop follow-ups.
- **C3 Real Alpha Scale** — completes A9 with cross-family operations, activation funnel, performance/privacy regression and the 20→50 promotion gate.

A1–A9 mission status remains implementation/verification truthful even when capabilities are hidden by B0 rollout controls.

## 2026-08-22 — B0-B implementation checkpoint

**B0-B Progressive Launch System is IMPLEMENTED IN SOURCE / verification pending.**

Delivered as one coherent release-control batch:
1. Founder-only Launch Control with bundle + solo feature switches.
2. Hidden/Test/Pilot/Released rollout and explicit family targeting.
3. Family Admin member-feature preferences that can only narrow founder-released capability.
4. One-time What's New discovery cards tied to announcement versions.
5. Founder rollout audit history and safe server-side authorization.

Migration: `027_b0b_progressive_launch_system.sql`.

The binding next mission is **B0-C Human-Friendly Family Experience**. B0-C should complete the adoption layer before C1/C2/C3 or additional feature expansion: radical invitation/first visit, calm Simple experience, one-primary-action screens, multilingual family-language cleanup, large touch targets, back-navigation safety, slow-network/error/empty states, and real novice/older-user mobile validation.

## 2026-08-22 — B0-C implementation checkpoint

**B0-C Human-Friendly Family Experience is IMPLEMENTED IN SOURCE / real-user verification required.**

The product now has the intended progressive adoption architecture:
- Simple member: Home · Family · Me;
- Connected member: adds memories/family moments;
- Explorer member: richer family exploration/contribution tools;
- Family Admin: separate Manage family surface;
- Platform Owner: separate Launch Control.

B0-C additionally makes invitations identity-first rather than account-first, reduces Simple-mode clutter, lets ordinary members progressively opt into more capability, and strengthens mobile touch/slow-network/error states.

### Mandatory B0-C usability gate before broad Alpha rollout
1. 50+/60+ low-frequency app user completes invitation and reaches family without coaching.
2. Non-technical 30–50 user can find a relative, open a profile and return Home.
3. Home / Family / Me labels are self-explanatory.
4. Progressive “More family” discovery is understandable but not intrusive.
5. Hindi/Marathi reviewed by fluent family members.
6. Real Android/iOS and narrow-screen/large-text/slow-network behavior checked.

If this evidence produces friction, fix it as **B0-C.1 Novice Usability Corrections** before C1/C2/C3. This is not a feature-expansion mission; it is an adoption gate.

# 2026-08-22 — V1 Family Alpha Release Certification (Binding next gate)

B0-A/B/C establish the simplification and progressive-release architecture. The next priority is now release certification, not more feature expansion.

## V1 — Family Alpha Release Certification — IMPLEMENTED IN SOURCE / CERTIFICATION REQUIRED

Scope delivered in source:
1. Multi-owner Founder Launch Control management by existing-account email, with final-owner lockout protection and access audit.
2. Essential account journey: signup confirmation/resend, sign in, forgot password, reset-link handling, new password, sign out/session recovery.
3. Founder one-click safe Day-1 Alpha rollout preset.
4. Binding end-to-end certification matrix for migrations, auth, invitation/claim, progressive experience, role boundaries, privacy/RLS, devices, slow network and novice-user completion.
5. Historical capability reconciliation remains tied to `B0-HISTORICAL-CAPABILITY-LEDGER.md` and `A1-A9-COMPLETENESS-AUDIT.md`; hidden or partial work must not be falsely marked complete.

### V1 certification gate
Before inviting the first external pilot families:
- production build passes;
- clean + upgrade migrations through 028 pass;
- account recovery and invitation journeys pass;
- Member / Family Admin / Platform Owner boundaries pass;
- cross-family data/media isolation passes;
- real mobile/slow-network checks pass;
- at least one 50+/60+ low-frequency app user and one non-technical 30–50 user complete core journeys without coaching;
- founder deliberately applies/chooses Day-1 rollout rather than exposing all deployed capability.

### Post-certification sequence
1. Founder family + 2–3 trusted-family pilot.
2. B0-C.1/V1 corrections driven by observed friction.
3. Gradual feature release through B0-B.
4. Resume C1 Trust/Recovery/Accessibility, C2 Engagement Completion and C3 Real Alpha Scale based on evidence.

### V1.1 preserved after trusted-family Alpha — Account lifecycle & help
Do not lose: verified email change, account deletion vs family-history retention, leave-family semantics (A3.4/C1), other-session revocation, simple help/contact-family-admin path, and Terms/Privacy acknowledgement before broad public self-service launch.

---

## 2026-08-23 — Pre-Alpha family feedback correction

Before broader family sharing, feature expansion remains secondary to adoption, trust and release control.

### P0 — Pre-alpha blockers
- **P0.1 Mobile full-width rendering:** device-width viewport + 100% mobile shell. Source fixed; real-device verification required.
- **P0.2 Platform-controlled family creation:** migration 029. Normal users request a family; platform owners approve/reject; approved requester becomes Family Owner. Direct family creation is rejected at the database layer for non-platform owners.
- **P0.3 V1 certification remains binding:** authentication, invitation, role/RLS, rollout precedence, mobile/novice journey and historical completeness must pass before Alpha Certified.

### C1 — Trust, Lineage & Cleanup bundle
Absorb: foundational relationship locks (Owner-defined parent hierarchy), strict Personal Lineage mode, verified member-owned contact visibility, cleanup/reversible repair workflows, and previously recorded trust/recovery/accessibility gaps.

### C2 — Family Delight & Controlled Sharing bundle
Absorb: focused-person/lineage visual refinement, mobile lineage-first tree, dedicated tree print/PDF, lineage-scoped notifications, memory reactions/download, and lineage/selected-person memory audiences, together with existing remembrance/sharing completion work.

### D2 — Communication (evidence-gated)
Family chat, direct messages and sub-groups are explicitly preserved but deferred until pilot evidence shows that Family Network should own messaging rather than integrate/share through WhatsApp or another channel.

### M0 — Monetization Foundation (after pilot evidence)
Preserve subscription/entitlement architecture for Free / Standard / Premium / Custom plans. Candidate storage tiers from feedback are 50 MB / 100 MB / 500 MB, but exact limits and pricing are **not committed** until real-family storage and engagement data is measured.

See `PRE-ALPHA-FAMILY-FEEDBACK-PRIORITIZATION.md` for the complete value/cost matrix. No feedback item is to be silently dropped if priorities change.

# 2026-08-23 — CR1 Core Family Simplicity & Trust (Binding pre-pilot checkpoint)

**Status: IMPLEMENTED IN SOURCE / VERIFY. Do not interpret this as completion of all C1 trust work.**

CR1 moves the highest-value Core-mode simplification ahead of general feature expansion:

1. **Strict Personal Lineage** — direct ancestors + direct descendants + focused person's spouse; no sibling/cousin/side-branch expansion by default.
2. **Lineage-first default** — a linked Simple member opens Family on their own Personal Lineage, and all signed-in members do so on mobile; Full Tree is opt-in.
3. **Mobile non-canvas lineage experience** — simple grouped relatives instead of requiring pan/zoom on a graph.
4. **Focus clarity** — explicit You/Viewing markers and stronger focused lineage edges.
5. **Navigation safety** — profile history Back and tree Back-to-profile.
6. **Human relationship language** — relationship-to-viewer text replaces generation-centric framing where possible in Simple mode.
7. **Relationship authority clarity** — members are view-only for structure; Manage Relationships is Family Admin-only.
8. **Foundational relationship protection** — migration 030 restricts parent/child deletion to Family Owner; co-admin cannot destructively remove direct lineage.
9. **Older-user readability** — persistent Larger Text option.

## CR1 verification required before broad family sharing

- `npm run validate:cr1`.
- production `npm run build`.
- migration 030 on clean/upgrade Supabase.
- member/admin/owner delete matrix.
- 360/390/430px Android/iOS real-device checks.
- Simple member must see own lineage with no cousins/siblings by default.
- profile → relative → Back and profile → tree → Back journeys.
- larger-text overflow check.

## CR1 items deliberately left open (must not become false-complete)

### CR1.1 — Simple governed corrections
Turn **Something is wrong?** into a one-screen member submission for profile/relationship/missing-person errors, using the existing change-request/governance system underneath.

### CR1.2 — Verified Contact Consent / data-layer privacy
Current UI visibility is insufficient for completion because raw family-member retrieval can still contain phone/email. Implement sanitized member reads (view/RPC), self-owned contact verification, visibility consent and audit. This is **Very High priority before broad external/public rollout**.

### CR1.3 — Relationship provenance / explicit Owner locks
Migration 030 protects all parent-child deletion from co-admins. Later add provenance/lock metadata so an Owner can explicitly lock/unlock foundational relationships and corrections remain auditable.

### CR1.4 — Safe cleanup / archive / recovery
Do not expose broad destructive cleanup until member/profile/relationship archive and recovery semantics exist. Fold into C1 Family Cleanup Center.

### CR1.5 — Kinship language + accessibility evidence
Translate generated kinship descriptions for Hindi/Marathi, then validate with fluent/non-technical relatives and large-text/device accessibility tests.

## Updated execution order after CR1

1. **CR1 verify + V1 Family Alpha Release Certification** — release gate, not feature expansion.
2. **Founder family + 2–3 trusted family pilot** using the Day-1 rollout preset.
3. **B0-C.1 / CR1.x corrections from observed friction**, especially contact privacy if external sharing is enabled.
4. **C1 Trust, Recovery & Accessibility completion** — absorbs A3/A5/A7 trust leftovers + CR1.1–CR1.5 where appropriate.
5. **C2 Family Engagement Completion** — remembrance, rich sharing, tree Print/PDF, scoped notifications, memory interactions/audiences.
6. **C3 Real Alpha Scale** — actual cross-family 20→50 operations, activation funnel, privacy/performance evidence and runbook.
7. **D2 Communication** only if pilot demand justifies chat/DM/subgroups.
8. **M0 Monetization Foundation** after usage/storage evidence; preserve Free/Standard/Premium/Custom candidate architecture without fixing limits/prices prematurely.

All earlier A1–A9, P3/P4/P5/D1, B0 and feedback-led items remain preserved. Hidden/deferred features are not removed and partial work is not equivalent to completed work.

---

## CR2 — Frictionless Family Entry & Alpha Exploration — IMPLEMENTED / VERIFY

**Priority: Alpha blocker.** A user must be able to explore with Supabase enabled without founder coaching.

Delivered in source:
- no-family landing: Join / Explore Sample / Create;
- Alpha family-creation auto-approval setting controlled by Platform Owner;
- migration 031 intentionally sets approval **OFF for the current Alpha**;
- short Family Code join for trusted relatives;
- verified-email detection/claim of an existing unclaimed profile;
- read-only Sample Family while remaining authenticated;
- prominent Excel-first family creation;
- quick Invite Family code/share experience;
- updated in-product Quick Start help.

Still requires live Supabase verification. Do not mark complete based only on source checks.

### CR2 follow-ups preserved, not required for first Alpha
The implementation sequence has consumed CR2.1–CR2.3 as real Alpha stabilization missions. Older ideas are preserved and renumbered rather than overwritten:
- CR2.4: invitation detection inside normal post-login landing when a token was opened on another device;
- CR2.5: richer "connect my joined membership to my profile" assistant after Family Code join;
- CR2.6: optional QR rendering of Family Code/join URL;
- CR2.7: Alpha onboarding analytics: signed-up → joined/demo/created → opened tree → returned;
- CR2.8: safe expiry/rotation policy for Family Codes if/when Alpha expands beyond trusted distribution.

**Immediate release order:** CR2.3 deployed behaviour verification → V1 Alpha certification → 2–3 trusted-family pilot → evidence-driven corrections.

### CR2.1 — Alpha onboarding/runtime hotfix — IMPLEMENTED / VERIFY
- Fix demo/local non-UUID profile IDs reaching UUID-only Supabase RPCs.
- Replace direct `network_settings` writes with tenant-scoped RPC updates.
- Normalize friendly Excel IDs to UUIDs before shared persistence.
- Offer both a small quick-start Naval workbook and the existing 150-person full demo workbook.
- Do not mark complete until fresh-family creation and both sample imports are tested against live Supabase.

## CR2.2 — Alpha First-Impressions QA & Progressive Onboarding — IMPLEMENTED / BEHAVIOUR VERIFY

This is now a release-critical layer before broad family sharing.

Implemented:
- explicit network ID on fresh-family settings save;
- no-login read-only Playground;
- family-name-only creation;
- progressive Excel/CSV import;
- guided Excel dropdowns;
- Father/Mother/Son/Daughter/Husband/Wife import vocabulary;
- human relationship labels on full-tree edges;
- detailed Help document preview;
- binding critical-path behaviour QA.

Not complete until fresh-account, Playground, Excel, mobile and relationship-vocabulary journeys pass against the deployed Supabase/Vercel environment.

## CR2.3 — Alpha Onboarding Stabilization + Behaviour QA — IMPLEMENTED / LIVE VERIFY

P0 correction after real Alpha testing exposed `Administrator access is required` during fresh-family creation.

Implemented:
- refresh creator auth immediately after the returned family UUID is activated;
- hydrate the newly-created family explicitly as Owner/Admin rather than using stale pre-create auth state;
- remove the redundant immediate settings re-save from the create path because `create_family()` already creates the family settings row;
- make bulk-import authorization recognize actual family Owner/Admin membership;
- make post-create audit telemetry non-blocking;
- migration 034 hardens active-family fallback and family-scoped legacy admin/audit semantics;
- preserve real-device CSS fixes: Special Days card padding and profile overlay stacking.

**Verification rule:** CR2.3 is not complete until anonymous Playground, fresh creator, Excel/CSV creator, joiner and returning-owner journeys pass on deployed Supabase/Vercel.

### Follow-ups preserved
- CR2.9 Generation inference + post-import relationship helper — only if Alpha users struggle with generation/relationship entry.
- CR2.10 Public first-impression polish + privacy-conscious funnel metrics — after real Alpha observation.

# 2026-08-23 Strategic Priority Overlay — Next 3 Milestones (Binding)

All previous roadmap items remain preserved. This overlay changes execution priority because the product is now feature-rich enough that **adoption, retention and business proof matter more than adding breadth**.

## S1 — Instant Family Magic — NEXT

**Goal:** a skeptical new user experiences personally meaningful value within 60 seconds.

Binding work:
- finish CR2.3 live behaviour verification and CR2.3.x corrections;
- certify anonymous Playground as a pitch-quality, no-login, no-save experience;
- make My Family Line + relation-to-me the default first family experience;
- finish mobile first-impression polish at 360/390/430px;
- ensure family creation requires <= 2 inputs and all other detail can be deferred;
- keep Excel/CSV guided and optional;
- add at most a 3-step contextual first-use spotlight;
- remove technical/admin language and dead ends from the first session.

**Exit:** 5+ critic users, including 2+ low-frequency/non-technical mobile users, complete the first-session journey without founder coaching; median first meaningful interaction target < 60 seconds.

## S2 — Living Family Loop

**Goal:** turn the static graph into a calm reason to return, contribute and invite.

Binding work:
- reconcile A6/A8/C2 partials into one Family Pulse and contextual contribution loop;
- complete emotionally strong, privacy-safe celebration/memory/lineage sharing artifacts;
- finish lightweight memory interaction and quiet scoped notifications after trust/lineage prerequisites;
- measure invite → join → claim → contribute → share → return;
- use AI only for relationship-grounded, permission-aware intelligence such as relation questions, grounded family summaries and missing-information suggestions.

**Exit:** real pilot families demonstrate a repeatable Discover → Feel → Contribute → Share → Return loop with measurable 7-day return, contribution and organic invite/share behavior.

## S3 — Proof of a Defensible Business

**Goal:** prove this is an investable/acquirable company/asset, not merely an impressive demo.

Binding work:
- certify V1 on the latest CR1/CR2 baseline;
- progress 3–5 trusted families → 20 families → 50-family promotion gate;
- implement the real cross-family Founder Operations console promised by A9/C3;
- complete high-risk C1 trust work: API-level contact privacy/consent, safe cleanup/archive/recovery, relationship provenance/Owner locks and account lifecycle semantics;
- instrument family-level activation, retention, contributions, invites/shares, support burden and cost;
- validate 100–300-member performance and repeat cross-family RLS/privacy matrices;
- test willingness to pay before full billing;
- prove one adjacent paid vertical using the relationship core rather than a renamed family product;
- maintain an investor/acquirer data room with architecture, trust model, cohort metrics, pilot evidence, runbooks and known gaps.

**Exit:** retained live families, measurable organic expansion, scalable founder/admin operations, no unresolved critical trust issue, and at least one credible willingness-to-pay signal.

## Strategic sequencing

`CR2.3 live verification → S1 → V1/3–5 family pilot → S2 → S3 20→50 proof → monetization/platform expansion based on evidence`

C1/C2/C3 remain preserved but are now consumed under S2/S3 according to the outcome they support. D2 chat/DM remains evidence-gated. M0 monetization architecture remains after usage/value evidence rather than before it.

Full rationale and metrics: `STRATEGIC-NEXT-3-MILESTONES.md`.

## 2026-08-23 — S1 Batch 1: S1-A + S1-B — IMPLEMENTED IN SOURCE / BEHAVIOUR VERIFY

The first S1 implementation batch is now in source. Historical CR/A/B roadmap content above remains unchanged and authoritative.

Delivered:
- anonymous Playground now has a temporary no-save **You** viewpoint;
- Home anchors the current viewer and first family interaction;
- personal **My Family Line** is the first family representation for Playground/simple/mobile journeys;
- Personal Family Line ↔ Full Tree is explicitly reversible;
- profiles and tree cards show human relationship-to-me wording;
- immediate-family shortcuts expose parents/partner/siblings/children;
- parent/child edge direction is normalized before human tree labels are rendered;
- governed **Something wrong?** correction entry added for members;
- 430px tree/control containment strengthened;
- missing public 150-person demo workbook restored.

Status rules:
- **S1-A:** IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY.
- **S1-B:** IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR VERIFY.
- **S1-C:** NOT STARTED by this batch.
- **S1 overall:** PARTIAL. Do not start S2.
- **CR2.3:** remains IMPLEMENTED / LIVE VERIFY until fresh deployed behaviour is confirmed.

Next execution: deploy this cumulative baseline, run the S1 persona behaviour matrix, fix any P0/P1 or high-value low/medium-effort failures, then implement S1-C. S2 remains blocked until the complete S1 behaviour gate passes.

## 2026-08-23 — S1 Batch 2: S1-C Implemented in Source

S1-C is now implemented on the cumulative S1-A/B baseline.

Delivered:
- secure Add Myself first bootstrap;
- one-name Father/Mother/Husband/Wife/Son/Daughter additions;
- guided Excel with categorical dropdowns;
- people-only CSV;
- preview-before-import and friendly recovery retained;
- dense 60-person / 5-generation full-potential showcase family;
- rich demo memories, stories, timeline/milestones, locations, identity/social examples and participation/reunion proof;
- UUID-safe shared persistence for synthetic demo seed data;
- satisfying **Your family is ready** post-create experience;
- Family Owner/Admin profile-submission review permission defect closed via migration 035.

Strategic status:
- **S1-A:** source implemented / live verify.
- **S1-B:** source implemented / live verify.
- **S1-C:** source implemented / live verify.
- **S1:** behaviour gate remains open; do not mark complete yet.
- **S2:** still blocked.

The old 150-person demo history remains preserved. The current product-showcase asset is intentionally 60 people because density of meaningful relationships/history/engagement demonstrates more product value than raw member count.

## S1 Update Candidate — Family access & showcase hardening (2026-08-23)
Status: **IMPLEMENTED IN SOURCE / LIVE VERIFY**.

S1 post-implementation audit found several first-60-second recovery/discoverability failures: Simple users could lose family-switch/logout visibility, setup had no logout, Playground inherited Simple feature visibility, and the database demo still used the old 150-person filler seed. These are now addressed by migration 036, always-visible family escape paths, Family Lobby, separate Playground Launch Control, and the synchronized 60-person full-potential showcase dataset. Preserve this as part of S1; do not start S2 until deployed behavior confirms it.

## 2026-08-23 — S1-D Interaction Reliability & Privacy Preview Clarity

Status: **IMPLEMENTED IN SOURCE / LIVE VERIFY**.

Hands-on Alpha review found two S1 trust/comprehension gaps: ordinary popups were inconsistent about backdrop dismissal, and the admin Public/Member/Admin selector looked like a whole-app role simulator although it only partially influenced profile rendering. S1-D standardizes outside-click dismissal for ordinary popups and turns the selector into an accurate **profile privacy preview** covering profile details, contact information, social links, life events and memories. Blocking authentication/recovery surfaces intentionally remain non-dismissible.

This mission also preserves the user-verified UI fixes `.card { padding: 10px; }`, `button.home-memory-tile { margin-bottom: 10px; }`, and the `UsersRound` import correction. S1 remains LIVE VERIFY; S2 is still blocked.

### Future engagement ideas evaluated — preserve, do not pull into S1

**Family Play / Games — HIGH-POTENTIAL S2 EXPERIMENT.** Do not build a generic games arcade. Start with family-native games that use the trusted graph and memories: Family Tambola for gatherings, “Who is this?” childhood-photo guessing, family trivia, generation-vs-generation quizzes and reunion challenges. These can create synchronous return loops while also revealing missing facts/photos that feed contribution prompts. Tambola can be the first simple real-time pilot, but the moat comes from family-context games rather than the game mechanic itself.

**Shared Social Video / Family Watch — PROMISING S2 EXPERIMENT, PLATFORM-DEPENDENT.** Treat YouTube/Instagram links as a new memory/media attachment rather than creating a generic social-feed clone. A relative shares a supported link, it appears inside a family Memory/Story/Event or a lightweight Family Watch queue, and the app renders an official embedded player where the platform permits it with a safe external-link fallback. This preserves context: *why this video matters to our family* becomes first-party family knowledge. Avoid downloading/rehosting third-party media and avoid making external algorithms the product's center of gravity.

**Acquisition thesis:** integrations alone are not a credible reason for Instagram/YouTube or another platform to buy the company. Strategic value would come from a high-engagement, permissioned family graph plus unique memory/context/contribution data and recurring family rituals. External media should amplify that moat, not replace it.

## 2026-08-23 — S2 execution begins: S2-A Living Family Loop

User verification has covered the majority of S1 journeys; remaining S1 items move to residual thorough QA rather than blocking all retention work. S1 is **SUBSTANTIALLY VERIFIED / RESIDUAL QA**, not retroactively marked fully certified.

S2-A is **IMPLEMENTED IN SOURCE / LIVE VERIFY**. It introduces a restrained Family Pulse (1–3 relevant reasons to act), lightweight memory reactions, privacy-safe engagement instrumentation, and an aggregate 30-day Living Loop scorecard. This is the first concrete implementation of `Discover → Feel → Contribute → Share → Return`.

Next S2 work should be evidence-led: improve the weakest step in the live loop rather than automatically adding breadth. Candidate follow-ons remain attractive share cards, digest delivery and contextual one-tap contributions. Family Play and contextual social-video memories remain later S2 experiments, not prerequisites for proving the core loop.

## S2-B — Community Umbrella & Opt-in Discovery — IMPLEMENTED IN SOURCE / LIVE VERIFY
- Family → approved community hierarchy: e.g. Maheshwari → Pune → chapter → family.
- Consent-based category discovery across families without exposing private family graphs.
- Marriage discovery requires self opt-in and introduction-oriented privacy; no ranking of marriage candidates.
- Professional/service/mentor/speaker/education/social-service/business discovery.
- Community needs/posts can target the appropriate chapter/city/umbrella level.
- Governed Community Highlights replace generic VIP/popularity scoring.
- Future: trusted cross-family connection paths only from explicit verified edges/introductions; community moderation; community digest; reputation; optional public showcase.

## S2-C — Trusted Introductions & Connection Paths — IMPLEMENTED IN SOURCE / LIVE VERIFY

S2-C converts community discovery from a flat directory into an explainable trust network while keeping family graphs private.

Delivered:
- explicit two-family-approved trust edges;
- shortest explainable family-level paths up to four hops;
- trust accept/decline/revoke governance for Family Owner/admin;
- persisted consent-based introduction requests against opt-in community cards;
- request accept/decline/cancel lifecycle;
- privacy-safe path snapshots with no phone/email leakage;
- Playground simulation of trusted paths and introductions.

Important boundary: named-person bridge paths remain deferred until bridge contacts explicitly opt in. Never infer paths from surname, community, city or family similarity.

Next S2 candidates remain preserved: quiet family digest, richer contribution/share loop, opt-in bridge contacts, introduction hand-off/completion, Family Play experiments, contextual external-media memories, moderation/rate limits before broad community scale.

## S2-D — Quiet Family Digest + Return Engine — IMPLEMENTED IN SOURCE / LIVE VERIFY

S2-D adds a calm weekly/monthly return surface rather than a social feed. Home now summarizes only meaningful changes: special days/history, recent memories, family growth, gatherings, contribution prompts and trusted-introduction updates. Users control topic/cadence preferences; digest opens, returns after 3+ days and shares are measured. External scheduled email/push remains a later deployment integration and must reuse these privacy/preferences rather than introducing a second notification model.

**Exit gate:** real pilot families repeatedly return because the digest is useful. Do not mark S2 complete from source checks alone.

## S2-E — Guided Family Experience & Living Help System — PLANNED / NEXT MAJOR MISSION

S2-E is promoted ahead of another engagement feature because product breadth has reached the point where discoverability and comprehension are a primary bottleneck. It will add a role/feature-aware **Explore & Guide** portal, contextual collapsible guidance across live modules, deterministic guide search, goal/use-case exploration, persona-based inspiration, Privacy & Trust Center, Family Owner playbook, First 7 Steps, What's New, curated future roadmap and structured feedback intelligence.

Key architectural rule: one structured guide registry must power contextual help, the standalone portal, search, related-feature navigation and future AI help. Do not create duplicated static prose across components.

S2-E also introduces governed contextual product feedback and Platform Owner triage so repeated user needs can inform future roadmap decisions without automatically becoming commitments.

Detailed scope: `S2-E-GUIDED-FAMILY-EXPERIENCE-LIVING-HELP-SYSTEM.md` and `S2-E-COMPLETE-GUIDE-CONTENT-MAP.md`.

Exit gate is behavior-based: a novice must be able to discover what the app is, understand why it matters, find help by goal/search, navigate to a feature, understand privacy/permissions and submit feedback across desktop/mobile without needing external documentation. Historical/future roadmap items remain preserved.

## 2026-08-24 — S2-E Guided Family Experience & Living Help System

**Status: IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR + SUPABASE VERIFY REQUIRED.**

S2-E now exists as a first-class product layer rather than a static documentation refresh: `Explore & Guide` navigation, one structured guide registry, contextual collapsible help, deterministic goal search, persona/use-case journeys, Privacy & Trust guidance, Family Owner playbook, First 7 Steps, What's New, curated future-interest cards, Playground entry actions, governed feedback persistence and Platform Owner feedback triage.

The guide registry carries feature/role/status metadata so hidden or uncertain functionality is not presented as universally live. Privacy-sensitive areas remain labelled `Live · verify deployment` until deployed RLS/runtime checks pass. Feedback status changes remain product evidence and never mutate roadmap files automatically.

S2-E does **not** delete or supersede Family Play, Family Watch/contextual social-video memories, external digest delivery, named opt-in introduction bridges, family book/export, community moderation/reputation or S3 defensible-business proof. Those remain preserved for later evidence-led sequencing.

## 2026-08-24 — S2-E Closure and S3 Business-Proof Design

S2-E is now **source-complete / ready for live certification** after a closure audit fixed broken related-guide navigation and added contextual help to high-value nested flows (Profile, Import, Invitations, Relationship management). Production certification remains gated by deployed migration/RLS/RPC/browser/mobile/Playground verification and dependency-complete production build.

The next major outcome milestone is **S3 — Defensible Business Proof**, defined in `S3-BUSINESS-PROOF-DESIGN.md`:

`S3-A activation & network growth → S3-B retention & compounding value → S3-C operations & scale → S3-D trust/defensibility → S3-E willingness-to-pay`

S3 should prioritize real-family evidence over feature breadth. Family Play, Family Watch/social-video memories, external digest delivery, family book/export, richer AI and generic chat remain preserved evidence-gated options rather than deleted roadmap ideas.

## 2026-08-24 — Pilot Freeze / S3-A only

The product enters a deliberate real-user learning period. **S3-A — Family Activation & Network Growth** is the only active product mission; implementation of additional S3 breadth is paused until pilot evidence warrants it. Canonical mission contract: `S3-A-ACTIVATION-NETWORK-GROWTH.md`.

Priority order during the pause: **user-blocking issue → privacy/security/correctness → repeated high-value friction → repeated user need → S3-A activation improvement → everything else deferred**.

S3-B Retention & Compounding Value, S3-C Founder Operations & Scale, S3-D Trust/Defensibility and S3-E Willingness-to-Pay remain preserved in the roadmap but are not active implementation work. Family Play, Family Watch/social-video memories, external delivery, family book/export, richer AI, community moderation/reputation and adjacent vertical work remain preserved, evidence-gated later options.

Launch Control is now the product-freeze safety valve. Real-family defaults intentionally expose the core family experience, Guide, Special Days, Memories, History, Family Pulse, Quiet Digest, Contributions and Relationship Explorer through progressive experience levels. Community, Places, trusted introductions and public/QR distribution remain Test; Gatherings and family sharing remain Pilot. Playground is broader for discovery while public-profile and print/QR distribution remain off by default.


# 2026-08-25 Strategic Addendum — Form-First Distributed Family Intake + Creator Reachability

This addendum preserves every earlier roadmap item and changes the immediate S3-A activation hypothesis based on founder observation: asking relatives to enter and learn the full application before the family is populated creates unnecessary adoption friction. The preferred experiment is now **collect family branches first, assemble the graph safely, then invite the wider family into an already valuable network**.

## S3-A1 — Distributed Family Intake & Branch Assembly — HIGHEST-PRIORITY ACTIVATION EXPERIMENT

**Hypothesis:** people who will not learn a new family application may still complete a familiar 3–5 minute mobile form about the immediate/sub-family they already know.

### Target journey
1. Family Starter creates a family.
2. System generates a safe shareable contribution link and optional human-friendly family code. The code identifies the family; it must not grant unrestricted family-data access.
3. Starter chooses 3–5 knowledgeable representatives from different branches and shares the link, primarily through WhatsApp/native sharing.
4. Recipient opens a focused mobile-first **Help build <Family>** form. No normal app navigation or tree knowledge is required.
5. Intake begins with the contributor/self, then conditionally asks for father, mother, spouse, children, siblings, paternal/maternal grandparents and optional extended relatives.
6. Relationship questions remain anchored (`father's brother`, `mother's sister`, etc.) so submissions create typed graph edges rather than ambiguous labels.
7. Submission writes to a staging/intake layer first, not directly to canonical family members/relationships.
8. Deterministic identity resolution normalizes names and uses multiple signals: exact identifiers when consented/available, normalized full name, birth date/year, gender, father/mother, spouse, city and graph context.
9. High-confidence matches may be resolved automatically; medium-confidence candidates require **Same person / Different person / Not sure** review; low-confidence entries remain separate. Never auto-merge uncertain people.
10. Duplicate/conflict questions should normally be batched after submission rather than interrupting every field.
11. Multiple submissions form independently useful family branches. The system reports submitted people, likely unique people, automatic matches, conflicts and disconnected components.
12. Family Owner/Admin gets a simple **Connect family branches** experience. Prefer relationship questions and common-ancestor suggestions over manual graph editing.
13. Once the graph is meaningfully populated, wider relatives receive the real activation message: **Your family is ready — find yourself and explore**.
14. Existing/pre-created people should later receive **Complete my branch** links with known parents/relationships prefilled for confirmation, making later contribution progressively shorter.

### Intake data principle
The intake form exists primarily to **construct trustworthy family structure**, not to fully enrich profiles. Start with name, relationship, living/deceased and optional birth year/date; keep city/contact fields optional and treat third-party privacy-sensitive information as unverified/private until the person claims or consents.

### Provenance and conflicts
Preserve who reported each proposed person/relationship/fact. Multiple independent reports can increase confidence. Conflicting birth years, parentage or identity facts must remain reviewable rather than silently overwriting one another.

### Later extensions — evidence gated
- Branch Collection Campaign dashboard for 3–5 representatives and submission status.
- Smart branch-completion links for people already present.
- Assisted common-ancestor / missing-parent suggestions for disconnected branches.
- Voice/conversational family intake with human confirmation.
- WhatsApp-style natural-language intake with human confirmation.
- Photo/PDF/handwritten genealogy extraction into staged proposals.

Do not build voice/OCR/LLM ingestion before the simple structured form proves participation and data quality.

### S3-A1 evidence
Measure form-open → start → completion, completion time, people submitted per form, unique people after resolution, duplicate/conflict rate, number of branches, owner reconciliation effort, branch connection success and percentage of populated-family recipients who later open/explore the application.

## S3-A2 — Activation after the family exists
After S3-A1 proves the collection model, optimize **Your family is ready** onboarding, self-identification/claiming, immediate lineage/relationship wow, tiny profile corrections and incremental contributions. Joining should be dramatically easier than creating.

## S3-A3 — Family activation intelligence
Retain the previously designed Family Journey, deterministic milestones, next-best-action prompts, first-wow measurement and New/Growing/Healthy/Stuck/Dormant family health states. Implement only after the form-first funnel gives real evidence about where families stall.

## Creator / Product Story / Contact & Opportunity Reachability — PLANNED, LOW-COMPLEXITY HIGH-LEVERAGE

As the product reaches families, community leaders, organizations, potential partners or investors, the application should make the responsible creator/product team discoverable without mixing personal promotion into the family experience.

Add a calm **About / Creator / Connect with us** destination accessible from the Guide/About/footer area, controlled through Launch Control if necessary.

It should support configurable—not hard-coded—content:
- product purpose and short origin story;
- creator/team name and concise professional background;
- optional professional profile links (for example LinkedIn/GitHub/website) explicitly supplied by the creator;
- contact categories: product feedback, bug/problem, family/community onboarding help, partnership/organization use, media/speaking, investment/business opportunity and other;
- a structured feedback/contact form with consent and spam/rate-limit protection;
- clear expectation that family/profile/private data should not be pasted into general contact requests;
- optional public product/contact email or routed backend form rather than exposing private personal contact details;
- Platform Owner inbox/triage integration where practical, reusing the governed feedback system rather than creating a disconnected second feedback database.

### Product principle
The creator section should build **trust and reachability**, not become an advertisement. Ordinary family tasks stay primary. Opportunity/contact details should be easy to find for people intentionally looking for them.

### Future organization mode
If adoption expands beyond individual families, the same contact surface can route community/association/enterprise interest into a lightweight lead/opportunity queue. Do not build CRM complexity before such inquiries exist.

## Updated immediate sequencing
`Pilot freeze → S3-A1 form-first intake pilot → branch reconciliation → populated-family activation observation → S3-A2 joining/first-wow fixes → S3-A3 activation intelligence → S3-B retention → S3-C scale operations → S3-D defensibility → S3-E willingness-to-pay`

User blockers, privacy/security/correctness and repeated feedback remain higher priority than this sequence at all times.

## 2026-08-25 — S3-A1 implementation checkpoint

S3-A1 Distributed Family Intake & Branch Assembly V1 is now **IMPLEMENTED IN SOURCE / LIVE VERIFY REQUIRED**. It remains the active S3-A adoption experiment and does not reopen broad feature expansion.

Delivered: Build Together family-creation handoff; secure per-representative contribution tokens; standalone mobile branch form; staged people/relationships; deterministic canonical and cross-branch match candidates; Same/Different/Not sure Owner review; conflict/provenance retention; Owner/Admin guarded canonical branch commit; Launch Control Pilot key; and activation instrumentation.

Next priority is **pilot verification and evidence**, not additional breadth. S3-A2 populated-family onboarding remains PLANNED and should begin only after S3-A1 demonstrates that representatives actually complete forms and the resulting branches can be reconciled safely. All previously deferred roadmap items remain preserved.


## 2026-08-25 — Mission closure discipline added

All future major user-facing missions, or coherent batches of 2–3 small missions, now follow the permanent delivery lifecycle:

**IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**

This prevents technically completed features from becoming hard to discover or understand. A mission is not **UX COMPLETE / CLOSED** until the applicable user guide, safe Playground demonstration, rollout classification, What's New communication and mission-to-UI traceability are also complete. Backend-only work uses only applicable layers.

### S3-A1 closure status
S3-A1 remains **IMPLEMENTED IN SOURCE / LIVE VERIFY REQUIRED**, but its new closure layers are still **PARTIAL**. The next closure patch should add:
- contextual help for Build Together, branch contribution and Owner reconciliation;
- central Guide/Doc Portal coverage;
- a no-save Playground walkthrough of multiple representatives → staged branches → duplicate decision → connected family;
- Launch Control presentation/description for `contribute.branch_intake`;
- a What's New entry;
- explicit **Where to see this in the product** traceability.

Only after these are present should S3-A1 be labelled **UX CLOSURE COMPLETE**. Deployed migration/RLS/browser checks remain a separate LIVE VERIFY gate.

### Related next mission — S3-A2 Populated-Family Onboarding
S3-A1 solves **how a family gets populated without asking everyone to learn/build the app**.

S3-A2 solves the next adoption problem: **what happens when the wider family finally arrives after the family already exists**.

The intended handoff is:

`3–5 representatives build branches → Owner reconciles/approves → family becomes meaningfully populated → "Your family is ready — find yourself and explore" → S3-A2`

S3-A2 should focus on:
1. **Find myself quickly** — search/identify the person's pre-created family profile without browsing a complex tree.
2. **Claim safely** — connect the authenticated user to the correct pre-created person with deterministic safeguards and Owner/review fallback for ambiguity.
3. **Immediate first wow** — after identification, show useful personal context immediately: parents/children/siblings, lineage, relationship paths and relevant family highlights rather than an empty dashboard.
4. **Complete my branch** — prefilled incremental contribution from the person's existing position; ask only for missing close relatives/facts.
5. **Tiny corrections** — make correcting name/year/relationship mistakes simpler than opening a full admin workflow while retaining governance/provenance.
6. **Measure activation** — invitation/open → find-self → claim → first-wow → correction/contribution → return.

S3-A2 remains **PLANNED / EVIDENCE-GATED**. Do not start it merely because S3-A1 source implementation exists. First complete S3-A1 UX closure and LIVE VERIFY/pilot observation sufficiently to confirm that distributed forms actually create useful family graphs.

## 2026-08-25 — S3-A1 UX closure complete

S3-A1 has completed the source/UI mission lifecycle: **IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**.

Current truth: **IMPLEMENTED IN SOURCE / UX CLOSURE COMPLETE / LIVE VERIFY REQUIRED**.

The closure patch adds a canonical Build Together guide, contextual help on Owner + contributor interfaces, a dedicated safe no-save Playground simulation, explicit Launch Control explanation, a What's New discovery card and formal UI traceability. No real-family Launch Control state was broadened: `contribute.branch_intake` remains **Pilot**.

### Next: S3-A2 — Populated-Family Onboarding
Keep **PLANNED / EVIDENCE-GATED** until S3-A1 receives enough live validation/pilot evidence. S3-A2 should optimize the moment after the family is populated: **Your family is ready → find myself → safely claim → immediate personal family context → Complete my branch → small corrections/contributions → return**. Do not turn S3-A2 into another empty-family builder.


# Strategic Platform Expansion — Trusted Network Product Family

Family remains the first and deepest production vertical, but the codebase now intentionally evolves toward a **layered Trusted Network Platform** rather than one family-specific application.

The target is a **capability tree**, not one giant generic base module. Each vertical should reuse the lowest genuinely common ancestor layer and add only its specialization.

```text
Trusted Network Platform
├── Core Network Foundation
├── Network Construction
├── Relationship Intelligence
├── Community & Engagement
├── Governance & Product Runtime
├── Kinship / Genealogy → Family Network
├── Institutional Membership → Alumni / Associations
├── Organizational Intelligence → Enterprise
├── Business Trust Networks → Founder / Investor / Industry
└── Membership Communities → Clubs / Societies / Nonprofits
```

## G0 — Trusted Network Architecture Classification & Extraction Blueprint
**ARCHITECTURE COMPLETE / 2026-08-25**

Classify the current codebase into:
- CORE
- SHARED CAPABILITY
- INTERMEDIATE DOMAIN LAYER
- VERTICAL-SPECIFIC

Deliverables:
- capability dependency map;
- Family-hardcoded assumptions inside otherwise reusable areas;
- stable contracts and dependency direction;
- vertical/module registry approach;
- extraction safety rules preserving Family behavior;
- first low-risk extraction candidates;
- Alumni MVP as the second consumer;
- reuse/regression KPIs.

Permanent architecture rules:
- **Lowest Common Capability Principle**
- **Second-Consumer Rule**
- **Stable Vertical Rule**
- **Dependency Direction:** Vertical → Domain Layer → Shared Capability → Core
- **Strong Primitives, Explicit Verticals**
- **Classification Gate**

Permanent mission lifecycle becomes:

**CLASSIFY → IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**

G0 is closed in `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`. It establishes that the existing network tenancy/membership/rollout spine is genuinely reusable, while kinship relations, generations, lineage and Family experience remain explicit domain/vertical semantics. G1 established architecture guardrails, typed vertical registration, separated feature runtime/catalogs, neutral network/membership contracts and remote compatibility seams. The formerly planned G1.5 claiming work was deliberately batched with invitations/participation into consolidated G2. S3-A1 construction is deliberately deferred to consolidated G3 rather than generalized prematurely.

## G1 — First Shared Capability Extraction + Alumni Skeleton
**COMPLETE — G1.1 / G1.2 / G1.3 / G1.4 CLOSED; planned G1.5 absorbed into consolidated G2**

Initial likely extraction candidates:
- network tenancy;
- identity/profile primitives;
- membership;
- invitations;
- claiming;
- relationship/graph primitives;
- audit/provenance;
- feature runtime;
- Launch Control / Guide / Playground / What's New framework.

Parallel deliverable:
- create explicit Family + Alumni vertical registrations;
- Alumni becomes the second real consumer;
- Family behavior remains unchanged.

Directional KPI:
> Alumni MVP should reuse roughly 60%+ of applicable runtime capability code if semantics genuinely support it.

## Historical pre-batching G2 — Distributed Network Construction Platform
**PLANNED**

Generalize S3-A1 beneath the existing Family implementation:

`representative → structured intake → staged entities/relationships → identity resolution → conflicts/provenance → reconciliation → canonical network`

Adapters:
- Family Branch Intake
- Alumni Batch/Department Intake
- Association Chapter Intake

## Historical pre-batching G3 — Relationship Intelligence Platform
**PLANNED**

Shared:
- graph traversal;
- trusted/shortest paths;
- mutual connections;
- common-context discovery;
- introductions;
- graph search/discovery.

Vertical semantics remain explicit:
- Family lineage/kinship;
- Alumni batch/department/faculty/employer;
- Enterprise team/project/skill/collaboration;
- Business founder/investor/advisor paths.

## Historical pre-batching G4 — Alumni Network MVP
**PLANNED / FIRST COMMERCIAL SECOND VERTICAL**

Initial scope:
- institution;
- department/program;
- batch/year;
- alumnus/faculty profile;
- company/role;
- claiming;
- search/discovery;
- relationship paths;
- mentorship interest;
- groups/events;
- distributed batch intake;
- privacy/governance;
- Launch Control + Guide + Playground + What's New.

Do not attempt a full university ERP or broad donation suite in V1.

## Historical pre-batching G5 — Professional / Trade / Community Association Vertical
**FUTURE / HIGH COMMERCIAL PRIORITY**

Potential specialization:
- chapters;
- membership roles/lifecycle;
- professional specialties;
- organization directory;
- opportunities;
- events/introductions.

## Historical pre-batching G6 — Enterprise Relationship & Expertise Intelligence
**FUTURE / HIGH VALUE / HIGHER COMPLEXITY**

Potential specialization:
- org hierarchy;
- teams;
- projects;
- skills/expertise;
- collaboration;
- mentorship;
- internal opportunities;
- SSO/HRIS/security.

## Historical pre-batching G7 — Founder / Investor / Industry Trusted Network
**FUTURE**

Potential specialization:
- founder/company/investor/advisor entities;
- worked-with / invested-in / advised / introduced-by;
- warm-introduction paths;
- expertise/opportunity discovery.

## Historical pre-batching G8 — Clubs / Societies / Nonprofit / Volunteer Networks
**FUTURE**

Potential specialization:
- membership/roles;
- chapters;
- committees;
- participation;
- events;
- volunteer/community discovery.

## Sequencing with S3-A

```text
S3-A1 ✅ source implementation + UX closure
    ↓
LIVE VERIFY / pilot observation
    +
G0 architecture blueprint ✅ complete
    ↓
S3-A2 Populated-Family Onboarding
    built under G0 CLASSIFY rules
    ↓
G1 shared extraction + Alumni skeleton
    ↓
Family + Alumni continue in parallel
    ↓
G2/G3 extraction driven by real second-consumer evidence
```

We do **not** wait for hundreds of Family users before broader work begins.

## Commercial thesis

Priority verticals:
1. Family / Kinship
2. Alumni / Education
3. Professional / Trade / Community Associations
4. Enterprise Relationship & Expertise Intelligence
5. Founder / Investor / Industry Networks
6. Clubs / Societies / Membership Communities
7. Nonprofit / Volunteer Networks

> **Build trusted networks from fragmented knowledge, reconcile identity and relationships safely, activate them through discovery and trusted connection intelligence, and reuse the same capability tree across multiple vertical products.**

## 2026-08-25 — G1.1 Architecture Guardrails + Typed Vertical Registry

**Status: IMPLEMENTED IN SOURCE / CLOSED AS NON-USER-FACING ARCHITECTURE MISSION / FULL BUILD VERIFY PENDING NORMAL DEPENDENCY ENVIRONMENT**

Implemented the first physical capability-tree seam:
- typed `NetworkVerticalKind` and `VerticalDefinition` contract in core;
- explicit active Family vertical;
- explicit Alumni skeleton using institutional-membership semantics rather than kinship relabeling;
- app-shell registry with duplicate-registration protection and Family default;
- optional runtime `vertical_kind` compatibility bridge with no database migration;
- Family setup wired through the registry with the exact existing Member/Generation/Parent/Child/Spouse defaults;
- dependency-direction source gate.

No Family table, RPC, feature key, navigation, S3-A1 workflow or user-facing behavior was changed.

Validation: G1.1 gate PASS; all existing source regression gates PASS; new architecture files compile independently under TypeScript 5.8.3. Full repository build remains to be rerun in the normal dependency/CI environment because dependency installation was unavailable/incomplete in this execution environment.

**NEXT: G1.2 — Feature Runtime / Vertical Catalog Split.** Preserve Family feature keys and rollout defaults exactly.

## 2026-08-25 — G1.2 Feature Runtime / Vertical Catalog Split

**Status: IMPLEMENTED IN SOURCE / CLOSED AS NON-USER-FACING ARCHITECTURE MISSION / FULL BUILD VERIFY ENVIRONMENT-LIMITED**

The reusable feature launch/evaluation engine now lives in `core/features/`, while all existing Family feature keys, labels, bundles, experience rules and rollout defaults live in `verticals/family/features/catalog.ts` and are composed through `FAMILY_VERTICAL.featureCatalog`.

`lib/features.ts` remains a compatibility facade so the current Family application, Launch Control, Family Admin, Guide typing and rollout RPCs keep the same API and behavior. Alumni has only a tiny hidden-by-default typed catalog to prove second-vertical composition; no Alumni UI/workflow/database exposure exists yet.

No database migration, RPC rename, feature-key rename, Family UX change, S3-A1 generalization or navigation change was made.

Validation: all 20 source gates PASS after moving two historical gate lookups to the Family catalog; focused TypeScript/runtime compatibility checks PASS; no accepted G1.1 files were deleted. Full Next.js build remains environment-limited because dependencies are absent and `npm ci` timed out.

See `G1.2-FEATURE-RUNTIME-VERTICAL-CATALOG-SPLIT.md` and `G1.2-RUNTIME-VERIFICATION-CHECKLIST.md`.

**NEXT: G1.3 — Neutral Network & Membership Contracts.** Preserve Family schema/RPC compatibility while removing Family semantics from reusable TypeScript contracts.

## 2026-08-25 — G1.3 Neutral Network & Membership Contracts

**Status: IMPLEMENTED IN SOURCE / CLOSED AS NON-BREAKING ARCHITECTURE MISSION / DEPLOYED DB SMOKE REQUIRED**

Implemented the next Core seam without changing Family membership behavior:
- neutral network identity, membership role/status, resource policy and active-network context contracts in `core/network/contracts.ts`;
- Family-only adapter owns the historical `get_my_networks()` row and isolates `member_id -> family_members` instead of pretending it is generic;
- `fetchMyNetworkMemberships()` provides the neutral contract while `fetchMyNetworks()` remains the unchanged Family compatibility facade;
- `AuthUser.membership_role` is neutral while `family_role` remains a compatibility alias;
- `NetworkSettings.membership_role` now uses the neutral role contract.

The G1.2 Playground issue is also closed defensively. Migration `044_g1_3_feature_catalog_integrity.sql` reconciles missing feature-registry rows after confirming S3-A1 migration 043 is present, preserves existing rollout/Playground choices, and Launch Control disables code-known/database-missing controls with `Database update required` instead of throwing `Unknown feature key`.

No Family membership table/column/RPC was renamed or migrated. No Alumni profile-link semantics were invented.

Validation: all historical source gates + G1.1/G1.2/G1.3 PASS; focused TypeScript and membership-adapter runtime assertions PASS.

See `G1.3-NEUTRAL-NETWORK-MEMBERSHIP-CONTRACTS.md` and `G1.3-RUNTIME-VERIFICATION-CHECKLIST.md`.

## 2026-08-25 — G1.4 Remote Capability Split Behind Compatibility Facade

**Status: IMPLEMENTED IN SOURCE / CLOSED AS NON-BREAKING ARCHITECTURE MISSION**

Moved only proven shared transport into `capabilities/network-context/remote.ts`, `capabilities/launch-runtime/remote.ts`, and `capabilities/platform-ownership/remote.ts`. `lib/remote.ts` remains the Family compatibility facade, and a G1.4 export snapshot/gate proves all 147 historical G1.3 facade exports remain available.

No RPC/table/schema/RLS/feature-key/Family UX change was made. Family creation/claiming/admin/data/community/memories/guide/S3-A1 transport remains intentionally legacy/domain-specific. The G1.3 Playground code↔database catalog-drift protection is now a permanent G1.4 regression assertion.

Validation: all historical gates + G1.1–G1.4 PASS; focused TypeScript 5.8.3 compile PASS. Full Next.js build remains normal-environment work because dependencies are absent in the artifact workspace.

See `G1.4-REMOTE-CAPABILITY-SPLIT.md` and `G1.4-RUNTIME-VERIFICATION-CHECKLIST.md`.

**BATCHING UPDATE:** the planned G1.5 claiming seam was absorbed into consolidated G2 together with invitations and governed participation. No capability was dropped.


# Consolidated G.x Architecture Roadmap — Authoritative from 2026-08-25

The earlier G2–G8 numbering above is preserved as historical planning context. After G1.4, architecture work was intentionally rebundled into larger High-effort missions to avoid micro-extraction churn. **This section is the authoritative current G.x sequence.**

| Mission | Status | Consolidated scope |
|---|---|---|
| **G2 — Shared Identity, Claiming & Participation Foundation** | **IMPLEMENTED IN SOURCE / CLOSED** | Neutral identity + binding contracts; shared claim lifecycle; invitation/governed-contribution/participation contracts; Family adapters over existing RPCs; explicit Alumni identity/participation skeleton; compatibility gates. |
| **G3 — Network Construction Engine Extraction** | **IMPLEMENTED IN SOURCE / CLOSED** | Shared construction lifecycle contracts/runtime; Family S3-A1 adapter over unchanged RPCs; Alumni institutional construction skeleton; compatibility/deletion gates; no schema rewrite. |
| **G4 — Vertical Runtime & App Composition** | **IMPLEMENTED IN SOURCE / CLOSED** | Vertical app composition contracts/runtime; Family navigation/Guide/Playground/Launch/What's New registration; fail-closed Alumni skeleton; Family UX preserved. |
| **G5 — Alumni Network V1** | **IMPLEMENTED / CERTIFIED R2** | Institution/batch/program identity, profiles, directory/search, onboarding/import, claiming, invitations, cohort connections, basic Alumni Home/Admin, privacy, Guide/Playground/Launch Control. |
| **G6 — Two-Vertical Architecture Proof, Shared UX Composition & Hardening** | **IMPLEMENTED IN SOURCE / CLOSED / DEPLOYED SMOKE REQUIRED** | Family + Alumni isolation, shared UX primitives, polished Alumni experience, vertical-scoped Launch Control, tenant/RLS hardening, migration compatibility and cross-vertical regression protection. |
| **G7 — Generic Network OS Productization & Template Architecture** | **IMPLEMENTED IN SOURCE / SOURCE CERTIFIED / DEPLOYED SMOKE REQUIRED** | Configurable affiliations/projections, template contracts, reusable Network Explorer + shared activity/group foundation, rich Alumni reuse proof, future template definitions. |
| **G8 — Productized Business Verticals: Organization, Business Trust & Franchise** | **IMPLEMENTED / SOURCE CERTIFIED / DEPLOYED SMOKE REQUIRED** | Three real user-creatable business verticals on the G7 Network OS with Explorer, Directory, Community, Places, Connections, Contributions, claiming, join codes, member/admin lifecycle, import, Guide, Playground and Launch Control. |
| **G9 — Network Intelligence Layer & Five-Vertical Proof** | **NEXT / HIGH EFFORT** | Permission-aware semantic/entity discovery, explainable connection paths, network health, expertise/trust/dependency insights and five-vertical hardening without genericizing domain truth. |
| **G10 — Commercial Platform Foundation** | **PLANNED / EVIDENCE-GATED** | Plans/entitlements, quotas/storage policy, usage/metering, paid capability packs, branded/managed networks and monetization experiments by vertical. |
| **G11+ — Future Verticals & Ecosystem Scale** | **FUTURE** | Education/Professional/Association/Supply Chain/Investor/Customer vertical expansion, integrations/APIs/white-label/extension ecosystem where evidence supports them. |

## G2 — Shared Identity, Claiming & Participation Foundation — 2026-08-25

**Status: IMPLEMENTED IN SOURCE / CLOSED AS CONSOLIDATED NON-USER-FACING ARCHITECTURE BATCH**

Delivered in one batch rather than G1.5/G1.6/G1.7:
- neutral `core/identity` contracts for vertical identity, claim eligibility/request/result and account↔identity binding;
- neutral `core/participation` invitation, contribution-prompt and metrics contracts;
- adapter-independent claiming + participation runtimes;
- Family claiming adapter delegating to existing verified-email RPCs unchanged;
- Family invitation/contribution/participation adapter delegating to existing RPCs unchanged;
- Family transport type compatibility facade;
- explicit Alumni institutional identity + claiming/participation skeletons with no `family_members` reuse;
- app-shell composition proving two consumers;
- compatibility lock preserving all 147 historical remote exports;
- `validate:g2` dependency/contract/no-fake-Alumni-DB gate.

No migration, RLS change, RPC rename, feature-key/default change or Family UX change was introduced. Family community groups/events and S3-A1 construction remain intentionally un-generalized in G2.

Validation: every historical D1/V1/CR/S1/S2/S3-A1 gate + G1.1–G1.4 + G2 PASS; focused strict TypeScript 5.8.3 compile PASS. Full Next.js build is not claimed because `npm ci` timed out in this dependency-less execution workspace.

See `G2-SHARED-IDENTITY-CLAIMING-PARTICIPATION-FOUNDATION.md` and `G2-RUNTIME-VERIFICATION-CHECKLIST.md`.

**G4 is now implemented and closed in source. NEXT: G5 — Alumni Network V1.** Keep it one consolidated High-effort product/architecture batch.


## G3 — Network Construction Engine Extraction — 2026-08-25

**Status: IMPLEMENTED IN SOURCE / CLOSED AS CONSOLIDATED NON-USER-FACING ARCHITECTURE BATCH**

The construction seam proven by S3-A1 is now explicit: neutral source/session/access/staged entity+edge/candidate/decision/conflict/provenance/validation/commit contracts live under `core/construction`, adapter-independent orchestration lives under `capabilities/construction`, and app-shell composes vertical adapters.

Family keeps the exact deployed `family_intake_*` RPC/table/RLS behavior behind `verticals/family/construction/adapter.ts`; current Family UI and `lib/remote.ts` / `lib/family-intake-types.ts` imports remain compatible. Parent/child/spouse, generation ordering, lineage/cycle validation, branch copy and canonical `family_members` commit semantics remain Family/Kinship-specific.

Alumni contributes institution/batch/program/department and batchmate/classmate/mentor/professional-connection semantics only as a persistence-disabled skeleton. It does not reuse Family tables/RPCs/kinship.

No migration was added. All historical gates through G3 pass; 147 historical remote exports and 234 accepted G2 files are compatibility-locked.

See `G3-NETWORK-CONSTRUCTION-ENGINE-EXTRACTION.md`, `G3-RELEASE-MANIFEST.md` and `G3-RUNTIME-VERIFICATION-CHECKLIST.md`.

**G4 completed. NEXT: G5 — Alumni Network V1.**

## G4 — Vertical Runtime & App Composition — 2026-08-25

G4 is implemented and closed in source. The app-shell now composes explicit vertical-owned navigation, Guide routing, Playground metadata, Launch Control metadata and What's New routing. Family remains behaviorally unchanged and the only active renderer. Alumni remains a fail-closed skeleton with no Family surface inheritance.

No migration was added. Historical gates through G4 pass; 147 historical remote exports and 260 accepted G3 files are compatibility-locked.

See `G4-VERTICAL-RUNTIME-APP-COMPOSITION.md`, `G4-RELEASE-MANIFEST.md` and `G4-RUNTIME-VERIFICATION-CHECKLIST.md`.

**NEXT: G5 — Alumni Network V1.**


## G5 — Alumni Network V1 — 2026-08-25

**Status: IMPLEMENTED / CERTIFIED R2 / SUPERSEDED AS BASELINE BY G6**

G5 activated the first real second vertical with separate Alumni persistence, institutional identity, directory/cohorts, claiming, invitations, import, Admin, Guide and Playground. The post-certification vertical-feature dispatch hotfix is part of the accepted R2 baseline.

## G6 — Two-Vertical Architecture Proof, Shared UX Composition & Hardening — 2026-08-25

**Status: IMPLEMENTED IN SOURCE / CLOSED / SHORT DEPLOYED SMOKE REQUIRED**

G6 proves Family + Alumni together and closes the first real two-vertical defects: shared UX primitives are now consumed by both products, Alumni receives a polished responsive product shell, network switching uses the neutral membership contract, Platform Launch Control is vertical-scoped, Alumni feature registry rows are backend-backed, and database-level Alumni tenant integrity is strengthened. Family domain foundations remain hash-identical to the certified G5 baseline.

Migration: `046_g6_two_vertical_hardening.sql` after 045.

Validation: complete historical D1 → G6 source gates PASS; 147 historical remote exports, 280 accepted G5 files and 7 protected Family foundations preserved; changed G6 TS/TSX transpile PASS.

See `G6-TWO-VERTICAL-PROOF-SHARED-UX-HARDENING.md`, `G6-RELEASE-MANIFEST.md` and `G6-RUNTIME-VERIFICATION-CHECKLIST.md`.

**NEXT: G7 — Generic Platform Productization.**


## G7 — Generic Network OS Productization & Template Architecture — 2026-08-25

**Status: IMPLEMENTED IN SOURCE / SOURCE CERTIFIED / DEPLOYED SMOKE REQUIRED**

G7 turns the Family + Alumni proof into a reusable Network OS foundation without forcing a universal domain model. New generic contracts/persistence cover entities, dimensions, affiliations, hierarchy projections, activities and groups. Alumni becomes the first active consumer of projection-based Explore, shared Community activity and Places.

Future template definitions now exist for Organizational Intelligence, Business Trust, Franchise, Education Graph, Professional, Association, Residential, Supply Chain, Investor, Customer Intelligence and Custom Network. They remain fail-closed architecture proofs/future templates, not active products.

Binding proof: one MET dataset supports both `MET → Engineering → 2011 → Computer` and `MET → 2011 → Engineering → Computer` through projection order only.

Migration: `047_g7_generic_network_os.sql` after 046.

**NEXT after G7 certification: G8 — Commercial Platform Foundation**, with business-evidence gates before broad entitlement/metering work.
## G8 — Productized Business Verticals — 2026-08-25

**Status: IMPLEMENTED / SOURCE CERTIFIED / SHORT DEPLOYED SMOKE REQUIRED**

Organizational Intelligence, Business Trust and Franchise are now active user-creatable products. They reuse the G7 Network OS affiliation/projection/activity foundation and a shared product shell while retaining explicit domain dimensions, typed relationships, labels, Guide content and Launch Control catalogs.

Migration: `048_g8_productized_verticals.sql` after 047.

G8 also closes verified-email claiming, own-claimed-entity editing, join codes, member/admin lifecycle, multi-value affiliations and governed contributions/import for these products. Family + Alumni foundations remain protected.

**NEXT: G9 — Network Intelligence Layer & Five-Vertical Proof.** Commercial platform work moves to G10 and remains evidence-gated.

## G8 Product Experience Completion — CLOSED (R4)

Before moving to G9, G8 received a product-experience closure pass prompted by real runtime screenshots. The release now has responsive productized navigation, container-safe network creation cards, five first-class Playgrounds, persisted Light/Dark/Aurora themes and a shared Network Pulse for the three G8 business verticals.

This does not change the G9 direction. Next major mission remains **G9 — Network Intelligence Layer & Five-Vertical Proof**. Future cross-vertical media, scheduled digests and public-sharing engines remain evidence-gated rather than forced into G8.

## G8.5 — Five-Vertical Capability Parity & Product Maturity — INSERTED BEFORE G9

G8 architecture/productization proved that new verticals can be composed rapidly, but the five active products do not yet have equal capability depth. G9 intelligence is therefore gated on G8.5 maturity rather than being layered immediately over thin business-vertical showcases.

### G8.5-A — Clean + Audit + Rules — DONE

- archived historical Markdown artifacts without deleting project history;
- repaired two missing G5 accepted-baseline certification artifacts;
- repointed accepted baseline manifests to archived historical paths instead of weakening gates;
- created the five-vertical capability applicability/product-depth matrix;
- established the permanent Generic Capability Utilization Rule and Productized Vertical Gate;
- no runtime/schema behavior change.

### G8.5-B — Generic Capability Parity — DONE

Consolidated capability-family implementation across every semantically applicable vertical:

1. Discovery & Relationships — map/geography, entity detail, typed relationship explorer, connection paths, search/filter/projection experience.
2. Living Network & Participation — groups, events/RSVP, neutral stories/history/milestones, contributions, media/digest evaluation.
3. Lifecycle/Governance/Help — invite/join/claim, construction/import UX, admin primitives, Launch Control, contextual Guide/Doc Portal and What's New.

Do not copy Family-only kinship, ancestry, deceased/remembrance or generation semantics into other verticals.

### G8.5-C — Five-Vertical Showcase & Certification — DONE

Build realistic Playgrounds large enough to demonstrate the applicable capability set, complete product-specific copy/empty states, run historical + G8.5 gates, close Guide/Launch/What's New/roadmap/status, and publish a refreshed authoritative baseline.

### G9 — Network Intelligence Layer — NEXT

Permission-aware deterministic network intelligence first, selectively augmented by AI. G9 remains planned; it is delayed only until the five active products provide mature network substrate and showcase data.

## G8.5-B — Generic Capability Parity — DONE
B1 Discovery & Relationships, B2 Living Network & Participation and B3 Lifecycle/Governance/Help are implemented as one certified batch. Organization, Business Trust and Franchise now consume richer shared geography, relationship/path, entity-detail, activity, contribution and capability-help experiences. G8.5-C remains next for deep showcase data/product polish; G9 stays gated until C closes.


## G8.5-C — Five-Vertical Product Showcase & Certification — CLOSED
All five Playgrounds now satisfy the product-depth proof: Family 60-member demo foundation; Alumni 36 profiles; Organization 36 people; Business Trust 36 businesses; Franchise 36 locations. The latter four include richer groups, events, stories/history, milestones and discoverable showcase journeys. G8.5-C adds a permanent five-vertical showcase gate and closes Guide / Launch Control visibility / What's New / mobile-theme showcase polish. G9 may now begin.

# 2026-08-26 Strategic Roadmap Reset — Must-Buy Outcome Gate

This section supersedes **execution order**, not historical roadmap content.

G8.5 demonstrated platform breadth and reusable capability depth. The next goal is not more verticals. It is to prove a repeated outcome worth paying for.

## G8.6 — Outcome-Driven Vertical Experience Closure — NEXT

**Mission:** translate the strongest mature Family product jobs into domain-native experiences across Alumni, Organization, Business Trust and Franchise, while fixing obvious product defects and avoiding semantic copying.

### G8.6-A — Orientation & Entity Action
- fix productized modal/overlay positioning;
- add first-class Structure / Network Map to all applicable verticals;
- add Profile / Entity 360 with View in Graph, connection explanation, context/history, edit/correction and relationship actions;
- preserve Family Tree/kinship as Family-specific.

### G8.6-B — Living Knowledge & Help Network
- Organization: Wins & Lessons / Decisions / Project History;
- Franchise: Operations Playbook / Wins & Lessons;
- Business Trust: Trust Evidence / Success Stories;
- Alumni: Journeys / Community Stories;
- replace generic contribution with domain-specific Help the Network flows;
- add community needs, trusted introductions and domain-native sub-networks where meaningful.

### G8.6-C — Home, Guide, Launch & Return Loop
- enriched domain-native Home/Pulse surfaces;
- small meaningful next-action prompts instead of dashboard clutter;
- mature goal-led Explore & Guide;
- full Platform Owner Launch Control parity;
- What’s New / contextual discovery;
- low-noise domain digest/pulse where useful;
- mobile/theme/empty/error/modal acceptance across five verticals.

**G8.6 exit:** a skeptical target user can enter each relevant Playground and encounter at least three recognizable domain problems that can be understood and acted on. No applicable mature Family product job is silently absent without a semantic exclusion/deferment.

See `FAMILY-TO-NETWORK-EXPERIENCE-MAP.md`.

## G9 — Paid Outcome Intelligence Proof — AFTER G8.6

Do not start with a universal chatbot. Build deterministic, permission-aware, explainable intelligence around paid outcome loops.

### Organization — Expertise & Dependency Intelligence
- expertise discovery with evidence;
- ownership/dependency paths;
- knowledge concentration/key-person risk;
- onboarding connection recommendations;
- missing ownership/expertise signals.

### Franchise — Operational Learning Intelligence
- similar-location/problem discovery;
- peer expert and proven-solution recommendations;
- support-isolation/coverage gaps;
- training/capability gaps;
- solution propagation history.

### Business Trust — Trust-Path Sourcing Intelligence
- provenance/recency/context-backed trust paths;
- warm introduction routes;
- trusted alternatives;
- introduction/outcome capture.

### Smaller adapters
- Alumni: career/mentor/company/city discovery and warm paths.
- Family: relation/completeness/contribution intelligence.

**G9 exit:** a high-value question produces an answer, evidence and an immediately useful next action.

## Commercial Reality Gate — BLOCKS G10

Before billing/enterprise platform expansion:
- pick one primary ICP and one secondary ICP;
- demo with real target buyers/users;
- use real or representative customer network data;
- measure repeated problem resolution, not demo admiration;
- seek a concrete commitment: pilot, data import, follow-up, LOI or paid trial;
- classify result as **DOUBLE DOWN / NARROW-PIVOT / FREEZE**.

No sixth vertical and no G10 until at least one product has a named buyer, repeated pain, measurable outcome, willingness to provide data, repeated workflow use and a credible paid-pilot path.

Full reasoning: `STRATEGIC-PRODUCT-REVIEW.md`.

## G8.6-A + G8.6-B — CLOSED / SOURCE CERTIFIED

Implemented the first two outcome-driven closure batches:
- **A — Orientation & Entity Action:** fixed productized modals, added living Structure Map, entity 360 actions, focused connection-path entry and relationship correction paths.
- **B — Living Knowledge & Help Network:** added domain-native knowledge walls, focused communities and Help-the-Network prompts across Alumni, Organization, Business Trust and Franchise.

The product job is translated rather than copied from Family. Family memories/kinship remain Family-specific; business verticals use Wins & Lessons, Trust Evidence, Operations Playbook and Alumni Journeys.

**NEXT: G8.6-C — Home, Guide, Launch & Return Loop.**

## G8.6-C — Home, Guide, Launch & Return Loop — DONE
- Outcome-driven Home for Alumni + Organization + Business Trust + Franchise.
- Domain-specific return loops and next-best-action prompts.
- Mature goal-based Guide and contextual What's New.
- Full vertical-aware platform-owner Launch Control access.
- Final pre-G9 product closure.

### Next: G9 — Network Intelligence Layer
G9 must build decision advantage on top of the completed Find → Understand → Connect → Act → Capture → Improve loop. No new vertical before commercial evidence.

## Commercial Reality Gate after G9
G9 technical certification is complete. Do not proceed directly to G10.

**Next: G9.1 Organization Paid-Pilot Readiness** — viewer-anchored paths, weighted expertise/ownership evidence, dependency blast radius, provenance/recency, pilot import, executive value metrics and privacy hardening.

Franchise remains the challenger vertical. Business Trust remains deferred until trust provenance/seeding is strong enough. G10 stays evidence-gated behind a real data pilot and willingness-to-pay signal.

## G9.1 — Autonomous Organizational Intelligence Bridge (Design Gate)

**Status:** Strategic design queued. Do not implement until both authoritative ZIPs are inspected in the next session.

G9 runtime certification established the deterministic Network Intelligence Layer. Before implementing the previously planned Organization paid-pilot work, perform a two-codebase architecture review of:

1. the current Generic Network OS / G9 runtime-certified baseline; and
2. the current RAG Knowledge Hub / local Ollama intelligence product.

### Product thesis

Do **not** sell or build "RAG connected to a graph" as the outcome. The target is:

> **Continuously turn knowledge the organization already produces into an evidence-backed living organizational graph, then use graph reasoning + knowledge evidence to answer who knows, who owns, what depends, what is fragile, who can help, and what should happen next.**

The integration should attack two commercial blockers at once:

- **cold-start / maintenance cost:** organizations should not manually populate hundreds of people, systems, skills, ownerships and dependencies;
- **decision value:** answers should combine verified structure with documentary evidence rather than behave like an org chart or generic chatbot.

### Candidate G9.1 architecture — validate against both codebases before accepting

**A. Knowledge ingestion capability**
- Reuse/extract the valuable parts of Knowledge Hub ingestion, parsing, crawling, chunking, embeddings, hybrid retrieval and local Ollama orchestration.
- Start with the sources already proven in the RAG product (for example uploaded documents and its existing authenticated/document sources). Do not add a broad connector program before validating the pilot.

**B. Knowledge → Network evidence extraction**
- Detect candidate people, teams, systems, projects, skills, ownership, dependencies, decisions, incidents, lessons and expertise signals.
- Every extracted fact must carry provenance, extraction method, confidence and verification state.
- AI-generated/extracted facts are **candidates**, not verified graph truth.
- Provide review/accept/reject/edit flows; later allow narrowly defined authoritative sources to auto-promote facts.

**C. Graph + RAG query orchestration**
- Structured relationship/path questions → deterministic Network OS graph engine.
- Document/knowledge questions → retrieval engine.
- Mixed questions → authorized graph subgraph + relevant document retrieval + evidence merge + deterministic checks + optional Ollama synthesis.
- LLM explains evidence; it does not manufacture relationships.

**D. Question-derived intelligence**
Repeated unanswered or weakly answered questions become signals for:
- ownership gaps;
- documentation gaps;
- missing expertise;
- knowledge concentration;
- stale/conflicting decisions;
- missing network relationships;
- requests for network contribution.

Close the loop:
**Ask → Retrieve/Reason → Detect uncertainty → Create gap → Ask network for help → Capture evidence → Improve graph/knowledge → Better future answer.**

### Hard architecture constraints

Reject designs that:
- bolt the Electron application directly into the Network OS UI;
- replace graph traversal/structured reasoning with vector similarity;
- send an unrestricted tenant graph to Ollama/LLMs;
- allow RAG extraction to directly mutate verified graph truth;
- duplicate two separate ingestion/reasoning stacks when a reusable engine/service can be extracted;
- expand this integration across all five verticals before Organization proves value.

### Commercial sequencing

1. **Organization is the primary integration/pilot vertical.**
2. **Franchise is the strongest challenger** once the Organization pattern works (SOPs, incidents, training guides, store learnings → reusable operating intelligence).
3. Business Trust waits for stronger provenance, verification, recency and anti-gaming foundations.
4. Alumni/Family consume only clearly valuable reusable pieces; do not force enterprise RAG into them.
5. **G10 remains blocked until real commercial evidence exists.**

### Required outputs from the next-session two-ZIP review

- codebase/component map of both products;
- reusable-vs-rewrite-vs-retire matrix;
- integration boundary recommendation (shared package vs service vs staged hybrid);
- canonical evidence/provenance contracts;
- ingestion-to-candidate-graph pipeline;
- query orchestration design;
- permission/tenant/security boundary;
- Ollama/embedding deployment and cost model;
- data freshness/reconciliation strategy;
- pilot UX and review workflow;
- migration plan that preserves both working products;
- risks, rejected alternatives and phased implementation batches;
- revised G9.1 mission only after the architecture review.

## Network Effect & Ecosystem Activation — New Strategic Track

Do **not** narrow the company thesis prematurely to one paid vertical. Organizational Intelligence remains the best near-term commercial wedge and Franchise remains a strong challenger, but the long-term thesis is broader: **trusted, permissioned, multi-network participation with selective cross-network value**.

### NE-1 — Multi-Network Identity & Membership Experience
- one account, many memberships;
- clear active-network switching;
- profile/context separation where needed;
- explicit privacy boundaries;
- reusable identity without accidental leakage.

### NE-2 — Trusted Network-to-Network Linking
- family → community;
- alumni → chapters/associations;
- business → trusted communities/ecosystems;
- franchise → operator/region councils;
- selective permissioned linking, never a global graph merge.

### NE-3 — Cross-Network Discovery & Introductions
Permission-aware use cases may include trusted job/referral requests, matrimonial/community discovery where consented, trusted service/provider requests, mentoring, professional introductions and local/community help. Every cross-network result must expose **why the connection is trusted** and respect visibility rules.

### NE-4 — Community Umbrella Model
Allow many independently governed networks to participate under a higher-level community/association umbrella without losing local autonomy. Example: **50 family networks → one trusted community umbrella**.

### NE-5 — Mass Onboarding & Network Seeding
Potentially the most important non-AI problem. Investigate RAG-assisted bootstrap, spreadsheets/import, invitation campaigns, distributed intake, admin/volunteer workflows, templates, organizer kits, self-serve setup, referral loops and migration from WhatsApp/contact lists/directories.

### NE-6 — Organic Growth Engine
Invitations, contribution requests, completion prompts, community linking, referral attribution, privacy-safe “people you trust are already here” signals, and member-to-network/network-to-network acquisition loops.

### NE-7 — Product Storytelling / Market Education
Later add demo videos, value-specific landing experiences, banners, guided tours, showcase networks, use-case explainers, ads/paid acquisition experiments and organizer kits.

### Guardrails
- no uncontrolled public social graph;
- isolation is default;
- cross-network discovery is permission/provenance aware;
- avoid feed-first addiction as the core model;
- optimize for outcomes and trusted context;
- keep purposeful vertical UX.

### Relationship with G9.1
RAG × Network OS remains valuable because it may solve the largest scaling constraint: **how to build and maintain rich networks with minimal manual effort**. G9.1 should therefore evaluate whether the extracted ingestion/evidence engine can later become a generic **Network Bootstrap Engine**, while first proving itself in Organization.

## NE-8 — Network Operations & Institutional Anchor Growth

Create a dedicated non-engineering growth capability for network seeding.

Scope:
- organizer/community-head acquisition;
- operator training;
- onboarding playbooks;
- minimal-data bootstrap;
- volunteer/admin recruitment;
- member claim/verification campaigns;
- activation dashboards;
- rewards tied to verified activation/outcomes;
- adjacent-network referrals;
- future Operator Console.

Investigate whether semi-retired/senior community members, alumni volunteers and local coordinators can become trusted low-cost operators.

The goal is not cheap labor. The goal is **trusted local activation with standardized tooling and measurable handoff**.



## G9.1-A — Evidence Foundation + Intelligence Adapter — IMPLEMENTED
- Additive evidence/provenance contracts and persistence foundation.
- Network-scoped Knowledge Intelligence adapter boundary.
- Candidate assertions remain separate from canonical graph truth.
- Existing G9 deterministic intelligence and all vertical runtimes remain unchanged.
- Knowledge Hub integration follows strict decoupling: bridge-first, standalone behavior preserved.
- Next gate: G9.1-B Organization Knowledge Bootstrap only after runtime/database verification of G9.1-A.

## G9.1-A Runtime / Database Verification — COMPLETE

G9.1-A is source-certified with strengthened regression/security gates. The bridge remains additive and decoupled from the certified G9 runtime. A read-only database catalog gate now verifies table presence, RLS, active-membership enforcement, restricted-evidence protection and closed direct writes after migration 050.

### Remaining environment certification
Apply migration 050 to the target Supabase project and perform the two-user/two-network isolation smoke test documented in `G9.1-A-RUNTIME-DATABASE-VERIFICATION.md`.

### Sequencing decision
Do **not** batch G9.1-B + G9.1-C + G9.1-D into one implementation release. They form distinct risk gates:
- **G9.1-B — Knowledge Bootstrap:** ingestion → evidence → extraction → entity resolution → candidate review;
- **G9.1-C — Graph-Aware RAG:** graph/evidence orchestration, ranking, confidence and evidence-backed answers;
- **G9.1-D — Knowledge Risk Loop:** question-derived gaps, concentration/risk scoring and contribution closure.

Small internal batches are encouraged inside each mission, but each mission must independently validate before the next begins. This preserves rollback, commercial learning and the decoupled-code rule.

### G9.1-B — Organization Knowledge Bootstrap — IMPLEMENTED
Evidence-backed targeted extraction for expertise, ownership, dependencies and architectural decisions with governed review. Next gate: G9.1-B live Supabase/RAG smoke verification before G9.1-C Graph-Aware RAG.


## G9.1-C — Graph-Aware RAG — IMPLEMENTED
- Organization-only graph + authorized evidence orchestration delivered.
- Supports expertise, ownership, dependency and decision/rationale questions.
- G9 deterministic engine and all non-Organization vertical behavior remain unchanged.
- Next strategic mission: G9.1-D Organizational Knowledge Risk Loop after manual G9.1-C runtime smoke.

## G9.1-D — Organizational Knowledge Risk Loop — DONE (source-certified)
Proactive Organization intelligence now combines verified graph structure, evidence freshness/conflict state and repeated weak-question signals. Current risk classes: ownership gaps, dependency criticality, key-person concentration, unanswered-question gaps, stale knowledge and conflicts. Next decision should be based on real Northstar/manual runtime feedback rather than automatically expanding to another vertical.

### G9.1-B.1 + C.1 — Intelligence Quality Hardening — IMPLEMENTED
Northstar-derived quality gate between initial G9.1-D implementation and further product expansion. Hardens explicit entity targeting, dependency direction, expertise ranking, extraction coverage diagnostics and answer readability. Re-run the existing Northstar corpus before further G9.1-D evaluation.

## NX-1 — My Networks & Trusted Identity Experience (implemented; runtime verification pending)
- Makes one-account/many-network participation visible through a first-class My Networks home.
- Uses an account-scoped trusted-person anchor while preserving network-local profiles and graphs.
- Corrects neutral five-vertical membership classification and exposes multi-vertical Playground switching.
- This is the first Network Effect execution mission after the post-G9.1 strategic shift.
- Next roadmap decision waits for NX-1 milestone verification; do not automatically proceed to cross-network discovery.

## 2026-08-27 — Global Portfolio & Platform Realignment

**Status: STRATEGIC PLANNING / NOT YET AN IMPLEMENTATION MISSION**

The roadmap is no longer Family-sequential. Preserve the Family signature-experience direction, but evaluate work across four parallel strategic tracks:

### P1 — Signature Product Quality
- Family: My Family, Through Me + One Family Moment + deeper Time Machine.
- Reduce primary UX rather than add surfaces.
- Full mobile/tablet/locale quality gates.

### P2 — Global Vertical Discovery
Research/design two low-to-medium regulatory commercial candidates first:
1. Professional Expertise & Referral Network.
2. Industry / Trade Ecosystem Network.

Healthcare-provider collaboration remains a high-value challenger after stronger compliance/security preparation.

### P3 — Graph Platform Evolution
Preserve tree/hierarchy behavior while introducing typed many-to-many graph capability only when a validated vertical needs it. No universal readable graph.

### P4 — Distribution & Monetization
Prioritize institutional-anchor opportunities, design partners and measurable paid outcomes. Keep direct SaaS, channel/reseller, OEM/white-label and embedded/API licensing as commercial options; do not build speculative billing/reseller machinery before evidence.

### Quality tracks — always-on, not “extra features”
- Internationalization completeness.
- Mobile/native portability.
- Accessibility/responsive behavior.
- Periodic technical-evolution/debt review.

### Next sequencing decision
Before coding the next mission, compare:
- Family Signature Experience blueprint;
- one commercial vertical concept blueprint;
- global/mobile/i18n quality closure needs.

Select the next coherent mission based on product leverage, not historical numbering.

## Stability / Quality Track — STABILITY-1
- Keep the accepted post-NX UX baseline; avoid broad Mission-1-style rewrites.
- Review NX-1→NX-6 incrementally through `window.nxFeatures = true` before removing/reworking any NX capability.
- Complete i18n migration screen-by-screen into separate locale catalogs; no new inline translation dictionaries.
- Future locale candidates after completeness: Spanish (`es`), Simplified Chinese (`zh-CN`), then French/Portuguese/German; Arabic only with RTL readiness.
- Keep future changes small, tagged by originating mission/release, and independently reviewable wherever practical.


## Mission 2 — Trusted Expertise & Professional Network
**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / LIVE RUNTIME VERIFICATION OPEN

- Added the sixth Network OS vertical for professional associations and expert communities.
- Core job: expertise discovery + credential/context + trusted referral/collaboration paths + reusable case knowledge.
- Reuses existing productized runtime; no Family/NX redesign.
- 36-person global Playground spans India, USA, UK, Spain, Canada, UAE, Australia and Singapore.
- Healthcare patient data / diagnosis / regulated clinical workflows remain explicitly out of scope.
- Migration 054 activates professional tenancy/template/feature support.
- Current EN/HI/MR catalog is 328/328 tokens in each locale. Legacy visible-literal extraction remains tracked debt.
- `npm run validate:m2` PASS; STABILITY-1 chain remains PASS.
- Next roadmap mission remains the governed graph + institutional bootstrap direction, but only after Mission 2 live runtime verification and any contained hardening.

## Mission 3 — Governed Graph Platform + Institutional Bootstrap — SOURCE IMPLEMENTED
Purpose: move from hierarchy-only thinking to governed typed relationships while enabling one institutional sponsor to seed and activate many members.

Delivered in source:
- additive graph rule/provenance contracts;
- relationship-kind constraints for Professional Network;
- governed metadata on new productized relationships;
- institution-first bootstrap score/stages;
- admin bootstrap panel with seed template, launch invite, join-code regeneration and distributed activation model;
- full static UI-copy extraction gate.

Next gate: local build/runtime verification before selecting the next major mission.


## 2026-08-27 — Post-Mission-3 Runtime Architecture Decision

The current Next.js + Supabase + Vercel architecture is considered a valid managed/serverless backend, not an architectural failure. The next maturity gap is an **application-owned server/command boundary**, not a wholesale backend rewrite.

**Mission 4 — Network OS Application & Runtime Foundation** is the next recommended major mission at **MEDIUM effort**. It will introduce a modular TypeScript `server/` layer, versioned Next.js `/api/v1` command endpoints, server-side Supabase adapters, shared mobile-portable contracts, command/query classification, an observability seam and a GitHub Actions CI baseline. Supabase Postgres/Auth/Storage/Realtime/RLS remain core infrastructure.

Do not add microservices, Kubernetes, Kafka, Redis, a dedicated graph database, native mobile, or RAG expansion as part of Mission 4. Extract only 3–5 high-value multi-step/privileged commands and preserve safe direct RLS-protected queries.

See `NETWORK-OS-BACKEND-RUNTIME-ARCHITECTURE.md` and `MISSION-4-APPLICATION-RUNTIME-FOUNDATION.md`.
