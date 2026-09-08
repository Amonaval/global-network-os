# XP-2 — i18n Closure

Status: **source-complete; browser linguistic QA pending**.

XP-2 moved the visible literal backlog reported by the production AST audit into the shared i18n message catalogs. The audit that previously reported 646 visible literal candidates across 17 released TSX files now reports zero unexplained violations. The touched released surfaces consume `MessageToken` keys through `useLanguage`, preserving runtime language switching.

## Contract
- English remains the canonical catalog.
- Hindi and Marathi catalogs contain every XP-2 key and continue to inherit existing translated messages.
- Shared strings are referenced through the shared catalog rather than copied into vertical-specific translation blocks.
- Existing family translations are preserved.
- Generated/user data, identifiers, technical values and proper nouns remain data rather than translatable UI copy.

## Important certification note
The newly extracted domain prose has complete catalog shape and English fallback safety. Native-speaker linguistic review of the newly extracted long-form Hindi/Marathi copy remains a runtime/content certification item; XP-2 does not claim that review was performed in this source-only environment.
