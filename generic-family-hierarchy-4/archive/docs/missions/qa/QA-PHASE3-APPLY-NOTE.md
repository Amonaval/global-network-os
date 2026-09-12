# QA Phase 3 — Apply Note

Apply this affected-files ZIP over the locally certified Phase-2 codebase that already ends with `PHASE2_CERTIFIED`.

Do not apply it over an older Phase-2 intermediate ZIP.

## Run order

1. `npm run qa:phase3:local`
2. Start/keep the app running exactly as used for certified Phase 2.
3. `npm run qa:phase3:browser`
4. Only after both pass: `npm run qa:certify:phase3`

Return the first failing output if a step fails. Do not rerun the full certification repeatedly.
