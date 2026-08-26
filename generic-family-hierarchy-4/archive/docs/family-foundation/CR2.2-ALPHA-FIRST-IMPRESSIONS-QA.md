# CR2.2 — Alpha First-Impressions QA & Progressive Onboarding

Status: **IMPLEMENTED IN SOURCE / BEHAVIOUR VERIFY REQUIRED**

## Why this mission exists

Alpha users were still hitting product-killing friction despite strong underlying functionality:

- fresh family creation could end with `No active family selected`;
- users had to sign in before seeing why the product was interesting;
- Excel looked like a genealogy-completion exercise instead of a quick starting point;
- relationship wording was technical (`Parent / Child / Spouse`) instead of familiar family language;
- full-tree lines did not explain what the relationship meant;
- help existed, but was not presented as an easy detailed preview for a new user.

CR2.2 treats **first interest, first success and first return** as release-critical behaviour.

## Implemented

### 1. Explicit family context after creation

`save_network_settings` now accepts the newly-created `network_id` explicitly instead of depending only on `current_network_id()` immediately after creation.

Client sequence:

1. `create_family()` returns UUID.
2. Client immediately calls `set_active_network(UUID)`.
3. Settings save includes that UUID explicitly.
4. DB verifies Owner/Admin membership directly against that UUID.
5. DB also refreshes `profiles.active_network_id`.

This removes the fresh-session race that produced `No active family selected`.

### 2. No-login Playground

The public landing page now offers:

- `Join or sign in`
- `Try Playground · no login`

Playground:

- uses sample family data;
- is read-only;
- has no account requirement;
- saves nothing;
- exposes the simple family experience first;
- always provides a route back to join/create a real family.

### 3. Minimum-data creation

A creator may now create a family with **only the family name**.

People, Excel/CSV and relationships can be added later.

The creation UI explicitly offers:

- `Create now · add people later`
- `Upload Excel or CSV`
- `Start with a few relatives`

### 4. Guided Excel with dropdowns

`public/family-excel-guided-template.xlsx` includes dropdowns for:

- Gender
- Living status
- Generation 1–10
- Father
- Mother
- Son
- Daughter
- Husband
- Wife
- Parent / Child / Spouse as generic fallbacks

Unknown details may remain blank.

### 5. Human relationship imports

Importer accepts:

- Father / Mother → parent edge
- Son / Daughter → reverse parent edge
- Husband / Wife → spouse edge
- Parent / Child / Spouse remain supported

### 6. Relationship labels in full tree

Tree edges now display familiar bidirectional labels where gender is known, for example:

- `Father · Daughter`
- `Mother · Son`
- `Husband · Wife`

Generic fallbacks remain `Parent · Child` and `Spouse · Spouse`.

### 7. Detailed Help preview

Quick Help now contains `Preview detailed family guide`, covering:

- playground;
- joining;
- creation;
- Excel/CSV;
- human relationship wording;
- personal lineage/full tree;
- progressive completion;
- privacy basics.

## Behaviour QA — mandatory before Alpha certification

### Critical fresh-user paths

1. **Anonymous critic**
   - open URL;
   - use Playground without login;
   - understand product value in <= 60 seconds;
   - open Family;
   - open at least two profiles;
   - return to landing/join path without confusion.

2. **Fresh account, empty family**
   - sign up/sign in;
   - Create Family;
   - enter only a family name;
   - `Create now · add people later`;
   - family must open without an active-family error.

3. **Fresh account + Excel**
   - create family name;
   - upload 5–20 people with optional details blank;
   - import with zero relationships;
   - family opens;
   - people are visible;
   - add relationships later through UI.

4. **Relationship vocabulary**
   - import Father/Mother/Son/Daughter/Husband/Wife;
   - verify graph orientation;
   - verify full-tree line labels.

5. **Mobile critic path**
   - 360/390/430 px;
   - no horizontal overflow;
   - personal lineage understandable without zoom/pan;
   - full tree remains optional;
   - help and join/create actions stay inside viewport.

### Product-quality rule

A mission that passes source checks but fails any critical user path is **not complete**.

## Still partial / future

- automatic generation inference when generation is omitted;
- richer relationship language such as elder/younger brother/sister and paternal/maternal uncle/aunt;
- post-import UI wizard to connect unresolved people visually;
- real anonymous behaviour analytics (privacy-conscious) for Alpha conversion;
- polished public marketing/onboarding page once family naming/branding is finalized.
