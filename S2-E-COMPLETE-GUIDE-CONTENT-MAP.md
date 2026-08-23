# S2-E — Complete Guide Content Map

Status: **PLANNED CONTENT INVENTORY**

This file is the completeness checklist for the interactive Family Network Guide. It prevents the implementation from covering only obvious modules while missing smaller but important flows.

## A. Product story
- What Family Network is.
- Why it exists.
- Why a living family network is different from a static tree.
- Main benefits.
- What can be preserved/learned/discovered.
- Family privacy/trust promise in human language.
- Playground explanation.
- Multi-family explanation.

## B. Personas and inspiration
Cover concrete stories for child/teen, young adult, newly married member, parent, working professional, grandparent, historian, Family Owner, overseas relative and wider-community participant. Each should include: what they might care about, 3–6 useful capabilities, and one example journey.

## C. Understand My Family
### Personal Family Line
What it is; why start here; You marker; closest family; open profile; switch to Full Family; mobile use; empty/recovery behavior.

### Full Family Tree
What it is; when to use it; navigating larger trees; relationship labels; repeated names; opening a profile; switching back to Personal Family Line; correction entry.

### Relationship-to-me / Relationship Explorer
Human relationship wording; examples; limits; never infer unsupported relationships; how to explore another person's relation.

### Profiles
Profile sections; identity/photo; profession/city; life information; social links; visibility/privacy; edit vs correction request; deceased profiles; repeated-name clarity.

### Directory / Find Family
Search by name/city/profession/other available filters; open profile; use cases for finding relatives in another city/profession.

### Places / Map
What map represents; privacy/visibility; geographic spread; example uses; location data caveats.

## D. Remember Our Story
### Memories
Create/view memory; connect people; photo/story/date; reactions; privacy; sharing; remove/manage where allowed; ideas for old photos, wedding stories, elders' stories.

### Family History / Timeline / Life Events
Difference between a memory and life event; historical chronology; birth/marriage/education/career/move/other events; deceased relative history; On This Day.

## E. Celebrate & Return
### Special Days
Birthdays/anniversaries and how they are derived.

### Gatherings
Create/view/respond if available; reunion use cases; link memories afterward.

### Family Pulse
Why only a few prompts appear; possible actions; contribution/memory/special-day examples.

### Quiet Family Digest
In-app digest; weekly/monthly/off delivery preference; topics; privacy-safe sharing; no noisy feed; external delivery may depend on deployment configuration.

## F. Build It Together
### Add Myself / close relatives
Fresh-family progression; name-only relative creation; Father/Mother/Husband/Wife/Son/Daughter; progressive optional details.

### Invitations / claiming
Invite, claim, expiry/resend/revoke where exposed; what joining means; privacy.

### Contributions
Missing-data prompts; why they matter; deterministic suggestions; completion; family progress.

### Corrections / submissions
Normal member correction path; owner/admin review; structure safety; what members cannot destructively change.

### Guided Excel
Template download; people sheet; relationship sheet; friendly IDs; dropdowns; preview; incomplete safe data; UUID normalization; common errors/recovery.

### CSV
People-only/simple import; when to use CSV vs Excel; preview/recovery.

## G. Sharing & privacy
### Public profile / privacy controls
Audience meanings; what fields can be public/family/admin; profile privacy preview is not whole-app impersonation.

### QR / print / profile sharing
What is shared; safe use cases.

### Memory / digest sharing
Privacy-safe behavior and what is intentionally excluded.

## H. Community Network
### Community hierarchy
Umbrella → city → chapter → family examples; approval/linking concept.

### Opt-in Community Profile
Discoverability is separate from family membership; categories; hide/unpublish; exposed snapshot vs private family graph.

### Marriage discovery
Explicit self opt-in; no popularity ranking; family post consent guard; respectful introduction workflow.

### Professional/services/mentor/speaker/etc.
Use cases for interior designer, mentor, speaker, business/service discovery.

### Community needs/posts
Publish at appropriate community scope; examples; governance.

### Community Highlights
Curated achievements/expertise, not VIP/social popularity; marriage excluded from ranking.

### Trusted Families
Explicit family-to-family requests; accept/decline/revoke; what trust does and does not mean.

### Connection Paths
Family-level explainable path; max-hop concept if relevant; only accepted edges; no surname/community inference; historical path snapshot distinction.

### Introduction Requests
Request, incoming/outgoing, accept/decline/cancel; no automatic phone/email leakage; future named bridge contacts deferred.

## I. Family/account navigation
- Family Switcher.
- Create another family.
- Join another family.
- Family Lobby / non-destructive unlink from active context.
- Return to an existing family.
- Leave Family and sole-owner protection.
- Sign out.
- Difference between switching, lobby and leaving.

## J. Family Owner/Admin
- Family Admin Center.
- invitations/claiming.
- profile submissions/corrections.
- structure permissions.
- feature visibility/experience levels.
- participation/living-loop metrics.
- import management.
- family/community linking.
- trusted-family governance.

## K. Platform Owner
Only show to Platform Owner:
- Launch Control purpose.
- actual-family feature visibility.
- separate Playground visibility.
- family rollout/approval controls.
- Community structure/highlight governance where applicable.
- product-feedback triage after S2-E3.

## L. Playground
- anonymous/no-login where configured;
- no-save behavior;
- sample `You` viewpoint;
- 60-person/5-generation showcase;
- memories/history/places/community/trusted-introduction examples;
- independent feature visibility;
- Try in Playground links.

## M. Goal-oriented help index
Must include mappings for at least:
- add mother/father/spouse/child;
- find cousin/relative;
- understand relation;
- edit own profile;
- report something wrong;
- add memory/photo/story;
- see birthdays;
- import Excel/CSV;
- invite family;
- switch/create/join/leave family;
- find professional/service;
- publish community profile;
- marriage discovery;
- trusted introduction;
- change digest preferences;
- understand who can see data.

## N. Privacy & Trust FAQ
Maintain a verified answer for every major visibility/editability/consent question. If behavior is not verified, wording must say so rather than promise it.

## O. Future / interest cards
Preserve and optionally expose curated interest cards for:
- Family Play / Tambola / trivia / photo guessing;
- contextual YouTube/Instagram memory links / Family Watch;
- family book/export;
- smarter family insights;
- named opt-in introduction bridges;
- external digest delivery.

## P. Feedback coverage
Every major guide entry should offer feedback. Guide-level feedback should support helpful/not-helpful and contextual improvement idea submission. Platform Owner triage must distinguish user request from roadmap commitment.

## Implementation coverage update — 2026-08-24

**Status: SOURCE COVERAGE IMPLEMENTED / LIVE BEHAVIOUR VERIFY REQUIRED**

The central guide registry and Guide Portal now cover the completeness areas A–P above, including smaller flows that are easy to miss: Add Myself/close relatives, guided Excel + CSV, profile corrections, Privacy Preview, digest preferences, opt-in Community Profile, marriage discovery, Trusted Families, connection paths, introductions, Family Switcher/Create/Join/Lobby/Leave, Platform Owner Launch Control, Playground, goal-oriented search, Privacy & Trust FAQ, curated future-interest cards and contextual feedback.

Coverage is intentionally grouped where the runtime already groups experiences (for example Family History/Timeline/Life Events and Public Profile/Privacy Preview). This source-coverage checkpoint is not a deployment certification. Entries marked `live_verify` must remain visibly qualified until browser/RLS behavior is verified.
