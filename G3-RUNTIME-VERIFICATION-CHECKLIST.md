# G3 Runtime Verification — Short Smoke

G3 has no database migration and no intended Family UX change. Do not run a full manual regression solely for this architecture extraction.

1. Open an existing Family and confirm Home / Family loads normally.
2. Open Family Admin → **Build together** and confirm existing sessions/branches load.
3. Open one contribution link and submit a small test branch; confirm it appears for Owner review.
4. If a possible duplicate exists, use **Same / Different / Not sure** once; commit a clean branch if convenient.
5. Reload once and glance at the console for missing-export/construction-adapter errors.

If these work, treat the deployed G3 smoke as sufficient unless another regression is observed.
