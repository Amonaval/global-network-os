# Family Release 1 — Regression Audit

## Baselines compared
- P5.1 Family UX
- D1 Production Participation
- Family Release 1

## Critical regression found
Family Release 1 was created from the P5.1 Family UX line without carrying forward the later D1 participation increment. This removed the complete participation surface rather than intentionally replacing it.

Restored from D1:
- `components/ParticipationCenter.tsx`
- `components/PublicMemberPage.tsx`
- `lib/participation-types.ts`
- `app/public/member/[id]/page.tsx`
- `supabase/migrations/016_d1_production_participation.sql`
- D1 participation exports and tracking in `lib/remote.ts`
- invitation preview / activation improvements
- public participation tracking
- participation navigation and rendering in `NetworkApp.tsx`
- QR dependency and D1 public-route hardening
- D1 source gate and release documentation

## Family Release 1 preserved
The family-first UI, mobile shell, multilingual support, guided Excel import, dynamic import improvements, visual system and other Family Release 1 changes remain in place. On mobile, Participation is exposed through the More sheet to preserve the simplified bottom navigation.

## Permanent gate
`DEVELOPMENT-RULES.md` now contains a hard no-silent-feature-regression rule. Future releases must diff against the previous accepted baseline and classify every deletion before delivery.
