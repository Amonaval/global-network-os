# Mission 6-A — Runtime Verification Checklist

## Automated
- `npm run validate:m6a`
- `npm run check:types`
- `npm run build`

## Database
- Apply `057_m6a_trusted_identity_reach.sql`.
- Signed-out RPC call must not expose useful cross-network data.

## My Networks
1. Sign in with an account that belongs to multiple networks.
2. Open **My Networks**.
3. Confirm **Your Network Reach** appears.
4. Active-network count should match active memberships.
5. Network-type count should reflect the distinct verticals you belong to.
6. Distinct member accounts should be an aggregate only; no new cross-network person list should appear.
7. Identity-linked contexts may be lower than active networks where you have membership but have not claimed/linked the network-local profile/entity.
8. Switch into Family, Alumni and a productized vertical and confirm existing behavior remains unchanged.

## Privacy regression
- No network should reveal another network's member list, profile fields or relationships.
- My Networks must show aggregate counts only.
- No silent profile merge should occur.

## Pass
M6-A is runtime accepted when source/type/build gates pass and the Network Reach card reflects the signed-in account without changing network-local privacy or switching behavior.
