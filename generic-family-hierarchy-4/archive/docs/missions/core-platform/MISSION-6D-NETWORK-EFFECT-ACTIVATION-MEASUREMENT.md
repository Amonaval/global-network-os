# Mission 6-D — Network Effect Activation & Measurement

## Purpose
Turn M6-A/B/C into a measurable product loop. M6-D answers whether belonging to multiple networks, bridging them, discovering adjacent help and receiving consented introductions actually creates repeatable value.

## Implemented
- Privacy-safe `network_effect_events` telemetry.
- No search text, candidate identity, profile details, email or phone in analytics.
- 30-day personal Network Effect Pulse.
- Funnel: multi-network → bridge → discovery → introduction → consent → proven.
- Metrics: accepted bridges, searches, anonymous opportunities, requests, accepted introductions and acceptance rate.
- Deterministic next-best-action nudges rather than AI scoring.
- Existing M6-C privacy/consent boundary remains authoritative.

## Non-goals
No universal trust score, no social score, no cross-network directory, no growth spam, no multi-hop discovery, no external analytics vendor, no AI ranking.

## Runtime
Apply migration `060_m6d_network_effect_activation_measurement.sql`, run `npm run validate:m6d`, `npm run check:types`, `npm run build`, then complete the M6-D runtime checklist.
