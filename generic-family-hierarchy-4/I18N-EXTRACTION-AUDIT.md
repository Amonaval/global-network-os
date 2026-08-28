# i18n Extraction Audit

Status after Mission 3 source closure:

- English canonical catalog: **1,933 unique tokens**.
- Hindi reviewed catalog: **351 tokens**.
- Marathi reviewed catalog: **351 tokens**.
- Missing Hindi/Marathi tokens intentionally fall back to English until translated/reviewed.
- AST direct-visible-literal audit: **0 candidates** across `app/**/*.tsx` and `components/**/*.tsx` for JSX text, standard visible string props, and alert/confirm copy.
- Inline mapped labels and high-confidence display fallbacks/messages were also migrated in this pass.
- Technical values such as `en-IN`, `numeric`, `configured`, internal status keys, input types, routes, CSS classes and persisted enum values are intentionally NOT translated.

## Permanent gate
`npm run audit:i18n`

New UI copy should be introduced through a stable message token, not as a literal inside a component.
