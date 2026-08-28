# i18n Extraction Audit

**Date:** 2026-08-27

## Architecture status
- Canonical source catalog: `lib/i18n/messages/en.ts`
- Hindi: `lib/i18n/messages/hi.ts`
- Marathi: `lib/i18n/messages/mr.ts`
- Current token counts: **328 EN / 328 HI / 328 MR**
- All current catalog tokens are translated in all three current languages.
- Locale packs are loaded through the catalog runtime; components should use stable tokens only.

## Important distinction
Catalog completeness is now strong, but the legacy application still contains user-visible string literals outside the catalog. Do **not** mass-refactor all of them in one release because that conflicts with the stability-first rule.

`npm run audit:i18n` is an intentionally approximate extraction audit. It currently reports **1,432 potential visible literal candidates across 58 TSX files**. Some are false positives, generated/domain data or technical copy, so this is a migration inventory rather than a release failure.

Largest current candidate surfaces:

| Surface | Approx. candidates |
|---|---:|
| `NetworkApp.tsx` | 129 |
| `AlumniNetworkApp.tsx` | 123 |
| `ParticipationCenter.tsx` | 98 |
| `CommunityNetwork.tsx` | 90 |
| `GuidePortal.tsx` | 81 |
| `TemplateNetworkApp.tsx` | 76 |
| `FamilyAdminCenter.tsx` | 62 |
| `FamilyBranchIntakeForm.tsx` | 55 |
| `FounderLaunchConsole.tsx` | 55 |
| `SetupScreen.tsx` | 43 |

## Migration rule
For every future mission:
1. Do not introduce new inline locale dictionaries.
2. Add English token first.
3. Add reviewed locale translations where available; English fallback remains safe for future locale packs.
4. When a screen is materially touched, extract its visible literals into tokens as part of that same mission.
5. Prefer small screen-level batches over a repository-wide string rewrite.

## Future locales already planned
After current EN/HI/MR extraction quality improves:
- Spanish (`es`)
- Simplified Chinese (`zh-CN`)
- French (`fr`)
- Portuguese (`pt`)
- German (`de`)
- Arabic (`ar`) only with proper RTL readiness
