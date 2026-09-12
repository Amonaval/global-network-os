# MPF-A1 — Family-Grade Community / Association Experience

## Objective
Evolve Community / Association from a generic productized template into a strong real-world association vertical derived from MPF-style usage while keeping implementation generic.

## Product model
Community / Association is approximately 60–70% Family-grade member/hierarchy experience plus Association-specific membership, events, committees and governance semantics.

## Implemented
- Dedicated Association signature Home instead of relying only on the generic productized hero.
- Mahesh-inspired visual system: deep indigo/blue, temple gold, saffron accents, warm ivory and ash/stone neutrals.
- Light, Dark and Aurora theme treatment plus mobile responsive behavior.
- 10-household / 30-person playground data with representative, spouse and child records.
- Full person metadata: DOB, age, phone, email, profession/occupation, relationship role and city.
- Profile detail and editor support for the richer person fields.
- Family-grade relationship semantics: represented-by, member-of-household, spouse-of and parent-of.
- Dedicated Me & My Family surface.
- Upcoming birthdays and events on Association Home.
- Community year/history timeline preview.
- Family / household membership and annual renewal remain first-class.
- Scoped family co-admin model: representative or network admin may grant maintenance rights to claimed members of the same household without making them network-wide admins.
- Association-specific navigation language: Families & Members, Family Structure, Community Life, Relationships, Update Network, Explore & Guide.

## Privacy / governance guardrails
- Household co-admin authorization is backend-enforced and audited.
- A co-admin must be a claimed user who belongs to the same household.
- Household maintenance rights do not imply network-wide admin rights.
- Association-to-broader-network linking remains governed by existing Network OS trust/federation boundaries.
- Formal elections remain a dedicated future governance capability and are not represented by Pulse/polls.

## Validation
- `npm run validate:mpfa1` passes, including MPF-A0 regression validation.
- Changed TypeScript/TSX files were syntax-transpilation checked with the installed global TypeScript compiler.
- Full `npm run check:types` / `npm run build` could not be certified in this reconstructed workspace because `node_modules/@types/*` directories are incomplete from the interrupted dependency installation. Run these in the user's real repository after applying the affected-files ZIP.

## Next feedback-driven enhancements
Do not expand speculatively. Use the first 10 real families to prioritize official elections, renewal workflow UX, photo/media ergonomics, family onboarding, association-to-parent linking, and any missing MPF workflows.
