# NF-1 Runtime Verification Checklist

## A. Migration / feature gate
- [ ] Apply `070_nf1_network_passport.sql` after migration 069.
- [ ] Confirm six `*.advanced.network_passport` feature rows exist and default to `test`.
- [ ] Confirm Playground rows exist and are disabled by default.

## B. Owner/Admin authoring
- [ ] Enable Network Passport for one test network/vertical in Launch Control.
- [ ] Open My Networks as Owner/Admin and confirm the Passport editor appears.
- [ ] Save a valid slug, tagline, summary, geography, capabilities and scopes.
- [ ] Refresh and confirm values persist.
- [ ] Attempt save as a regular member and confirm no authoring surface / RPC authorization.
- [ ] Attempt duplicate slug on a second network and confirm uniqueness is enforced.
- [ ] Attempt an `http://` external URL and confirm it is rejected; `https://` succeeds.

## C. Visibility behavior
- [ ] `private`: direct `/passport/<slug>` returns unavailable.
- [ ] `federation`: direct public route remains unavailable.
- [ ] `public`: direct public route renders the Network Passport.
- [ ] Switching public → private immediately removes anonymous availability.
- [ ] Directory-discoverable is forced false when visibility is private.

## D. Privacy regression
- [ ] Inspect anonymous RPC payload and confirm it contains no member names, contacts, member IDs, relationship rows, media or private topology.
- [ ] Confirm existing `/public` member directory behavior is unchanged.
- [ ] Confirm M6 bridge/discovery/introduction behavior is unchanged.
- [ ] Confirm affiliation has not been implicitly created anywhere.

## E. UI / responsive
- [ ] Passport editor and preview render cleanly in light/dark themes.
- [ ] Mobile width stacks editor/preview without overflow.
- [ ] Copy/open-public actions work only for public visibility.
- [ ] Public Passport official external link permits HTTPS only.

## F. Source validation already completed
- [x] NF-1 source gate PASS.
- [x] i18n AST visible-literal audit PASS (0).
- [x] TypeScript syntax transpile PASS for all new NF-1 TS/TSX.
- [ ] Full `npm run check:types` — blocked in packaged execution workspace because `npm ci` timed out and left missing third-party type libraries (`react`, `node`, `d3-*`, `leaflet`, etc.). Re-run in a complete dependency workspace.
- [ ] `npm run build` in normal installed project workspace.
