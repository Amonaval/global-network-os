# Stability Hotfix — Anonymous Playground Must Never Trap Sign-In

## Reported regression
From the engagement checkpoints, an anonymous visitor could reach Playground and then perceive Playground as the only usable surface, with no obvious way to authenticate. This is a release blocker because Playground is meant to encourage conversion, not replace sign-in.

## Hotfix contract
- The existing anonymous sign-in landing remains intact.
- Family Playground now exposes an explicit **Sign in** CTA in the Playground banner and account menu.
- Productized Playground and Alumni Playground expose **Sign in** in their account menus.
- The sign-in action clears temporary demo state and opens the existing authentication surface.
- Existing Playground, My Networks, creation and authenticated navigation behavior is not removed.

## Validation
Run:

```bash
npm run validate:stability-anonymous-login
npm run validate:showcase-flow-repair
npm run validate:showcase-stabilization
npm run validate:engage-e8
```

## E9 build blocker still requiring the actual E9 source file
The reported `NetworkPostsPanel.tsx` error is real: an `await` is currently inside a non-`async` callback/function. The safe fix is to move asynchronous deep-link loading into an async function/IIFE from the effect rather than marking the React effect callback itself `async`.

The E9 source file is not contained in the last certified E8 checkpoint available in this session, so it is intentionally **not guessed or fabricated** in this hotfix. Apply this login hotfix first; then patch `NetworkPostsPanel.tsx` from the exact E9 file and rerun the build.

## Next mission after stability
The planned Discovery / Product Exploration transformation remains frozen until E9/E10 compile and runtime stability are restored.
