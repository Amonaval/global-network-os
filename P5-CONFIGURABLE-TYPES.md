# P5 Task: Configurable Entity & Relationship Types

## How to start this session
1. Read `CODEBASE.md` first (project root) — full file map, data model, dev rules.
2. Read this file completely before touching any code.
3. Context warning: warn user if conversation exceeds 100k tokens.

---

## What to implement

The app is currently hardcoded to family vocabulary. Every UI label, every legend item, every button says "Member", "Generation", "Parent", "Spouse". The goal is to make these configurable via `network_settings` so the same app works for org charts, alumni networks, skill trees, academic genealogies, etc.

**Scope: UI label configuration only.** The DB structural types (`parent`/`child`/`spouse`) do NOT change — they drive the tree layout algorithm. Only the *display labels* become configurable. This is the 80/20 approach.

---

## Current hardcoded strings to replace (by file)

### `components/NetworkApp.tsx`
- `"Submit Profile"` button → `"Submit ${cfg.entity_label}"`
- `"Member Directory"` heading → `"${cfg.entity_label_plural} Directory"`
- `"members"` in stats sidebar → `cfg.entity_label_plural.toLowerCase()`
- `"generations"` in stats → `cfg.level_label_plural.toLowerCase()`
- `"Submit Profile"` in Directory → dynamic

### `components/TreeView.tsx`
- Legend: `"family"` → `cfg.child_label` (or `cfg.parent_label`)
- Legend: `"spouse"` → `cfg.peer_label`

### `components/ProfileDrawer.tsx`
- `"Generation {member.generation_level}"` → `"${cfg.level_label} ${member.generation_level}"`
- `"Family Connections"` heading → `"Connections"`
- Relationship type labels: `"Parent"`, `"Child"`, `"Spouse"` → `cfg.parent_label`, `cfg.child_label`, `cfg.peer_label`

### `components/ProfileForm.tsx`
- `"Submit Profile"` → dynamic

### `components/SetupScreen.tsx`
- Add template selector (see Templates section below)
- After network name/description, show template cards

### `components/RelationshipModal.tsx`
- `"Add Parent"`, `"Add Spouse"` → use config labels

### `app/globals.css` / inline labels
- Any hardcoded "Generation" or "Member" strings

---

## DB change — extend `network_settings`

### Migration file: `supabase/migrations/011_configurable_types.sql`

```sql
ALTER TABLE network_settings
  ADD COLUMN IF NOT EXISTS entity_label       text NOT NULL DEFAULT 'Member',
  ADD COLUMN IF NOT EXISTS entity_label_plural text NOT NULL DEFAULT 'Members',
  ADD COLUMN IF NOT EXISTS level_label        text NOT NULL DEFAULT 'Generation',
  ADD COLUMN IF NOT EXISTS level_label_plural text NOT NULL DEFAULT 'Generations',
  ADD COLUMN IF NOT EXISTS parent_label       text NOT NULL DEFAULT 'Parent',
  ADD COLUMN IF NOT EXISTS child_label        text NOT NULL DEFAULT 'Child',
  ADD COLUMN IF NOT EXISTS peer_label         text NOT NULL DEFAULT 'Spouse',
  ADD COLUMN IF NOT EXISTS network_template   text NOT NULL DEFAULT 'family';
```

Existing rows keep defaults (family vocabulary) — fully backwards compatible.

---

## TypeScript changes

### `lib/network.ts` — extend `NetworkSettings` type

```typescript
export type NetworkSettings = {
  id: string;
  name: string;
  description?: string;
  initialized_at?: string;
  updated_at?: string;
  // New fields (all have defaults matching current behaviour)
  entity_label: string;        // "Member"
  entity_label_plural: string; // "Members"
  level_label: string;         // "Generation"
  level_label_plural: string;  // "Generations"
  parent_label: string;        // "Parent"
  child_label: string;         // "Child"
  peer_label: string;          // "Spouse"
  network_template: string;    // "family"
};

// Helper — always safe to call even if network is null
export function getNetworkConfig(network: NetworkSettings | null) {
  return {
    entity_label:        network?.entity_label        ?? 'Member',
    entity_label_plural: network?.entity_label_plural ?? 'Members',
    level_label:         network?.level_label         ?? 'Generation',
    level_label_plural:  network?.level_label_plural  ?? 'Generations',
    parent_label:        network?.parent_label        ?? 'Parent',
    child_label:         network?.child_label         ?? 'Child',
    peer_label:          network?.peer_label          ?? 'Spouse',
    network_template:    network?.network_template    ?? 'family',
  };
}
```

### Pattern in components
```typescript
// At top of any component that needs labels:
import { getNetworkConfig } from '../lib/network';
// ...
const cfg = getNetworkConfig(network); // network comes from props or context
// Then use cfg.entity_label, cfg.parent_label, etc.
```

---

## Templates (for SetupScreen)

Add a template selection step to `SetupScreen.tsx`. When a template is chosen, it pre-fills the config fields. User can customise after.

```typescript
export const NETWORK_TEMPLATES = [
  {
    id: 'family',
    name: 'Family Tree',
    description: 'Track generations, marriages, and family history',
    entity_label: 'Member', entity_label_plural: 'Members',
    level_label: 'Generation', level_label_plural: 'Generations',
    parent_label: 'Parent', child_label: 'Child', peer_label: 'Spouse',
  },
  {
    id: 'org',
    name: 'Organisation Chart',
    description: 'Company reporting lines and team structures',
    entity_label: 'Employee', entity_label_plural: 'Employees',
    level_label: 'Seniority', level_label_plural: 'Levels',
    parent_label: 'Manager', child_label: 'Direct Report', peer_label: 'Co-founder',
  },
  {
    id: 'alumni',
    name: 'Alumni Network',
    description: 'School or university alumni by batch and year',
    entity_label: 'Alumni', entity_label_plural: 'Alumni',
    level_label: 'Batch Year', level_label_plural: 'Batch Years',
    parent_label: 'Senior', child_label: 'Junior', peer_label: 'Classmate',
  },
  {
    id: 'academic',
    name: 'Academic Lineage',
    description: 'PhD advisor–student trees and research lab hierarchies',
    entity_label: 'Researcher', entity_label_plural: 'Researchers',
    level_label: 'Career Stage', level_label_plural: 'Stages',
    parent_label: 'Advisor', child_label: 'Student', peer_label: 'Collaborator',
  },
  {
    id: 'corporate',
    name: 'Corporate Ownership',
    description: 'Subsidiaries, parent companies, and board relationships',
    entity_label: 'Company', entity_label_plural: 'Companies',
    level_label: 'Tier', level_label_plural: 'Tiers',
    parent_label: 'Parent Company', child_label: 'Subsidiary', peer_label: 'Partner',
  },
  {
    id: 'skills',
    name: 'Skill Tree',
    description: 'Technology prerequisites and learning path dependencies',
    entity_label: 'Skill', entity_label_plural: 'Skills',
    level_label: 'Difficulty', level_label_plural: 'Levels',
    parent_label: 'Prerequisite of', child_label: 'Required for', peer_label: 'Related',
  },
];
```

---

## `lib/remote.ts` — update saveNetworkSettings

`saveNetworkSettings` currently upserts only `name` and `description`. Extend the payload to include the new fields:

```typescript
export async function saveNetworkSettings(settings: NetworkSettings) {
  if (!supabase) return;
  const { error } = await supabase.from('network_settings').upsert({
    id: 'network',
    name: settings.name,
    description: settings.description || '',
    entity_label: settings.entity_label ?? 'Member',
    entity_label_plural: settings.entity_label_plural ?? 'Members',
    level_label: settings.level_label ?? 'Generation',
    level_label_plural: settings.level_label_plural ?? 'Generations',
    parent_label: settings.parent_label ?? 'Parent',
    child_label: settings.child_label ?? 'Child',
    peer_label: settings.peer_label ?? 'Spouse',
    network_template: settings.network_template ?? 'family',
  }, { onConflict: 'id' });
  if (error) throw error;
}
```

---

## `lib/store.ts` (Local mode) — saveLocalNetwork already passes full settings object

Check that `saveLocalNetwork` persists the new fields. It currently takes `name` and `description` as separate params. Either extend the signature or pass the full `NetworkSettings` object.

---

## Implementation order

1. Write migration `011_configurable_types.sql`
2. Extend `NetworkSettings` type + add `getNetworkConfig()` helper in `lib/network.ts`
3. Add `NETWORK_TEMPLATES` array (new file or in `lib/network.ts`)
4. Update `saveNetworkSettings` in `lib/remote.ts`
5. Update `SetupScreen.tsx` — add template cards before the name/description step
6. Update `NetworkApp.tsx` — pass `cfg` down to components (or use a simple prop)
7. Update `TreeView.tsx` — legend labels
8. Update `ProfileDrawer.tsx` — "Generation X" label + relationship type labels
9. Update `RelationshipModal.tsx` — button labels
10. Update `ProfileForm.tsx` and Directory section labels
11. Test: create a new network using "Org Chart" template, verify all labels changed. Then verify an existing "family" network still shows original labels.

---

## Key constraint: backwards compatibility

All new `network_settings` columns have `DEFAULT` values matching the current family vocabulary. Existing deployed networks show no change. The `getNetworkConfig()` helper also falls back to defaults if `network` is null. Nothing breaks.

---

## What NOT to do

- Do NOT rename the DB table `family_members` — too many queries reference it
- Do NOT change the structural `relationship_type` values (`parent`/`child`/`spouse`) in the DB — the tree layout algorithm depends on them
- Do NOT add a settings UI inside the running app yet (can be P5.2) — template is chosen once at setup
- Do NOT implement custom relationship types beyond label renaming in this task
