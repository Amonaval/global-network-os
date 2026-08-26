# G6 — Very Short Runtime Verification

After deploying code and applying migration `046_g6_two_vertical_hardening.sql`:

1. Open an existing **Family Network** and confirm Home + Family still look normal.
2. Open **Sample Alumni Network**: the page should be styled/polished, not raw browser buttons/text; open Directory once.
3. Switch **Alumni → Family → Alumni** once and confirm the correct vertical UI/data returns each time.
4. As Platform Owner, open **Launch Control**, switch Family/Alumni tabs and confirm each shows its own features/networks. Do not change every toggle.
5. Reload once and glance at the console for `Unknown feature key`, cross-vertical or missing-RPC errors.

If these five checks pass, G6 high-level runtime verification is sufficient unless a specific workflow fails.
