-- 012: Make photo storage buckets private.
-- Drops the open "public can view" policies, flips both buckets to private,
-- and adds authenticated-only read policies so signed URLs are required.

update storage.buckets set public = false
where id in ('profile-photos', 'community-media');

drop policy if exists "public can view profile photos" on storage.objects;
drop policy if exists "public can view community media" on storage.objects;

drop policy if exists "authenticated can read profile photos" on storage.objects;
create policy "authenticated can read profile photos"
on storage.objects for select to authenticated
using (bucket_id = 'profile-photos');

drop policy if exists "authenticated can read community media" on storage.objects;
create policy "authenticated can read community media"
on storage.objects for select to authenticated
using (bucket_id = 'community-media');
