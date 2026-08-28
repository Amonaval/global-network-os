# I18N Architecture — Stability Rule

## Decision
User-visible translations must not be authored inside React components. Locale catalogs are separate files and are loaded by locale.

## Structure
- `lib/i18n.tsx` — provider/runtime only; no translation prose.
- `lib/i18n/catalog.ts` — supported locales and dynamic catalog loader.
- `lib/i18n/messages/en.ts` — English source catalog.
- `lib/i18n/messages/hi.ts` — Hindi catalog.
- `lib/i18n/messages/mr.ts` — Marathi catalog.

Tokens use stable semantic names such as `FamTreeTxt`, `AddRelativeTxt`, `PrivateContactTxt`. Components call `t("Token")`; translations never become branching `language === "hi" ? ...` code in new work.

## Loading
English is the deterministic fallback. Hindi/Marathi catalogs are dynamically imported only when selected, allowing future language packs to become separate chunks.

## Quality rules
1. Every supported catalog must contain the exact English token set.
2. A missing token falls back to English and must fail the i18n source gate before release.
3. No business/domain logic in language files.
4. Date/number formatting uses locale metadata, not translated prose.
5. Do not use translated text as identifiers, keys, feature names or persistence values.
6. New UI strings require a token before component implementation is considered complete.

## Existing debt
Older components still contain pre-existing inline EN/HI/MR copy objects/ternaries. They are now explicit migration debt; do not expand them. Migrate opportunistically by coherent screen, not through a risky all-app rewrite.

## Future language roadmap
After EN/HI/MR architecture and completeness are stable:
1. Spanish (`es`) — first global expansion candidate.
2. Simplified Chinese (`zh-CN`) — major global language pack; verify fonts/layout/line breaking.
3. French (`fr`).
4. Portuguese (`pt-BR`).
5. German (`de`).
6. Arabic (`ar`) only together with proper RTL architecture/testing.

Do not mark a locale supported until its primary journeys are complete and visually verified on mobile and desktop.

## Mission 2 checkpoint — 2026-08-27
- Current canonical catalog: **328 tokens**.
- English / Hindi / Marathi each currently contain all 328 tokens.
- `LocaleCatalog` remains structurally partial so future language packs can be developed behind English fallback before being declared supported.
- A locale is not considered **supported** until its current token contract is complete and primary journeys are visually verified.
- `npm run audit:i18n` tracks legacy user-visible literals that have not yet been extracted from components.

## Mission 3 extraction closure
- English is the canonical source catalog.
- Hindi/Marathi are independent reviewed overrides with English fallback; key-count equality is not required.
- Static user-visible copy must not be authored directly in TSX.
- `npm run audit:i18n` is AST-based to avoid false positives from TypeScript generics and technical strings.
- Do not translate class names, route segments, enum/status keys, API fields, locale codes or persisted values.
- Future `es`, `zh-CN`, `fr`, `pt`, `de` packs plug into the same catalog loader; Arabic requires an RTL readiness mission before launch.
