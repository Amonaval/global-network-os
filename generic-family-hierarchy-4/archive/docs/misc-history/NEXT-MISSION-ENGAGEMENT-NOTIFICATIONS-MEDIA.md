# Next Mission — Engagement, Notifications, Governance & Media

This is the agreed mission after showcase stabilization/certification.

## Product thesis
People rarely open a private community app just to browse. Useful, permission-aware notifications should bring them back to the exact item that needs attention. Photos and lightweight social participation make the network feel alive.

## Scope to design before implementation

### 1. Notification foundation
- In-app notification inbox for every vertical.
- Web Push / installable PWA notification path so important alerts can appear without the app already being open.
- Every notification contains a deep link into the exact network and page/item.
- Read/unread, grouped notifications, preference controls, quiet hours/digest options, and safe defaults.
- Role-aware routing: President, committee member, complaint resolver, event organizer, household representative, etc.
- Mentions/tagging (`@President`, named board member, responsible team/person) create targeted notifications.
- No cross-network leakage: network membership and authorization are rechecked when a deep link opens.

### 2. Residential engagement
- Complaint with photos.
- Complaint category can map to one or more responsible resolvers/committee roles.
- New complaint, assignment, comment, status change and resolution notify the relevant people.
- Resident who raised it receives progress/resolution notifications.
- Posts/notices can include images and targeted mentions.

### 3. Community / MPF governance
- Membership fee/pool-fund ledger and yearly cycle visibility.
- Events, RSVP and event-specific collections where required.
- Elections: nomination, eligible-voter rules, voting window, one-person/household policy as configured, result publication and audit history.
- General voting/polls for resolutions or community decisions, distinct from formal elections.
- Important posts/announcements and role/member tagging.

### 4. Image/media architecture
- Profile/DP image with strict dimensions/size target and thumbnail derivative.
- Complaint images with optimized preview + optional higher-quality source within policy.
- Event/memory photos compressed on upload with multiple sizes rather than serving originals everywhere.
- Client-side resize/compression before upload where supported to save bandwidth/storage.
- Server/storage validation still enforces MIME type, byte size and ownership; client compression is not a security boundary.
- Strip unnecessary EXIF/location metadata by default for privacy.
- Lazy loading and thumbnails for feeds/directories.

### 5. Storage lifecycle
- Network-level media quota and usage meter.
- Active vs archived media state.
- Archive older event/media collections without breaking historical references.
- Admin-selective deletion plus safe confirmation and audit record.
- Orphan-media cleanup after entity/post deletion.
- Retention policy configurable later; no blind destructive cleanup.
- Deduplication/content hash can be evaluated after the basic lifecycle is stable.

### 6. Delivery order
1. Notification data model + deep-link contract + in-app inbox.
2. PWA/web push subscription and delivery.
3. Mentions and role-based routing.
4. Residential complaint assignment + photo path as first end-to-end proof.
5. Shared media pipeline (DP/event/complaint thumbnails and compression).
6. MPF funds/events.
7. Elections/voting.
8. Media archive/quota/cleanup dashboard.

## Guardrails
- Preserve all current vertical capabilities.
- Start with low-cost/free-tier-safe storage and tiny POC datasets.
- Do not make push delivery the source of truth: notifications are persisted in-app first; push is a delivery channel.
- Deep links must re-check authorization.
- Photos must never be public merely because their storage URL is known.
