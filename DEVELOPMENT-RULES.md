# Development Rules

## Model and Effort Selection

Follow `MODEL-SELECTION-RULE.md` at the start of every major mission. Always recommend the best currently available model and reasoning effort; switch automatically only when the environment supports and authorizes it, otherwise tell the user the exact manual choice. Do not use a low-effort run silently for security, migrations, architecture or major UX work.

## Family UX Acceptance

Usability and emotional quality are release criteria, not optional polish. For user-facing family work, validate the rendered desktop and mobile journeys with realistic data. Compilation alone is insufficient. Prefer plain family language, progressive disclosure, large tap targets, obvious primary actions, dignified warmth, accessible contrast and privacy explanations that non-technical relatives can understand.

Every user-facing deliverable must state: the changed journey and screens; the
newly possible user outcome; phone behaviour; translated behaviour; loading,
empty, error and success states; accessibility/performance acceptance; privacy
impact in plain language; and rendered evidence or an explicit unverified item.
Do not mark a visual mission complete from compilation alone.

## Family Visual System

- Use the shared ivory/forest/gold design tokens; do not introduce isolated page themes.
- Prefer people, photographs, relationships and memories over dashboards and statistics.
- Keep layouts aligned, spacious and calm with one obvious primary action.
- Design at 390px first, then tablet and desktop. No horizontal overflow.
- Hindi/Marathi text expansion and Devanagari typography are acceptance cases.
- Motion must be restrained, fast and safe for `prefers-reduced-motion`.

## Family Excel Rule

The official workbook and importer are one product journey. Use harmless human
IDs such as P001, separate people from relationships, include instructions and
a realistic example, preview before write, explain issues in family language and
never silently invent an uncertain relationship. Do not expose UUIDs, raw SQL or
database error text to the user.

## Source of Truth

1.  Latest user-provided source ZIP/repository is authoritative.
2.  Actual code and migrations override planning documents.
3.  `CODEBASE.md` is a navigation/index document, not proof that a
    feature works.
4.  Never trust a migration because an implementation note says it ran;
    inspect dependencies and schema.

## Session Start

1.  Read `CODEBASE.md`.
2.  Read `PROJECT-VISION.md`, `FOUNDER-COMPASS.md`, `ROADMAP.md`,
    `MISSION-STATUS.md`.
3.  Read the active mission and relevant source/migrations.
4.  Verify claims against code.
5.  Continue the active mission unless priority changes.

## Implementation

-   Work mission-by-mission, end-to-end.
-   Do not silently expand scope.
-   Fix production/security/data-integrity blockers before feature
    expansion.
-   Preserve local/demo and Supabase modes unless intentionally retired.
-   Every introduced feature must be mobile-usable.
-   Prefer additive/backwards-compatible migrations.
-   Never add speculative columns just to satisfy code.
-   When a PostgreSQL function return signature changes, explicitly drop
    the exact prior signature.
-   Privacy is enforced by RLS/secure RPC/access boundary, not React
    hiding.
-   `SECURITY DEFINER` functions require safe `search_path` and explicit
    authorization.
-   Never expose service-role secrets to browser code.
-   Validate ownership/visibility server-side; assume client IDs are
    manipulable.
-   Media visibility must be enforced at the access boundary.

## Generic Platform Rule

Classify new capabilities: - **CORE** --- domain-independent
relationship capability. - **MODULE** --- vertical/domain semantics. -
**CONFIG** --- labels/presentation/settings. - **PRODUCT** ---
workflow/experience for a customer.

Do not put domain semantics into CORE merely because labels can be
renamed.

## Quality Gate

Before a mission is complete: - build/typecheck/lint/tests available in
repo; - migration clean-chain/upgrade verification as applicable; -
RLS/security cases for changed data; - local/demo regression if
touched; - mobile usability; - documentation update; - explicit list of
anything unverified.

## Context/Token Discipline

Prioritize implementation and verification over repeated long planning.
Do not regenerate exhaustive audits unless architecture/security
materially changes. Keep session-resume context in maintained Markdown
files rather than conversational history.

## Hard rule — no silent feature regression

Every accepted release is cumulative unless a feature removal or replacement is explicitly approved.
Before delivery, compare the candidate against the previous accepted release(s) and treat unexplained deletion of UI, routes, components, exports, types, repository functions, RPCs, migrations, workflows, navigation, or user journeys as a release blocker.

Required release validation:
1. Run a source-tree deletion/diff audit against the previous accepted baseline.
2. Classify every deletion as intentional replacement, verified dead code, or regression.
3. Restore all regressions before release.
4. Run TypeScript/production build validation to catch missing exports and stale consumers.
5. Validate all previously delivered feature journeys, not only the current mission.
6. Never mark a release complete when a previous feature is merely hidden from navigation but still expected by the product baseline.

## Hard rule — behaviour QA for user-facing journeys

A user-facing mission is not complete because its component, RPC or source gate exists.
For every onboarding/navigation/profile/import/share flow changed by a mission:

1. Define the journey from a clean user state (anonymous, fresh signup, member, family owner/admin, returning user as applicable).
2. Verify the user's next visible action after every successful write; never assume hidden session/auth context refreshed correctly.
3. A successful primary write must not be presented as a failed journey because optional hydration, telemetry, analytics or secondary UI work failed afterward.
4. Test both first use and return use (logout/login or reload) when persistence is part of the feature.
5. Test the narrow mobile path for any flow intended for relatives.
6. Record what was source-checked versus actually exercised against deployed Supabase/Vercel.
7. Status remains **IMPLEMENTED / BEHAVIOUR VERIFY** until the critical journey passes in the real runtime.

This rule is especially binding for Alpha onboarding: anonymous Playground, fresh creator, Excel/CSV creator, invited/code joiner and returning Owner.

## Strategic outcome rule — 2026-08-23

For major product work, classify the mission before implementation:

- **S1:** reduces time-to-value or increases first-session emotional/product magic;
- **S2:** increases return, contribution, sharing or organic family growth;
- **S3:** increases trust, repeatability, defensibility, measurable business proof or willingness to pay.

If a proposed item supports none of S1/S2/S3 and is not a release/security blocker, defer it.

Each major mission must state both:
1. the user behavior expected to change; and
2. the metric/evidence that would prove the change occurred.

Do not substitute source-complete status for behavioral evidence.

## S1 first-session relationship rule — 2026-08-23

For family-facing first-session work:
- default to **You / My Family Line / human relationship words** before graph, generation or hierarchy terminology;
- anonymous demo identity must be explicitly temporary, read-only and non-persistent;
- every personal-family view must have an obvious reversible path to Full Family and back;
- imported `parent`/`child` vocabulary must be normalized before rendering human labels;
- members may report structure/profile corrections, but reporting must route through governed change requests rather than silently granting structure mutation;
- a sample/download CTA is not implemented unless the referenced public artifact actually ships;
- source gates remain regression checks only; S1 status cannot advance to complete without persona behaviour QA on deployed runtime and supported mobile widths.

## S1 behaviour and demo-data rules — 2026-08-23

- Security hardening must not be bypassed to fix UX. If a direct table grant was intentionally revoked, add/use a narrowly scoped RPC instead of reopening broad writes.
- Family Owner/Admin checks must use family-scoped membership semantics; do not assume legacy/global `profiles.role` is sufficient.
- Friendly/demo/import IDs must never reach UUID-only Supabase writes. Normalize/remap before persistence, including linked relationships/events/memories.
- Playground data must be read-only and must never silently fetch/write the signed-in user's live active family merely because Supabase is configured.
- Demo quality is measured by capability density and emotional/product coverage, not maximum member count.
- A workbook feature is not complete if users must remember valid categorical vocabulary. Prefer spreadsheet dropdowns for relationship, gender, generation and living status.
- Fresh family creation must always provide an obvious next smallest action: Add Myself, add close family, import, or defer safely.
- S1 source gates are necessary but never sufficient for S1 completion; deployed persona behaviour remains binding.

## S1 family escape-path rule
Authentication and family membership must never trap a user inside one family. Sign out, family selection, create/join-another and safe recovery paths are baseline navigation and MUST NOT be hidden by Simple/Connected/Explorer experience settings. A sole Owner must not be allowed to orphan a populated family; use a non-destructive Family Lobby/switch path instead.

## Playground rollout rule
Playground feature visibility is controlled independently from real-family platform rollout. The Playground should demonstrate released product potential without forcing the same exposure onto Alpha families. Anonymous Playground remains read-only and must never persist demo IDs/data.

## S1 modal + privacy-preview interaction rules (2026-08-23)

- Ordinary modal popups must dismiss when the user activates the backdrop; interaction inside the modal must never trigger backdrop dismissal.
- Blocking authentication/password-recovery surfaces are exempt when dismissing them would leave no meaningful usable state.
- Never label a narrow privacy preview as a whole-app role simulation. UI labels must describe the actual scope.
- Admin privacy-preview controls must reduce rendered information to the simulated audience even though the operator's real account has broader privileges.
- User-verified visual fixes become part of the cumulative baseline and must not be silently reverted by later missions.

## S2 living-loop rules — added 2026-08-23

- Retention features must stay family-contextual and calm; do not introduce infinite-feed mechanics.
- Family Pulse is capped at 1–3 prioritized items per visit.
- Engagement telemetry must be tenant-scoped, privacy-minimal and aggregate-oriented for admins.
- Demo/Playground interaction may simulate writes locally but must never persist into a real family.
- S2 completion requires pilot behavior evidence; source gates can only mark implementation, never retention success.

## Cross-family/community data rule
Community membership never grants direct access to another family's tables. Cross-family discovery must use explicit opt-in snapshots/RPCs. Sensitive categories (especially marriage) require person-level consent. Do not infer family relationship from surname, caste/community, city or similarity. Community publishing must always identify its scope (chapter/city/umbrella) and offer a recovery/unpublish path.

## Cross-family trust / introduction rules
- Cross-family connection edges must be explicit and accepted by both families before they can power paths.
- Family trust-edge creation/revocation is Family Owner/admin governed; normal members cannot alter family-level trust.
- Same surname, community, geography or inferred similarity must never create a connection path.
- Person-level connector wording requires explicit opt-in from the named bridge person; until then show family-level paths only.
- Introduction requests may reference only opt-in community profile cards and must not reveal private phone/email/tree data.
- Preserve a path snapshot for explainability/audit, but do not treat old snapshots as proof that a currently revoked path still exists.

## Quiet return-loop rule (S2-D)
- Do not create high-frequency notification pressure merely to increase sessions.
- Digest generation must stay active-family scoped and preference-aware.
- Shared digest content must be an explicit safe summary; never serialize private profile/contact/tree data into share text.
- Playground/demos must never write digest engagement into a signed-in user's real family.
- External email/push providers are replaceable delivery infrastructure, not product architecture; preserve one canonical digest/preference model.
