# Mission 2 — Trusted Expertise & Professional Network

**Status:** SOURCE IMPLEMENTED / SOURCE-GATED / LIVE RUNTIME VERIFICATION OPEN  
**Recommended effort:** Medium  
**Date:** 2026-08-27

## Purpose
Prove that Generic Network OS can support a commercially relevant sixth vertical without destabilizing Family/NX or creating a second platform. The product job is not a public professional directory; it is trusted expertise discovery through verified context, warm referral/collaboration paths and reusable professional knowledge.

## Primary audiences
Professional associations and expert communities including accounting/tax, legal, architecture, consulting, engineering and specialist advisory networks.

Healthcare provider collaboration remains a future specialization. Patient data, diagnosis and regulated clinical workflows are explicitly excluded from this mission.

## Signature product jobs
1. Find specialists by profession, specialty, service, industry, credential and geography.
2. Understand known `worked_with`, `referred_by`, `collaborates_with` and `mentors` paths.
3. Request or support a warm professional introduction rather than cold discovery alone.
4. Organize practice groups and regional expert circles.
5. Preserve de-identified case lessons and reusable expertise so network knowledge compounds.

## Reuse
The vertical reuses the existing productized-template runtime, network membership, tenant isolation, profiles/entities, affiliations, typed relationships, projections, groups/events, Places, Contributions, Guide, Playground, Launch Control and deterministic Network Intelligence.

## Additive implementation
- `professional` vertical + template registration.
- Professional productized configuration and global showcase dataset.
- 36-person sample across India, USA, UK, Spain, Canada, UAE, Australia and Singapore.
- Professional relationship semantics and projections.
- Professional intelligence prompts/copy.
- Migration `054_m2_trusted_expertise_professional_network.sql`.
- Creation, Playground, My Networks and Launch Control exposure.

## i18n quality work included
Mission 2 also closes the current catalog-level EN/HI/MR gap:
- English is the canonical token contract.
- Hindi and Marathi are separate locale files.
- All 328 current English tokens have matching Hindi and Marathi entries.
- Runtime still uses English fallback for future partial packs.
- `SetupScreen` no longer embeds a locale dictionary.
- `npm run audit:i18n` reports remaining legacy visible string literals so extraction can continue without broad unstable rewrites.

## Explicit exclusions
- Native mobile app.
- New RAG/Ollama dependency.
- Patient records or regulated clinical workflows.
- Cross-network data merging.
- Major Family/NX redesign.
- Mass extraction of every legacy literal in one risky refactor.

## Exit criteria
- Dedicated Mission 2 source gate passes.
- STABILITY-1 regression gate remains green.
- All referenced `t("Token")` keys exist.
- EN/HI/MR current catalogs are key-complete.
- Application TS/TSX parses without syntax errors and relative imports resolve.
- Live build/runtime checklist is completed in the normal project environment before commercial pilot use.
