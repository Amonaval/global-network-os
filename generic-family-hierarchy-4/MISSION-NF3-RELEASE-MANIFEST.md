# NF-3 Release Manifest

## Release
- Mission: NF-3 — Umbrella Network Runtime
- Date: 2026-08-29
- State: source implemented; integrated runtime/deployed smoke intentionally deferred
- Launch Control: TEST by default

## Product changes
- New umbrella operating dashboard where Networks are the governed participants.
- Approved participating-network directory based on NF-2 affiliations + permitted NF-1 Passport fields.
- Aggregate federation readiness, Passport coverage/freshness, vertical diversity, capability mix and declared scope mix.
- Source Passport privacy changes are respected at read time.

## Database
- `072_nf3_umbrella_network_runtime.sql`
- `get_my_umbrella_runtime_summaries()`
- `get_umbrella_network_participants(uuid)`
- feature registration `*.advanced.umbrella_runtime`

## Client/runtime
- `FederationUmbrellaRuntime` is dynamically imported from My Networks.
- New federation runtime types and remote adapter are isolated under `core/federation` and `capabilities/federation`.

## Security/privacy
- RPCs require Umbrella Owner/Admin authorization.
- Network directory includes only approved affiliations.
- Outward fields are returned only while the source Passport is `federation` or `public`.
- Migration intentionally does not query child-network member/profile/contact/relationship tables.
- Federation readiness uses only affiliation and Passport metadata.

## Strategic continuity
- NF-0A: federation as distribution supernode.
- NF-1: governed Network Passport.
- NF-2: governed Network↔Umbrella affiliation.
- NF-3: operational network-of-networks runtime.
- Next: NF-4 privacy-safe federated directory/discovery.
