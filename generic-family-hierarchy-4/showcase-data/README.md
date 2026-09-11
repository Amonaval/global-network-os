# Showcase data packs

These JSON files are **source/reference packs for deterministic Playground content**. They are checked into the application package so showcase stories can be reviewed and evolved alongside the code.

## Important: do not upload these manually

- Do **not** upload `mpf-east-showcase-data.v1.json` or `residential-showcase-data.v1.json` through the normal member/import UI.
- The current Playground is read-only and renders deterministic demo fixtures from the application; it does not require a Supabase data import.
- Repeatedly opening a Playground does not insert or duplicate database records.
- A future database-backed showcase seeder, if introduced, must use stable showcase IDs plus upsert/idempotency semantics and an explicit reset operation. It must never depend on repeated blind inserts.

## Current purpose

The packs are the authored reference for the richer MPF Pune East and Emerald Heights stories (families/units, events, governance, finance, visitors, assets, etc.). Runtime panels currently consume deterministic fixtures aligned to these packs.
