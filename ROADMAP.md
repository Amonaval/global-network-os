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
- CR2.1: invitation detection inside normal post-login landing when a token was opened on another device;
- CR2.2: richer "connect my joined membership to my profile" assistant after Family Code join;
- CR2.3: optional QR rendering of Family Code/join URL;
- CR2.4: Alpha onboarding analytics: signed-up → joined/demo/created → opened tree → returned;
- CR2.5: safe expiry/rotation policy for Family Codes if/when Alpha expands beyond trusted distribution.

**Immediate release order remains:** CR1 real-device corrections → CR2 live onboarding verification → V1 Alpha certification → 2–3 trusted-family pilot → evidence-driven corrections.

### CR2.1 — Alpha onboarding/runtime hotfix — IMPLEMENTED / VERIFY
- Fix demo/local non-UUID profile IDs reaching UUID-only Supabase RPCs.
- Replace direct `network_settings` writes with tenant-scoped RPC updates.
- Normalize friendly Excel IDs to UUIDs before shared persistence.
- Offer both a small quick-start Naval workbook and the existing 150-person full demo workbook.
- Do not mark complete until fresh-family creation and both sample imports are tested against live Supabase.
