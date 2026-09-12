# Mission 7-B Runtime Verification Checklist

## Build gates
- [ ] `npm ci`
- [ ] `npm run validate:m7b`
- [ ] `npm run check:types`
- [ ] `npm run build`
- [ ] Confirm the prior `Can't resolve './CrossNetworkDiscovery'` error is gone.

## Showcase smoke test
- [ ] Open **My Networks**.
- [ ] Confirm **Experience the Network Effect** is visible.
- [ ] Confirm header shows 720 synthetic people, six network types and seven stories.
- [ ] Select at least one direct-path scenario.
- [ ] Advance all seven stages through useful outcome.
- [ ] Confirm the target person's identity is hidden at the anonymous-match stage.
- [ ] Confirm identity appears only at the consent-accepted/reveal stage.
- [ ] Select at least one two-hop story and confirm the path visibly contains three networks.
- [ ] Use **Restart** and **Try another story**.
- [ ] Verify mobile/narrow layout does not overflow.

## Live-product regression
- [ ] Existing Network Bridge Manager still loads.
- [ ] Existing Trusted Cross-Network Discovery still loads.
- [ ] Existing Network Effect Pulse still loads.
- [ ] Existing network switching remains unchanged.

## Pass criteria
M7-B can be runtime-certified when build/type gates pass, the missing-module error is resolved, all seven synthetic stories are selectable, direct/two-hop storytelling is understandable, and privacy sequencing remains clear.
