# FCA-0 — Family Community / Cultural Association Foundation

## Mission
Create a precise Family Community / Cultural Association vertical without changing the existing generic Community / Association template. MPF East is the proving case, but all code remains reusable for family-centric cultural/community associations and similar household-based societies.

## Product model
The paid/renewed membership unit is a Family. Each family has one Representative, an optional spouse, and children/dependents. Every person remains a first-class profile. For the MPF proving configuration, the annual cycle is April–March, dependent coverage defaults to age 22 or marriage, contact/profile visibility defaults to members, and the chapter controls official membership/payment/governance data.

## Implemented in FCA-0
- New `family-association` vertical, template, runtime composition, feature catalog, creation/playground registration, Launch Control contracts and isolated theme.
- Generic `association` remains unchanged.
- Family/person model with `represented_by`, `member_of_family`, `spouse_of`, `parent_of`, `serves_on`, and `supports` relationships.
- Family-grade rich people profiles: DOB/age, phone/email, profession, company/business, designation, industry, expertise, social links, bio, profile/contact visibility and discoverability.
- Pune + Area/Locality semantics instead of treating Kharadi/Hadapsar as cities.
- Directory modes: All, Families, Representatives, Members; visible Area and Profession filters; thumbnail support.
- Explicit Add Family / Add Member flows and automatic family link creation when a person is saved with a family.
- Family Community home retains Coming Up birthdays/events and community history while generic Outcome/Intelligence-style home panels are hidden.
- Dedicated Me & My Family and Build Together / Explore & Guide composition reused from the mature platform.
- Family co-admin scope reused so household helpers do not become network-wide admins.
- Temporal annual membership tables: membership years, family memberships, representative, renewal/payment/inactive/transfer history.
- Controlled role catalog and role history, with President, President Elect, Past President, Secretary, Treasurer, Director, Chairperson, Committee Member, Volunteer and Mentor defaults.
- Awards/recognition history.
- Annual finance ledger for opening balance, membership collection, donation, sponsorship, event contribution/allocation, good cause, expense, carry-forward and adjustment with visibility levels.
- Dedicated Manage Community panel for policy, membership year, family renewal/payment, controlled role assignment and finance entries.
- Safe productized network lifecycle: Leave; Archive & unlink while preserving network history; Permanent delete of network-owned data only.
- Shared lightweight activity engagement: like, comment and share action for community events/memories/updates.
- Existing productized seeding for Association, Organization, Business Trust, Franchise and Professional is preserved fully.

## Important governance boundaries
- Ordinary member/profile editing cannot change official membership status/year or committee assignment.
- Official membership/payment, controlled roles and finance are admin-owned.
- Permanent network deletion cascades network-owned rows but does not delete auth/profile identity or data owned by another network.
- Intelligence and advanced generic platform surfaces are hidden from the Family Community member composition.
- Formal election-grade voting remains a future governed capability; Pulse/likes are not elections.
- Email entered on a profile is identity/contact data. The current productized join flow generates a join code/link; no server email transport is claimed by FCA-0.

## Validation
`npm run validate:fca0` passes 27 source-contract checks.

Changed TS/TSX files were syntax-transpiled with TypeScript 5.8.3 successfully. Full project `tsc`/Next build cannot be truthfully certified in this reconstructed workspace because project dependencies are not installed completely; run the supplied runtime checklist in the real repository after applying migration 080.

## Next evidence-driven work
FCA-1 should focus on the actual 10-family pilot flow and runtime evidence: family self-onboarding/review policy, invitation delivery UX, Excel column mapping, family/person RSVP counts + guests, event contribution tracking, richer comments/gallery links, change-request approvals and field-level governance, annual-history member views, and parent/umbrella connection UX kept simple.
