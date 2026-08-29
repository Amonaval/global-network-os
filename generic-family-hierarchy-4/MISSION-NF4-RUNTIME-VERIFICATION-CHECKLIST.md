# NF-4 Runtime Verification Checklist

**Current status:** deferred by founder decision until the federation source batch is complete and applied sequentially.

## Source verification completed
- [x] NF-4 dedicated source gate passes.
- [x] New/modified TypeScript files pass isolated TypeScript syntax transpilation.
- [x] NF-4 SQL contains no known child-network Family/Alumni/Organization person or relationship-table dependency.
- [x] Feature is TEST by default and dynamically imported.
- [x] Full `tsc --noEmit` attempted; blocked by incomplete local third-party type definitions (React/Node/Leaflet/D3/etc.), not an NF-4-specific diagnostic.

## Apply-time database verification
- [ ] Apply migrations 070 → 071 → 072 → 073 in order.
- [ ] Confirm `search_federated_network_directory` exists and authenticated role can execute it.
- [ ] Confirm `*.advanced.federated_directory` rows exist in TEST state.

## Functional scenario
- [ ] Create/identify source Network A and target Network B.
- [ ] Give both Federation/Public Passports; target Passport must be directory-discoverable.
- [ ] Approve A→Umbrella and B→same Umbrella affiliations.
- [ ] Sign in as an active member of Network A.
- [ ] Enable NF-4 in Launch Control for the active vertical/pilot.
- [ ] Search and confirm Network B appears.
- [ ] Confirm trust route shows A → Umbrella → B.
- [ ] Filter by one declared capability/scope and confirm matching behavior.

## Privacy regressions
- [ ] Set B Passport to Private; confirm B disappears immediately without deleting affiliation.
- [ ] Set `directory_discoverable=false`; confirm B disappears.
- [ ] Suspend/revoke B affiliation; confirm B disappears.
- [ ] Confirm no member names, emails, contacts, Family tree, Organization graph or internal relationships appear.
- [ ] Confirm a declared purpose does not reveal people from target network.

## Regression
- [ ] Existing My Networks basic flow works with NF-4 disabled.
- [ ] NF-1 Passport manager still works.
- [ ] NF-2 affiliation manager still works.
- [ ] NF-3 umbrella runtime still works.
