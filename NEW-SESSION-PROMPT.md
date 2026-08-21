# Resume Prompt — Family Release 1 Acceptance

I am continuing the attached latest source ZIP. Treat source and migrations as
authoritative. Read `CODEBASE.md`, `FAMILY-RELEASE-1.md`, `ROADMAP.md`,
`MISSION-STATUS.md`, `DEVELOPMENT-RULES.md`, `MODEL-SELECTION-RULE.md` and the
relevant source before acting.

## Immediate product priority

Ship an outstanding family product to real families quickly. It must be warm,
fast, mobile-first, multilingual and understandable without training. Family
users—not enterprise buyers or generic platform architecture—control the
immediate roadmap. Preserve technical/platform plans for later; do not implement
second verticals, multi-tenancy, billing or enterprise operations now.

Every family deliverable must be visible in the UI or directly required for
privacy, reliability, performance or safe release. People, photographs,
relationships and memories precede settings and statistics.

## Current baseline

- P3/P4 and P5.1 capabilities remain implemented.
- Migration chain is `001`–`015`.
- Family Release 1 source is implemented: warm ivory/forest/gold design system,
  mobile shell, English/Hindi/Marathi foundation, two-step family setup,
  generated multi-sheet family workbook, guided import/preview/validation,
  family home, simplified navigation, sign-in and profiles.
- Clean install, TypeScript, production build and 150-member demo integrity pass.
- No new database migration was required.
- New Release 1 visuals were not browser-rendered in the implementation workspace
  because the matching browser binary could not be installed. Do not inherit the
  earlier P5.1 screenshots as proof.

## Do now

Complete **Family Release 1 acceptance and deployment**:

1. Run the app and inspect setup, start choices, Excel assistant, home, tree,
   directory and profiles at phone, tablet and desktop sizes.
2. Verify English, Hindi and Marathi for overflow, clarity and Devanagari rendering.
3. Download/open the workbook; import its example, malformed cases and a copy of
   the real family sheet. Improve confusing guidance or errors.
4. Apply migrations `001`–`015` on clean staging and test existing-instance upgrade.
5. Run anon/member/admin/invited-user RLS, RPC, signed-media and usability cases.
6. Deploy, smoke-test and run an observation test with one older relative plus one
   non-technical family administrator.
7. Fix release blockers, update maintained Markdown files and return one verified ZIP.

Do not add Family Release 2 or platform features during this mission.

## Quality rules

- Mobile 390px is the primary visual surface; no horizontal overflow.
- One clear primary action; large tap targets and readable contrast.
- Plain family language; no entity, governance, UUID, RPC or hierarchy jargon.
- Excel uses P001-style non-sensitive IDs, separate people/relationships,
  preview-before-write and no invented uncertain relationships.
- Privacy is enforced by DB/RLS/RPC/storage boundary, never only by UI hiding.
- State exactly what was and was not verified.
- Follow `MODEL-SELECTION-RULE.md`. Recommended: GPT-5.6 Sol High for the
  acceptance/UX work and Extra High for RLS/privacy review.

After a successful pilot, the next product mission is Family Release 2 —
Remember, Connect and Celebrate. The technical platform roadmap remains deferred.
