# Mission 7-D — Release Manifest

## Mission
Pilot Feedback & Product Learning Loop

## New files
- `core/activation/pilot-learning.ts`
- `capabilities/pilot-learning/remote.ts`
- `components/PilotFeedbackLearningLoop.tsx`
- `supabase/migrations/064_m7d_pilot_feedback_product_learning.sql`
- `scripts/m7d-pilot-feedback-learning-gate.mjs`
- `MISSION-7D-PILOT-FEEDBACK-PRODUCT-LEARNING.md`
- `MISSION-7D-RUNTIME-VERIFICATION-CHECKLIST.md`
- `MISSION-7D-RELEASE-MANIFEST.md`
- `MISSION-7D-PILOT-FEEDBACK-PRODUCT-LEARNING.docx`

## Modified files
- `components/MyNetworksHome.tsx`
- `app/globals.css`
- `lib/i18n/messages/en.ts`
- `package.json`
- `.github/workflows/ci.yml`
- `scripts/m5-production-runtime-gate.mjs`
- `scripts/m6a-trusted-network-reach-gate.mjs`
- `scripts/m7b-wow-showcase-gate.mjs`
- `MISSION-7-REAL-WORLD-ACTIVATION-SHOWCASE.md`
- `ROADMAP.md`
- `MISSION-STATUS.md`
- `CURRENT-STATE.md`
- `AI-START-HERE.md`
- `NEXT-SESSION-PROMPT.md`
- `VALIDATION.md`
- `TECHNICAL-EVOLUTION-REGISTER.md`
- `USER-GUIDE.md`

## Database
Migration `064_m7d_pilot_feedback_product_learning.sql` adds `pilot_feedback` and three governed RPCs for submission, context and admin learning.

## Validation
Run `npm run validate:m7d`; it chains through M7-C, M7-A, M7-B and the complete M6/M5/M4/M3/M2/STABILITY source-regression history.
