# TrustWeave — Current User Experience Handbook

**Updated:** 2026-09-12  
**Audience:** product managers, designers, support, pilot operators and engineers validating user-visible behavior.

This document describes the **current intended experience**, not every historical experiment.

---

## 1. First contact

A first-time person should understand four choices quickly:

- **Family** — private extended-family relationships, memories and history.
- **Community / Cultural Association** — households, members, events, membership, committee and community life.
- **Residential Community** — flats, residents, notices, complaints, amenities and society operations.
- **Explore Playground** — understand the product without creating a network.

Normal showcase users should not be forced to understand internal terms such as graph, federation, entity runtime or capability registry.

---

## 2. Sign in

- Sign-in opens as a dismissible experience.
- The modal supports close, outside-click and Escape where cancellation is appropriate.
- After authentication the product resolves the account’s memberships and active network.
- An account may belong to more than one network.
- Missing/repairable account profile state must not make legitimate memberships disappear.

---

## 3. My Networks

**My Networks is a core account workspace, not a showcase feature flag.**

The user can:

- see every active network membership,
- identify network type/context,
- switch into another network,
- add/join another network,
- enter permitted Playground experiences,
- understand which network is currently active.

Existing memberships remain visible even when Launch Control hides that vertical from new Create or Playground discovery.

Network switching should show visible transition feedback rather than looking frozen.

---

## 4. Create / Join

### Create

The current creation principle is **minimum setup before value**:

1. choose a network type,
2. enter the small amount of identity/context required,
3. create,
4. enter the created network immediately when auto-approval is enabled.

### Approval

Platform policy can be:

- **Auto-approve** — creation completes and the creator enters the network.
- **Manual approval** — the network enters Pending approval and the creator retains their previous usable network context until approval.

### Join

Depending on vertical/workflow, joining can use:

- invitation,
- claim,
- join code,
- network-specific onboarding.

---

## 5. Playground

Playground is a **product-exploration surface**, not a technical sandbox.

Expected experience:

- deterministic data,
- safe/non-destructive behavior,
- visually meaningful content,
- direct return to My Networks/network selection,
- no exposure of internal QA/debug controls.

Flagship Playground contexts are Family, Family Community and Residential.

---

## 6. Family experience

Family is the most mature experience and already contains simple/guided/explore-oriented presentation work.

Primary product jobs:

- understand who is in the family,
- understand relationships and generations,
- find a person,
- open a person profile,
- explore tree/path/kinship context,
- preserve memories and life events,
- see birthdays and special family moments,
- contribute missing information,
- invite/claim/correct safely,
- explore family history/legacy,
- manage the family when authorized.

The Family experience should remain warm and human, not resemble an enterprise admin console.

---

## 7. Community / Cultural Association experience

The Community experience is family-grade but association-specific.

### Member mental model

**Community → households/families → people → events/membership/community life**

### Member-facing jobs

- Me & My Family,
- browse member families,
- view people/profiles,
- upcoming events,
- RSVP/community activity,
- birthdays/celebrations,
- announcements,
- memories/photos,
- community history,
- professional/member discovery.

### President / committee jobs

- understand Community Today,
- see renewals/membership attention,
- understand family/member counts,
- see upcoming events and announcements,
- manage committee/responsibility roles,
- manage membership/governance flows,
- use Network Registry/Launch Control only when the user is a platform owner, not merely a community admin.

MPF Pune East is the flagship proving configuration, but implementation remains generic.

---

## 8. Residential / Housing Society experience

The structural mental model is:

**Society → Building/Tower → Wing → Floor → Unit/Flat → Household → People**

### Resident jobs

- find residents/units where allowed,
- see notices,
- create/track complaints,
- attach a complaint photo,
- see amenity availability/bookings,
- understand My Home/My Flat context,
- see relevant society updates.

### Chairman / committee jobs

The flagship Home should answer in seconds:

- What needs attention?
- What is overdue?
- What is happening today?
- What should I open next?

It summarizes:

- open complaints,
- maintenance dues,
- visitors,
- committee actions,
- compliance,
- assets,
- notices,
- bookings/events,
- finance and governance snapshots.

Cards link to the existing deeper modules; the Home does not replace them.

---

## 9. Complaint workflow

Residential complaints are the first complete notification/media operational loop.

1. resident creates complaint,
2. optionally adds a photo,
3. photo is compressed before upload,
4. complaint category can map to a responsibility role,
5. the resolver is assigned/notified,
6. notification deep-links to the exact complaint,
7. resolver/admin comments or changes status,
8. resident receives an update notification.

Complaint media remains private to authorized workflow participants.

---

## 10. Notifications

The bell/inbox is shared across verticals.

Notifications can carry:

- network context,
- priority,
- actor,
- entity type/id,
- deep-link surface,
- exact item id.

User actions:

- open inbox,
- read notification,
- mark all read,
- open destination.

The notification drawer is rendered at the document-body level to avoid app-shell z-index clipping.

Desktop uses a full-height side drawer. Mobile uses a tall bottom sheet with its own scroll area.

---

## 11. Browser push / PWA

When configured and explicitly enabled by the user:

- the browser can receive push while TrustWeave is not open,
- clicking the notification opens the relevant TrustWeave destination,
- the persisted in-app notification remains the source of truth,
- dead subscriptions are retired.

Push requires environment/VAPID configuration; absence of VAPID must not break the in-app inbox.

---

## 12. Mentions and responsibility routing

Network admins can assign responsibility roles.

Examples:

- President,
- Chairman,
- Secretary,
- Treasurer,
- Membership,
- Events,
- Facilities,
- Security,
- Complaint Resolver.

Users can use role mentions such as `@President` and named-member mentions where supported.

Mentions resolve only inside the active network.

---

## 13. Media experience

The current shared media direction covers:

- profile/DP,
- memories,
- events,
- announcements/posts,
- activities,
- complaints.

The browser:

- resizes the image,
- re-encodes to WebP,
- generates a thumbnail,
- removes embedded camera/EXIF metadata from the derivative,
- uploads into private storage,
- registers metadata in the shared media registry,
- later hydrates signed URLs.

Users should experience good visual quality without uploading original multi-megabyte camera files unnecessarily.

---

## 14. Appearance and branding

### Appearance themes

- Light
- Warm
- Modern
- Aurora
- Dark

Appearance changes the overall app environment.

### Brand palette

Launch Control can assign a vertical/network brand palette independently of Appearance.

This distinction should remain: **Appearance = user environment; palette = product/network identity.**

---

## 15. Language

The product has English/Hindi/Marathi localization foundations.

High-visibility surfaces should never add new hard-coded English copy when a message-token route exists.

Language QA is required for:

- overflow,
- mixed-language screens,
- mobile controls,
- tables/modals,
- important admin actions.

---

## 16. Launch Control — platform owner

Launch Control is a platform-level governance area and is organized conceptually into:

### Networks & Approvals

- auto/manual approval policy,
- network registry,
- status by vertical,
- creator/member/status details,
- approve/reject where needed.

### Showcase

- Create availability,
- Playground availability,
- Featured state,
- brand palette.

### Feature Rollout

- controlled release/pilot/test visibility where supported.

### Governance

- platform-owner controls,
- founder feedback/legacy request administration where still applicable.

Launch Control should never be used to hide an already-valid membership from My Networks.

---

## 17. Progressive disclosure rule

TrustWeave has more capability than should appear in primary navigation.

Therefore:

- primary navigation stays small,
- advanced areas move under More/Manage/Guide,
- role-specific admin functions are hidden from normal members,
- hidden means **progressively disclosed**, not deleted.

---

## 18. Loading, error and success behavior

A user should not have to infer that work is happening.

Important transitions must provide:

- loading feedback,
- clear success state,
- actionable error,
- safe retry/recovery when possible.

This specifically applies to:

- network creation,
- My Networks loading/switching,
- Playground transitions,
- uploads,
- complaint creation,
- invitation/claim workflows.

---

## 19. Mobile expectations

Mobile is a primary experience, not a compressed desktop layout.

Required behaviors:

- reachable CTAs,
- safe-area padding,
- usable bottom navigation,
- proper More disclosure,
- tall/scrollable notification sheet,
- modals that can be closed,
- no important action hidden below inaccessible scroll regions,
- images constrained to viewport.

---

## 20. Pilot support expectations

When demonstrating to a Society Chairman or Community President, the product should be understandable with minimal narration.

### Two-minute Society story

“Your residents, flats, notices, complaints, maintenance, visitors, governance and operations can live privately in one place.”

### Two-minute Community story

“Your member families, annual membership, events, birthdays, committee, announcements, history and photos can live together instead of being scattered across sheets and chat groups.”

### Family story

“Your extended family, relationships, memories and history can remain private and connected.”

---

## 21. Next UX additions after E5

Planned, not yet claimed complete:

- E6 membership funds / pool funds / event collections,
- E7 elections / nominations / voting / polls,
- E8 archive / storage / selective media cleanup.

These should reuse notifications, deep links, role routing and the shared media pipeline.
