# S2-E — Guided Family Experience & Living Help System

Status: **PLANNED — NEXT MAJOR MISSION**

## Why this mission exists

Family Network now has enough breadth that discoverability itself is a product problem. A feature that exists but users cannot discover, understand, complete, recover from, or imagine using is not fully implemented.

S2-E turns help/documentation into a first-class product surface. Its job is not merely to explain buttons. It must make a novice understand the app, see why it matters, discover the possibilities, safely learn what each module can do, and generate ideas for how their own family could use it.

### Mission statement

> The app should never require someone to understand Family Network before Family Network helps them understand what it can do.

### Help-system rule

> Every help surface must answer both **how do I use this?** and **why would I care?**

## Product outcomes

S2-E should improve:
- first-session comprehension;
- feature discoverability;
- activation and contribution;
- trust/privacy understanding;
- older/non-technical usability;
- Family Owner success;
- Playground/demo quality;
- product feedback quality;
- roadmap evidence;
- perceived product maturity for users, partners and investors.

## Three-layer architecture

### Layer 1 — Contextual Guide on every meaningful module

Every major user-facing screen gets a reusable collapsible guide near the top.

Recommended collapsed label:
- **What can I do here?**
- secondary option where appropriate: **About this section**

The guide should be expanded for a first-time visitor when that helps comprehension, then remember dismissal/seen state per user/device where practical. It must never block the core task.

Each contextual guide should cover, as applicable:
1. What this section is.
2. Why it is useful.
3. How to use it.
4. Common examples/use cases.
5. Ideas to try.
6. Who can do what.
7. Privacy/visibility notes.
8. Common questions.
9. Recovery/troubleshooting.
10. Related features.
11. **Open this feature / Try this now** action when useful.
12. **Suggest an improvement** contextual feedback entry.

### Layer 2 — Standalone `Explore & Guide` portal

Do not call the ordinary-user navigation item `Docs`; that sounds technical. Preferred user-facing name: **Explore & Guide**.

The portal must be a first-class navigation destination on desktop and mobile and should work for Playground users where safe.

#### Landing intent choices

At the top ask:
- **I'm new — show me what this can do**
- **I want to build my family**
- **I want to understand a feature**
- **I need help with something**

Then offer **Explore everything**.

#### Major portal sections

1. Start Here — What is Family Network?
2. Why use it / purpose / benefits / value.
3. Imagine your family using this.
4. Family Network for people like me — persona examples.
5. Top features organized by user goal.
6. Complete Module Library.
7. What do you want to do? — goal/use-case explorer.
8. Search the Guide.
9. Ideas for Your Family / Explore the possibilities.
10. Privacy & Trust Center.
11. Family Owner playbook.
12. First 7 Steps / activation journey.
13. Things you may not know Family Network can do.
14. What's New.
15. Curated Future / Coming Next.
16. Feedback / Ideas / Roadmap interest.

### Layer 3 — Feedback Intelligence

Help must become a structured product-learning loop rather than a dead documentation page.

Every module can expose **Have an idea for this section?** with types such as:
- Something confusing
- Something missing
- Feature idea
- Improvement idea
- Problem / bug
- Something my family needs
- Other

Capture only safe product context automatically:
- module / guide key;
- screen / feature key;
- family ID when applicable;
- user/member reference when authenticated;
- role/experience mode;
- app/version marker if available;
- timestamp.

Do not capture private profile/story content automatically.

Platform Owner should eventually be able to triage feedback with states:
- New
- Reviewing
- Planned
- Already supported
- Not planned
- Implemented

Future extension: aggregate repeated demand, e.g. `17 families requested Family Play`, without exposing private text broadly.

## Core information architecture

### 1. What is Family Network?

Suggested positioning:

> **Your family is more than a tree.** Family Network is a private living space where your family can understand how everyone is connected, preserve memories and history, celebrate important moments, find relatives, contribute missing information, and stay connected across generations.

Four simple pillars:
- **Know your family**
- **Remember your story**
- **Stay connected**
- **Build it together**

Benefits to explain:
- See where you belong.
- Preserve what can otherwise be lost.
- Help children know their family.
- Bring distant relatives closer.
- Celebrate together.
- Build the family record collaboratively.
- Discover trusted wider-community connections without exposing the private family graph.

### 2. Imagine your family using this

Use narrative examples that trigger ideas, not feature jargon. Examples:
- A grandmother tells a story about a grandfather; it is saved to his profile for future generations.
- A young adult moves to another city and discovers extended relatives nearby.
- Before a wedding, a newly married person learns how everyone is related.
- Someone finds an old photograph; relatives help identify the people and it becomes a permanent memory.
- A family reunion becomes a documented event with photos and stories afterward.
- A child explores great-grandparents and old hometowns.
- A professional finds a mentor or trusted service provider through the wider community.
- A family seeks a respectful marriage introduction through opt-in profiles and trusted-family paths.

### 3. Persona / age-group explorer

At minimum cover these 10 personas in detail:

1. **Child / teenager (8–14)** — learn grandparents/cousins, explore old photos, understand origins, future family quizzes.
2. **Young adult (18–25)** — find relatives in another city, discover mentors/professionals, digitize elders' stories.
3. **Newly married family member** — understand a large new family, learn names/branches/relationships/traditions.
4. **Parent with young children** — preserve stories, milestones and lineage for children.
5. **Working professional** — find family/community professionals, mentors and trusted introductions.
6. **Grandparent / 60+** — tell stories, identify old photos, correct family history, see descendants together.
7. **Family historian** — lineage, deceased relatives, places, chronology and archival memory.
8. **Family Owner / organizer** — invite, import, approve, govern, organize gatherings and improve completeness.
9. **Relative living abroad** — stay connected to family life and help children understand roots.
10. **Wider-community participant** — opt into professional/service/marriage discovery, needs and introductions.

Future persona additions may include family event organizer, student/mentor seeker, caregiver/elder-support coordinator, and community leader.

## Feature taxonomy

### Understand My Family
- Personal Family Line
- Full Family Tree
- Relationship-to-me labels
- Relationship Explorer
- Profiles
- Family Directory / Find Family

### Remember Our Story
- Memories
- Photos
- Family History
- Timeline
- Life Events
- Important Places

### Celebrate & Stay Connected
- Birthdays
- Anniversaries
- On This Day
- Gatherings
- Family Pulse
- Quiet Family Digest

### Build It Together
- Invitations
- Contributions
- Correction requests
- Missing-information prompts
- Add Myself / close relatives
- Guided Excel / CSV import

### Explore the Wider Community
- Community umbrella hierarchy
- Community profile discovery
- Marriage opt-in discovery
- Professional/services/mentor/speaker/education/social-service/business categories
- Community needs/posts
- Community Highlights
- Trusted Families
- Trusted connection paths
- Introduction requests

### Share Safely
- Public profile controls
- Privacy-safe sharing
- QR / print
- Memory sharing
- Digest sharing

### Manage the Family
- Family Admin Center
- Family switching / Family Lobby
- Create / Join another family
- Leave Family
- Permissions
- Profile-submission approvals
- Privacy Preview
- Feature visibility / experience controls

### Platform Owner-only
- Launch Control
- family rollout/approval
- Playground feature visibility
- product feedback triage
- deployment/admin surfaces that ordinary users should never see in their guide.

## Complete Module Library inventory

The central guide registry must cover at least these modules/flows. Combine closely related items into one guide where that improves usability, but do not omit their behavior.

1. Home
2. Family Pulse
3. Quiet Family Digest
4. Personal Family Line
5. Full Family Tree
6. Relationship-to-me
7. Relationship Explorer
8. Profiles
9. Directory / Find Family
10. Memories
11. Memory reactions
12. Family History
13. Timeline
14. Life Events
15. Special Days
16. Family Places / Map
17. Gatherings
18. Contribution Center
19. Invitations
20. Corrections / governance
21. Add Myself
22. Add Father/Mother/Husband/Wife/Son/Daughter
23. Guided Excel import
24. CSV import
25. Import preview/recovery
26. Sharing
27. Public profiles / privacy controls
28. QR / print
29. Community Network
30. Community profile publishing
31. Community needs/posts
32. Community Highlights
33. Trusted Families
34. Trusted connection paths
35. Introduction requests
36. Family Switcher
37. Create another family
38. Join another family
39. Family Lobby
40. Leave Family
41. Family Admin Center
42. Profile Privacy Preview
43. Feature visibility / experience levels
44. Launch Control — Platform Owner only
45. Playground and how it differs from a real family

## Standard guide schema

Implement one structured content source, e.g. `lib/user-guide-content.ts` or equivalent, rather than duplicating prose inside components.

Suggested model:

```ts
{
  id: "family-tree",
  title: "Your Family",
  summary: "...",
  whyItMatters: ["..."],
  howToReach: ["..."],
  howTo: ["..."],
  useCases: ["..."],
  ideas: ["..."],
  permissions: ["..."],
  privacy: ["..."],
  faq: [{ question: "...", answer: "..." }],
  troubleshooting: ["..."],
  relatedGuideIds: ["relationship-explorer"],
  featureKey: "core.family",
  roles: ["member", "family_admin", "family_owner"],
  availability: "live",
  introducedIn: "...",
  updatedIn: "..."
}
```

The exact types can be improved, but one source of truth must power:
- contextual guides;
- standalone Guide Portal;
- Guide search;
- related-feature links;
- future AI help/RAG;
- Playground examples.

## Goal / use-case explorer

Users think in outcomes, not internal module names. Include deterministic mappings such as:

- **How is this person related to me?** → Personal Lineage / Relationship Explorer.
- **Add my mother/father/spouse/child** → Family starter / Add Relative.
- **Preserve an old story** → Memories.
- **Find relatives in Pune** → Directory / Places.
- **Import 50 relatives** → Guided Excel.
- **Something in my profile is wrong** → correction request.
- **Ask relatives to help fill information** → Contributions / invitations.
- **Find an interior designer in my community** → Community Network → Services.
- **Seek a marriage introduction** → Marriage opt-in discovery → trusted path → introduction request.
- **Switch/create/join another family** → Family Switcher / Lobby.
- **Stop receiving digest delivery** → Quiet Digest preferences.

## Guide search

Initial search should be deterministic and fast; no LLM dependency is required.

Support natural queries/keywords such as:
- add my mother
- delete person
- who sees my phone number
- import Excel
- find cousins
- leave family
- public profile
- trusted introduction
- marriage discovery
- memories
- switch family

Search result cards should show module title, concise answer/snippet and **Open guide** / **Open feature** actions.

Future AI guide assistant may be added only after this curated guide corpus is strong and must answer from the controlled guide source rather than hallucinating product behavior.

## Ideas for Your Family

Create inspiration categories:

### Preserve
- record elders' stories;
- digitize old albums;
- document hometown/village origins;
- preserve wedding and migration stories;
- record family professions and achievements.

### Connect
- find relatives nearby;
- discover relatives abroad;
- create professional mentorship;
- plan reunions;
- use trusted community introductions.

### Celebrate
- birthdays;
- anniversaries;
- milestone events;
- family-history dates;
- gatherings.

### Contribute
- identify old photographs;
- complete missing professions/cities;
- invite knowledgeable elders;
- let younger members digitize information.

### Discover
- family achievements;
- geographic spread;
- professions/skills;
- five-generation lineage;
- trusted wider-community connections.

## Privacy & Trust Center

This must use human wording and clearly answer:
- Who can see my profile?
- Can any member edit the family tree?
- What can Family Owner/admin change?
- Can another family see our private tree?
- What does Public Profile / Privacy Preview mean?
- Does joining a community make me searchable automatically? **No.**
- Can someone publish me for marriage without my opt-in? **No.**
- What is a trusted family connection?
- Does the app infer relationships from surname/community/city? **No.**
- What does an introduction reveal?
- Who can leave/switch families?
- What is shared when I share a memory/digest?

Any privacy statement must match actual runtime/RLS behavior; never write aspirational privacy as if already enforced.

## Family Owner playbook

Provide a dedicated guided track:
1. Create the family.
2. Add yourself.
3. Add closest relatives.
4. Invite 3–5 relatives.
5. Import a larger family if available.
6. Review corrections/submissions.
7. Add several meaningful memories.
8. Preserve older family history.
9. Encourage relatives to complete profiles.
10. Add/organize a gathering.
11. Review participation/living-loop health.
12. Connect to a wider community only when useful.

## First 7 Steps activation journey

Prefer a seven-step journey rather than forcing literal daily notifications:
1. **Know your family** — explore Personal Lineage.
2. **Complete yourself** — review your profile.
3. **Preserve one memory**.
4. **Invite one relative**.
5. **Discover history** — explore timeline/history.
6. **Help the family** — complete one contribution.
7. **Share something meaningful**.

Track progress only if implementation remains simple and privacy-safe. It should feel encouraging, never gamified pressure.

## Things you may not know Family Network can do

Include high-value discovery examples such as:
- Show the human relationship between you and another person.
- Switch between personal lineage and the full family.
- Preserve stories about deceased relatives.
- Search extended family by profession/city.
- See geographic family spread.
- Let members request corrections without destructively editing lineage.
- Maintain more than one family network.
- Keep community discoverability separate from private family membership.
- Find a trusted family path before an introduction request.
- Share memories/digests without sharing the entire family graph.

## What's New

Create a lightweight data-driven or structured release section so returning users discover important capabilities. Do not duplicate technical changelogs.

Example:
- Trusted Introductions — discover explainable accepted family paths.
- Quiet Digest — catch up without scrolling through a feed.

## Curated future roadmap

Do not expose the full founder/technical roadmap. User-facing future content should use:
- **Being explored**
- **Planned** only where genuinely intended
- **Tell us what matters**

Potential `Being explored` examples:
- Family Play — Tambola, trivia, photo guessing, reunion games using family context.
- Family Video Memories — supported external video links attached to memories/events/people.
- Rich family book/export.
- Smarter family insights.
- Opt-in named bridge contacts for trusted introductions.

Avoid public release dates unless committed.

Add **I'm interested / I'd use this** signals where valuable. These should feed feedback intelligence, not directly mutate roadmap status.

## Adaptive/permission-aware help

Guide content must reflect actual runtime permissions and feature visibility.

- Normal member: member-relevant family/memory/contribution/community content.
- Family Owner/admin: additionally imports, invitations, approvals, governance, family controls.
- Platform Owner: additionally Launch Control, rollout and feedback triage.
- Playground: explain simulation/no-save behavior and expose safe `Try in Playground` actions.

Do not describe hidden/admin-only capabilities to ordinary users as if they can perform them.

## Playground integration

Where useful, Guide modules offer **Try this in Playground**.

Examples:
- Relationship Explorer → open sample relationship.
- Memories → open a populated sample memory.
- Community → show community discovery/trusted path examples.

Playground guide actions must remain no-save and must never write into a signed-in user's real active family.

## Visual/interaction design rules

The Guide must not become a wall of text.

Use:
- concise hero summaries;
- card-based navigation;
- progressive accordions;
- large readable typography;
- meaningful icons;
- goal-oriented examples;
- optional detailed expansion;
- search;
- related-guide chips/cards;
- actual Open Feature actions;
- mobile-first layouts.

Desktop can use a left guide navigation + main content + optional on-page navigation when space permits. Mobile should collapse naturally into search, category cards and accordions.

Accessibility/novice rules:
- plain language;
- avoid graph/database/admin jargon where human wording exists;
- large tap targets;
- obvious back navigation;
- outside-click/escape behavior consistent with existing modal rules;
- 360/390/430 width verification;
- useful with keyboard and screen reader semantics where feasible.

## Technical implementation guidance

Preferred components/services:
- `FeatureGuide` — reusable contextual collapsible guide.
- `GuidePortal` — complete Explore & Guide experience.
- `GuideSearch` — deterministic indexed search over guide registry.
- `GuideFeedback` — contextual feedback form.
- `lib/user-guide-content.ts` (or split structured registry) — canonical guide content.
- optional `guide-types.ts`.

Avoid copy/paste help blocks embedded separately across 30+ components.

Guide registry should support availability/version metadata so documentation does not claim incomplete features are live.

## Feedback persistence / governance

Add a governed feedback model/RPC if not already available.

Minimum conceptual fields:
- id
- family_id nullable
- user_id/member_id nullable as appropriate
- guide_key/module_key
- feedback_type
- feedback_text
- helpful boolean nullable
- route/screen context
- role/experience context
- status
- created_at / updated_at

Platform Owner needs a triage surface; Family Owner visibility should be carefully scoped. Ordinary users must not browse other users' raw feedback unless intentionally designed later.

Rate-limit/spam consideration should be documented before broad public exposure.

## S2-E implementation batches

Implement as one coherent mission, but internally stage work:

### S2-E1 — Guide Foundation
- Explore & Guide navigation.
- central structured guide registry.
- reusable contextual guide.
- guide search.
- role/feature-aware filtering.
- Open Feature / Try in Playground routing.
- responsive design.

### S2-E2 — Complete Product Guide
- Start Here / purpose / benefits.
- narrative possibilities.
- 10+ personas.
- feature categories.
- complete module library.
- goal/use-case explorer.
- Privacy & Trust Center.
- Family Owner playbook.
- First 7 Steps.
- Things You May Not Know.
- What's New.
- curated future roadmap.

### S2-E3 — Feedback Intelligence
- module-specific feedback.
- helpful/not-helpful.
- roadmap-interest signals.
- persistence/RPC governance.
- Platform Owner feedback inbox/triage.
- safe contextual metadata.

## Behavior/QA gate

Do not mark S2-E complete from source checks alone.

Test at minimum:
1. Anonymous Playground visitor.
2. Fresh signed-in user with no family.
3. New family creator.
4. Normal family member.
5. Family Owner.
6. Family co-admin.
7. Platform Owner.
8. Older/non-technical mobile user.
9. User with hidden/disabled modules.
10. User searching for a task rather than a module name.

For each verify:
- discoverability;
- comprehension;
- correct role/feature filtering;
- navigation/open-feature routing;
- mobile behavior;
- guide collapse/expand behavior;
- no contradictory/outdated claims;
- feedback submission/recovery;
- privacy;
- Playground no-save behavior.

Critique as skeptical user, novice 60+ user, product founder, UX expert, QA engineer, security architect and investor/demo viewer.

## Exit gate

S2-E is complete only when:
- every major live user-facing module has contextual guidance or an explicit justified exception;
- standalone Explore & Guide covers the complete live product coherently;
- a novice can find help by goal or search without knowing internal module names;
- role/feature visibility is accurate;
- privacy/trust explanations match runtime behavior;
- feedback can be submitted and governed;
- 360/390/430 mobile is usable;
- Playground provides safe interactive examples;
- source/build checks pass in a dependency-complete environment;
- live behavior has been tested across core personas.

## Future after S2-E

Do not let S2-E consume/erase prior roadmap ideas. Preserve Family Play, contextual social-video memories, named opt-in bridge contacts, external digest delivery, richer community moderation/reputation, family book/export and S3 business proof. S2-E should make those future capabilities easier to discover and evaluate when they arrive.

## Implementation update — 2026-08-24

**Status: IMPLEMENTED IN SOURCE / LIVE BEHAVIOUR + SUPABASE VERIFY REQUIRED**

Implemented architecture and surfaces: central guide registry/types; reusable `FeatureGuide`; standalone `GuidePortal`; deterministic search; persona/goal/inspiration/Owner/activation content; role/feature filtering; privacy/trust content; Playground actions; governed feedback table/RPC; Platform Owner feedback triage and aggregates; responsive Guide styling; S2-E source gate.

This status does not certify deployed RLS/privacy behavior, mobile real-device usability, feedback RPC execution or a dependency-complete production build. Those remain exit-gate items.

## Release closure update — 2026-08-24

Status advanced from **IMPLEMENTED IN SOURCE / LIVE VERIFY** to **SOURCE-COMPLETE / READY FOR LIVE CERTIFICATION**.

The closure audit found and fixed issues not covered by the original source gate: broken related-guide references and missing contextual guidance in several important nested flows. `scripts/s2-e-release-closure-gate.mjs` now protects these paths. Production certification still requires deployed migration/RLS/RPC/browser/mobile/Playground/build verification documented in `S2-E-RELEASE-CLOSURE.md`.
