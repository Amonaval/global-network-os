# New Session Prompt — Implement S2-E Guided Family Experience & Living Help System

I am attaching the **fresh latest cumulative ZIP of the entire Family Network App**.

## CANONICAL BASELINE RULE

The attached full ZIP is the **only canonical baseline**. It already contains all accepted work through S2-D plus my manual verified fixes. Do NOT restart from an older Family Release, P5, S1 or earlier S2 patch. Do NOT reconstruct from old affected-file ZIPs unless I explicitly ask you to compare something.

Preserve all existing functionality, migrations, docs, roadmap history and manual UI fixes.

## PRODUCT NORTH STAR

> Make people fall in love with seeing their own family, give them reasons to keep enriching it, and prove that the resulting trusted relationship network compounds into a defensible business.

Core rules:
- First 60 seconds earn the next 60 days.
- Powerful underneath. Effortless on the surface.
- A feature users cannot discover, understand, complete or recover from is not implemented.
- Every screen should create understanding, emotion, contribution, trust or progress.
- Family-first vertical strength now; generic extensibility underneath.
- Mobile-first, novice/50+/low-frequency friendly.
- Preserve old roadmap ideas/history; defer rather than delete.
- Behavior QA matters more than source assertions.
- Do not falsely mark partial work complete.
- Final implementation ZIP must contain only affected/new files preserving original folder hierarchy.

## CURRENT STRATEGIC STATE

S1 is substantially verified with residual QA retained.

Implemented / LIVE VERIFY S2 work includes:
- S2-A Living Family Loop — Family Pulse, memory reactions, engagement/return metrics.
- S2-B Community Umbrella & Opt-in Discovery.
- S2-C Trusted Introductions & Connection Paths.
- S2-D Quiet Family Digest + Return Engine.

Do not discard residual S1/S2 behavior testing.

## NOW IMPLEMENT — S2-E GUIDED FAMILY EXPERIENCE & LIVING HELP SYSTEM

This is a major product mission, not a static documentation task.

Read and follow these planning docs in the attached ZIP before implementation:
- `S2-E-GUIDED-FAMILY-EXPERIENCE-LIVING-HELP-SYSTEM.md`
- `S2-E-COMPLETE-GUIDE-CONTENT-MAP.md`
- `ROADMAP.md`
- `MISSION-STATUS.md`
- `FOUNDER-COMPASS.md`
- `DEVELOPMENT-RULES.md`
- `STRATEGIC-NEXT-3-MILESTONES.md`
- `CODEBASE.md`
- `VALIDATION.md`

### S2-E mission intent

Turn the product into a self-explanatory, inspiring experience. Users should understand not only how each feature works, but why it matters and multiple ways their own family can use it.

The guide must make users think things like:
- I can preserve grandparents' stories here.
- My children can understand their family through this.
- I can find relatives in another city.
- We can organize and remember reunions.
- We can preserve old photos/history.
- We can discover trusted professionals/mentors/community members.
- We can use opt-in community/marriage discovery safely.
- There are capabilities I did not realize were possible.

## REQUIRED IMPLEMENTATION

### S2-E1 — Guide Foundation
1. Add a first-class top navigation destination named preferably **Explore & Guide** (not technical `Docs`). Make it mobile accessible too.
2. Build a central structured guide registry / one source of truth for guide content. Do NOT duplicate long help prose inside every component.
3. Build reusable contextual `FeatureGuide`-style collapsible help at the top of every meaningful live module/screen.
4. Each contextual guide should cover as applicable:
   - what this section is;
   - why it matters;
   - how to use it;
   - examples/use cases;
   - ideas to try;
   - who can do what;
   - privacy;
   - FAQ;
   - recovery/troubleshooting;
   - related features;
   - Open Feature / Try Now;
   - contextual feedback.
5. Make guide visibility role-aware and feature-aware. Do not show ordinary members Platform Owner/Admin instructions as if they can perform them.
6. Add deterministic fast guide search. No LLM dependency is needed initially.
7. Add `Open this feature` / contextual navigation from guide entries.
8. Add safe `Try in Playground` actions where useful. Playground must remain no-save.
9. Mobile-first at 360/390/430.

### S2-E2 — Complete Interactive Product Guide
Implement all major sections defined in `S2-E-GUIDED-FAMILY-EXPERIENCE-LIVING-HELP-SYSTEM.md`, including:
- What is Family Network?
- purpose, benefits, value and living-network vs static-tree positioning;
- `Imagine your family using this` stories;
- at least 10 age/background personas with detailed use cases;
- top features grouped by user goal;
- complete module library;
- goal/use-case explorer (`What do you want to do?`);
- search;
- Ideas for Your Family / possibility inspiration;
- Privacy & Trust Center;
- Family Owner playbook;
- First 7 Steps activation journey;
- Things You May Not Know Family Network Can Do;
- What's New;
- curated user-facing future roadmap with `Being explored`, `Planned` only where real, and `Tell us what matters`.

Cover every live module/flow in `S2-E-COMPLETE-GUIDE-CONTENT-MAP.md`. Do not silently omit smaller flows such as Family Lobby, Leave Family, privacy preview, digest preferences, correction requests, community profile opt-in, trusted-family edges or introductions.

### S2-E3 — Feedback Intelligence
Implement structured contextual feedback, not just a mailto/text box.

Support feedback types such as:
- Something confusing
- Something missing
- Feature idea
- Improvement idea
- Problem / bug
- Something my family needs
- Other

Also support helpful/not-helpful where appropriate and future-roadmap interest signals such as `I'd use this`.

Persist through governed Supabase schema/RPC with appropriate privacy and direct-table restrictions. Capture safe context (module/guide/role/family/user reference/timestamp/version if available), but never automatically capture private profile/story data.

Add a Platform Owner feedback inbox/triage surface with statuses such as New, Reviewing, Planned, Already supported, Not planned and Implemented. Feedback status must not automatically alter roadmap files.

### IMPORTANT CONTENT/UX REQUIREMENTS
- Plain human language, not technical jargon.
- Summary first, details progressively expanded.
- Avoid giant walls of text.
- Use cards, accordions, meaningful icons, search, examples and linked actions.
- Contextual help should be collapsible and not obstruct core tasks.
- Guide state can remember seen/collapsed behavior when sensible.
- 50+ friendly readable design and large tap targets.
- Accurate privacy wording must match actual runtime behavior/RLS.
- Never describe a PARTIAL/future feature as LIVE.
- Curated future roadmap must not expose sensitive founder/technical plans or dates we cannot commit to.

## REQUIRED PRODUCT REVIEW

Critique and improve the implementation as:
- brand-new skeptical user;
- older/non-technical relative;
- Family Owner;
- normal member;
- product founder;
- UX/accessibility expert;
- QA engineer;
- security/privacy architect;
- potential investor/demo viewer.

Fix high-value low/medium-effort failures you discover rather than only documenting them.

## VALIDATION / EXIT GATE

Do NOT mark S2-E complete from compilation/source gates alone.

At minimum test/review:
1. anonymous Playground user;
2. fresh authenticated user without a family;
3. fresh family creator;
4. normal member;
5. Family Owner;
6. co-admin;
7. Platform Owner;
8. older/non-technical mobile user;
9. user with hidden/disabled features;
10. user searching by goal rather than module name.

Verify discoverability, comprehension, accurate role/feature filtering, navigation, collapse/expand behavior, feedback persistence/recovery, privacy, Playground no-save behavior, and 360/390/430 responsiveness.

Run cumulative existing S1/S2/CR/V1/D1 source gates plus production build/typecheck when dependencies are available. Fix build regressions discovered during implementation.

## DOC UPDATES REQUIRED

Update while preserving all historical content:
- `ROADMAP.md`
- `MISSION-STATUS.md`
- `FOUNDER-COMPASS.md` if needed
- `DEVELOPMENT-RULES.md`
- `STRATEGIC-NEXT-3-MILESTONES.md`
- `CODEBASE.md`
- `VALIDATION.md`
- S2-E mission docs
- other relevant guide/user docs when the implementation materially changes them.

Do not delete/de-prioritize old ideas merely because they are not in this batch. Preserve Family Play, contextual social-video memories, external digest delivery, named opt-in bridge contacts, family book/export, community moderation/reputation and S3 business-proof work in their appropriate future queues.

## DELIVERY

At completion:
1. Explain the implemented guide architecture and user experience.
2. Summarize guide coverage and important examples.
3. Clearly distinguish IMPLEMENTED vs PARTIAL vs LIVE VERIFY.
4. Report source/build/behavior validation honestly.
5. List actual remaining live behavior tests.
6. Provide **ONLY affected/new files ZIP**, preserving original folder hierarchy.

Spend tokens primarily on implementation and high-value review. Avoid repeated broad re-analysis once the architecture is clear.
