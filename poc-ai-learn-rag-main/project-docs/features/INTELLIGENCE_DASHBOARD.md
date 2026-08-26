# Intelligence Dashboard

**Shipped:** 2026-08-03  
**Mission:** Intelligence Consolidation — replace 8 separate intelligence tabs with one high-density command centre.

---

## Problem

We had 11 navigation items, with 5 intelligence-related panels spread across a dropdown:
- Insights, Risk, Gaps, Memory, Analytics — separate tabs with no shared context.

This was a feature factory symptom: each panel showed one dimension of intelligence in isolation. A user wanting a complete picture had to visit 5 different panels and assemble it mentally.

---

## Solution

A single **Intelligence Dashboard** (`🧠 Intelligence`) promoted to the primary nav bar. It surfaces all intelligence dimensions in one view with drill-down links to each full panel.

---

## Layout

### Intelligence Density Score (IDS)

The north star metric displayed at the top. Computed client-side from all available signals:

| Component | Weight | Source |
|---|---|---|
| Answer quality (success rate) | 0.30 | insights.overallSuccessRate |
| Query volume (min(queries/50, 1)) | 0.15 | insights.totalQueries |
| Memory richness (min(clusters/8, 1)) | 0.20 | memory.clusters.length |
| Gap resolution (1 − gap pressure) | 0.15 | gaps.totalBlocked / totalQueries |
| Risk baseline established | 0.10 | riskData exists |
| Average health score | 0.10 | health avg / 100 |

**IDS thresholds:**
- < 0.20: Just starting
- 0.20–0.40: Building momentum
- 0.40–0.60: Growing — intelligence compounding
- 0.60–0.70: Strong — approaching moat threshold
- ≥ 0.70: **Moat achieved — this org won't leave**

A vertical marker at 70% on the IDS bar shows the moat threshold visually.

### KPI Row (6 tiles, each clickable → full panel)

Answered % · Open Gaps · Risk Alerts · Mem Clusters · Avg Health · Total Queries

### 4 Dimension Cards

Each card shows top-4 entries with a "View all →" link that navigates to the full panel:

1. **🔎 Documentation Gaps** — top clusters with action type badge
2. **⚠️ Knowledge Risk** — critical/high sections with risk level + signals
3. **🔍 Top Searched Topics** — mini horizontal bar chart, trending flag
4. **🧠 Organisational Memory** — top recurring clusters, trending marker

---

## Navigation Changes

**Before:** Intelligence dropdown (Insights, Risk, Gaps, Memory, Analytics) + Knowledge dropdown + Manage dropdown

**After:**
- Primary nav: `Chat` · `🧠 Intelligence` (dashboard)
- Knowledge dropdown: Knowledge Map, Decisions, Health, Onboard (unchanged)
- Manage dropdown: Upload, Chunks, Analytics + all detail panels (for power users)

The 5 individual intelligence panels remain fully functional — accessible from within the dashboard via "View All" links or via the Manage dropdown.

---

## Implementation

- **New component:** `frontend/src/components/chat/IntelligenceDashboard.tsx`
- **Store change:** `ActivePanel` union extended with `'intelligence'`
- **App.tsx:** `'intelligence'` added to `NAV_PRIMARY`, dashboard rendered, `onNavigate` prop enables drill-down
- **CSS:** `.id-*` namespace, responsive 2-column grid, dark mode variants

---

## IDS Alignment

This dashboard is the first time IDS is **visible to the user**. Every future feature should increase IDS speed — get customers from 0 to 0.7 faster. The dashboard makes that progress tangible.
