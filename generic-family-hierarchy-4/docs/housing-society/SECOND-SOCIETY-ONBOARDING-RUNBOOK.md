# Second Society Onboarding Runbook — Pilot D

## Rule
A second society must not require a founder-specific branch, direct SQL data patch or one-off schema change. Any such requirement must be recorded as failed repeatability evidence.

## Sequence
1. Create a new `housing-society` network through the normal product flow.
2. Apply the standard migration chain through `088_hs6_founder_pilot_commercialization.sql`.
3. Use `public/housing-society-pilot-import-template.csv` and the existing HS-1 column mapper.
4. Import units/residents/occupancy/vehicles/parking without manual database editing.
5. Invite and claim representative resident profiles.
6. Run one notice, one complaint-to-resolution flow and one maintenance visibility cycle.
7. Exercise one governance or security/compliance workflow appropriate to the society.
8. Start Pilot D and record a checkpoint with `repeatable onboarding confirmed` only if the same reusable product path worked.
9. Record whether any founder-specific code/manual patch was required.
10. Export the HS-6 evidence JSON for comparison with the first society.

## Failure handling
A failed repeatability gate is product evidence. Fix the generic mapper, permissions, UX or runtime; do not hide the problem with society-specific code.
