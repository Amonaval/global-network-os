# NF-1 → NF-8 Build Typing Hardening

Purpose: fix strict TypeScript inference leaks from Supabase RPC adapters after applying the federation missions together.

Changes:
- Added explicit Promise return types to NF-2 → NF-8 federation remote adapters so RPC `data` typed as `any` cannot leak `any` into UI callback parameters.
- Added explicit `FederatedOutcomeCandidate` callback typing in `FederatedOutcomeTrustReceipt.tsx` as a defensive local guard.
- No database schema, Launch Control, authorization, routing, or UI behavior changes.

Verified:
- Every exported async function in the included federation remote adapters now has an explicit Promise return type.
- NF-8 component syntax transpiles successfully.
- Launch Control registry remains unchanged; NF-0A → NF-8 stay independent TEST-by-default federation capabilities.
