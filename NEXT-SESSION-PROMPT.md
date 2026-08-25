# NEXT SESSION — G6 Two-Vertical Architecture Proof & Hardening

Start from the certified G5 codebase (G0→G5 applied, including migration 045).

## Mission
Implement **G6 — Two-Vertical Architecture Proof & Hardening** as one consolidated High-effort batch.

Use real Family + Alumni behavior to find and remove accidental coupling. Priorities:
1. tenant/cross-vertical RLS and RPC isolation audit,
2. Family ↔ Alumni switching and active-network context hardening,
3. feature/Guide/Playground/Launch Control/What's New vertical scoping,
4. performance and unnecessary cross-vertical hydration/network calls,
5. migration/deployment compatibility and rollback-safe checks,
6. architecture rules/gates proving neither vertical leaks into the other,
7. high-level runtime smoke only; do not demand hours of manual regression.

Preserve Family behavior and Alumni V1 behavior exactly unless a verified defect requires a fix. Update architecture docs, validation, release manifest and affected-files ZIP at closure.
