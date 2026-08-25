# G7 Certification Hotfix — Native `Map` Constructor Collision

**Date:** 2026-08-25  
**Status:** FIXED / CERTIFIED  
**Scope:** Frontend runtime hotfix; no database migration

## Symptom

Opening Alumni after G7 could fail with:

```text
TypeError: ...lucide_react....default is not a constructor
components/AlumniNetworkApp.tsx
const counts = new Map<string, number>()
```

## Root cause

`AlumniNetworkApp.tsx` imported the Lucide icon named `Map`, while G7 Places also used JavaScript's native `Map` collection constructor. The icon import shadowed the global constructor at runtime.

## Fix

The Lucide icon is now explicitly aliased:

```ts
import { ..., Map as MapIcon, MapPin, ... } from "lucide-react";
```

Icon rendering uses `<MapIcon />`, while Places aggregation continues to use the native `new Map(...)` collection.

## Regression protection

`validate:g7` now fails if `AlumniNetworkApp.tsx` imports an unaliased Lucide `Map` while using the native `Map` constructor.

## Certification

After the correction, the complete historical automated chain was rerun:

**D1 → V1 → CR1/CR2 → S1 → S2 → S3-A1 → G1.1 → G1.4 → G2 → G3 → G4 → G5 → G6 → G7: PASS**

G7 continues to preserve:
- 147 historical remote facade exports
- 289 accepted G6 files
- 7 protected Family foundations
- dual MET projection acceptance tests

## Deployment

No SQL migration or Supabase action is required for this hotfix.
