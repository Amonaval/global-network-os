# Family Network — Alpha → Beta Product Roadmap

## Product decision locked for Alpha
- One product/domain, many isolated family networks. No deployment/domain per family.
- Family creator signs in and becomes Family Admin automatically.
- Family members join free through an invitation/token and see only authorized family networks.
- Alpha target: 20 families first, then 40–50, without platform-owner manual family setup.
- Maximum family media/storage entitlement target: 100 MB per family. This becomes enforceable once multi-family tenancy and per-family usage accounting exist.
- Photo upload is OFF by default now and controlled by the current family admin.
- If enabled, each uploaded profile or memory image is hard-limited to 100 KB.
- Initials/avatar placeholders are the default lightweight identity treatment.
- Future profiles can expose optional user-supplied public social-profile links (e.g. Facebook/Instagram) instead of storing a photo. Links are never required and must not be scraped/copied into our storage.
- Beta: paying Family Admin controls whether that family permits photo uploads, subject to plan/storage limits.

## Mission A0 — Current Release 2 closure [NOW]
User outcome: current family can operate Release 2 without confusing admin/storage failures.
1. Fix admin approval/RPC permission path and provide diagnostics.
2. Make migrations safely rerunnable where practical and document 001–018 order.
3. Add Admin setting: Allow photo uploads — default OFF.
4. Enforce 100 KB maximum on every application photo upload.
5. When disabled, show initials/avatar instead of an upload control.
6. Keep memories useful as text/story-first content when photos are disabled.
7. Complete Release 2 UI discoverability/help so users can see what changed.
Exit: current family admin can operate approvals, memories and photo policy without Supabase intervention for normal use.

## Mission A1 — True multi-family tenancy [ALPHA BLOCKER]
User outcome: unrelated families safely coexist in one application.
1. Add networks/families table with stable ID, name, unique slug, status and owner.
2. Add network_memberships(user_id, network_id, role, status).
3. Scope members, relationships, memories, events, groups, invitations, change requests, notifications and settings by network_id.
4. Prefix stored media by network_id.
5. Rewrite RLS/RPCs so membership is checked for every tenant-owned operation.
6. Migrate today's single family into the first network automatically.
7. Add adversarial cross-family isolation tests: URL guessing, UUID guessing, RPC calls, storage paths, public/private routes.
8. Add family switcher for a user belonging to multiple networks.
Exit: Family A cannot read/change Family B data through UI, REST, RPC or storage.

## Mission A2 — Autonomous Create Family / Join Family
User outcome: the platform owner does nothing to onboard a normal family.
Create flow: Landing → Create family → Sign in/up → family name → slug → owner/admin membership → Excel/empty → Home.
Join flow: private invite → sign in/up → validate opaque expiring token → join correct network → claim intended profile where relevant → Home.
Include invite expiry/revoke/resend, duplicate-account handling, already-claimed handling and clear recovery messages.
Exit: a non-technical admin creates a family and invites relatives without SQL/support.

## Mission A3 — Family Admin Center
User outcome: each family runs itself.
Screens: Overview, Members & Claims, Invitations, Approvals, Privacy, Storage, Family Settings, Export/Backup.
Admin can manage roles, invitation state, privacy defaults, photo policy, storage usage, family slug/display details and governed changes.
Show simple meters: Members used / entitlement; Storage used / 100 MB (Alpha policy); photo uploads On/Off.
Exit: normal administration never requires Supabase dashboard access.

## Mission A4 — Lightweight identity & social links
User outcome: recognizable profiles without expensive image storage.
1. High-quality initials/avatar system with several neutral icon/avatar choices.
2. Optional public Facebook/Instagram/other profile URL fields.
3. Explicit visibility toggle for each external link.
4. Public page opens the external profile; we do not download/cache social photos.
5. URL validation and safe external-link handling.
6. No assumption that social profile is identity verification.
Exit: a useful profile can be visually distinct while consuming essentially no media storage.

## Mission A5 — 100 MB family storage enforcement
User outcome: predictable storage with no surprise platform bill.
1. Per-network media_usage_bytes accounting.
2. 100 MB Alpha family hard quota.
3. 100 KB per-image hard cap in client and server/storage path.
4. Compress/resize helper before upload; reject when still >100 KB.
5. Thumbnails for list/tree views; never load full media unnecessarily.
6. Orphan/replaced-media cleanup.
7. Admin storage meter and near-limit messages.
8. Quota-safe concurrency/server-side enforcement, not UI-only checks.
Exit: a family cannot exceed its entitlement through direct API calls or race conditions.

## Mission A6 — Release 2 completion: Remember, Connect, Celebrate
- On This Day.
- Birthday/anniversary cards optimized for WhatsApp sharing.
- Memory story cards with attractive privacy-safe previews.
- Gathering → RSVP → attendee list → post-event stories/memories.
- Printable reunion directory/tree summary.
- Quiet notification preferences/digest.
- Guided contributions with visible “you improved X” feedback.
Exit: relatives have genuine reasons to return between data-maintenance sessions.

## Mission A7 — Alpha operations: 20 → 50 families
1. Controlled alpha signup/invite for family admins.
2. Family activation funnel: created → imported/added members → first invite → first claimed member → first return/memory.
3. Performance tests at 100–300 members/family and aggregate alpha scale.
4. Privacy/isolation regression suite on every release.
5. Usage dashboard for platform owner: tenants, MAU, storage, errors — not casual private-content browsing.
6. Export/recovery procedure and migration runbook.
7. Non-technical family usability sessions.
Exit: 40–50 families operate with low support burden and no tenant/privacy incident.

## Mission B1 — Beta / paid family plans
Payer: Family Admin/owner. Invited members participate free.
Entitlements: member capacity + storage + admin seats + premium exports/features.
Admin chooses photo-upload permission for the family; plan determines available storage/capabilities.
Add billing, entitlement enforcement, grace period, upgrade/downgrade, invoices, cancellation/export, and commercial hosting.
Do not finalize price until Alpha reveals actual willingness-to-pay and usage.

## Later platform roadmap — deliberately paused
Generic relationship-core extraction, second vertical, enterprise operations, custom domains, advanced analytics, large-scale SaaS infrastructure and deeper generic configuration remain preserved but do not distract from family Alpha/Beta.
