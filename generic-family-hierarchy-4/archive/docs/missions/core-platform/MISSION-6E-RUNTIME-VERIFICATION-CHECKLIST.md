# Mission 6-E — Runtime Verification Checklist

## Automated
- Apply `061_m6e_governed_multihop_trusted_paths.sql`.
- `npm ci`
- `npm run validate:m6e`
- `npm run check:types`
- `npm run build`

## Direct-path regression
1. Keep an existing accepted A↔B discovery bridge with path traversal OFF.
2. Search from A for a matching claimed person in B.
3. Verify the normal M6-C anonymous result still appears as **Direct trusted bridge**.
4. Request/accept one introduction and confirm identity stays hidden until consent.

## Two-hop governed path
Prepare A↔B and B↔C accepted bridges with discovery + introductions + path traversal enabled on both.
1. User belongs to A.
2. Put a claimed matching person in C.
3. Search from A.
4. Verify an anonymous C opportunity can appear with **Two-hop trusted path** and a governed path explanation.
5. Verify the person's identity is still hidden.
6. Request introduction; target in C can accept/decline normally.
7. After acceptance, identity becomes visible as in M6-C.

## Negative governance tests
- Turn path traversal OFF on either edge: A must not discover C via that two-hop path.
- Revoke either bridge after discovery but before introduction request: request must fail.
- Keep discovery ON but introductions OFF on either edge: discovery may occur but introduction request must fail.
- Verify no depth-3 result is returned from A→B→C→D.

## Measurement
After one two-hop discovery, refresh Network Effect Pulse and verify **Multi-hop opportunities** increases.

## Pass condition
M6-E is runtime certified when direct M6-C behavior remains intact, two-hop traversal works only with explicit per-edge consent, revocation blocks stale paths, identity remains consent-gated, and no depth >2 traversal occurs.
