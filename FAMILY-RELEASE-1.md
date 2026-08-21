# Family Release 1 — Create, Explore and Join

## Outcome

Family Release 1 turns the existing feature-rich hierarchy application into a
family product intended for ordinary relatives. It prioritizes visual warmth,
mobile use, supported languages and guided family creation without removing the
existing tree, profile, timeline, privacy, local/demo or Supabase capabilities.

## User-visible delivery

### Visual system

- Warm ivory background, forest-green primary surfaces, restrained gold/coral accents.
- `DM Sans`/`Noto Sans Devanagari` body typography and `Lora` family headlines.
- Consistent cards, inputs, buttons, drawers, shadows, focus rings and semantic states.
- Warm family hero and onboarding artwork made with maintainable CSS rather than a static mockup.
- Mobile bottom navigation uses icons and fixed, non-wrapping targets.

### Create a family

- Two clear steps: name the family, then choose how to add people.
- Family is the only visible product; enterprise/network templates are deferred.
- Start empty, explore sample data, or open the guided Excel assistant.
- Privacy is described in family language.

### Language

- Persistent language selector: English, Hindi and Marathi.
- Translated first-use setup, Excel guidance, primary navigation, family home,
  visibility choices and key profile actions.
- Names and descriptions remain exactly as entered and support any script.
- Devanagari-capable typography and layouts designed for longer translated labels.

### Family Excel assistant

The app generates `Our-Family-Excel-Template.xlsx` with:

1. `Family Members` — one person per row using non-sensitive IDs such as P001.
2. `Relationships` — one relationship per row using Parent, Child or Spouse.
3. `Read Me First` — short instructions and examples.
4. `Example Family — Do Not Import` — a clearly separated three-generation example.

The two entry sheets are intentionally blank so a novice cannot accidentally
import the sample Sharma family with their own data. Read Me lists the allowed
gender, living-status and relationship values.

The importer accepts XLSX, XLS and CSV, normalizes common column headings,
converts external IDs to safe database IDs, previews people, checks relationships
and requires confirmation before write. It identifies duplicate IDs, missing
people, self-relations, impossible parent loops and generation conflicts. It
never invents uncertain relationships.

### Explore and join

- Family home gives a warm introduction, people/generation/connection context,
  Find someone and Add relative actions.
- Family labels replace hierarchy/platform labels in primary navigation.
- Sign-in and account creation use an invitation/family mental model.
- Profile drawer emphasizes a person, life journey, memories and family connections.
- Mobile navigation keeps the main family journeys reachable without wrapping.

### Independent UI-expert closure

An independent consumer-UX review was applied before packaging:

- mobile Tree now appears immediately below a compact family header;
- More sheet restores Places, Help, language, privacy preview, settings and sign-out;
- mobile nav labels are readable and profile actions use a safe grid;
- family-member faces replace a statistics-only hero treatment;
- saved language restores the document language and Devanagari letter spacing is normalized;
- blank Excel entry sheets prevent accidental example-family imports;
- numeric Excel dates, invalid dates and deceased-status inconsistencies are checked;
- the hidden file input remains keyboard focusable and key dialogs have semantic roles/Escape support;
- Excel/XLSX is dynamically loaded, reducing `/` first-load JavaScript from about 401 KB to 260 KB in the production build;
- runtime Google-font loading was removed.

## Verified in this workspace

- Clean `npm ci` using an isolated cache.
- `tsc --noEmit`.
- Next.js production build.
- `/` first-load JavaScript: 260 KB after lazy-loading the Excel assistant.
- 150 people, 180 relationships and six generations demo integrity validation.
- Migration chain remains `001`–`015`; no database migration was required for this UI release.

## Explicitly unverified

The workspace contained the browser-control package but not its matching Chromium
binary, and the restricted network returned an empty browser download. Therefore
new Release 1 screens were not truthfully marked as rendered/visually verified.
The previous P5.1 screenshots describe the earlier UI and must not be treated as
evidence for this release.

## Mandatory release acceptance

Run on a configured staging deployment:

1. Setup at 390×844, 768×1024, 1366×768 and 1440×1000.
2. English, Hindi and Marathi setup; verify no clipping or horizontal overflow.
3. Download the Excel workbook in Chrome and Edge; open it in Excel and LibreOffice.
4. Import the included example, a malformed copy and a copy of the real family sheet.
5. Verify friendly handling of duplicate IDs, missing relatives, invalid relationship values and generation conflicts.
6. Create a sample family and inspect home, tree, directory, timeline and profile.
7. Check keyboard focus, readable contrast, 44px tap targets and reduced-motion behaviour.
8. Apply migrations `001`–`015`; run anon/member/admin/invited-user RLS, RPC and media checks.
9. Test with one older relative and one non-technical family administrator. Observe without coaching.
10. Fix every release blocker, deploy, then invite a small family pilot.

## Pilot success indicators

- Administrator creates/imports the family without developer help.
- Invited relative understands the first action and finds themselves.
- People can explore the tree and profiles comfortably on a phone.
- Supported-language users can complete the first-use journey.
- Import problems are corrected without reading technical documentation.
- No private contact or media is exposed to an unauthorized viewer.

## Exact next mission

Complete the staging and real-device acceptance above, deploy Family Release 1
to a small pilot, and fix only observed release blockers. After pilot evidence,
begin Family Release 2 — Remember, Connect and Celebrate.
