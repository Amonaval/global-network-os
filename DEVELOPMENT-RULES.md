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
