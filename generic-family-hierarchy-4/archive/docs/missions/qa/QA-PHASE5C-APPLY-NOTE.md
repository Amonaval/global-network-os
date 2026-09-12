# Phase 5C Apply Note

Apply this patch after the Phase-5B patch. Do not run Phase-5C runtime against the normal `.env.qa`. Copy `.env.qa.release.example` to `.env.qa.release` and point it at the same disposable Supabase project used for the successful Phase-5B replay. Keep `QA_RELEASE_CONFIRM_DISPOSABLE` blank until you have manually verified the project identity; then set exactly `YES_DELETE_ME` for the one-time runtime certification.

Recommended verification order later:
1. close/certify Phase 5A
2. certify Phase 5B
3. `npm run qa:phase5c:local`
4. configure `.env.qa.release`
5. `npm run qa:phase5c:runtime`
6. `npm run qa:certify:phase5c`
