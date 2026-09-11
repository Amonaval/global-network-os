-- S0.1 — Correct showcase defaults after 099.
-- Only seed-owned rows are changed; founder-edited rows (updated_by is not null) are preserved.

update public.platform_showcase_verticals
set create_enabled = true, playground_enabled = true, featured = true, updated_at = now()
where vertical_kind in ('family','family-association','housing-society')
  and updated_by is null;

update public.platform_showcase_verticals
set create_enabled = false, playground_enabled = false, featured = false, updated_at = now()
where vertical_kind in ('alumni','association','organization','business-trust','franchise','professional')
  and updated_by is null;
