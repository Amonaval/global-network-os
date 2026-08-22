# A7 — Alpha Launch & Family Delight Bundle

Implemented as one coordinated batch rather than minor missions.

1. **Activation:** Admin Center now shows a four-step Alpha launch checklist: add/import, invite three, improve family health, export backup.
2. **Family health & duplicate safety:** visible health score based on exact-name/date duplicate candidates, unconnected profiles and incomplete profiles. No automatic merge is performed.
3. **Continuity & recovery:** backup area explicitly warns when fewer than two admins exist and points the Owner to role management; CSV/JSON/print backup remains one click.
4. **20-family pilot readiness:** Admin Center consolidates the operational signals an Owner needs without SQL/Supabase: claims, invites, approvals, health, admins and storage.

## Verification
Open Family Settings/Admin Center after migrations through 025. Verify Overview health/checklist, Members & roles, Storage and Export/backup on desktop and mobile. Create two same-name/same-DOB profiles to confirm a duplicate warning appears without data mutation. Remove all but one admin to confirm continuity warning.
