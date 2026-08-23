# V1 — Family Alpha Release Certification

Status: **IMPLEMENTED IN SOURCE / RUNTIME + REAL-USER CERTIFICATION REQUIRED**

## Why this mission exists
Family Network now contains a large amount of capability. The V1 goal is not to add another feature area; it is to make sure a normal family can receive the app, create/recover an account, join a family, understand the product, and use the deliberately small Day-1 experience without the founder or a technical administrator standing beside them.

This mission is the release gate before the first 2–3 real-family pilot.

---

## 1. Launch Control ownership — clarified and strengthened

Launch Control is **not tied to one hard-coded email address**.

The security model is a dedicated `platform_owners` table keyed by Supabase Auth user ID. B0-A originally seeded the first legacy installation admin as the initial platform owner. V1 adds founder-only management so a current platform owner can:

- see every account that has Launch Control access;
- add another existing Family Network account by email;
- revoke another platform owner's access;
- review recent owner-access changes.

Database safeguards:

- family Owner/Admin role does not grant Launch Control;
- only an existing platform owner can add/remove platform owners;
- the target email must already belong to a Supabase Auth account;
- the final platform owner cannot be removed;
- ordinary authenticated users cannot read the platform-owner directory through direct table access.

Migration: `028_v1_alpha_release_certification.sql`.

---

## 2. Essential account journey added before Alpha

A regular user journey audit identified missing release basics that were more important than another feature batch.

### Password recovery
The sign-in panel now includes **Forgot password?**.

Flow:
1. User enters their email.
2. Supabase sends a private reset link.
3. Opening the link returns to Family Network.
4. The app recognizes the `PASSWORD_RECOVERY` auth event.
5. User chooses and confirms a new password.
6. User returns to their family.

### Signup confirmation recovery
If email confirmation is enabled and signup does not immediately create a session:
- the app clearly explains that confirmation is required;
- the user can **Resend confirmation email**;
- messaging tells the user to check inbox/spam rather than presenting a technical auth error.

### Human auth errors
Common sign-in errors are translated into useful actions:
- invalid credentials → retry or reset password;
- unconfirmed email → check confirmation email;
- password reset validation → matching 8+ character password required.

### Session/logout handling
The app now explicitly reacts to Supabase `SIGNED_OUT` state so expired/manual sessions return to the sign-in experience instead of leaving stale authenticated UI behind.

### Password usability
- password show/hide control;
- browser autocomplete hints for email/current/new password;
- mobile-friendly recovery controls.

---

## 3. Day-1 Alpha launch configuration

V1 adds a founder-only **Apply safe Day-1 preset** action.

The preset does not run automatically. When the founder deliberately applies it:

### Released
- Core family
  - Home
  - Family/tree
  - Family finding/directory
  - Profile
- Celebrate
  - birthdays/anniversaries/special days
- Family administration for authorized Owner/Admin users

### Test — platform owners only until deliberately promoted
- Memories
- Family history
- Places/map
- Community
- Gatherings
- Relationship exploration
- Contributions/help-family
- family/public sharing
- QR/print

This gives the first family a deliberately small product while keeping all existing source capability intact.

---

## 4. V1 end-to-end certification matrix

A source implementation is **not** a release certification. The following must be exercised against the real Supabase/Vercel environment.

### A. Fresh installation / migration
- Run clean `001 → 028` migration sequence.
- Run existing-instance `027 → 028` upgrade.
- Confirm no migration requires manual DROP/repair.
- Confirm only the intended first platform owner exists after B0-A bootstrap.
- Confirm additional platform owner can be added by email through Launch Control.

### B. Authentication
- New account signup.
- Email confirmation when enabled.
- Resend confirmation.
- Sign in.
- Wrong-password friendly error.
- Forgot password.
- Reset-link return to app.
- Set new password.
- Sign in with new password.
- Sign out and verify authenticated surfaces disappear.
- Session-expiry/sign-out recovery.

### C. Invitation / first visit
- valid invitation;
- wrong/already-used/expired/revoked invitation;
- identity-first “Is this you?” flow;
- existing account invited to a family;
- new account invited to a family;
- claim intended profile only;
- reach Simple family experience after claim without configuration work.

### D. Progressive experience
Normal member:
- Simple = Home · Family · Me as the primary journey;
- Connected adds the intended member capability only when founder/family controls allow it;
- Explorer adds advanced member exploration;
- changing experience never grants administration.

Family Owner/Admin:
- Manage family is available;
- member feature controls can only narrow founder-released functionality;
- cannot see Launch Control unless separately listed in `platform_owners`.

Platform owner:
- Launch Control visible;
- Test features visible for validation;
- Hidden features remain hidden;
- Pilot features visible only to selected family + platform owners;
- Released features respect family preference + experience + permission;
- multiple platform-owner management works and final-owner removal is blocked.

### E. Privacy/security
- anonymous/member/admin/invited-user RLS/RPC matrix;
- family A cannot access family B records/media;
- signed private media remains scoped;
- public pages expose only public-safe information;
- feature flags do not create authorization bypasses;
- platform-owner RPCs reject ordinary family admins.

### F. Normal family product journey
Without coaching, a low-frequency app user should be able to:
1. open a WhatsApp invitation;
2. understand which family invited them;
3. identify themselves;
4. create/sign into account;
5. reach Home;
6. open Family;
7. find a known relative;
8. understand/open the relative profile;
9. open their own profile;
10. return Home;
11. sign out and later sign back in;
12. recover the account if the password is forgotten.

Any point requiring verbal explanation is a V1 UX defect, not “user training”.

### G. Device/resilience
- Android Chrome narrow screen;
- iOS Safari;
- 320–430px widths;
- browser/text zoom;
- slow network;
- refresh/back button during auth and invitation flows;
- empty family / small family / 150-member family;
- no raw PostgreSQL/Supabase error text in normal user journeys.

---

## 5. Historical completeness reconciliation

V1 uses `B0-HISTORICAL-CAPABILITY-LEDGER.md` + `A1-A9-COMPLETENESS-AUDIT.md` as binding history.

The release review must classify each previously developed capability as exactly one of:

- **WORKING + RELEASED**
- **WORKING + INTENTIONALLY HIDDEN/TEST/PILOT**
- **IMPLEMENTED / VERIFY**
- **PARTIAL — follow-up preserved**
- **BROKEN — Alpha blocker**
- **DEFERRED — named future scope**

A hidden capability is never considered deleted, and a source implementation is never considered verified merely because a mission document once used the word “complete”.

Open A1–A9 follow-ups remain preserved for C1/C2/C3 after pilot evidence.

---

## 6. First pilot acceptance gate

V1 can be called **ALPHA CERTIFIED** only when all of these are true:

1. Production build succeeds.
2. Clean and upgrade migrations through 028 succeed.
3. Auth/signup/confirmation/password-reset/logout journey succeeds.
4. Invitation → claim → Simple Family succeeds.
5. Founder/Family Admin/Member boundaries succeed.
6. Cross-family privacy/RLS smoke matrix succeeds.
7. At least one 50+/60+ low-frequency app user completes the core journey without coaching.
8. At least one non-technical 30–50 user completes find-relative/profile/return journey without coaching.
9. No release-blocking raw error or broken mobile navigation remains.
10. Day-1 founder rollout state is intentionally chosen rather than accidentally inherited.

Until then status remains **IMPLEMENTED / CERTIFICATION REQUIRED**.

---

## 7. After V1

Launch to the founder's family + 2–3 trusted families.

Use B0-B to reveal capability gradually. Real observed friction becomes `B0-C.1`/V1 correction work before broad feature expansion.

Then resume the preserved bundled roadmap:
- C1 — Trust, Recovery & Accessibility
- C2 — Family Engagement Completion
- C3 — Real Alpha Scale

---

## 8. Preserved account-lifecycle follow-ups — do not mark silently complete

The ordinary-user audit also identified important account lifecycle needs that should remain visible after the first trusted-family Alpha rather than being forgotten:

### V1.1 — Account lifecycle & help
- change verified account email safely;
- leave a family without accidentally deleting historical family records (already overlaps preserved A3.4/C1 scope);
- request account deletion while preserving governed genealogy/history semantics;
- revoke other sessions/devices when an account is suspected compromised;
- simple **Need help?** path to the relevant family admin/support contact;
- versioned Terms/Privacy acknowledgement before broad/public self-service launch.

These are intentionally preserved as follow-up scope. They should not be described as completed by the password-recovery work in V1.

## Addendum — Pre-Alpha family feedback gate (2026-08-23)

V1 certification now additionally requires:

- migration 029 applies cleanly after 028;
- non-platform users cannot directly create a family;
- a signed-in user can submit one pending family-creation request;
- platform owner(s) can see, approve and reject requests in Launch Control;
- approval creates the family and makes the requester its `owner`;
- rejection creates no family tenant;
- the last platform owner protections from V1 remain intact;
- mobile browser uses the device viewport and the application shell fills the viewport without the previously reported large blank left area;
- member relationship access remains read-only in both UI and RLS/RPC verification.

Feedback-derived future items are tracked in `PRE-ALPHA-FAMILY-FEEDBACK-PRIORITIZATION.md`; their presence in the roadmap must not be interpreted as current completion.
