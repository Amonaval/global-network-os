# Showcase S3 — Navigation, Progressive Disclosure, Themes & High-Visibility i18n

## Mission status
Implemented on top of the S2 continuation baseline.

## Goal
Make the first-time experience easier to navigate, remove capability overload from the primary rail, make Appearance visibly distinct, repair dark-mode readability, and translate the highest-visibility product surfaces into Hindi and Marathi.

## 1. Navigation & progressive disclosure

### Family Community / Cultural Association
Primary navigation is intentionally reduced to:
1. Home
2. Me & My Family
3. Families
4. Community Life
5. Guide & Help

More contains:
- Family Structure
- Family & Community Links
- Build Together
- Manage Community (admin only)

### Residential Community
Primary navigation is intentionally reduced to:
1. Home
2. My Home
3. Residents
4. Notices
5. Complaints
6. Amenities

More contains:
- Maintenance & Dues
- Committee & Meetings
- Visitors & Security
- Society Structure
- Community
- Neighbours
- Guide & Help
- Manage Society (admin only)

### Family
Primary navigation is reduced to the everyday family journey. Advanced discovery/history/places/community/help/admin capabilities remain available through More according to experience and role.

### Mobile rule
The mobile bottom bar remains compact. Any primary destination that does not fit the bottom bar is automatically included in the mobile More sheet, preventing hidden or unreachable pages.

## 2. Two different color concepts

These are now deliberately separate.

### Appearance — user-facing
Every user can choose one of five complete application appearances:
- Light — warm editorial / vintage character
- Warm — cream, sage and terracotta; softer and more community-oriented
- Modern — cool slate, teal and cleaner SaaS typography
- Aurora — noticeably colored violet/teal/coral treatment
- Dark — high-contrast deep navy/teal with repaired readable surfaces

### Brand palette — founder/network control
Launch Control continues to manage the vertical/network brand treatment:
- Signature
- Warm
- Modern
- Classic
- Minimal

Appearance controls the overall UI environment. Brand palette controls the identity/accent of a vertical/network within that environment.

## 3. Dark-mode repair

Explicit contrast fixes were added for the surfaces visible in the reported screenshot, including:
- sidebar labels and inactive navigation
- feature guide card
- guide icon/body/trust text
- Family Ready celebration card
- quick-start card
- warm kicker/section labels

Dark is no longer implemented as a simple dark background behind light-theme cards.

## 4. High-visibility i18n

Hindi and Marathi were expanded for the most visible showcase areas, including:
- Appearance/theme names
- Family main menu labels
- member/admin preview labels
- TrustWeave login hero and sign-in actions
- showcase welcome/setup copy
- Family / Community / Residential titles and descriptions
- Playground entry and read-only/sample labels
- creation availability / Playground availability messages
- key setup context fields
- flagship navigation labels through the vertical composition contract
- flagship outcome copy shown on My Networks / Playground cards

The implementation continues using `lib/i18n/messages/en.ts`, `hi.ts`, and `mr.ts` rather than adding hard-coded Hindi/Marathi inside components where locale tokens already fit.

## 5. No database migration
S3 is application/navigation/theme/i18n work only. No Supabase migration is required.

## Validation
- Showcase S3 source gate: 12/12 PASS
- Showcase S2 source gate: 9/9 PASS
- FCA-0: 27/27 PASS
- Housing HS0: 24/24 PASS
- Housing HS1: 27/27 PASS
- Housing HS2: 26/26 PASS
- Housing HS3: 28/28 PASS
- Housing HS4: 28/28 PASS
- Housing HS5: 28/28 PASS
- Changed TS/TSX/locale files: syntax-transpile PASS

Repository-wide `tsc --noEmit` remains blocked before semantic checking by the pre-existing syntax errors in `qa/e2e/19-phase4b-data-integrity-recovery.spec.ts`. That certified QA file was intentionally not modified for S3.

The historical NX6 source gate also has three pre-existing source-string assertions that already fail on the S2 baseline; S3 does not broaden this mission to rewrite old historical source gates unrelated to the current product behavior.
