# S2-D — Quiet Family Digest + Return Engine

Status: **IMPLEMENTED IN SOURCE / LIVE VERIFY**

## Goal

Turn the living family network into a calm reason to return without creating another noisy social feed.

The product loop remains:

**Discover → Feel → Contribute → Share → Return**

S2-D compresses the useful parts of that loop into a private weekly/monthly digest.

## Implemented

- Home-level Quiet Family Digest, including Simple experience.
- 1–3 preview highlights before expanding.
- Upcoming birthdays and relevant family-history moments.
- Recent memories, new family members, gatherings, open contribution prompts and trusted-introduction changes.
- Per-user digest preferences: weekly/monthly/off, preferred weekday and topic controls.
- Privacy-safe digest sharing: only rendered highlight text is shared; private profile/contact/tree data is not exported.
- Digest state: last opened/shared, open/share counts.
- Retention instrumentation: `digest_open`, `digest_return` (return after 3+ days) and `digest_share`.
- Living-loop admin scorecard includes digest opens, digest returns and digest shares.
- Playground uses simulated digest data and performs no digest writes.

## Deliberate boundary

S2-D does **not** hard-code an email/push provider. The digest is useful in-app immediately and preferences are stored now. Scheduled external delivery remains an integration layer for a later deployment mission (for example Supabase scheduled function + configured email provider) and must honor the exact same preference/privacy rules.

The preferred weekday is stored so delivery infrastructure does not require a future schema redesign.

## Privacy rules

- A digest is generated only for an authenticated member of the active family.
- Community introduction summaries are shown only to users already party to that introduction.
- No phone/email/private cross-family data is included.
- Shared digest text contains only the visible digest highlights.
- Direct digest state tables remain unavailable to browser clients; RPCs govern access.

## Live behavior gate

1. Returning member sees a short useful summary rather than a feed.
2. Digest expands on 360/390/430px without overflow.
3. Turning categories off removes them from the generated digest after save.
4. Digest Off does not remove private in-app access; it represents delivery cadence preference.
5. Opening after 3+ days records a digest return.
6. Native share and clipboard fallback both work without leaking private fields.
7. Playground interactions do not write to a real active family.
8. Family Owner metrics reflect real digest opens/returns/shares.

## Not complete until

Real pilot families demonstrate repeat returns attributable to the digest. Source implementation alone is not retention proof.
