# S2-B — Community Umbrella & Opt-in Discovery

Status: **IMPLEMENTED IN SOURCE / LIVE VERIFY**

## Product thesis
A private family network can become more useful when it connects upward into a trusted community structure, but family membership must never automatically expose a person outside the family.

Example hierarchy:

`Maheshwari Community → Pune Maheshwari → East Pune Circle → Nawal Family`

A family may participate at its approved chapter/city/community level. Community discovery exposes only explicit published snapshots — never another family's private tree, relationships, phone/email, memories or admin data.

## Implemented in S2-B
1. Hierarchical community spaces (`community`, `city`, `chapter`, `association`).
2. Family → community link requests with Platform Owner approval.
3. Opt-in personal community cards by category:
   - Marriage
   - Professional
   - Services
   - Mentor
   - Speaker
   - Education
   - Social service
   - Business
   - Arts & culture
4. Community needs/posts published at the selected umbrella level.
5. Marriage consent guard: a marriage-targeted post requires that person to first publish their own Marriage card.
6. Community Highlights: Platform Owner-curated featured profiles. **No popularity/rating leaderboard for marriage.**
7. Family affiliation shown as an introduction context without exposing lineage.
8. Playground showcase: Maheshwari → Pune → East Pune, opt-in candidate/service/speaker profiles and realistic community needs.
9. Mobile-first Community screen and empty/link states.

## Privacy boundary
- Publishing a profile is self-service only: the claimed member can publish their own card.
- Family admins may not silently publish another person's community profile.
- Community profile snapshots contain only opted-in display fields.
- Direct family tables remain RLS-isolated.
- Cross-family discovery is served through security-definer RPCs.
- Marriage profiles are not ranked, rated or labeled VIP.
- Introduction requests are preferred over exposing personal phone/email.

## Not yet implemented / future S2
- Trusted cross-family relationship path (“how our families are connected”). This needs explicit cross-family edges or accepted introduction records; never infer kinship from caste/community/surname.
- Community admins separate from Platform Owners.
- Moderation/reporting workflow for community posts/cards.
- Anonymous/public community directory. Current discovery is authenticated + approved-community scoped.
- Endorsements/reputation signals with anti-abuse governance.
- Community commerce/booking/payment.
- Matrimonial workflow beyond discovery/introduction consent.
- Community-level digest/notifications and analytics.

## Product decision: VIP / Popular
Do not implement generic popularity ratings. Replace with governed **Community Highlights** such as Featured Speaker, Education Mentor, Social Service, Arts, Business, etc. This creates discovery value without turning family/community identity into a social-status leaderboard.

## Behavior gate
Validate:
1. unlinked family can discover community names but cannot search member cards;
2. Family Owner requests a link;
3. Platform Owner approves;
4. member publishes only their own card;
5. another family in the same scope can discover that card but cannot access private profile/tree/contact details;
6. marriage post fails until target has opted in;
7. service/professional post publishes at correct level;
8. city scope does not accidentally expose unrelated communities;
9. hide/unpublish removes card from discovery;
10. 360/390/430 mobile layout and recovery states.
