# Apply the S3-A Pilot Freeze Patch

1. Overlay the affected/new files on the latest working Family Network codebase.
2. Run `node scripts/archive-legacy-docs.mjs` once to move superseded root planning files into `archive/history/` if those originals still exist locally.
3. Apply Supabase migration `042_s3a_pilot_launch_defaults.sql` after migration 041.
4. Open Platform Owner → Launch Control and review the resulting defaults against `PILOT-LAUNCH-VISIBILITY.md`.
5. Assign pilot family IDs before relying on the `Pilot` state for Gatherings or Share with family.
6. Do not start S3-B/C/D/E during the feedback pause unless explicitly decided.

The archive is historical only. Current work should ignore `archive/history/` unless old reasoning or regression history is specifically needed.
