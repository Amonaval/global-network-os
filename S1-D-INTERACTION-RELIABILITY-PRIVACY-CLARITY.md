# S1-D — Interaction Reliability & Privacy Preview Clarity

Status: **IMPLEMENTED IN SOURCE / LIVE VERIFY**  
Date: 2026-08-23

This is an S1 closure mission discovered during hands-on Alpha review. It does **not** advance the roadmap to S2; it removes interaction traps and misleading controls that would weaken first-session trust.

## Implemented

- User-verified layout fixes are retained as canonical: general `.card { padding: 10px; }`, `button.home-memory-tile { margin-bottom: 10px; }`, profile overlay remains above the app, and `UsersRound` is imported where used.
- Clicking the backdrop dismisses all ordinary dismissible popups: profile form, relationship manager/explorer, life-event editor, import assistant, invitation modal, memory-share modal and Help.
- Profile drawer already supported backdrop dismissal and remains unchanged.
- Authentication / password recovery intentionally remains non-dismissible by backdrop when it is the blocking entry surface; there is no meaningful underlying authenticated screen to return to.
- The admin-only Public / Member / Admin dropdown is retained because privacy preview is useful, but is renamed to **Preview profile privacy as** so it does not pretend to emulate the whole application role.
- Privacy preview now consistently simulates the chosen audience for profile details, contact information, public/social links, profile life events and profile memories.
- Public preview no longer leaks admin-only contact information merely because the current operator is an administrator.

## Why this belongs in S1

A first-time or low-frequency user interprets a modal that will not dismiss, or a privacy preview that shows the wrong information, as product unreliability. These are trust and comprehension failures, not cosmetic issues.

## Behaviour verification still required

1. Open every ordinary popup on desktop and 360/390/430 mobile; click/tap outside and verify dismissal without accidental save.
2. Confirm clicks *inside* a popup do not close it.
3. As Family Owner/admin, open a profile and compare Public visitor / Family member / Family admin preview for a member whose profile/contact/event/memory visibility differs.
4. Confirm a normal family member never sees the admin preview control.
5. Confirm authentication and password-reset entry surfaces do not disappear into an unusable blank state.

## Gate

S1 remains **IMPLEMENTED IN SOURCE / LIVE VERIFY** until the full deployed persona matrix and novice mobile tests pass. S2 remains blocked.
