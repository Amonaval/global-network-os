# Cross-Network Discovery Runtime Hotfix

## Problem
The M6-C/M6-E discovery RPC assumed every claimed person existed in `network_entities`. That is true for generic/productized verticals, but not for the two mature native verticals:

- Family identities live in `family_members`, linked through `network_memberships.member_id`.
- Alumni identities live in `alumni_profiles`, linked through `claimed_by`.

As a result, an accepted bridge could be valid while discovery either returned no useful candidates for Family/Alumni targets or failed when later code expected a generic `target_entity_id`.

## Fix
Migration `065_discovery_vertical_neutral_hotfix.sql` makes candidate references vertical-neutral while preserving the same privacy model:

- generic/productized person -> `network_entities.owner_user_id`
- alumni person -> `alumni_profiles.claimed_by`
- family person -> active `network_memberships.member_id`

`target_entity_id` remains populated for generic entities but becomes nullable. New opaque `target_subject_kind` + `target_ref_id` columns allow the consent workflow to resolve the correct label only after acceptance.

## Runtime prerequisites
Migrations 058, 059, 060 and 061 must already be applied before 065. If the API error says the RPC does not exist, apply the missing M6-C/M6-D/M6-E migrations first, then 065.

## Verify
1. Confirm bridge status is `accepted` and `discovery` is enabled.
2. Search from Network A for a claimed member/profile in Network B.
3. Family target: member must be approved and claimed by an active membership.
4. Alumni target: alumni profile must have `claimed_by` and `visibility='members'`.
5. Generic target: entity must be `kind='person'`, `owner_user_id` set, `visibility='members'`.
6. Discovery result must remain anonymous until target accepts the introduction.
