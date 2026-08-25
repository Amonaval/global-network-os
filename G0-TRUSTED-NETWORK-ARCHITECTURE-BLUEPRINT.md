# G0 — Trusted Network Architecture Classification & Extraction Blueprint

**Date:** 2026-08-25  
**Status:** ARCHITECTURE COMPLETE / NO RUNTIME REFACTOR IN G0  
**Canonical baseline:** latest cumulative source through S3-A1 Distributed Family Intake V1 + UX closure

## 1. Executive decision

The product should evolve as a **capability tree with explicit verticals**, not as one giant configurable hierarchy engine and not as duplicated Family/Alumni applications.

The current codebase already contains two different architectural realities:

1. a genuinely reusable network/runtime spine (`networks`, `network_memberships`, active-network context, platform-owner rollout, audit/governance primitives); and
2. a rich Family domain built directly on top of that spine (`family_members`, parent/child/spouse semantics, generations, lineage, deceased/history/memories, Family intake and Family-first UI).

G0 therefore chooses **incremental extraction with compatibility facades**. Family behavior is the stable contract. Alumni becomes the second consumer that proves each abstraction before it moves downward.

### Binding dependency direction

```text
Vertical UI / Vertical workflows
        ↓
Intermediate domain layer
        ↓
Shared capability
        ↓
Core network foundation
```

Imports or schema dependencies in the opposite direction are forbidden. Core/shared code must not import Family, Alumni, Enterprise, or other specialization.

### Binding extraction rule

> A capability moves downward only when its semantics remain correct for the second real consumer.

Renaming `family` to `network` is not generalization. Converting every domain concept into metadata is also not generalization.

---

# 2. Target capability tree

```text
Trusted Network Platform
│
├── CORE NETWORK FOUNDATION
│   ├── Network/Tenant Identity
│   ├── User ↔ Network Membership
│   ├── Active Network Context
│   ├── Roles / Authorization Primitives
│   ├── Audit / Provenance Primitives
│   ├── Platform Ownership
│   ├── Feature Runtime / Rollout
│   └── Shared persistence / repository contracts
│
├── SHARED CAPABILITIES
│   ├── Identity & Claiming
│   ├── Invitations / Join
│   ├── Search / Discovery primitives
│   ├── Graph primitives
│   ├── Profile visibility / contact visibility
│   ├── Distributed Network Construction
│   │   ├── contribution access/token
│   │   ├── staging
│   │   ├── deterministic matching
│   │   ├── conflict/provenance
│   │   └── reconcile/commit framework
│   ├── Relationship Intelligence primitives
│   ├── Groups / Events / Participation primitives
│   ├── Notifications / Digest runtime
│   ├── Guide framework
│   ├── Playground framework
│   ├── Launch Control framework
│   └── What's New / discovery framework
│
├── INTERMEDIATE DOMAIN LAYERS
│   ├── Kinship / Genealogy
│   │   ├── parent-child-spouse vocabulary
│   │   ├── generation ordering
│   │   ├── ancestry/descendancy
│   │   └── kinship explanations
│   │
│   ├── Institutional Membership
│   │   ├── institution
│   │   ├── department/program
│   │   ├── cohort/batch/year
│   │   ├── alumnus/faculty roles
│   │   └── mentorship/career context
│   │
│   ├── Organizational Intelligence
│   ├── Business Trust Networks
│   └── Membership Communities
│
└── EXPLICIT VERTICALS
    ├── Family Network
    ├── Alumni Network
    ├── Professional / Trade Association
    ├── Enterprise Relationship & Expertise Intelligence
    ├── Founder / Investor / Industry Network
    └── Clubs / Societies / Nonprofit / Volunteer Networks
```

---

# 3. Current source classification

This classification is logical. **G0 does not physically move files.** A file can contain more than one class today; mixed files are extraction targets rather than proof that the concepts belong together.

## 3.1 CORE

### Database / backend

| Current asset | Classification | Decision |
|---|---|---|
| `networks` | CORE | Keep as canonical tenant/network identity. Add a typed vertical kind later rather than replacing it. |
| `network_memberships` | CORE | Reusable user↔network membership spine. `member_id -> family_members` is a Family leak to remove through compatibility evolution, not destructive migration. |
| `profiles.active_network_id` | CORE | Reusable active-network context. |
| `current_network_id()` | CORE | Stable tenant context primitive. |
| `is_network_member()` | CORE | Stable authorization primitive. |
| `is_network_admin()` | CORE | Stable authorization primitive. |
| `set_active_network()` | CORE | Stable runtime primitive. |
| `get_my_networks()` | CORE | Reusable, though return vocabulary may need vertical metadata. |
| `platform_owners`, `is_platform_owner()` | CORE / product runtime | Reusable platform authority. |
| `platform_feature_flags`, rollout audit | CORE / product runtime | Reusable launch runtime; current feature keys are Family-heavy. |
| `network_feature_settings` | CORE / product runtime | Reusable per-network overrides. |
| `user_feature_discoveries` | CORE / product runtime | Reusable What's New/discovery primitive. |
| `audit_log` | CORE | Generic audit primitive; event vocabulary can remain capability/vertical specific. |
| `profiles` auth linkage | CORE | User-account primitive; Family claim pointer is mixed and needs facade evolution. |

### TypeScript

| Current asset | Classification | Notes |
|---|---|---|
| `lib/supabase.ts` | CORE | Infrastructure only. |
| `lib/auth.ts` active network/platform owner logic | CORE with Family naming leak | `family_role` should later become a compatibility alias over generic membership role. |
| `lib/repository.ts` repository selection/mode | CORE shell | Interface is currently dominated by Family entity types. Split contracts incrementally. |
| `lib/store.ts` persistence mechanics | CORE shell | Stored shape is Family-domain today. |
| `lib/features.ts` rollout mechanics | CORE runtime + Family catalog | Types/evaluation engine reusable; current registry keys/labels are Family-specific. |

## 3.2 SHARED CAPABILITY

| Current asset | Capability | Current condition |
|---|---|---|
| invitation token lifecycle | Invitations / Join | Reusable lifecycle; RPC/table naming and member target are Family bound. |
| claiming flows | Identity & Claiming | Reusable concept; current verified-email claim resolves `family_members`. |
| profile visibility/contact visibility | Identity privacy | Reusable primitive with vertical policy adapters. |
| `change_requests` | Governed contribution | Mostly reusable; action vocabulary currently Member/relationship focused. |
| notifications/preferences | Notification runtime | Reusable transport/state primitive. |
| groups/events/participation tables | Community & Engagement | Reusable concepts; validate field semantics before extraction. |
| community spaces/posts/profile cards | Discovery/community | Partly reusable; `community_family_links` is an intermediate Family↔community adapter, not core. |
| trust edge / introduction lifecycle | Trusted connections | Reusable flow pattern; current edges are family-to-family and need neutral endpoints before reuse. |
| guide feedback | Product intelligence | Reusable framework; `family_count` naming is a Family leak. |
| Guide components/types | Guide framework | Rendering/search/routing framework reusable; content is Family vertical. |
| Playground launch controls | Playground framework | Reusable runtime; demo data and feature catalog are vertical. |
| Founder Launch Control | Launch Control framework | Reusable controller UI after registry becomes vertical-aware. |
| S3-A1 token/staging/match/conflict workflow | Distributed Network Construction | **Architecturally shared, physically Family-specific. Do not extract in G1.** |

## 3.3 INTERMEDIATE DOMAIN LAYER — KINSHIP / GENEALOGY

These are not merely Family branding. They encode actual kinship semantics and should live below Family only if another kinship-style vertical needs them.

| Asset / semantic | Decision |
|---|---|
| `RelationshipType = parent | child | spouse` | KINSHIP domain. Never make this the universal graph edge enum. |
| generation levels/order validation | KINSHIP domain. |
| parent/child/spouse duplicate rules | KINSHIP domain. |
| ancestry/descendancy traversal | KINSHIP domain. |
| `relationship-intelligence.ts` kinship naming/explanations | KINSHIP domain with potentially reusable traversal beneath it. |
| family branch intake `generation_offset` | KINSHIP adapter over future construction primitives. |
| branch role labels (`mother`, `uncle`, etc. where used) | KINSHIP / Family semantics. |
| family foundational relationship protection | KINSHIP governance. |
| family lineage/tree rendering assumptions | KINSHIP presentation/domain. |

## 3.4 FAMILY-SPECIFIC

Keep these explicit. They should not be forced into shared configuration solely to increase reuse percentage.

- Family Home emotional experience and Family Pulse composition.
- birthdays, anniversaries, On This Day and Family special-day language.
- deceased-person handling and family-history storytelling.
- memories framed as intergenerational family preservation.
- reunion/gathering flows when the semantics are explicitly family reunion oriented.
- Family Admin Center copy, continuity expectations and family ownership language.
- family creation policy, family join code UX, family lobby and Family switcher copy.
- family spreadsheet templates and kinship import guidance.
- family-specific Guide content, personas and privacy explanations.
- Family branch intake form wording and branch-relative vocabulary.
- Family feature catalog labels and Family What's New copy.
- `FamilyHome`, `FamilyDigest`, `FamilyBranchIntakeForm`, `FamilyIntakeAdmin` as vertical surfaces.
- current `TreeView` presentation until graph rendering is proven with a second non-kinship relationship model.

---

# 4. Family-hardcoded assumptions inside reusable-looking code

## Highest-priority leaks

1. **Membership identity is tied to `family_members`.**  
   `network_memberships.member_id` references `family_members(id)`. Alumni needs a user to claim an Alumni profile without pretending that profile is a family member.

2. **The principal entity type is named and shaped as `Member`.**  
   `lib/types.ts` combines reusable profile fields with Family-only fields (`date_of_death`, `generation_level`, kinship status assumptions).

3. **The universal-looking relationship type is kinship-only.**  
   `parent | child | spouse` cannot model classmate, faculty-of, mentor, colleague, invested-in or member-of.

4. **`lib/repository.ts` is nominally NetworkRepository but its contract is Family domain.**  
   It exposes members, family relationships, life events, memories and generation-oriented search.

5. **`lib/network.ts` templates imply vocabulary substitution can generalize semantics.**  
   The existing `alumni` template maps Parent→Senior, Child→Junior, Spouse→Classmate. This is exactly the abstraction G0 rejects. An Alumni network is not a renamed family tree.

6. **Feature runtime and feature catalog are mixed.**  
   `lib/features.ts` has reusable rollout mechanics, but keys such as `remember.memories`, `celebrate.special_days`, `contribute.branch_intake`, `advanced.relationships` are Family product catalog items.

7. **Remote transport is one monolithic module.**  
   `lib/remote.ts` mixes core tenancy, platform runtime, Family onboarding, memories, community, trust, guide feedback and S3-A1 construction. This makes dependency boundaries invisible.

8. **RPC naming bakes vertical semantics into reusable lifecycle patterns.**  
   Examples: `create_family`, `join_family_by_code`, `get_my_claimable_profiles`, `search_family_members`, `request_family_trust_connection`, `family_intake_*`.

9. **Analytics names assume family semantics.**  
   living/deceased/generations are useful Family metrics, not core network analytics.

10. **Storage error and policy copy assumes Family.**  
    Media enforcement can be shared; Family quota/product wording is vertical policy.

## Lower-risk naming leaks

- `family_role` in `AuthUser` duplicates generic membership role.
- `PlatformFamilyTarget` should become a generic rollout target with a Family compatibility alias.
- `FamilyFeatureSetting` is structurally generic.
- guide feedback `family_count` should ultimately become `network_count` while preserving RPC compatibility.
- Launch Control UI currently explains Family Pilot behavior even though rollout machinery is platform-level.

---

# 5. Stable contracts for incremental extraction

G1+ must preserve these externally observable Family contracts while internals are extracted:

1. Existing Family routes continue to resolve.
2. Existing Supabase RPC names continue to work until callers are migrated and a deprecation window is completed.
3. Existing migration history is immutable; new migrations are additive.
4. Existing Family table data is not bulk-moved merely for architectural neatness.
5. Family feature keys remain valid aliases even if a vertical-aware registry is introduced.
6. `NetworkApp` Family behavior, role visibility and active-family switching remain unchanged.
7. Existing Family invite/claim links remain valid.
8. Existing public profile/privacy behavior remains unchanged.
9. S3-A1 tokens and staged branch data retain their existing semantics and security model.
10. Local/demo mode remains functional while shared abstractions are introduced.

Compatibility should be implemented with **new contracts + adapters/facades**, not simultaneous rewrite of all callers.

---

# 6. First extraction candidates — G1

G1 should deliberately choose low-risk capabilities already proven by both Family needs and the minimal Alumni skeleton.

## Candidate A — Vertical registry and runtime descriptor — EXTRACT FIRST

Create a small typed registry such as:

```text
core/verticals
  NetworkVerticalKind = family | alumni | ...
  VerticalDescriptor
  registerVertical(...)
```

The descriptor should contain only runtime composition facts:
- stable vertical id;
- display name/icon/theme hook;
- enabled capability ids;
- route/navigation factory;
- vertical-specific feature catalog provider;
- optional domain adapter handles.

It must **not** contain arbitrary schema definitions or encode business workflows as JSON metadata.

Family registers existing behavior. Alumni registers only its skeleton.

**Risk:** low.  
**Alumni value:** immediate.  
**Family regression surface:** composition/navigation only; protect with snapshots/source gates.

## Candidate B — Feature runtime separated from feature catalogs

Extract:
- launch state types;
- effective-feature evaluation;
- pilot targeting behavior;
- discovery/announcement mechanics.

Keep Family feature definitions in Family vertical catalog. Alumni gets its own catalog.

**Risk:** low–medium.  
**Alumni value:** high.  
**Do not rename existing Family feature keys.**

## Candidate C — Generic network context + membership types

Introduce generic TS contracts:
- `NetworkSummary`;
- `NetworkMembershipRole`;
- `ActiveNetworkContext`;
- `NetworkAccess`.

Keep `family_role` as compatibility alias temporarily.

**Risk:** low.  
**Alumni value:** high.

## Candidate D — Split transport by capability without changing RPCs

Physically split `lib/remote.ts` behind a compatibility barrel:

```text
capabilities/network-context/remote.ts
capabilities/launch-runtime/remote.ts
capabilities/identity-claiming/remote.ts
verticals/family/remote.ts
```

Existing `lib/remote.ts` re-exports during migration so no big-bang caller change is required.

**Risk:** low if exports are preserved.  
**Alumni value:** architectural dependency enforcement.

## Candidate E — Claiming interface, Family adapter first

Define a generic claim contract around:
- claimable identity summary;
- claim policy;
- claim operation;
- claim result.

Family adapter continues resolving Family profile. Alumni adapter later resolves Alumni profile.

Do **not** change the `network_memberships.member_id -> family_members` database reference in the same G1 patch. First prove the TypeScript/API seam; database identity generalization can follow additively.

**Risk:** medium.  
**Alumni value:** essential.

### Explicitly NOT G1

Do not extract S3-A1 staging/matching, kinship graph, relationship intelligence, memories, community trust graph, or generic entity storage in the first extraction patch. Those have larger semantic/regression surfaces and should be driven by Alumni evidence in G2/G3.

---

# 7. Vertical registry / module loading approach

Use **typed composition, not metadata programming**.

Recommended shape:

```text
core/
  network/
  auth/
  runtime/
  registry/

capabilities/
  identity/
  invitations/
  claiming/
  construction/        # G2
  graph/               # G3
  guide/
  playground/
  launch-control/

domain-layers/
  kinship/
  institutional/

verticals/
  family/
    definition.ts
    features.ts
    routes.ts
    adapters/
  alumni/
    definition.ts
    features.ts
    routes.ts
    adapters/

app-shell/
```

A `VerticalDefinition` can choose capabilities and provide typed adapters, but capability implementation owns its own contract. Example: Claiming asks an `IdentityClaimAdapter` to find/claim a vertical profile; it does not inspect arbitrary vertical metadata.

### What belongs in config

Good configuration:
- labels;
- feature defaults;
- icon/theme tokens;
- enabled capabilities;
- navigation ordering;
- simple policy thresholds.

Bad configuration:
- relationship meaning;
- identity matching rules;
- authorization rules;
- conflict resolution semantics;
- database schema definitions;
- arbitrary workflow state machines.

Those remain typed code/domain policy.

---

# 8. Database migration strategy

## Phase 1 — no destructive schema generalization

G1 should preserve existing Family tables. Add only the smallest fields/tables needed for vertical identity and Alumni skeleton.

Recommended additive evolution:

1. add `vertical_kind` (or equivalent) to `networks`, default/backfill `family`;
2. validate allowed values through a conservative check/lookup strategy that can evolve;
3. keep all existing Family rows and RLS intact;
4. add Alumni-specific tables separately (`alumni_profiles`, institution/program/cohort structures) rather than forcing them into `family_members`;
5. introduce a neutral claim binding only when needed, e.g. a network-scoped profile/subject binding table, while continuing to populate/read `network_memberships.member_id` for Family compatibility;
6. expose new neutral RPCs alongside old Family RPCs; old RPCs delegate where safe;
7. remove compatibility paths only in a later migration after usage/tests prove they are no longer needed.

## Why not create one `entities` table now

A universal entity table is tempting but premature. Family people, Alumni people/institutions/programs and future Enterprise projects/skills have different lifecycle and integrity rules. G0 does not have enough second-consumer evidence to justify that migration.

## RLS implications

Every new shared table must be network-scoped unless it is intentionally global. Required properties:
- `network_id` present on tenant data;
- restrictive policies tied to active network or explicit authorized network;
- no use of client-supplied network id as authority without membership check;
- public/token flows expose purpose-built RPC projections, never tenant tables;
- vertical adapter RPCs must not bypass core network authorization;
- cross-network discovery/trust requires explicit opt-in edges and purpose-specific projections;
- service-role-only operations remain isolated from browser clients.

---

# 9. Incremental file movement rules

1. **No move + behavior rewrite in the same commit** unless trivial.
2. Extract pure types/evaluators first; add compatibility re-exports.
3. Move one capability cluster at a time.
4. Preserve public import paths until all callers migrate.
5. Add architecture dependency checks before broad physical movement.
6. Family source gate must pass after every extraction step.
7. New Alumni code may import shared/core and Institutional layer; Family code may import shared/core and Kinship layer.
8. Core/shared imports from `verticals/*` fail CI/source gate.
9. Do not use barrel exports that recreate circular dependencies.
10. Database object renames are avoided; additive neutral APIs wrap old objects first.

---

# 10. Regression gates for G1+

Minimum automated checks before an extraction is considered source-complete:

### Architecture gates
- forbidden dependency direction scan;
- no Family import from Alumni and no Alumni import from Family;
- vertical registration uniqueness;
- feature key uniqueness per vertical/runtime scope;
- compatibility export checks for moved APIs.

### Family regression gates
Continue all current source gates, especially:
- S1 hardening;
- S2-A/B/C/D/E + closure;
- S3-A1.

Add targeted smoke checks for:
- active Family selection;
- create/join/invite/claim;
- Family admin role resolution;
- feature visibility/Launch Control;
- Playground no-save boundaries;
- S3-A1 availability and token routes.

### Build/runtime gates
- dependency-complete `npm run build`;
- fresh migration + upgrade migration paths;
- RLS tenant isolation;
- existing Family URL/link compatibility;
- 360/390/430 mobile checks for touched Family surfaces.

A passing architecture/source gate never upgrades LIVE VERIFY to VERIFIED.

---

# 11. Alumni MVP as the second consumer

Alumni exists first to validate the abstraction, not to maximize feature count.

## Domain model

Minimum explicit Institutional Membership concepts:
- Institution
- Department / Program
- Batch / Graduation year / cohort
- Person profile with role: alumnus | faculty
- employment/company/role context
- mentorship interest / offering
- groups/events

## MVP journeys

1. **Create/enter Alumni network** tied to an institution.
2. **Find my pre-created profile and claim it** safely.
3. **Search alumni/faculty** by name, department/program, batch/year, company/role and mentorship interest.
4. **See connection context/path** without pretending Alumni relationships are parent/child/spouse.
5. **Request/offer mentorship introduction** with consent.
6. **Join groups/events**.
7. **Distributed batch intake:** batch/department representative submits known cohort data through the shared construction pipeline once G2 exists.

## Alumni V1 exclusions

- student information system / university ERP;
- fees/donations/fundraising suite;
- admissions;
- academic transcript management;
- broad job marketplace;
- arbitrary social feed;
- forced genealogy-style tree visualization.

---

# 12. Reuse forecast by capability

No forced platform-wide percentage is accepted. Reuse is measured on **applicable runtime capability**, not total source lines.

| Capability | Family | Alumni | Directional reuse expectation |
|---|---:|---:|---:|
| tenant/network context | yes | yes | 90–100% |
| membership/roles | yes | yes | 80–95% |
| platform rollout/Launch Control | yes | yes | 85–95% |
| Guide/Playground/What's New framework | yes | yes | 75–90% framework; content separate |
| invitation lifecycle | yes | yes | 70–90% |
| identity claiming lifecycle | yes | yes | 60–80%; adapters differ |
| profile privacy primitives | yes | yes | 60–80% |
| distributed construction pipeline | yes | yes | 60–80% after G2; input/domain adapters differ |
| deterministic identity resolution | yes | yes | 50–75% after real Alumni evidence |
| graph traversal | yes | yes | 60–85% algorithmically |
| relationship explanation | yes | yes | 10–30%; domain semantics differ |
| groups/events | yes | yes | 60–80% |
| notification/digest runtime | yes | yes | 60–80%; content selection differs |
| memories / family history | yes | limited | low / not a target |
| kinship tree/generation rules | yes | no | 0% by design |
| alumni cohort/program model | no | yes | 0% by design |

**Directional conclusion:** a ~60%+ reusable runtime for the Alumni MVP is credible **without** pretending the Family domain itself is generic. The likely reuse is concentrated in tenancy, membership, rollout, identity lifecycle, construction workflow, discovery/runtime frameworks and graph algorithms.

---

# 13. S3-A2 classification before implementation

S3-A2 must be decomposed before code is written.

| S3-A2 need | Classification | Implementation direction |
|---|---|---|
| detect that current network is already populated | SHARED CAPABILITY | generic network activation state/summary |
| "Your family is ready" presentation | FAMILY-SPECIFIC | Family onboarding copy/UX |
| find pre-created identity | SHARED CAPABILITY | identity discovery contract + Family adapter |
| safe profile claim | SHARED CAPABILITY | generic claim lifecycle + Family policy adapter |
| immediate relationship/lineage value | KINSHIP DOMAIN + FAMILY UX | graph traversal primitive may be shared; explanation is kinship |
| "Complete my branch" prefill | KINSHIP/FAMILY adapter over contribution capability | do not make branch a universal concept |
| lightweight correction/contribution | SHARED GOVERNED CONTRIBUTION + FAMILY fields | generic request lifecycle, vertical patch policy |
| activation instrumentation | CORE/SHARED product analytics | event vocabulary includes vertical/context |
| rollout/Guide/Playground/What's New | SHARED frameworks + FAMILY catalog/content | existing lifecycle retained |

### S3-A2 build rule

S3-A2 may proceed after G0 using these boundaries **without waiting for full G1 physical extraction**. Where a reusable seam is obvious and low-risk (e.g. claim contract or activation event naming), implement through the seam. Where semantics are not yet proven, keep Family code explicit and mark the later extraction candidate.

This prevents architecture work from delaying the Family activation experiment while still avoiding new unnecessary Family lock-in.

---

# 14. G0 decisions on existing "generic hierarchy" artifacts

## `lib/network.ts` / `NETWORK_TEMPLATES`

Keep Family template for compatibility. Treat `org`, `alumni`, `academic`, `corporate`, `skills` as **legacy vocabulary experiments, not validated vertical architecture**. Do not build G1/G4 by selecting one and relabeling Parent/Child/Spouse.

During G1, either:
- mark non-Family legacy templates as deprecated/experimental in the UI/runtime; or
- isolate them behind a legacy local-demo path until explicit vertical definitions replace them.

Do not delete them in G0.

## `NetworkRepository`

Do not rename it to `FamilyRepository`. Instead shrink it over time:
- core network repository contracts move to core;
- Family domain repository becomes explicit;
- capability repositories own their APIs;
- compatibility facade keeps existing callers working during migration.

## `NetworkApp`

Do not split this giant orchestration component as the first G1 task. First introduce vertical registration/composition and capability contracts. Then extract shell orchestration in small steps with Family regression gates.

---

# 15. G1 implementation sequence approved by G0

Recommended next implementation sequence:

**G1.1 — Architecture guardrails + typed vertical registry**
- vertical kind on runtime model;
- Family registration reproducing existing behavior;
- Alumni registration skeleton only;
- dependency source gate.

**G1.2 — Feature runtime/catalog split**
- generic launch evaluator/runtime;
- Family feature catalog moved behind Family definition;
- minimal Alumni feature catalog;
- compatibility exports preserved.

**G1.3 — Network context/membership contracts**
- neutral TS types and adapters;
- preserve `family_role` compatibility.

**G1.4 — Remote capability split behind barrel facade**
- zero RPC rename in this step;
- move only core/runtime calls first.

**Historical planned G1.5 — Claiming seam + Alumni identity skeleton (absorbed into consolidated G2)**
- shared claim contract;
- Family adapter delegates to current behavior;
- Alumni adapter/types without overbuilding Alumni UI.

Then reassess. Do not automatically continue to G2 until Family regressions pass and Alumni skeleton demonstrates which construction primitives are genuinely common.

---

# 16. G0 closure checklist

- **CLASSIFY:** PASS — current source/schema/RPCs classified by layer.
- **IMPLEMENT:** N/A for runtime — G0 is architecture blueprint; documentation/guardrails plan only.
- **VALIDATE:** PASS at architecture review level; no runtime behavior changed.
- **GUIDE:** N/A — no user-facing capability added.
- **PLAYGROUND:** N/A — no user-facing capability added.
- **LAUNCH CONTROL:** N/A — no user-facing capability added.
- **WHAT'S NEW:** N/A — architecture-only mission, intentionally not announced to family users.
- **ROADMAP/STATUS:** UPDATED.
- **CLOSE:** G0 architecture mission complete; G1.1 is the next code implementation mission.

## Where to see this in the product

Nowhere by design. G0 is a non-user-facing architecture classification mission. Family UI remains unchanged. Its value is visible in safer future implementation boundaries and the ability to add Alumni without corrupting Family semantics.

---

# 17. Binding architectural principles after G0

1. Stable Family Rule.
2. Lowest Common Capability Principle.
3. Second-Consumer Rule.
4. Dependency Direction: Vertical → Intermediate Domain → Shared Capability → Core.
5. Strong primitives, explicit verticals.
6. Compatibility-first migration.
7. No generic percentage gaming.
8. No universal relationship enum built from Family semantics.
9. No universal entity schema until multiple verticals prove it.
10. Every new mission starts with CLASSIFY before IMPLEMENT.

## Implementation checkpoint — G1.2 / 2026-08-25

The G0 classification of `lib/features.ts` as **CORE runtime + Family catalog** has now been physically separated. Generic contracts/evaluation live in `core/features/`; Family declarations live in `verticals/family/features/`; app-shell composes the catalog into the Family vertical; `lib/features.ts` is now only a compatibility facade. Alumni supplies a separate hidden skeleton catalog, proving the abstraction without relabeling Family semantics.

## G1 implementation checkpoint — through G1.4

As of 2026-08-25:
- G1.1 typed vertical registry: COMPLETE;
- G1.2 feature runtime / vertical catalog split: COMPLETE;
- G1.3 neutral network & membership contracts: COMPLETE;
- G1.4 remote capability split behind compatibility facade: COMPLETE;
- G1.5 claiming seam + Alumni identity skeleton: SUPERSEDED / DELIVERED INSIDE CONSOLIDATED G2.

G1.3 confirms the original G0 classification: user↔network membership is Core, while `network_memberships.member_id -> family_members` is a Family compatibility link that must remain outside the neutral contract until a safe additive persistence evolution is justified. G1.4 confirms the transport strategy: move proven shared implementation downward into capability modules while preserving stable Family-facing compatibility exports and unchanged backend RPC names.


## G2 implementation outcome — 2026-08-25

The G0 classification of identity claiming, invitations and governed participation as shared-capability candidates is now physically implemented. Neutral contracts live under `core/identity` and `core/participation`; adapter-independent runtimes live under `capabilities/identity-claiming` and `capabilities/participation`; Family delegates to its existing verified-email/invitation/contribution RPCs through explicit adapters; Alumni supplies institutional identity/participation skeletons without using `family_members`.

The previously planned fine-grained G1.5 claiming seam was intentionally absorbed into consolidated G2. S3-A1 construction extraction moves to G3 so the next architecture batch can address intake/staging/matching/conflict/provenance/commit as one coherent capability boundary.


## G3 implementation outcome — 2026-08-25

The G0 classification of S3-A1 as **architecturally shared, physically Family-specific** has now been executed safely. Shared construction contracts/runtime cover source/session/access, staged entity/edge envelopes, candidate/decision/conflict/provenance, validation and commit mechanics. The current Family implementation remains authoritative behind an adapter using the unchanged migration 043 RPC/table/security model.

Kinship scoring context, parent/child/spouse, generation ordering and lineage/cycle integrity remain outside Core. Alumni contributes institutional/batch/program construction semantics only as a skeleton and uses no Family persistence. This confirms the G0 capability-tree rule: share workflow at the lowest proven layer; keep domain truth explicit.

G4 should now focus on app-shell/vertical composition, not reopen the construction schema or rename deployed Family RPCs.

## G4 execution note — vertical app composition is now explicit

G4 turns the earlier typed-vertical idea into a user-surface composition boundary. Navigation, Guide routing, Playground registration, Launch Control bundle metadata and What's New routing are now vertical-owned metadata validated by the app-shell. Family remains the only active renderer; Alumni is fail-closed until G5 supplies real Alumni surfaces. The older `VerticalDefinition.navigation` field was removed so app navigation has one owner rather than two competing registries.

## G5 validation of the blueprint
G5 supplies the second real semantic consumer. The architecture is no longer inferred only from Family: Alumni uses institutional identity/cohorts and separate persistence while sharing neutral tenancy, identity claiming, participation, construction orchestration and vertical runtime composition. This validates the capability-tree direction and moves remaining accidental coupling work into G6 hardening.

## G6 proof update — 2026-08-25

The G0 capability-tree hypothesis is now exercised by two active verticals rather than one active product plus skeletons.

- Family and Alumni share Core membership/context, feature/runtime contracts, identity/participation/construction lifecycle seams and selected UX primitives.
- Family retains kinship graph semantics, memories/history and Family-specific workflows.
- Alumni retains institutional identity, cohorts/directory/career discovery and Alumni-specific persistence/connections.
- Shared UI is now evidence-based: topbar/network switching/metrics/sections/empty states are reusable; domain page composition is not collapsed.
- Platform rollout must be vertical-scoped; bundle names are vertical-local.
- Cross-vertical switching must resolve vertical ownership before any vertical-specific feature/runtime/data hydration.

This is the strongest proof so far that the intended architecture is a tree of reusable capabilities rather than one generic base module or a renamed Family application.

# G7 architecture evolution — Generic Network OS

G0's capability-tree direction is now executable through G7.

New reusable layers:
- generic entity registry;
- configurable dimensions and values;
- network-scoped entity affiliations;
- multiple hierarchy projection definitions over one dataset;
- reusable Network Projection Explorer;
- shared activity/group foundation for events, RSVP, memories, milestones, announcements and chapters/groups;
- first-class vertical template contracts and future template definitions.

The G0 boundary remains binding: Family kinship (parent/child/spouse/lineage/generation) is not rewritten as generic affiliation. Alumni institutional identity remains Alumni-owned. Generic Network OS storage is additive and receives vertical-owned projections/adapted data rather than replacing every canonical domain table.

Future templates (Organization, Business Trust, Franchise, Education, Professional, Association, Residential, Supply Chain, Investor, Customer Intelligence, Custom) are fail-closed definitions until a real product mission activates their runtime/persistence.
