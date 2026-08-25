# Next Session Prompt — G1.2 Feature Runtime / Vertical Catalog Split

Use the latest cumulative codebase containing G0 + G1.1.

Read first:
1. `G0-TRUSTED-NETWORK-ARCHITECTURE-BLUEPRINT.md`
2. `G1.1-ARCHITECTURE-GUARDRAILS-TYPED-VERTICAL-REGISTRY.md`
3. `DEVELOPMENT-RULES.md`
4. `CODEBASE-UPDATE-RULE.md`
5. `ROADMAP.md`
6. `MISSION-STATUS.md`
7. `CODEBASE.md`

## Mission

Implement **G1.2 — Feature Runtime / Vertical Catalog Split**.

Binding constraints:
- preserve Family behavior exactly;
- preserve every existing Family feature key, rollout state and compatibility export;
- separate generic launch/evaluation/runtime mechanics from Family feature definitions;
- Family feature catalog must live behind the Family vertical definition/composition seam;
- Alumni gets only the minimal typed feature catalog needed to prove the second vertical; do not build Alumni UI/workflows;
- do not rename RPCs or database feature keys in G1.2;
- do not generalize S3-A1, kinship graph, memories or relationship intelligence;
- keep `lib/features.ts` as a compatibility facade/barrel if needed so existing callers do not require a big-bang migration;
- add/extend source gates to prohibit reverse dependencies and protect Family feature defaults;
- run all existing regression gates and full build/type validation when dependencies are available;
- update roadmap/status/codebase docs and close the non-user-facing mission truthfully.

Do not skip CLASSIFY before IMPLEMENT. If a feature definition is Family-semantic, keep it Family-specific rather than forcing it into generic config.
