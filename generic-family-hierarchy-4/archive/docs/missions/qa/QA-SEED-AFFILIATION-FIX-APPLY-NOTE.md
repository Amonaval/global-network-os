# QA seed affiliation fix

Apply these files over the current QA baseline.

Fix: the deterministic seeder no longer sends an invented `qa` network affiliation dimension to `upsert_productized_network_entity`. QA provenance remains in entity metadata (`qa`, `namespace`, `qaPurpose`).
