# G9 Runtime Verification Checklist

Run after `npm ci` and migration 049.

- [ ] `npm run build`
- [ ] `npm run validate:g9`
- [ ] Family Playground shows Intelligence for Explorer experience and can answer the suggested family questions.
- [ ] Alumni Playground shows Intelligence and can find alumni by city/company/cohort context.
- [ ] Organization Playground surfaces connector, completeness and missing-link insights.
- [ ] Business Trust Playground can search supplier/service context and show evidence.
- [ ] Franchise Playground can surface peer-location/network gaps.
- [ ] Ask Network answers show a confidence label and `Why this answer` evidence.
- [ ] Clicking entity evidence never reveals an entity that was not already present in the current authorized dataset.
- [ ] No intelligence action writes relationships automatically.
- [ ] Platform owner Launch Control shows an `Intelligence` bundle for all five verticals.
- [ ] Real-network rollout starts in Test after migration 049; Playground remains enabled.
- [ ] Light, Dark and Aurora themes remain readable on desktop and mobile.
- [ ] Family/Alumni legacy flows remain unchanged outside the explicitly added Intelligence surfaces.
