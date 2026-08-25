# G2 — Shared Identity, Claiming & Participation Foundation

**Date:** 2026-08-25  
**Status:** IMPLEMENTED IN SOURCE / CLOSED AS CONSOLIDATED NON-USER-FACING ARCHITECTURE BATCH / SHORT DEPLOYED SMOKE RECOMMENDED

## Objective

Turn the next group of proven Family primitives into reusable capability seams in one High-effort batch, without splitting the work into G1.5/G1.6/G1.7 micro-missions and without changing Family behavior.

G2 covers:
- neutral vertical identity references and account↔identity binding contracts;
- typed claimable identity / claim eligibility / claim request / claim result contracts;
- a shared identity-claiming runtime;
- generic invitation, governed-contribution and participation-metric contracts;
- a shared participation runtime;
- Family adapters that delegate to the exact existing verified-email, invitation and contribution RPCs;
- explicit Alumni identity + participation skeletons that do **not** reuse `family_members`;
- app-shell composition proving Family and Alumni are two consumers of the same capability contracts;
- compatibility facades preserving all existing Family callers and remote exports.

## Classification

### CORE — identity contracts

New `core/identity/contracts.ts` owns:
- `VerticalIdentityRef`;
- `ClaimableIdentitySummary`;
- `ClaimMethod`;
- `IdentityClaimEligibility`;
- `IdentityClaimRequest`;
- `IdentityClaimResult`;
- `IdentityBinding`;
- `IdentityClaimAdapter`.

Core identity contracts contain no Family table/RPC shape and do not define `member_id` as the universal profile link.

### CORE — participation contracts

New `core/participation/contracts.ts` owns reusable lifecycle shapes for:
- invitation delivery/status;
- invitation create/list/preview/accept operations;
- governed contribution prompts and actions;
- participation metric snapshots;
- privacy-safe public participation events;
- `ParticipationAdapter`.

These contracts intentionally do **not** generalize Family community groups/events, kinship prompts, or relationship semantics.

### SHARED CAPABILITY — claiming runtime

`capabilities/identity-claiming/runtime.ts` owns adapter-independent claim orchestration and vertical-kind guardrails.

The runtime does not know Supabase RPC names or Family/Alumni storage.

### SHARED CAPABILITY — participation runtime

`capabilities/participation/runtime.ts` owns adapter-independent invitation, contribution-prompt and participation-metric orchestration.

It does not import either vertical implementation.

## Family adapter — behavior remains the contract

### Verified-email claiming

`verticals/family/identity/claiming-adapter.ts` now owns the historical Family transport functions:
- `fetchMyClaimableProfiles()` → `get_my_claimable_profiles`;
- `claimProfileByVerifiedEmail()` → `claim_profile_by_verified_email`.

The generic Family claim adapter maps those stable RPC results into neutral identity contracts. It does not replace or weaken the database verification rules.

The existing UI still imports the same names from `lib/remote.ts`.

### Invitations + participation

`verticals/family/participation/adapter.ts` now owns the existing RPC transport for:
- single/member invitation creation and acceptance;
- bulk invitations;
- invitation list/revoke/resend/preview;
- contribution suggestion refresh/list/action;
- participation metrics;
- public participation tracking.

Every deployed RPC name is unchanged.

`verticals/family/participation/types.ts` owns the historical Family snake_case transport shapes (`MemberInvitation`, `ContributionSuggestion`, `ParticipationMetrics`). `lib/participation-types.ts` re-exports them for compatibility and intentionally keeps Family/community group/event types outside the shared participation abstraction.

## Alumni second-consumer skeleton

G2 adds:
- `verticals/alumni/identity/types.ts` with institutional identity fields such as institution, graduation year, program and department;
- `verticals/alumni/identity/claiming-adapter.ts`;
- `verticals/alumni/participation/adapter.ts`.

Both adapters are explicitly `skeleton` / unavailable for writes.

They do **not**:
- call Family claiming RPCs;
- call Family invitation/contribution RPCs;
- use `family_members`;
- use `member_id` as the Alumni identity model;
- expose Alumni UI;
- create fake Alumni database tables before G5 needs them.

This is intentional. The second consumer proves the contract without pretending backend persistence already exists.

## App-shell composition

New `app-shell/vertical-capabilities.ts` composes:
- Family identity claiming runtime;
- Family participation runtime;
- Alumni identity claiming runtime skeleton;
- Alumni participation runtime skeleton.

Core/shared modules never import vertical implementations. App-shell remains the composition root.

## Compatibility facade

`lib/remote.ts` remains the stable Family-facing API.

The G1.4 compatibility snapshot is still binding:
- **147/147 historical remote facade exports preserved**;
- Family components/pages do not need import migrations;
- `NetworkApp`, `SetupScreen`, `InvitationModal`, invitation page and `ParticipationCenter` continue using the same public functions;
- no Family UI copy/navigation/feature-key/default changed.

`lib/participation-types.ts` is also now a compatibility facade for extracted Family invitation/contribution transport types.

## Database and security

G2 adds **no Supabase migration**.

No changes to:
- `profiles.member_id`;
- `network_memberships.member_id`;
- `family_members`;
- `member_invitations`;
- `contribution_suggestions`;
- RLS/security-definer policies;
- claim/invitation/contribution RPC names or grants.

This preserves the security-reviewed Family backend while creating the TypeScript/runtime seam needed before a real Alumni backend exists.

## Intentionally not extracted in G2

To keep the batch coherent rather than gigantic, G2 does **not** generalize:
- Family community groups/events;
- memories/life events;
- kinship/relationship semantics;
- S3-A1 staging/matching/commit pipeline;
- Family Admin;
- guide content;
- digest/community trust graph;
- universal entity storage.

S3-A1 construction becomes the next consolidated batch, G3.

## Automated regression protection

New `validate:g2` enforces:
- Core/shared identity/participation code cannot depend on Family/Alumni implementations;
- Core contracts cannot contain Family table/RPC semantics;
- Family adapters delegate to the current RPCs rather than reimplementing persistence rules;
- Alumni skeleton cannot use Family tables/RPCs/identity fields;
- Family and Alumni adapters cannot import one another;
- app-shell composes both consumers;
- Family UI callers remain behind compatibility facades;
- all 147 G1.4 historical remote exports remain present;
- no post-044 migration is introduced in G2.

During implementation the gate also caught and prevented an accidental extraction-range regression that temporarily removed adjacent Family community group/event exports. They were restored unchanged before release.

## Validation performed

PASS:
- every historical D1/V1/CR1/CR2/S1/S2/S3-A1 source gate;
- G1.1 architecture gate;
- G1.2 feature-runtime gate;
- G1.3 network/membership gate;
- G1.4 remote-capability gate;
- G2 shared identity/participation gate;
- 147/147 historical `lib/remote.ts` exports;
- focused TypeScript 5.8.3 strict/noEmit compile for all new Core/shared/Family/Alumni G2 modules using a Supabase declaration shim;
- Node syntax validation of the new source gate;
- source deletion/diff audit: no accepted application file deleted.

Not claimed:
- full `next build`; `node_modules` is absent and `npm ci` timed out in this execution environment.

## User/Admin documentation decision

No normal User/Admin Guide change is required because G2 changes no visible Family workflow, wording, permissions or navigation. Architecture/release documentation and the deployment smoke checklist are the correct documentation surfaces.

## Closure lifecycle

- [x] CLASSIFY
- [x] IMPLEMENT
- [x] VALIDATE
- [x] GUIDE — N/A for end users; architecture docs updated
- [x] PLAYGROUND — existing behavior preserved; no artificial G2 screen added
- [x] LAUNCH CONTROL — existing behavior/catalog-drift guard preserved
- [x] WHAT'S NEW — N/A because no user-facing feature changed
- [x] ROADMAP / STATUS
- [x] WHERE TO SEE THIS — existing Family claim/invite/participation surfaces unchanged
- [x] CLOSE
- [ ] SHORT DEPLOYED SMOKE

## Where to see existing behavior

G2 itself is invisible. The compatibility surfaces it protects are:
- no-family Setup → verified-email **This is me** claim when a matching profile exists;
- Invite family / private invitation link flow;
- Participation Center → batch invitations, contribution prompts and metrics;
- public profile/share tracking;
- Launch Control / Playground feature behavior from G1.3/G1.4.

## Next consolidated mission

**G3 — Network Construction Engine Extraction**

Extract the reusable S3-A1 workflow mechanics—intake session, staged entities/edges, deterministic matching, conflicts, decisions, provenance, validation and commit contracts—while keeping Family kinship interpretation/commit semantics in the Family adapter and creating only the minimum Alumni batch/department construction adapter needed to prove the second consumer.
