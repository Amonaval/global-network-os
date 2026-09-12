# Stability Hotfix — Association Home i18n

## Fix
Added `AllCaughtUpTxt` to EN/HI/MR message catalogs.

This fixes the typed-i18n build error in `components/AssociationHome.tsx` where the Community Today attention strip renders its zero-attention state.

## Important CSS preservation note
This patch intentionally does **not** contain `app/globals.css`.

A previous stability overlay was based on an E8-certified tree and could overwrite E9-only CSS such as the `/* E9 — shared community posts & important broadcasts */` / `.network-posts-panel` block. Never apply an older `globals.css` over an E9/E10 tree. Restore that block from the exact E9 source/version rather than reconstructing it from an older baseline.
