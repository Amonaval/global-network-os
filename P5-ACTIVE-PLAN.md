# Active Plan — Family Release 1 to Real Users

## Resume rules

1. Treat code and migrations as authoritative.
2. Read `MODEL-SELECTION-RULE.md`; recommend or select the best available model/effort before substantial work.
3. Treat family UX as a release criterion and visually verify phone plus desktop journeys.
4. Complete the current family release end-to-end before beginning platform work.

## Completed baseline

- P3/P4 through production hardening.
- Migrations `001`–`015`, including private media authorization and P5.1 Living Network.
- Configurable vocabulary, private signed media, public directory, timeline, milestones and field-aware self-edit.
- First D1 Family UX and Usability Audit: family-first setup/copy, welcome experience, mobile contribution/navigation fixes, large-tree guidance, improved empty/profile states and privacy presentation.
- Local TypeScript, production build, demo integrity and Playwright desktop/mobile checks.

## Family Release 1 — source complete

- Warm ivory/forest/gold family theme, design tokens and responsive component treatment.
- Mobile-first navigation, family home, sign-in and profile presentation.
- English, Hindi and Marathi foundations for the most important first-use journeys.
- Family-only progressive setup with no enterprise/platform terminology.
- Downloadable multi-sheet family Excel template and guided import review.
- Friendly validation for duplicates, missing people, impossible loops and generation conflicts.

See `FAMILY-RELEASE-1.md` for implementation and acceptance details.

## Release acceptance — do now

### Gate A: real visual and usability acceptance

- Review setup, start choices, Excel assistant, family home, tree, directory and profile at 390px, 768px and desktop widths.
- Confirm Hindi and Marathi do not clip, overflow or fall back to developer terms.
- Test with an older relative and one non-technical family administrator.
- Use a copy of the real family Excel data; verify duplicate names, missing relationships and corrections are understandable.

### Gate B: invisible safety and deployment

- Apply `001`–`015` to a clean Supabase staging database and verify an existing-instance upgrade.
- Execute anon/member/admin/invited-user RLS, RPC, media and usability journeys.
- Verify Vercel/Supabase runtime, signed media expiry and public-page privacy.

## Family Release 2 — after the pilot

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

## Preserved for later

- **D2:** P5.3 Modular Domain Architecture + P5.4 Commercial Validation, proving an alumni/association vertical with real semantics and a credible paid ICP.
- **D3:** P6 Multi-Network SaaS only after D2 evidence: tenant-safe `network_id`, scoped roles/RLS, dashboard, plans/limits, branding/embed, observability and backups.

## Exact next mission

Complete Family Release 1 acceptance on a configured staging deployment and
invite a small real family pilot. Recommended setting: GPT-5.6 Sol High; use
Extra High only for the RLS/privacy portion.
