# NF-7 Runtime Verification Checklist

Run this during the planned NF-1 → NF-8 sequential verification round.

- Apply migration `076_nf7_governed_federated_introductions.sql` after `075`.
- Confirm six `*.advanced.governed_introductions` Launch Control rows exist and default to TEST.
- Confirm NF-7 appears only when enabled and its JS chunk is lazy-loaded.
- Create NF-6 request, refresh routes and shortlist one eligible target.
- Confirm only shortlisted routes appear in NF-7 introduction composer.
- Request introduction with alias/message/contact note.
- As target, confirm alias/message/Trust Receipt are visible but requester contact note is NOT visible while pending.
- Decline: confirm no requester contact is revealed.
- Repeat and accept with target response channel: confirm both deliberately supplied contact notes become visible after acceptance.
- Deactivate target NF-5 purpose profile before accepting: acceptance must fail.
- Make target Passport private/remove purpose before accepting: acceptance must fail.
- Suspend/revoke target or source umbrella affiliation before accepting: acceptance must fail.
- Cancel pending introduction as requester; target must not be able to accept afterward.
- Verify no source-network email/phone/member/private graph data appears in NF-7 payloads.
- Verify existing NF-1 through NF-6 behavior remains intact.
- Verify mobile/light/dark layouts.
- During NF-8 closure, run full project TypeScript/import/build sweep across NF-1 through NF-8 and fix accumulated compile/import issues before runtime certification.
