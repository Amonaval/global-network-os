# NX-6 — WOW Experience & Product Unification

## Mission
Turn accumulated capability into a product that feels simpler, clearer and more desirable. NX-6 adds no major Family feature; it recomposes existing value so a normal user knows what matters, where to go and why the product is different.

## Product test
A user should be able to answer quickly:
- What is this family space for?
- What should I do now?
- Where do I understand people?
- Where do I preserve family legacy?
- Where are my networks/profile/help/sign out?

## Delivered
### Family Home
- Replaced the long NX-2/NX-5/NX-3 feature stack with **Today · People · Legacy**.
- Kept a small family snapshot and a few real family moments/actions.
- Preserved birthdays **and anniversaries** in the compact moment surface.
- Today contains Living Family / Quiet Digest, People contains Connection & Belonging, Legacy contains Time Machine.

### Product shell
- Added one reusable account menu for Family, Alumni and productized verticals.
- Consolidated Profile / My Networks / Guide / Launch Control / Sign out where applicable.
- Playground account state says Explore / Playground rather than pretending there is a signed-in person.

### Profiles
- Desktop/tablet profile uses an elevated modal-style surface; mobile stays a bottom sheet.
- Long content is split into **Overview · Story · Family** tabs.

### My Networks
- Stronger identity/network message.
- Network cards remain primary.
- Playground and privacy explanation use progressive disclosure instead of permanently occupying the page.

### Entry/onboarding
- Preserve the structural NX-1 fix: no empty left column and no giant nested option sections.
- Entry options, Playgrounds and product creation remain separate responsive sections.

## Guardrails
- No new database tables or migrations.
- No RLS changes.
- No network/profile merge.
- No invented family history.
- No infinite feed, streaks, points or engagement pressure.
- Simplification must not silently remove existing Family value.

## Validation
`npm run validate:nx6` is the deterministic source/regression gate. Runtime verification is milestone-based and should judge product coherence, responsive behavior and navigation rather than re-running every historic feature path.
