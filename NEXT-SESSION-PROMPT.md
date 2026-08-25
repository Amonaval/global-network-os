# Next Session Prompt — G1.3 Neutral Network & Membership Contracts

Use the latest cumulative codebase containing G0 + G1.1 + G1.2.

Read first:
1. `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
2. `G1.1-ARCHITECTURE-GUARDRAILS-TYPED-VERTICAL-REGISTRY.md`
3. `G1.2-FEATURE-RUNTIME-VERTICAL-CATALOG-SPLIT.md`
4. `G1.2-RUNTIME-VERIFICATION-CHECKLIST.md`
5. `DEVELOPMENT-RULES.md`
6. `CODEBASE-UPDATE-RULE.md`
7. `ROADMAP.md`
8. `MISSION-STATUS.md`
9. `CODEBASE.md`

## Mission

Implement **G1.3 — Neutral Network & Membership Contracts**.

Binding constraints:
- CLASSIFY before moving code;
- preserve Family runtime/UI/database behavior exactly;
- introduce neutral TypeScript contracts for network identity/context and user↔network membership where semantics are genuinely shared;
- keep Family compatibility aliases/adapters for existing callers;
- do not migrate/drop/rename `family_members`, existing RPC names, membership columns or Supabase schema in G1.3 unless an additive compatibility change is strictly required and proven safe;
- do not pretend `network_memberships.member_id -> family_members` is already generic; isolate that leak rather than hiding it;
- Alumni must not be forced to use kinship member semantics;
- do not generalize graph/relationships, S3-A1 construction, memories, lineage or kinship intelligence;
- preserve all G1.1/G1.2 architecture gates and all historical regression gates;
- add a G1.3 source gate for dependency direction and Family compatibility;
- run focused TypeScript/runtime checks plus full build when dependencies are available;
- update architecture/roadmap/status/handoff docs and add a short runtime smoke checklist after the round;
- only update end-user/Admin guide content if visible behavior changes.

Target result: a neutral network/membership contract seam that makes the next transport/repository split possible without destabilizing Family.
