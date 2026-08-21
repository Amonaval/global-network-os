# P5 Active Plan — D1

## Resume rules

1. Treat code and migrations as authoritative.
2. Read `MODEL-SELECTION-RULE.md`; recommend or select the best available model/effort before substantial work.
3. Treat family UX as a release criterion and visually verify phone plus desktop journeys.
4. Complete the current deliverable end-to-end before beginning D2.

## Completed baseline

- P3/P4 through production hardening.
- Migrations `001`–`015`, including private media authorization and P5.1 Living Network.
- Configurable vocabulary, private signed media, public directory, timeline, milestones and field-aware self-edit.
- First D1 Family UX and Usability Audit: family-first setup/copy, welcome experience, mobile contribution/navigation fixes, large-tree guidance, improved empty/profile states and privacy presentation.
- Local TypeScript, production build, demo integrity and Playwright desktop/mobile checks.

## D1 — Production Participation Release

### Gate A: live baseline closure

- Apply `001`–`015` to a clean Supabase staging database and verify an existing-instance upgrade.
- Execute anon/member/admin/invited-user RLS, RPC, media and usability journeys.
- Verify Vercel/Supabase runtime, signed media expiry and public-page privacy.

### Build B: P5.2 participation and distribution

- Invitation/claim flow at scale: resend, revoke, expiry, status and funnel measurement.
- Guided find-myself, claim and contribute journeys.
- Contextual missing-information prompts and deterministic data-quality suggestions.
- Privacy-aware QR/public profile cards, deep links, print/export and embed hardening.
- Group/branch connection view and lightweight reunion/event validation.
- Measure invite acceptance, claimed profiles, contributions, shares, return visits and admin effort.

### Experience acceptance

- Non-technical relatives can understand the first action without guidance.
- Mobile is the primary test surface; older-user readability, tap targets and plain privacy language are required.
- People, relationships, photos, memories and milestones precede settings/statistics.
- Every loading, empty, error and success state is deliberate.

## After D1

- **D2:** P5.3 Modular Domain Architecture + P5.4 Commercial Validation, proving an alumni/association vertical with real semantics and a credible paid ICP.
- **D3:** P6 Multi-Network SaaS only after D2 evidence: tenant-safe `network_id`, scoped roles/RLS, dashboard, plans/limits, branding/embed, observability and backups.

## Exact next mission

Run Gate A on configured Supabase staging, fix every release blocker, then implement Build B as one verified D1 delivery.
