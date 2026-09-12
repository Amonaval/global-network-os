# Showcase S2 — First Impression Foundation

## Scope completed

This mission follows S0/S1 and deliberately changes only the first-impression and showcase-entry surfaces.

### 1. Showcase visibility is enforced everywhere

- `SetupScreen` filters Create and Playground choices using `platform_showcase_verticals`.
- `MyNetworksHome` / “Back to network selection” now fetches the same showcase settings and renders only Playground-enabled verticals.
- `NetworkApp.openNetworkPlayground()` re-checks Launch Control before opening a Playground, so a stale/alternate UI path cannot open a hidden vertical.
- Alumni/productized creation callbacks re-check `create_enabled` before creating.

### 2. First sign-in impression

Anonymous sign-in is now TrustWeave-wide rather than Family-only and explains the three flagship mental models:

- Family
- Community / Cultural Association
- Residential Community

### 3. First authenticated setup

The primary entry is now focused on:

- Create Family
- Create Community / Cultural Association
- Create Residential Community
- Explore Playground

Any other network types explicitly enabled in Launch Control remain available under a secondary “More network types” disclosure rather than crowding the primary decision.

### 4. Playground selection

Playground selection is now a dedicated, read-only gallery containing only verticals enabled by Launch Control.

### 5. Showcase data pack contract

`showcase-data/*.json` are authored source/reference packs only. They are **not** manually uploaded to Supabase.

The current Playground is deterministic and read-only. Reopening it does not insert records. A future database-backed showcase seeder must use stable IDs/upserts and explicit reset semantics.

## Database requirements

No new S2 migration is required.

The S0 control-plane migrations must already be present:

- `099_showcase_control_plane.sql`
- `100_showcase_default_visibility_fix.sql` if 099 was applied from the original S0 package

## Validation

- `npm run validate:showcase-s2` — 9/9 PASS
- FCA-0 source gate — 27/27 PASS
- Housing Society HS0–HS5 source gates — PASS
- i18n extraction audit — 0 visible literal candidates

Repository-wide typecheck remains outside this package’s proof because the certified baseline contains the previously identified Phase-4B QA source syntax issue and this working container did not have dependencies installed. Changed TSX files were syntax-parsed with TypeScript with no parse errors.

## Next recommended mission

S3 — Navigation & Progressive Disclosure.

Do not expand features yet. Reduce primary navigation per vertical/role and move advanced/platform concepts into contextual More / Manage surfaces.
