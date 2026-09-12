# FCA-0.1 Entity / Relationship Contract Fix

## Failure
`FCA runtime compatibility check failed: entity kinds missing.`

## Root cause
The first version of migration 081 reasserted `g8_productized_vertical()` and create-network contracts, but only asserted that `g8_allowed_entity_kind()` and `g8_allowed_relationship()` already contained Family Community Association rules. It did not recreate those two functions itself.

If migration 080 was absent/partially applied or a later migration had replaced either shared function, 081 failed exactly as observed.

## Fix
Migration 081 is now standalone/idempotent and explicitly recreates:

- FCA entity kinds: `family`, `person`, `committee`, `organization`, `location`
- FCA relationships: `represented_by`, `member_of_family`, `spouse_of`, `parent_of`, `serves_on`, `supports`

It preserves the existing contracts for Association, Organization, Business Trust, Franchise and Professional.

The final migration guard validates the complete FCA set rather than only `family`, `person`, `member_of_family` and `represented_by`.

## Apply
Rerun the corrected `081_fca01_family_association_runtime_compatibility.sql`.

The earlier failed execution rolled back, so no cleanup migration is required for that failed attempt.
