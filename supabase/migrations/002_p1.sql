alter table public.family_members add column if not exists latitude numeric(10,7);
alter table public.family_members add column if not exists longitude numeric(10,7);
create index if not exists idx_family_members_coordinates on public.family_members(latitude,longitude);
-- Production: enforce phone/email visibility using authenticated RLS/API.
