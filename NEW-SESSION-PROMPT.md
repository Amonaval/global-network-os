# New Session Handoff — Family Network after Priority 1 A1

Use this patch together with the latest full Family Release 2/2A codebase. Read in this order: `ROADMAP.md`, `MISSION-STATUS.md`, `A1-MULTI-FAMILY-FOUNDATION.md`, `ALPHA-FAMILY-PLATFORM-ROADMAP.md`.

## Non-negotiable preservation rule
Do not delete earlier valuable roadmap or mission-history items when reprioritizing. ROADMAP and MISSION-STATUS are cumulative. Move deferred ideas to FUTURE/FAR-FUTURE queues with milestone gates.

## Current product direction
Family-first, mobile-first, multilingual, novice/older-user friendly. One application/domain supports many isolated families. Family Owner/Admin self-serves; relatives join free. Alpha: 20 then 50 autonomous families. 100 MB/family; photos OFF by default; <=100 KB/image when enabled; initials/icons and optional public social-profile links reduce storage dependence.

## Immediate execution
1. Audit Priority 1/A1 implementation and migration `019` against the actual latest codebase.
2. Run/fix clean migration path and existing-instance upgrade.
3. Audit every SECURITY DEFINER RPC and storage path for network isolation.
4. Prove Family A cannot read/write Family B via UI, REST, guessed IDs, RPC or storage.
5. Regression-test existing Release 1, Release 2 and Release 2A journeys.
6. Fix A1 blockers only and mark A1 VERIFIED when evidence exists.
7. Then implement Priority 2/A2 autonomous Create Family / Join / Invite / Claim and family switching.

Do not jump to generic platformization, billing or enterprise work. Do not delete those missions either; preserve them behind their roadmap gates.

## 2026-08-22 continuation
This canonical package now also contains A2 source implementation in migration `020`, family switching, self-service family creation, and family-scoped invitation/claim handling. Read `A2-AUTONOMOUS-ONBOARDING.md` after the four documents above. A1 is source-audited but must not be called VERIFIED/production-closed until the documented live Supabase isolation/regression gate passes. Next work is staging verification of 001–020 and A2 edge-case closure, then A3 — not reconstruction from any older ZIP.

## 2026-08-22 Home UX + documentation checkpoint
The canonical baseline also restores the missing `components/FamilyHome.tsx` and adds dedicated responsive Home styling. Do not remove or reconstruct this from older ZIPs. The user will run build/Supabase checks; implementation sessions should preserve existing behavior and add roadmap features with focused source-level correctness checks. Reserve broad/high-effort regression audits for milestone gates.

User guide cadence: the Complete User & Administrator Guide is current through Release 2/2A and A1/A2 source implementation. Refresh it after roughly 3–5 implementation sessions (next natural checkpoint: A3–A5), unless a major user-visible journey changes sooner.

## 2026-08-22 A3 continuation
A3 Family Admin Center is now implemented in source with migration `021_a3_family_admin_center.sql`; read `A3-FAMILY-ADMIN-CENTER.md`. Preserve the older advanced admin/governance tools behind the new family-first center. Live Supabase verification remains user-run. Next product mission is A4 — Lightweight identity & social links unless a focused A3 defect is reported.
