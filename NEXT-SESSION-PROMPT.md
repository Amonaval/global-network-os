# Next Session Prompt — G1.5 Claiming Seam + Alumni Identity Skeleton

Use the latest cumulative codebase containing G0 + G1.1 + G1.2 + G1.3 + G1.4.

Read first:
1. `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
2. `G1.1-ARCHITECTURE-GUARDRAILS-TYPED-VERTICAL-REGISTRY.md`
3. `G1.2-FEATURE-RUNTIME-VERTICAL-CATALOG-SPLIT.md`
4. `G1.3-NEUTRAL-NETWORK-MEMBERSHIP-CONTRACTS.md`
5. `G1.4-REMOTE-CAPABILITY-SPLIT.md`
6. `DEVELOPMENT-RULES.md`
7. `CODEBASE-UPDATE-RULE.md`
8. `ROADMAP.md`
9. `MISSION-STATUS.md`
10. `CODEBASE.md`

## Mission

Implement **G1.5 — Claiming Seam + Alumni Identity Skeleton**.

Binding constraints:
- CLASSIFY current Family claiming semantics before extracting;
- define a shared typed claim contract around claimable identity summary, claim policy/eligibility, claim operation and result;
- Family adapter must delegate to the existing verified-email/current Family claiming behavior rather than reimplementing it;
- Alumni gets only the minimum identity/profile claim types/adapter skeleton required to prove the second consumer; no fake kinship reuse and no broad Alumni UI;
- do not destructively change `network_memberships.member_id -> family_members` in G1.5;
- do not rename current Family RPCs/tables or weaken RLS/security for generic naming;
- keep existing `lib/remote.ts` imports working through the G1.4 compatibility facade;
- preserve all 147 historical remote facade exports unless an additive export is intentionally introduced;
- preserve the G1.3 Playground feature-catalog drift guard;
- preserve every historical source gate plus G1.1–G1.4 gates;
- add a G1.5 gate enforcing shared claiming contracts do not import Family/Alumni implementations and Family/Alumni adapters do not import each other;
- run focused TypeScript/runtime checks and full build when dependencies are available;
- update architecture/roadmap/status/handoff docs and add only a short high-level runtime checklist;
- update end-user/Admin guide only if visible Family behavior changes.

Target result: prove identity claiming as a shared capability with Family unchanged and Alumni represented explicitly, making the second vertical real enough to inform the next extraction decision without overbuilding it.
