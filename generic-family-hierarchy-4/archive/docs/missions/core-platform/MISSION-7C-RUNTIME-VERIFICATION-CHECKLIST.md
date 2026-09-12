# M7-C Runtime Verification Checklist

## Setup
1. Apply migration `063_m7c_guided_pilot_admin_console.sql`.
2. `npm ci`
3. `npm run validate:m7c`
4. `npm run check:types`
5. `npm run build`

## Functional verification
- Sign in as a user who owns/administers at least two networks.
- Open **My Networks** and find **Guided Pilot & Admin Launch Console**.
- Confirm only networks you own/administer appear.
- Confirm portfolio counts are plausible: administered networks, attention/progressing/proven and total claims.
- Confirm each row shows members, claims, bridges, 30-day searches, 30-day outcomes and next constraint.
- Confirm clicking a row opens the existing network; M7-C must not create a parallel management screen.
- Confirm the highest-leverage intervention points to the first missing launch constraint.
- For a new/sparse network, expect Starting or Needs attention depending on age.
- For a network with an accepted introduction in the last 30 days, expect Value proven.

## Privacy regression
- No adjacent-network member names appear in the console.
- No discovery query/search text appears.
- No candidate identity/profile appears.
- A normal member without owner/admin role must not receive that network in the pilot console RPC.

## Existing product regression
- M7-A Launch Activation still renders and opens the real network.
- M7-B Scenario Theater still works.
- M6 bridge/discovery/introduction experiences remain unchanged.

## Pass criteria
`validate:m7c` + typecheck + build pass, admin scoping is correct, portfolio health/next action are plausible, privacy invariants hold, and existing M7-A/M7-B/M6 experiences remain intact.
