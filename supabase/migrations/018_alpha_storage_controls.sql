-- Alpha storage controls. Run after 017.
alter table public.network_settings
  add column if not exists photo_upload_enabled boolean not null default false;

-- Alpha default is deliberately OFF. Admin may enable it from Family settings.
update public.network_settings set photo_upload_enabled=false where photo_upload_enabled is null;
