# Generic Network OS — Lean AIDLC Operating Rule

Adapted from the supplied AIDLC approach for this project. Use the lightest process that preserves correctness.

## Canonical loop

**Outcome → Context → Baseline → Challenge → Mission → Acceptance → Implement → Verify → Review → Record → Deliver → Observe → Reprioritize**

## 1. Outcome before code

State what becomes better for the user/product/business. For user-facing work, name the journey/screen and the desired “wow” or friction reduction.

## 2. Load context progressively

Read `AI-START-HERE.md`, `PRODUCT-CONSTITUTION.md` and `CURRENT-STATE.md` first. Load architecture, roadmap, validation and history only when the mission requires them.

Do not read every MD or every source file blindly.

## 3. Inspect the baseline

Understand existing behavior and reuse before editing. Preserve stable code and standalone behavior. Prefer the smallest coherent change.

## 4. Challenge before accepting the mission

Challenge only meaningful assumptions:
- Is this solving a valuable problem?
- Is there a substantially stronger product move?
- Does this improve desirability/activation/retention/trust/distribution?
- Does it create privacy or architecture debt?
- Are we building complexity because it is interesting rather than valuable?

## 5. Mission contract

For meaningful work define:
- **Why / outcome**
- **Included**
- **Excluded/deferred**
- **Existing capabilities to reuse**
- **Constraints/invariants**
- **Observable acceptance**
- **Validation**
- **Delivery form**

Do not create a separate mission document for trivial fixes.

## 6. Deterministic first

Use code, schemas, policies, graph algorithms, validation and tests for deterministic truth. Use AI where reasoning/synthesis materially helps. AI-generated knowledge does not silently become canonical graph truth.

## 7. Build in milestone loops

Do not interrupt forward product work with full manual verification after every small change. Group coherent work into a meaningful milestone. At that checkpoint:
- cut the affected/new-files release artifact;
- run focused automated/static validation;
- let the founder perform runtime/product verification;
- use that milestone window for bug fixing, regressions and hardening;
- once stable, resume forward product development rather than remaining in permanent polish mode.

Privacy/security-sensitive changes still require immediate proportional validation and must not be deferred merely for batching convenience.

## 8. Verify proportionally

Use focused tests/source gates, shared regression gates when blast radius requires them, and runtime/live verification for behavior that static checks cannot prove.

Never call source completion “product complete” when rendered/user behavior is unverified.

## 9. Record only durable truth

At mission close update only what changed:
- `CURRENT-STATE.md` for current operational truth;
- relevant architecture/decision docs for new invariants;
- `ROADMAP.md` / `MISSION-STATUS.md` with concise status/log entries;
- guides when user behavior changed;
- validation docs when commands/gates changed.

Do not duplicate the same rule across many files.

## 10. Observe and reprioritize

Real usage outranks speculative backlog. But founder outreach has a cost: prefer passive/public/product-led evidence until the product is strong enough that direct outreach has high expected learning or conversion value.

## 11. Definition of a strong mission

A strong mission leaves at least one of these materially better:

**want it · understand it · trust it · use it · return to it · depend on it · invite others · pay for it · build on it safely**
