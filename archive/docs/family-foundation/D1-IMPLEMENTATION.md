# D1 — Production Participation Release

## Delivered

- **Gate-ready baseline:** sequential migrations `001`–`016`, private media authorization retained, hardened public headers, a repeatable source/security gate, and an explicit live staging matrix.
- **Invitation and claiming:** batches up to 200, strong single-use tokens, opened/active/accepted/expired/revoked status, resend/revoke, existing-account and new-account activation, and invitation CSV export.
- **Contribution engine:** deterministic missing-field, orphan, possible-duplicate, and incomplete-relationship prompts; member/admin scoping; accept, complete, and dismiss actions; no LLM dependency.
- **Distribution:** locally generated QR codes, public member deep links, printable/downloadable cards, public-directory embed mode, minimized public fields, and deduplicated anonymous share/view counts.
- **Community validation:** connected branch/household/circle groups, reunion/event creation, going/interested/not-going responses, guest totals, and participation measurement.
- **Success dashboard:** invitation, claim, activation, contribution, share/view, returning-member, admin-effort, and event-response indicators.

## Security boundaries

- Raw invitation tokens are returned only at creation/resend and never stored; PostgreSQL stores SHA-256 hashes.
- Revoked, expired, accepted, already-claimed, and cross-linked-account claims are rejected in the acceptance RPC.
- Contribution suggestions are visible only to an administrator or the account linked to the target member.
- Public deep-link RPCs return the same minimal field set as the public directory and require `profile_visibility='public'`.
- Public analytics store no email, phone, account ID, IP address, or raw browser token. A browser-generated token is hashed and used only for five-minute deduplication.
- RSVP identity is not returned by the event aggregate RPC. Members see their own response and aggregate counts.
- All D1 privileged RPCs use fixed `search_path`, explicit grants, and server-side actor checks.

## Verification completed locally

- Dependency installation and the committed lockfile include the local QR generator.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass; routes include `/`, `/invite/[token]`, `/public`, and `/public/member/[id]`.
- `node validate-demo.mjs`: pass.
- `node scripts/d1-source-gate.mjs`: pass.

Live staging/database, real email confirmation, signed-URL expiry, Vercel runtime, and real-account role-matrix evidence remain deployment-environment checks; see `D1-RELEASE-GATE.md`.
