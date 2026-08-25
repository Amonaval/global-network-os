# Pilot Launch Visibility — Recommended Defaults

This is the canonical default exposure policy for the real-user learning pause. Platform Owner can override it in Launch Control at any time.

| Capability | Real families | Playground | Why now |
|---|---|---|---|
| Home / Family / Directory / Profile | Released | Visible | Core comprehension and family value |
| Explore & Guide | Released | Visible | Self-service understanding and feedback |
| Special Days | Released | Visible | Safe emotional return value |
| Memories | Released (Connected+) | Visible | Core emotional value / contribution signal |
| Family History | Released (Explorer) | Visible | Strong preservation/discovery value |
| Family Pulse | Released (Connected+) | Visible | Small, meaningful next actions |
| Quiet Family Digest | Released (Connected+) | Visible | Return loop without noisy feed |
| Contributions / Invitations | Released (Explorer/admin where required) | Visible | Essential network growth |
| Relationship Explorer | Released (Explorer) | Visible | Strong first-wow candidate |
| Gatherings | Pilot | Visible | Useful but not needed for every Alpha family |
| Share with family | Pilot | Visible | Growth-capable but requires careful privacy observation |
| Places | Test | Visible | Privacy-sensitive and non-core for activation |
| Community network | Test | Visible | Wider-network value needs controlled validation |
| Trusted introductions | Test | Visible | Consent/trust-sensitive; validate before release |
| Public profiles | Test | Hidden | Distribution/privacy surface not needed for activation proof |
| Print & QR | Test | Hidden | Distribution surface; defer until demand |
| Family administration/import/governance | Released to eligible roles | Not a member Playground surface | Required to operate families |

`Simple / Connected / Explorer` experience levels remain a second layer after founder rollout. A Released Explorer feature does not clutter a Simple user's navigation.

## S3-A1 launch addition — 2026-08-25

`contribute.branch_intake` — **PILOT** for real families. Platform Owner can exercise it for controlled testing; Pilot targeting uses the existing Launch Control family list. The public token form is available only for valid links created under an enabled/pilot intake. It does not grant membership or family-read access. Playground registry may advertise the capability, but the real save/commit flow is not executed in no-save Playground.


## Mission closure coupling — 2026-08-25

Launch Control is now a mandatory checkpoint in the mission closure lifecycle:

**IMPLEMENT → VALIDATE → GUIDE → PLAYGROUND → LAUNCH CONTROL → WHAT'S NEW → ROADMAP/STATUS → CLOSE**

For every meaningful user-facing mission:
- record whether it is Hidden, Test, Pilot or Released for real families;
- record Playground visibility separately;
- keep Guide and What's New claims consistent with that rollout;
- never expose a privacy-sensitive feature merely because its source implementation exists.

### S3-A1
`contribute.branch_intake` remains **Pilot** for real families. Playground should receive a separate safe no-save demonstration during the S3-A1 closure patch. The real anonymous token/RPC flow must not be invoked from Playground merely to demonstrate the feature.
