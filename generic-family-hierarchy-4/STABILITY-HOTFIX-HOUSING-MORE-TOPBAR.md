# Stability Hotfix — Housing Booking Type, Persistent More, Playground Topbar

## Fixes

1. **HousingSocietyHome booking type**
   - `HsBooking` does not contain `unitLabel`.
   - Demo bookings now use the real `unitEntityId` contract.
   - The Home booking card displays `purpose` with a resident-booking fallback instead of reading a nonexistent field.

2. **Desktop More remains expanded**
   - Family and productized desktop navigation no longer forcibly remove the `<details open>` state after selecting a More item.
   - Mobile More sheets still close after selection because they are modal overlays.

3. **Family Playground topbar de-clutter**
   - `NetworkTopbar` now supports `middleFullRow`.
   - Family Playground renders its temporary/demo banner on its own full-width row rather than squeezing network title, appearance, language and account actions.
   - No `globals.css` replacement is included in this hotfix, protecting E9/E10 styles.

4. **Supabase sign-in clarification**
   - The previously missing `.env.local` explains the observed anonymous/local setup screen.
   - No further normal Supabase sign-in flow changes are made in this hotfix.

## Validation
- Changed TSX syntax transpile: PASS
- Showcase Flow Repair: 9/9 PASS
- Showcase Stabilization: 14/14 PASS
- Residential Flagship: 12/12 PASS

## Files
- `components/HousingSocietyHome.tsx`
- `components/NetworkApp.tsx`
- `components/TemplateNetworkApp.tsx`
- `components/shared/NetworkTopbar.tsx`
