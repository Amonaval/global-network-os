# G9 — USING NETWORK INTELLIGENCE

Open **Intelligence** to ask network questions and review evidence-backed insights. Suggested questions differ by vertical. G9 analyzes only information already visible in the current network session. Answers show confidence and a **Why this answer** section. Use the evidence to open people/entities or move to Connections, Community, Directory or Contribute. Intelligence never creates a relationship automatically.

For real networks, the feature begins in **Test** and must be released by the platform owner through Launch Control. It is enabled in Playground for safe evaluation.

---

# Our Family — User Guide

Our Family is a private place to explore your family tree, find relatives,
preserve relationships and gradually complete the family story. Choose English,
Hindi or Marathi from the language selector; names remain in the script in which
your family enters them.

## Create your family

1. Give the family a familiar name.
2. Choose to start with a few relatives, explore a sample, or use Family Excel.
3. If using Excel, download the guided workbook before editing your own file.
4. Upload and review the people and relationships found.
5. Correct any clearly explained issues, then choose **Add to family**.

## 1. What you see first
The demo dataset contains **150 synthetic members across 6 generations**. It intentionally includes siblings, spouses, branches, multiple cities and deceased members so the features can be tested without real personal data.

## 2. Family Hierarchy
- **Family Hierarchy** opens the visual relationship graph.
- Solid connectors = parent/child lineage.
- Dashed connectors = spouse relationship.
- Use mouse wheel / trackpad to zoom and drag the canvas to pan.
- `+ / -` controls change zoom; the mini-map helps navigate larger trees.
- Click any person to open their profile.
- Search dims non-matching people.

### Lineage Focus
1. Click a member.
2. Choose **View in Family Tree** or **Focus Lineage**.
3. The app isolates the connected branch: parents, children, siblings and spouses that are reachable through recorded relationships.
4. **Show Full Tree** returns to the entire network.

This is intentionally a network view rather than a simple top-down org chart because real families contain marriages and sibling branches.

## 3. Member Directory
Search and filter by:
- Name
- Profession
- City/location

Use **View Profile** for details or **Focus Lineage** to jump back to the relationship graph.

## 4. Member Profile
A profile can show:
- Name and generation
- Profession
- City/country
- Date of birth
- About/bio
- Phone and email depending on visibility mode
- Recorded family connections

Click a connected person to navigate directly to their profile.

## 5. Privacy Preview
The top-right selector is a **preview of the intended privacy model**:
- **Public**: phone/email are hidden.
- **Member**: contact details can be shown to authenticated members.
- **Admin**: intended for administrators.

Important: the current local demo is client-side. Real production privacy must be enforced in Supabase RLS/API, not only by hiding fields in the UI.

## 6. Location Map
Open **Location Map** from the left navigation.

Each member with latitude/longitude appears on the map. In the sample data, city coordinates are provided for Pune, Mumbai, Jalgaon, Nashik, Bengaluru, Delhi, London and Dubai.

Click a marker to see the member name, profession and city, then use **View profile**.

The map is useful for questions such as:
- How many members are in Pune?
- Who lives outside India?
- Where are community clusters?

The map is not a precise home-address map. For privacy, production should normally store city/region coordinates rather than residential addresses.

## 7. In-Memoriam
A member is treated as deceased when `date_of_death` is present.

In the hierarchy their node is visually subdued/grayscale and shows the death year. Their profile retains the recorded birth/death information.

This is a **presentation feature**, not a separate person type. A deceased person can still be an ancestor, spouse or parent in the same relationship network.

The sample includes several deceased members specifically to make this visible during testing.

## 8. Submit Profile
A member can submit a profile without directly editing the master record. The submission enters the pending queue.

The intended production workflow is:
`Member submits → Admin reviews → Approve/Reject → Master profile updated`

## 9. Administration
Administration currently provides:
- Member count
- Relationship count
- Pending profile count
- Location count
- CSV/XLSX import
- CSV export
- JSON export
- Demo reset
- Pending submission approval/rejection

## 10. Family Excel

Supported input: XLSX, XLS and CSV.

The recommended workbook is downloaded inside the Family Excel assistant. It has:

- **Family Members:** `person_id, full_name, gender, date_of_birth,
  living_status, generation, city, profession, phone, email,
  short_introduction`.
- **Relationships:** `person_id, related_person_id, relationship, note`.
- **Read Me First:** step-by-step instructions and a realistic example.
- **Example Family — Do Not Import:** a separate worked example; the two entry
  sheets remain blank to prevent accidental sample imports.

Use simple IDs such as P001 only to connect rows. Never enter Aadhaar, PAN or
another sensitive identity number. Relationship values are Parent, Child and
Spouse. Siblings are understood through shared parents. Leave information blank
when it is not known; do not guess.

The app previews the file and checks duplicate people, missing references,
impossible loops and inconsistent generations before anything is added.

## 11. Export / Backup
- **CSV** exports member/profile data.
- **JSON** exports both members and relationships and is the better structural backup.

## 12. Sample hierarchy
The included 150-member dataset is intentionally synthetic and contains:
- 6 generations
- 150 people
- parent/child relationships
- sibling branches created by shared parents
- spouse relationships
- a few cross-branch marriages
- deceased ancestors
- multiple Indian and international locations
- varied professions

Use this dataset to test the app before importing real family data.

## 13. Recommended next production features
Before adding AI/analytics/PDF features, prioritize:
1. Stable relationship editor (add/edit/remove parent, child, spouse, sibling).
2. Duplicate detection and merge.
3. Relationship validation and orphan detection.
4. Authenticated member/admin roles with real RLS.
5. Approval workflow for profile and relationship changes.
6. Audit history.
7. Better large-tree layout/performance.
8. City-level map clustering.

## Account help

### Forgot your password
1. Open **Join or sign in**.
2. Choose **Forgot password?**.
3. Enter the email used for your family account.
4. Open the private reset link sent to that email.
5. Choose and confirm a new password.
6. Continue to your family.

If an account was just created but email confirmation is required, the signup screen explains this and can resend the confirmation email.

Family Owner/Admin access and Platform Launch Control are different. A family administrator manages only their family. Launch Control is available only to separately trusted platform-owner accounts.

---

# Alpha Quick Start — getting into a family

After you sign in, Family Network first checks whether you already belong to a family.

If you do, your family opens automatically.

If you do not, choose one of these:

### Join my family
Use the short **Family Code** shared by your family administrator. This gives you normal member access so you can explore the family. It does not claim another person's profile.

If the family already contains an unclaimed profile using your **verified sign-in email**, the app may show the matching name and family. Choose **This is me** to connect it.

A private personal invitation link remains the best option when the administrator wants you to claim one exact family profile.

### Explore a sample family
Choose **Explore a sample family** when you only want to understand the app first. The sample is read-only. Your Supabase account stays signed in, but sample data is not saved into your real family.

Use **Join or create mine** when you are ready to leave the sample.

### Create my family
For the current invite-only Alpha, Platform Launch Control can allow instant creation without waiting for approval.

Recommended starting methods:
1. **Upload guided Excel** — best when you already have a family list.
2. **Start with a few relatives** — create the family immediately and add parents, spouse, children and close relatives one by one.

The Excel assistant provides a downloadable template and checks the people/relationships before import.

## For Family Admins — easiest way to invite relatives
Open **Manage family → Invitations / Invite Family**.

For quick Alpha exploration, share the **Family Code** in your trusted WhatsApp group. You can regenerate it if it spreads beyond the intended group.

For exact profile ownership, create a **personal invitation link** for the specific member instead.

## Quick navigation
- **Home** — what matters now and a shortcut to your family.
- **Family** — your personal lineage first on mobile; use Full Tree only when needed.
- **Me** — your own profile and information.
- **Help** — open Quick Start instructions at any time.

## Alpha Excel examples
In the Family Excel assistant you can now choose between:

- **Small demo · Naval family** — a quick multi-generation example with relationships intentionally left blank so you can add them yourself.
- **Full demo · 150 people** — the larger/default scale example for seeing how a bigger family behaves.

The `person_id` values in Excel are friendly temporary references only. In shared/Supabase mode the app safely creates UUID member IDs and remaps relationship references during import.

## Fastest way to try the app

You do not need an account to understand the product. On the first page choose **Try Playground · no login**. The sample family is read-only and nothing is saved.

When ready for a real family:

1. Sign in.
2. Join with a Family Code/invitation, or choose **Create my family**.
3. A new family can start with only its name during Alpha.
4. Add a few people manually or upload Excel/CSV.
5. Unknown details can remain blank and be completed later.
6. Relationships may use familiar words such as Father, Mother, Son, Daughter, Husband and Wife.

Use **Help → Preview detailed family guide** inside the app for the full quick-start document.

# Explore & Guide — Living Help System

Family Network now includes a first-class **Explore & Guide** area. Use it when you are new, want to build your family, need to understand a feature, or simply know a goal such as “add my mother”, “find relatives in Pune”, “import Excel”, “who can see my phone number?”, “marriage discovery” or “switch family”.

Each major product area also includes a collapsible **What can I do here?** guide with a short explanation, why the feature matters, practical steps, examples, privacy notes and links to the full guide. Where appropriate, the Guide can open the feature directly or launch the sample Playground. Playground remains a temporary no-save learning environment.

The complete Guide includes the product story, persona journeys for different generations and family roles, feature library, goal explorer, ideas for your family, Family Owner playbook, First 7 Steps, Privacy & Trust Center, What's New and a curated Being Explored area. Feature visibility and role-specific guidance follow the current product configuration; Platform Owner controls are not shown as ordinary member actions.

Users can send structured feedback such as something confusing/missing, a feature or improvement idea, a bug, or a family need. Do not include private family stories, contact information or sensitive profile content in feedback. Product-interest clicks and feedback are signals only; they do not automatically commit the roadmap.

## Explore & Guide closure note

Explore & Guide now includes contextual help not only on the main Family Network screens but also inside important tasks such as viewing a profile, importing Excel/CSV, inviting relatives and managing relationships. Platform Owners also have a dedicated guide entry for structured feedback triage. Deployment-sensitive privacy or governance behavior may still appear as **Live · verify deployment** until the target environment is certified.


# G6 — Family + Alumni shared experience

The same application can now host both **Family Networks** and **Alumni Networks** while keeping their information and relationship meaning separate. Use the network switcher in the header to move between networks you belong to. The app changes to the correct experience automatically.

## Alumni experience

The Alumni workspace now has a full responsive product layout rather than a basic proof screen:
- **Home** — institution summary, network metrics, your identity and suggested connections;
- **Directory** — search/filter alumni by name, company, city, graduation year and program;
- **Cohorts** — explore graduation batches and programs;
- **Connections** — update your own profile and create trusted alumni connections;
- **Admin** — preview/import Excel or CSV and manage growth;
- **Guide** — quick help and privacy guidance.

Family and Alumni intentionally do not show the same content. Family keeps lineage, memories and family-specific workflows; Alumni focuses on institution, cohort and professional connection. Shared controls are reused only where the interaction is genuinely common.

## Switching safely

When you switch from Alumni to Family (or the reverse), the app reloads the active network context before showing that vertical. If a screen ever shows another vertical's terminology/data after switching, reload once and report it rather than editing data.

## Alumni privacy

Directory email addresses remain hidden from ordinary members except for their own profile. Alumni profile, invitation and connection data uses Alumni-specific persistence and tenant checks; it is not stored as Family relationships.

# G7 Alumni — Explore the Network, Community & Places

## Explore
Alumni is no longer limited to a flat Directory or one fixed cohort order. Open **Explore** and choose how to browse the same people:
- Program → Batch → Stream
- Batch → Program → Stream
- City → Institution → Batch
- Company → Institution → Batch

Changing the view does not create duplicate profiles. It changes how existing affiliations are grouped.

## Community
**Community** brings reusable network-life capabilities into Alumni:
- Meetups / reunions and RSVP
- Memories
- Milestones
- Announcements
- Groups / chapters

Admins can create events and announcements. Members can share memories/milestones and RSVP. Admins can create groups; members can join or leave them.

## Places
**Places** summarizes the network using profile city affiliations. Select a city to narrow the Alumni Directory.

## Profile data powers the network
Graduation year, Program/School, Stream/Course, City and Company are now more than profile text: they help build Explorer projections and discovery views.

Privacy remains network-scoped. Ordinary members still do not receive private Alumni email data.

# G8 — Organizational Intelligence, Business Trust & Franchise

The welcome/setup flow now lets signed-in users create three additional private network types or try their read-only samples.

## Common experience

All three provide:
- Home dashboard and network health;
- Explorer with multiple useful hierarchy projections;
- Directory/search;
- Community with events/RSVP, memories/history, milestones, announcements and groups;
- Places/geographic coverage;
- typed Connections and connection paths;
- governed Contributions;
- Admin with join code, member/admin management, add/edit and Excel/CSV import;
- Guide and Playground.

When an imported record contains your verified account email, **This is me** links it to your account. After claiming, a normal member may edit that claimed record, but cannot edit other entities.

## Organizational Intelligence

Use dimensions such as Region, Business Unit, Department, Team, Project and Skill/Expertise. One person may have multiple projects or skills. Explore the formal organization or switch to Project/Expertise views without duplicating people.

Use typed relationships such as Reports to, Works with, Owns and Depends on.

## Business Trust Network

Add trusted businesses with Region, Business Category and one or more Products/Services. Record explicit relationships such as Recommends, Verified by, Supplies to and Worked with. The purpose is a private trusted ecosystem, not an anonymous public rating directory.

## Franchise Network

Add/import locations using Country, State, City, Store Type and Franchise Owner. Switch between Geography and Ownership views. Use Community for operator groups, training, launch history and shared operational learning.

## Joining and administration

Admins can share the Network OS join code. The owner can promote/demote admins. Owners/admins can remove members subject to owner protections. If a member is removed, their stale active-network context and claimed record link are cleared.

## Import guidance

Use Name/Label plus the relevant dimension columns. Comma-separated values are supported for multi-value dimensions such as Skills, Projects or Services.

Deployment requires migration `048_g8_productized_verticals.sql` after 047.

## Shared productized-network experiences (G8.5-B)
Organization, Business Trust and Franchise now include an interactive Places map where coordinates exist, richer typed-relationship exploration with connection paths, reusable entity details, visible Events/Announcements/Stories/Milestones, categorized contribution suggestions, admin rollout visibility and a capability-aware Guide. Playground is read-only; create/join a real network to edit, RSVP, contribute or administer.


## G8.5-C Playground showcase
The five Playgrounds are designed for exploration rather than as tiny mock screens. Family uses the existing 60-member family dataset. Alumni now demonstrates 36 people across batches, programs, cities and companies. Organization, Business Trust and Franchise each demonstrate 36 primary entities with richer relationships, communities, events, history and milestones. On the three productized business Home screens, use **Three useful journeys** to jump directly into discovery, connections or community. Playground remains read-only.

## G8.6 — Understand, connect and reuse network knowledge

### Structure Map
Organization, Business Trust, Franchise and Alumni can now be explored as a living structure, not only a flat directory. Switch projection order to answer different questions without duplicating entities.

### Entity 360
Open an entity to see its affiliations and relationships, then use domain-aware actions such as **View in network**, **How are we connected?**, **Update connection**, or **Ask the network**. Editing remains permission-aware.

### Living knowledge
The shared activity foundation now presents different product jobs:
- Organization — **Wins & Lessons**;
- Business Trust — **Trust Evidence & Success Stories**;
- Franchise — **Operations Playbook**;
- Alumni — **Alumni Journeys & Give Back**.

### Help the network
Use the suggested prompts to request expertise, ownership, verification, a warm path or peer operational help. In live networks these requests continue through the governed contribution workflow so ordinary members do not receive unrestricted admin write access.

## G8.6-C — What to do when you open a network
The Home page now highlights useful paths, reusable knowledge/evidence, active communities, missing context and a recommended next action. Use the Return Loop cards to see what changed and where participation can make the network more useful. Platform owners can open Launch Control directly from Alumni and the business verticals; ordinary network admins cannot change platform rollout state.

## My Networks — one trusted home, separate private contexts

`My Networks` is the cross-network home for a signed-in person who belongs to more than one Network OS space.

- Open **My Networks** from the network switcher/top bar.
- Choose a Family, Alumni, Organization, Business Trust or Franchise network to enter that network's own context.
- Use **Add or join network** to create or join another supported network.
- Use the **Playground** cards to experience another vertical without changing real network data.

### Privacy model
Your sign-in is the trusted anchor, but each network keeps its own profile/entity data and relationships. Joining two networks does **not** merge their graphs or reveal one network's members to the other. Future cross-network portability/discovery must be explicit and permission-aware.


## Trusted Expertise & Professional Network
Use this network when a professional association or trusted expert community wants more than a flat member directory.

### What members can do
- find professionals by profession, specialty, service, industry, credential and geography;
- explore known worked-with, referral, collaboration and mentoring paths;
- use practice groups to organize expertise and recurring problems;
- preserve de-identified case lessons and reusable professional knowledge;
- use Network Intelligence to find relevant experts, warm paths and context gaps with visible evidence.

### Playground
From network selection choose **Trusted Expertise / Expert Network → Playground**. The sample is read-only and contains 36 professionals across multiple countries. Use Explorer, Directory, Connections, Community and Intelligence to understand the value before creating a real network.

### Privacy
The professional network is a separate tenant context. It does not merge Family or Alumni profiles. Mission 2 is not a healthcare/patient-record product and should not be used to store patient-identifying clinical information.

## Institutional Bootstrap (productized network admins)
Open **Admin** in a Professional or other productized network. The Institutional Bootstrap card shows a simple activation path: seed the initial directory, activate members, let people claim their identity, delegate another admin, and enrich the network together. Download the seed CSV template for a starting structure, then use the existing import flow. Share the private join code or copy the launch invitation. The bootstrap card does not create a second membership system; it coordinates the existing Network OS capabilities.

## Experience the Network Effect — Showcase
From **My Networks**, open **Experience the Network Effect** to explore seven synthetic, read-only stories showing how Network OS can turn a real need into a governed trusted introduction. Choose a story, then move through Need → Direct Gap → Trusted Path → Anonymous Match → Consent → Reveal → Outcome. The showcase never exposes the synthetic target identity before the consent stage and does not change your live networks.

## M7-A — Zero-Friction Network Launch & Activation
M7-A is source implemented. My Networks now gives Owners/Admins a privacy-safe launch-readiness path: seed meaningful people/entities → bring in participants → claim/link identities → establish trusted reach when appropriate → complete a first consented outcome. Migration 062 returns aggregate counts only for networks the caller administers. Existing import/invite/claim/admin experiences are reused rather than duplicated. Validate with `npm run validate:m7a`; runtime/type/build certification is pending in the normal installed workspace. After M7-A, proceed to M7-C Guided Pilot/Admin Activation and then M7-D Pilot Feedback & Learning, using M7-B/M7-A friction as evidence.

## Guided Pilot & Admin Launch Console (M7-C)
If you own or administer more than one network, open **My Networks** and use **Guided Pilot & Admin Launch Console** to see which pilot needs attention first. The console summarizes launch readiness, claimed identities, bridges and recent discovery/introduction outcomes. Use **Act now** or select a network row to open the existing network and complete the suggested missing step. The console is for prioritization only; it does not expose members from other networks.

## Pilot Feedback & Product Learning
In **My Networks**, members can share one quick signal about a meaningful network step: whether it helped, partly helped, or blocked them. If something got in the way, choose the closest friction category and optionally add a short note. Do not include names, contact details, health information or other private network data in the note.

Owners/Admins also see an aggregate learning snapshot for networks they administer. Use repeated friction as a reason to simplify the product or pilot process before asking people to adopt more features.

## Pilot Evidence Review — Owner/Admin
After collecting pilot feedback, open **My Networks → Pilot Evidence Review**. Each experience moment shows its feedback count, helpful rate, top friction and a suggested disposition. `INVEST` means deepen proven value; `FIX` means remove repeated friction before expanding; `HOLD` means keep scope stable while gathering evidence; `STOP` is an explicit human choice to stop further investment. Add a rationale before saving. Saving a decision records the evidence and reasoning only—it does not change product features or permissions.

## Controlling M6/M7 advanced capabilities
Platform Owners can open Launch Control, select a network vertical, and manage the **Advanced network effect**, **Advanced showcase**, and **Advanced pilot operations** groups. Use Hidden for unavailable, Test for platform-owner verification, Pilot for selected networks, and Released only when the capability is ready for all eligible networks of that vertical. Multi-hop trusted paths are controlled separately from direct bridges/discovery.

