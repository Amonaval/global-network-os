# QA seed all-vertical entity-kind fix

Audited all nine QA vertical seed markers against the latest active `g8_allowed_entity_kind` contract (migration 082, which is the final migration redefining that function).

Corrected:
- business-trust: `business` -> `organization`
- professional: `professional` -> `person`

Verified existing marker kinds are valid:
- housing-society: unit
- family-association: family
- association: household
- organization: person
- franchise: location

Family and Alumni use dedicated seed paths/RPCs.

A regression contract now locks all nine mappings.
