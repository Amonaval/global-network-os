# QA Preflight Fix

Apply these files over the QA Mega Mission baseline, preserving paths.

Changes:
- `package.json`: adds project-local `tsx@4.23.13` to `qa:setup`; `qa:unit` now uses `tsx --test` instead of Node strip-only TypeScript execution.
- `qa/unit/core-contracts.test.ts`: removes explicit `.ts` import suffixes so the repository's existing TypeScript compiler settings accept the test.
- `qa/fixtures/roles.ts`: types the Playwright fixture `use` callback and awaits it, fixing TS7006.

After applying:
1. `npm run qa:setup`
2. `npm run qa:preflight`

No application runtime behavior is changed by this patch.
