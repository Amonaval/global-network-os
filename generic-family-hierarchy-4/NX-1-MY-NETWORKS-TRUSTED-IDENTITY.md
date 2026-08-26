# NX-1 — My Networks & Trusted Identity Experience

## Outcome
Make the Generic Network OS thesis visible: one authenticated person can participate in multiple independently governed networks without merging their profiles or graphs.

## Delivered
- First-class `My Networks` home with active memberships across Family, Alumni, Organization, Business Trust and Franchise.
- Generic cross-vertical switching from the Family shell using the neutral `NetworkSwitcher`.
- Account-scoped `TrustedPersonIdentity` aggregate as the minimum trusted-person seam.
- Explicit privacy rules: network-local profiles, private memberships, explicit portability, no graph merge.
- Multi-vertical Playground entry from `My Networks`.
- Fixed neutral membership classification so Organization, Business Trust and Franchise no longer fall back to Family.

## Architecture decision
NX-1 does **not** add a new global profile table.

`auth.users` remains the authentication/person anchor for this phase. Existing Family, Alumni and generic entity/profile persistence remains vertical-owned. The new trusted-person aggregate contains only the signed-in person's own membership contexts.

```text
Authenticated account / trusted person anchor
             |
      +------+------+------+...
      |      |      |
 membership membership membership
      |      |      |
 Family   Alumni   Organization
 profile  profile   context
```

This preserves the rule:

**identity != membership != profile/entity != network**

## Privacy invariant
A shared person anchor never authorizes one network to read another network's members, relationships, profile fields, activity or graph. Any future portability, discovery or introduction must be explicit and capability-scoped.

## Product intent
The user should experience the platform as a trusted home for meaningful networks, not as a Family application with hidden multi-tenant plumbing.

## Launch Control / release classification
My Networks is an always-on core shell capability for authenticated multi-network users. It is not separately feature-flagged because disabling it would hide the active network context model itself. Cross-network discovery/trust capabilities remain separately gated future work.

## Deferred intentionally
- global identity merge/recovery workflows
- portable profile fields
- cross-network discovery
- trust edges outside existing Family prototype
- persistent cross-network profile binding table
- enterprise identity/entitlements

Those require evidence or later privacy-sensitive missions.
