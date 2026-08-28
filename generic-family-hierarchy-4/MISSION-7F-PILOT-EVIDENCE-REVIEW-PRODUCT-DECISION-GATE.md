# M7-F — Pilot Evidence Review & Product Decision Gate

## Mission
Close Mission 7 by converting actual pilot evidence into an explicit human product decision. M7-F does not add another network capability. It establishes the stop/continue discipline that prevents the product from expanding faster than evidence.

Mission 7 now closes as:

`SHOW → GUIDE → OPERATE → LEARN → CERTIFY → DECIDE`

- M7-B SHOW: prove the product story with synthetic scenarios.
- M7-A GUIDE: help a real network reach first value.
- M7-C OPERATE: give administrators an intervention portfolio.
- M7-D LEARN: collect lightweight contextual pilot feedback.
- M7-E CERTIFY: verify the real trusted-network runtime before demos.
- M7-F DECIDE: turn the accumulated evidence into an explicit investment decision.

## Decision vocabulary
M7-F deliberately uses only four dispositions:

- **INVEST** — pilots repeatedly find the capability useful; deepen it.
- **FIX** — the capability has value but repeated friction is blocking it; repair before expanding.
- **HOLD** — evidence is too thin or mixed; keep stable and learn more.
- **STOP** — do not spend more on this capability until the premise or evidence changes.

The system may recommend a disposition, but the recommendation is advisory. An Owner/Admin records the final decision and rationale.

## Evidence model
The gate reads the existing M7-D `pilot_feedback` evidence for Owner/Admin networks. It groups evidence by meaningful moment: launch, participation, claim, bridge, discovery, introduction, outcome and general feedback.

For each moment the gate shows:
- feedback count;
- helpful / partial / blocked counts;
- helpful rate;
- top bounded friction category;
- evidence confidence;
- an evidence-derived recommendation and explanation.

The initial recommendation policy is intentionally understandable rather than ML-driven:
- fewer than 5 responses → HOLD;
- blocked rate >= 40% → FIX;
- helpful rate >= 70% → INVEST;
- partial + blocked >= 60% → FIX;
- otherwise → HOLD.

There is intentionally no automatic STOP recommendation in V1. STOP is a consequential human product choice and should require explicit judgment.

## Recorded decision
`pilot_product_decisions` stores the human disposition, evidence window, evidence snapshot, rationale, optional next action and timestamp. The stored evidence snapshot makes later roadmap conversations auditable: the team can see what was known when the decision was taken.

M7-F does **not** automatically edit feature flags, code, permissions, ROADMAP.md or release scope.

## Privacy and governance
Only authenticated users who currently Owner/Admin at least one active network may access the gate and record decisions. Evidence is derived from M7-D's de-identified feedback surface. The decision gate never exposes feedback authors, discovery query text, candidate identity or contact information.

## Product decision rule
A future mission should be opened only when one of these is true:
1. M7-F evidence produces a credible INVEST or FIX decision with an explicit next action; or
2. leadership deliberately chooses a new business/market goal and documents why it supersedes current pilot evidence.

Otherwise, capability expansion should HOLD.

## Mission 7 closure
M7-F is the final planned Mission 7 implementation. The trusted-network / showcase track is now designed to stop producing speculative features and start producing evidence-backed product choices.
