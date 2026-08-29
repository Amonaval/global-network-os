# NF-8 / NF-1→NF-8 Federation Runtime Verification Checklist

## Apply order
- [ ] Apply NF-1 affected files, then NF-2, NF-3, NF-4, NF-5, NF-6, NF-7, NF-8.
- [ ] Apply migrations `070` → `077` in numeric order after existing `069`.
- [ ] Confirm no migration/RPC signature conflict occurs.

## Build / integration
- [ ] Run clean dependency install in the normal project workspace.
- [ ] Run full TypeScript check.
- [ ] Run production build.
- [ ] Confirm every advanced My Networks dynamic import resolves.
- [ ] Confirm no `use client` ordering regressions.
- [ ] Run i18n audit.

## Launch Control
- [ ] All NF-1→NF-8 feature rows exist for six verticals.
- [ ] All remain TEST by default.
- [ ] Disabled capabilities do not render their UI.

## NF-1 Passport
- [ ] Owner/admin can save Passport.
- [ ] Member cannot author Passport.
- [ ] private/federation/public visibility behaves correctly.
- [ ] public route exposes no member/profile/relationship data.

## NF-2 affiliation
- [ ] Request requires outward Passport.
- [ ] Umbrella admin can approve/decline.
- [ ] Suspend/revoke works.
- [ ] Affiliation grants no member access.

## NF-3 umbrella runtime
- [ ] Approved participating Networks appear.
- [ ] aggregate readiness/capability data renders.
- [ ] no child member/private graph data appears.

## NF-4 directory
- [ ] Only directory-enabled Federation/Public Passports are discoverable.
- [ ] search/purpose filters work.
- [ ] Trust Receipt institutional route renders.
- [ ] results are Networks only.

## NF-5 purpose scopes
- [ ] eligible contexts require active membership + approved affiliation + declared Passport purpose.
- [ ] one purpose opt-in does not opt person into another purpose.
- [ ] selective outward snapshot only exposes chosen fields.
- [ ] withdraw/republish works.

## NF-6 trusted requests
- [ ] user can create request in eligible context.
- [ ] route refresh returns only current NF-5 opt-ins.
- [ ] requester cannot route to self.
- [ ] shortlist/dismiss works.
- [ ] no contact is revealed or target notified by routing alone.

## NF-7 introductions
- [ ] only shortlisted route can request introduction.
- [ ] pending target cannot see requester contact.
- [ ] decline reveals no private contact.
- [ ] accept requires target response channel.
- [ ] after accept both deliberately supplied channels are visible to participants.
- [ ] current federation/purpose eligibility is revalidated at acceptance.

## NF-8 outcomes / receipts
- [ ] accepted NF-7 introduction gets exactly one Trust Receipt.
- [ ] pre-NF-8 accepted introduction is backfilled on migration 077.
- [ ] requester can record/update only requester outcome.
- [ ] recipient can record/update only recipient outcome.
- [ ] each participant sees the Trust Receipt route/timeline.
- [ ] outcome note is participant-private and not visible publicly.
- [ ] requester can optionally close originating open request.
- [ ] recording an outcome does not alter memberships, affiliations or purpose opt-ins.
- [ ] no outcome is exposed as a public person score.

## UX
- [ ] My Networks remains usable with all NF features disabled.
- [ ] NF-1→NF-8 surfaces work in light/dark themes.
- [ ] mobile layouts are usable.
- [ ] loading/error/empty states are understandable.

## Closure
- [ ] Record all defects by introducing mission where possible.
- [ ] Fix and create one federation hardening affected-files ZIP.
- [ ] Update CURRENT-STATE, MISSION-STATUS, ROADMAP and handover docs.
- [ ] Only after this gate decide whether to start NF-9.
