# NX Feature Review Map

NX remains enabled by default. This is a review/debug seam, not a product feature flag system.

## Enable review mode
Open browser DevTools Console:

```js
window.nxFeatures = true
```

Within about 300 ms the **NX Review Mode** panel appears. Toggle NX-1…NX-6 individually. Choices persist locally for review. Hide the panel with:

```js
window.nxFeatures = false
```

Normal app behavior is unchanged while review mode is false.

## Version map
| Version | Main code/surface | Review behavior |
|---|---|---|
| NX-1 | `MyNetworksHome`, trusted identity / multi-network entry | My Networks entry is review-tagged; architecture remains intact for safety. |
| NX-2 | `LivingFamilyLoop`, Family Digest | Today/Living Network surface can be disabled. |
| NX-3 | `FamilyTimeMachine` | Legacy/Time Machine can be disabled. |
| NX-4 | `FamilyGrowthRelay` | Growth Relay can be disabled in Participation. |
| NX-5 | `FamilyBelonging` | People/Belonging can be disabled. |
| NX-6 | `FamilyExperienceHub`, NX6 Home/My Networks composition | Family Experience Hub can be disabled; enabled NX2/3/5 modules render separately for comparison. |

## Tagging convention
- TS/TSX: `// [NX-N] ...`
- CSS: `/* [NX-N] ... */`
- Cross-version code may carry multiple tags.

## Safety rule
The review switch hides/recomposes visible NX experiences only. It does **not** roll back database schema, tenancy, identity, privacy or shared architecture. Removing those underneath a running modern build would make review results misleading and destabilize later releases.
