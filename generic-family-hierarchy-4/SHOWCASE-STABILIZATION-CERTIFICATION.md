# Showcase UX Stabilization + Certification

## Mission
Make the three showcase journeys demo-safe without deleting or replacing vertical capabilities.

## Stabilized contracts

1. Existing memberships are independent of Showcase Create/Playground visibility.
2. Switching networks, opening My Networks, opening Playground, and signing in now show visible loading feedback instead of a dead screen.
3. My Networks reports transition failures inline instead of silently doing nothing.
4. Create/Join remains the original setup flow; the mobile `Choose how to start` CTA stays reachable above the safe area.
5. Sign-in modal closes via X, backdrop, or Escape. Account/help/mobile More overlays also have a keyboard escape path.
6. All five Appearance modes remain test-addressable: Light, Warm, Modern, Aurora, Dark.
7. Community and Residential flagship homes have stable certification anchors; their underlying modules remain unchanged.

## Automated source certification

```bash
npm run validate:showcase-stabilization
```

## Browser certification

Use the existing staging/free-tier QA setup and seeded roles. This suite is deliberately read-only except for changing local UI state; the mobile create test stops before creating a network.

```bash
npm run qa:showcase:headed
```

It certifies:

- non-owner Admin can see/open Family, Family Community, and Residential memberships;
- Community and Residential flagship homes render;
- Playground Back returns an authenticated user to My Networks;
- mobile `Choose how to start` remains inside the viewport;
- all five Appearance themes switch correctly;
- sign-in popup dismisses with Escape.

## Manual 2–3 minute demo scripts

### Family organizer
1. Sign in and open Family from My Networks.
2. Show Home in Simple mode and the family-at-a-glance content.
3. Open Family/Tree and one profile.
4. Show Me and privacy controls.
5. Return to My Networks.

Success signal: the user understands people, relationships, privacy and navigation without explanation.

### MPF / Family Community President
1. Open the Community network from My Networks.
2. On Home, point out Community Today, renewals, events, birthdays and announcements.
3. Open Families/Members.
4. Open Community Life.
5. Open More to demonstrate that advanced/admin capability is preserved rather than removed.
6. Return to My Networks.

Success signal: a President/Director can identify what needs attention within 20–30 seconds.

### Residential Chairman
1. Open Residential from My Networks.
2. On Home, show open complaints, dues, visitors, committee actions, compliance and assets.
3. Open Complaints.
4. Open Maintenance & Dues.
5. Open Committee & Meetings and Visitors & Security from More.
6. Return to Home and My Networks.

Success signal: a Chairman can understand society health and reach the operational module in one tap.

## Freeze rule after certification
Until a demo regression is found, do not redesign My Networks, auth, Create/Join, approval activation, or Playground return routing while building engagement features.
