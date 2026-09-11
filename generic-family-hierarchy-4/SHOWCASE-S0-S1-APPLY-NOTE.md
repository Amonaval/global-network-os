# S0 + S1 — Showcase Control Plane & WOW Data Universe

## Implemented in this batch
- Added additive migration `099_showcase_control_plane.sql`.
- Launch Control now has per-vertical controls for Create, Playground, Featured, and curated Palette.
- Setup/creation screens consume the founder-controlled visibility settings with fail-safe legacy behavior if migration 099 is absent.
- Productized vertical shell applies the configured palette.
- Added curated Community and Residential palette variants: Signature, Warm, Modern, Classic, Minimal.
- Added authored source packs under `showcase-data/` for MPF Pune East and Emerald Heights CHS.
- Enriched Family Community and Housing Society demo content so more of the existing vertical capability appears populated in Playground mode.

## Deliberately not changed
- Phase 5A/5B/5C security work.
- Experimental storage migrations.
- Core navigation/first-login redesign (reserved for S2/S3).
- Backend vertical deletion or feature removal.

## Database action
Apply migration 099 to the main development Supabase project before expecting Launch Control network-type toggles to become editable. Until then the UI falls back to existing visibility behavior.
