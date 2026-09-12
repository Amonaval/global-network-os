# QA Free-Tier POC v6

Fixes a real runtime bug found by POC certification: `fetchMyNetworkMemberships()` recognized only six released vertical kinds. `association`, `family-association`, and `housing-society` were silently coerced to `family`, so the network switcher could not expose the seeded Housing Society using its actual vertical kind.

Changes:
- `capabilities/network-context/remote.ts`: recognizes all 9 released vertical kinds.
- `qa/unit/runtime-contracts.test.mjs`: regression coverage requires the membership transport to preserve every QA catalog vertical.

Apply over the current tree after v5, then run `npm run qa:certify`.
