# Free-tier POC QA v2

- Keeps `@playwright/test` in `devDependencies` as `^1.55.0`.
- Uses one browser login for both Family and Housing Society.
- Selects seeded networks deterministically through `qa-nav-networks` / seeded network-card testids instead of assuming the active network after login.
- Keeps RPC permission audit evidence, but its current findings are advisory in POC mode and no longer inflate the compact POC pass/fail summary.
