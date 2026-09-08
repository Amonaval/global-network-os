# XP-7 Supabase Export Type Hotfix

## Build failure

Next.js/TypeScript rejected the XP-5 export helper because `ReturnType<typeof createClient>` collapses the generic Supabase client schema parameters into an incompatible client type. The service-role client created in `buildNetworkExport` is a normal `SupabaseClient<any, "public", ...>`, while the helper parameter was inferred as an unrelated `SupabaseClient<unknown, ..., never, ...>`.

## Fix

`listAll` no longer accepts or types the entire Supabase client. It accepts only the `storage` API it actually uses:

```ts
type StorageApi = ReturnType<typeof createClient>["storage"];
async function listAll(storage: StorageApi, bucket: string, prefix: string) { ... }
```

Call sites pass `admin.storage`. This removes database-schema generic coupling from a storage-only helper and keeps the boundary type-safe without `as any`.

The XP-5 gate was also relaxed from an exact implementation string to accept both equivalent Storage API call shapes.
