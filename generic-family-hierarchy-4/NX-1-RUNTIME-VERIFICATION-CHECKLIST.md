# NX-1 — Runtime Verification Checklist

Use this checklist at the NX-1 milestone verification window, not after every small follow-up change.

## My Networks
- Sign in to an account with 2+ memberships.
- Open `My Networks` from the Family top bar.
- Confirm every membership shows the correct vertical icon/type, name and role.
- Confirm Organization, Business Trust and Franchise are **not** shown as Family.
- Switch between at least Family + one non-Family network and confirm the correct vertical app opens.

## Privacy / identity UX
- Confirm My Networks explains that profiles remain separate by network.
- Confirm no member list/profile data from one network appears on another network card.
- Confirm only the signed-in user's own memberships are shown.

## Playground
- From My Networks, open sample Family, Alumni, Organization, Business Trust and Franchise.
- Confirm each sample opens the correct vertical and remains read-only/demo-scoped.

## Regression
- Existing Family tree/home/profile flows still work.
- Existing Alumni claiming and runtime still work.
- Existing productized network join/create/runtime still work.
- Existing active-network switching still persists correctly.

## Build
- Run `npm ci` if dependencies are not installed.
- Run `npm run build`.
- Run existing G1.3 / G2 / G8.5-C source gates.
