# QA Phase 5C — Production Release Certification

## Purpose
Compose all certified application, data, governance, vertical, security and migration evidence into one final release gate, plus a focused runtime/destructive certification on the same disposable project that passed Phase 5B.

## Safety model
The normal staging project is protected. Phase 5C mutation is permitted only through a dedicated `.env.qa.release` file with an explicit disposable confirmation. The configured release project must differ from the protected project reference and must match Phase-5B replay evidence. Production-like hosts are rejected. The final certification command itself is non-mutating.

## Runtime proofs
1. Health/readiness and anonymous protected-route denial.
2. Owner/admin/member browser boundaries and known cross-tenant isolation.
3. Invitation expiry, revoke, resend rotation and token replay denial.
4. Private media upload/signed-URL authorization across owner/member/foreign tenant/anonymous actors.
5. Strict Phase-5A RPC contract rechecked on the release candidate.
6. Full adversarial RLS matrix.
7. Logical export/backup with manifest-only media semantics.
8. Disposable create → import → media → archive → restore → purge → zero-residue lifecycle.
9. Fixture cleanup.

## Prerequisites
Phase 4A, 4B, 4C, 4D, Phase 5A and Phase 5B must already be certified. Phase 3 is not accepted as a waiver; its historical Storage blocker must either disappear in the fresh chain/runtime or it will fail the Phase-5C RLS/media gates.

## Commands
- `npm run qa:phase5c:local`
- `npm run qa:phase5c:runtime`
- `npm run qa:certify:phase5c`

## Success
`TrustWeave Production Certification: PRODUCTION_CERTIFIED`
