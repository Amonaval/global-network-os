# XP-6 — Invitation, Claiming & Correction Parity

## Closure
A shared network invitation lifecycle now supports create-by-email, expiration, resend (token rotation), revoke and authenticated acceptance. Productized verticals and Alumni expose the shared operational surface; Family retains its mature invitation implementation. Supabase Auth email is attempted server-side when the service role/mail path is configured. If the provider cannot deliver (including already-registered users), the same governed invitation remains usable through a private copied link rather than falsely claiming email was sent.

Acceptance activates membership and active-network context. Optional Productized entity targets can be claimed only when unowned; a user already owning another identity in that network is rejected to prevent duplicate claims. Existing Family/Alumni/Productized verified claim flows remain authoritative for their profile semantics.

Productized contribution/correction requests remain governed by admin accept/reject; XP-6 adds immutable review-history rows whenever contribution status changes.

## Certification
Source-complete. Migration 094, Supabase Auth mail configuration, new-user/existing-user email delivery, expiry timing and role/identity matrices must be exercised in staging before runtime certification.
