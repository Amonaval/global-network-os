# NX-9 Help Modal Theme Contrast Fix

Fixes the contextual help modal contrast issue across Light, Dark and Aurora themes.

## What changed
- Replaced undefined NX-8/NX-9 surface aliases inside the modal with theme-safe variables backed by the established global theme tokens.
- Added explicit dark-theme modal surface, panel, text, muted text, border and accent values.
- Added Aurora overrides.
- Hardened header, cards, guardrail, footer and close button so inherited colors cannot make content unreadable.
- Strengthened the dark backdrop while keeping the modal visually distinct.

No component behavior, feature flags or backend logic changed.
