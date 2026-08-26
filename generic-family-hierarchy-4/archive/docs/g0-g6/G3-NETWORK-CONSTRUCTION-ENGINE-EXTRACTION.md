# G3 — Network Construction Engine Extraction

**Date:** 2026-08-25  
**Status:** IMPLEMENTED IN SOURCE / CLOSED AS CONSOLIDATED NON-USER-FACING ARCHITECTURE BATCH / SHORT DEPLOYED SMOKE RECOMMENDED

## Objective

Extract the reusable construction workflow proven by S3-A1 without moving Family/kinship semantics into Core, renaming the deployed S3-A1 database, or changing any current Family intake UX/security behavior.

The reusable lifecycle is now represented as:

`source/access -> session -> staged entities/edges -> match candidates -> decisions/conflicts -> provenance -> validation -> commit plan/result`

Family remains the authoritative production implementation through the existing S3-A1 Supabase RPCs. Alumni is the second-consumer proof only at the contract/adapter level; it has no fake importer or Family persistence reuse.

## Classification outcome

| S3-A1 concept | G3 classification | Decision |
|---|---|---|
| session/access lifecycle | SHARED CONSTRUCTION | neutral contracts + runtime |
| source metadata / provenance | SHARED CONSTRUCTION | neutral `ConstructionSource` / `ConstructionProvenance` |
| staged entity envelope | SHARED CONSTRUCTION | neutral staged entity contract |
| staged edge envelope | SHARED CONSTRUCTION | neutral staged edge contract |
| match candidate + confidence/status | SHARED CONSTRUCTION | neutral candidate representation |
| Same / Different / Not sure lifecycle | SHARED CONSTRUCTION | neutral decision contract |
| conflict envelope | SHARED CONSTRUCTION | neutral conflict representation |
| validation result / blocking issues | SHARED CONSTRUCTION | neutral validation contract |
| commit plan/result | SHARED CONSTRUCTION | neutral commit contracts |
| deterministic scoring lifecycle | SHARED, algorithm policy DEFERRED | Core owns candidate/decision mechanics; current scoring weights/context stay in Family SQL until a real second implementation proves them common |
| parent / child / spouse | KINSHIP | Family-only |
| generation offset/order | KINSHIP | Family-only |
| lineage/cycle graph validity | KINSHIP | Family SQL/domain rules remain authoritative |
| branch language and Family contributor copy | FAMILY | unchanged |
| canonical `family_members` / `family_relationships` commit | FAMILY | unchanged |
| Alumni institution/batch/program semantics | ALUMNI | typed skeleton only; no persistence yet |

## Architecture introduced

```text
core/construction/contracts.ts
        │
        ▼
capabilities/construction/runtime.ts
        │
        ├──────── verticals/family/construction/
        │             ├── types.ts
        │             └── adapter.ts
        │
        └──────── verticals/alumni/construction/
                      ├── types.ts
                      └── adapter.ts

app-shell/vertical-capabilities.ts        # composition root
lib/remote.ts                            # Family API compatibility facade
lib/family-intake-types.ts               # Family type compatibility facade
```

`network.construction` is now an explicit typed vertical capability.

## Core/shared construction contracts

`core/construction/contracts.ts` now defines reusable workflow primitives for:
- source/access provenance;
- entity and edge input envelopes;
- session/access summaries;
- staged entity/edge summaries;
- candidate matching confidence/status;
- decision records;
- conflict records;
- construction metrics;
- validation issues/results;
- commit plan/result;
- typed `ConstructionAdapter`.

Core does not import Family or Alumni implementations and contains no `family_intake_*`, `family_members`, parent/child/spouse or generation-offset semantics.

## Shared runtime

`capabilities/construction/runtime.ts` provides adapter-independent orchestration for:
- create session/access;
- public preview;
- submit staged network data;
- fetch construction dashboard;
- resolve identity candidates;
- validate access/batch;
- build commit plan;
- commit;
- revoke access.

The runtime blocks a `skeleton` vertical before persistence exists.

It deliberately does **not** hard-code match weights or graph rules. Those are policy/domain semantics and need real second-consumer evidence before moving downward.

## Family adapter — behavior remains authoritative

`verticals/family/construction/adapter.ts` owns the historical S3-A1 transport functions unchanged:
- `createFamilyIntakeSession()` → `create_family_intake_session`;
- `createFamilyIntakeLink()` → `create_family_intake_link`;
- `fetchFamilyIntakePreview()` → `get_family_intake_preview`;
- `submitFamilyIntake()` → `submit_family_intake`;
- `fetchFamilyIntakeDashboard()` → `get_family_intake_admin_dashboard`;
- `decideFamilyIntakeMatch()` → `decide_family_intake_match`;
- `commitFamilyIntakeBranch()` → `commit_family_intake_branch`;
- `revokeFamilyIntakeLink()` → `revoke_family_intake_link`.

The Family adapter maps the existing dashboard into the neutral construction representation. Family-specific attributes such as `role_from_anchor`, `generation_offset` and `matched_member_id` remain inside the Family adapter/types.

Migration 043 currently keeps raw staged relationship rows and decision rows server-side rather than returning them from the historical admin dashboard RPC. G3 models those concepts in the shared contract but returns empty generic arrays from the compatibility adapter rather than changing the deployed Family RPC shape.

Family validation in the adapter mirrors the existing visible commit blockers: ambiguous unmatched staged people and medium/high open-or-unsure candidates block a construction commit plan. The database remains the final authoritative transaction/graph-integrity enforcement.

## Family type compatibility

Historical `lib/family-intake-types.ts` remains the import path used by current UI, but it is now a compatibility facade over `verticals/family/construction/types.ts`.

No current Family component was forced to import Core construction types.

## Alumni second-consumer evidence

G3 adds institutional construction semantics:
- institution identity/name;
- graduation year;
- program;
- department;
- batchmate/classmate/mentor/professional-connection edges.

`ALUMNI_CONSTRUCTION_ADAPTER` is explicitly `skeleton` and unavailable for persistence.

It does **not** use:
- `family_members`;
- `member_id` as an Alumni profile model;
- parent/child/spouse;
- generations;
- Family intake RPCs;
- Family tables.

This proves that the shared construction lifecycle is wider than kinship while avoiding a half-built Alumni backend before G5.

## App-shell composition

`app-shell/vertical-capabilities.ts` now composes construction alongside identity claiming and participation:
- Family → ready construction runtime;
- Alumni → skeleton construction runtime.

Shared/Core code does not compose verticals.

## Compatibility and database safety

G3 adds **no Supabase migration**.

Unchanged:
- migration 043 schema;
- all `family_intake_*` tables;
- all S3-A1 RPC names;
- token hashing and anonymous isolation;
- RLS/security-definer behavior;
- deterministic scoring/Family graph validation logic;
- S3-A1 contributor/Admin UI;
- `contribute.branch_intake` feature key/default;
- current Family copy/navigation.

`lib/remote.ts` still exposes all historical Family intake functions through re-export, and all 147 historical G1.4 facade exports remain present.

## Automated validation

`validate:g3` verifies:
- Core/shared construction code has no Family/Alumni implementation dependency;
- Core construction contracts contain no Family/Kinship persistence semantics;
- Family adapter owns every existing S3-A1 RPC;
- `lib/remote.ts` no longer implements those RPCs directly but preserves their public functions;
- historical `lib/family-intake-types.ts` remains compatible;
- Alumni construction has zero Family persistence/kinship reuse;
- app-shell composes both construction adapters;
- current S3-A1 UI still imports through compatibility paths;
- G2 identity/participation contracts remain intact;
- all 147 historical remote exports remain present;
- all 234 accepted G2 baseline files remain present;
- no post-044 migration was added.

Historical source/regression suite through G3: PASS.

Focused strict TypeScript 5.8.3 no-emit compilation of the G3 architecture layer: PASS.

Focused executable runtime assertion: PASS for ready-adapter delegation and skeleton blocking.

Full Next.js production build is not certified in this workspace because installed dependencies are not present. Do not convert that environment limitation into a build PASS.

## User/Admin documentation decision

No normal Family User/Admin Guide change is required. G3 changes no visible Family workflow, wording, permissions or controls. Existing S3-A1 Guide/Playground/Launch Control/What's New coverage remains the correct user-facing documentation.

## Closure lifecycle

- [x] CLASSIFY
- [x] IMPLEMENT
- [x] VALIDATE
- [x] GUIDE — N/A for new user-facing content; existing S3-A1 guidance unchanged
- [x] PLAYGROUND — existing S3-A1 no-save simulation unchanged
- [x] LAUNCH CONTROL — existing `contribute.branch_intake` behavior unchanged
- [x] WHAT'S NEW — N/A; architecture-only extraction
- [x] ROADMAP / STATUS
- [x] WHERE TO SEE THIS — existing S3-A1 surfaces unchanged
- [x] CLOSE
- [ ] SHORT DEPLOYED SMOKE

## Where to see preserved Family behavior

- Family Admin → Build together;
- Create Family / Home quick-start → build with relatives;
- `/contribute/[token]` contributor form;
- Family Admin overlap review / Same / Different / Not sure / commit;
- Playground → Build Together simulation;
- Platform Owner → Launch Control → Build family together.

## Next consolidated architecture batch

**G4 — Vertical Runtime & App Composition**.

G4 should reduce Family assumptions in shell/navigation/feature/Guide/Playground/Launch/What's New composition without weakening Family UX, while using the now-proven network, identity, participation and construction capability seams.
