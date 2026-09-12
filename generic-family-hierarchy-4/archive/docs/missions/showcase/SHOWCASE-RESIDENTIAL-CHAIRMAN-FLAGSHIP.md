# Residential Chairman Flagship

## Mission
Create a chairman-first Residential Community / Housing Society home without removing or replacing any certified Housing Society capability.

## Preservation contract
- No original project file was removed from the consolidated stable baseline.
- This mission does not modify `verticals/housing-society/runtime/composition.ts`.
- This mission does not modify the existing HS core/operations/finance/governance/security panels.
- Existing modules remain reachable through the existing primary navigation and More menu.
- Launch Control continues to control vertical discovery (Create / Playground / Featured), not existing network membership or certified module existence.

## New flagship home
`components/HousingSocietyHome.tsx` provides a summary/control surface for a chairman/admin while remaining useful to residents.

It shows:
- open complaints
- outstanding dues / overdue homes
- visitors today
- committee actions
- compliance due
- assets needing attention
- urgent notices
- maintenance collection snapshot and funds
- amenity bookings / community events
- committee members and resolutions
- asset and compliance attention
- homes / residents / amenities at a glance

Every action deep-links to the existing certified module rather than duplicating its workflow.

## Live vs Playground
For real societies the dashboard uses existing HS2/HS3/HS4/HS5 snapshot RPC adapters. Playground uses deterministic showcase snapshots. It does not write showcase data to Supabase.

## i18n
New high-visibility dashboard labels were added to English, Hindi and Marathi message catalogs.

## Validation
- Residential flagship source gate: 12/12
- HS-0: 24/24
- HS-1: 27/27
- HS-2: 26/26
- HS-3: 28/28
- HS-4: 28/28
- HS-5: 28/28
- Changed TS/TSX/locale syntax: PASS
- Housing composition and existing HS panels: byte-for-byte unchanged from repaired baseline

## No database migration
No new migration is required for this mission.
