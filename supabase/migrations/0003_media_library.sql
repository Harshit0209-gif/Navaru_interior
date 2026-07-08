-- Media Library & Image Upload System — run this once in the Supabase SQL
-- Editor. Safe to re-run. Requires 0001 (schema.sql) and 0002
-- (portfolio_admin) to have been run first.
--
-- What this does:
--   1. Creates the `website-assets` storage bucket (portfolio-images and
--      attachments already exist from earlier migrations).
--   2. Expands allowed MIME types on portfolio-images/website-assets to
--      include SVG and PDF, and raises the size limit for pre-compression
--      originals.
--   3. Grants authenticated (admin) users upload/replace/delete rights on
--      both buckets (previously read-only for everyone).
--   4. Creates `media_assets`, the Media Library's metadata table —
--      independent of `portfolio_images` (per-project galleries), tracking
--      every file uploaded through the Media Library regardless of whether
--      it's currently used on a project.

-- ---------------------------------------------------------------------------
-- 1 & 2. Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'website-assets', 'website-assets', true, 15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

update storage.buckets
set
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'],
  file_size_limit = 15728640
where id = 'portfolio-images';

-- ---------------------------------------------------------------------------
-- 3. Storage RLS — authenticated admins can manage both media buckets
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated users can upload portfolio images" on storage.objects;
create policy "authenticated users can upload portfolio images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-images');

drop policy if exists "authenticated users can update portfolio images" on storage.objects;
create policy "authenticated users can update portfolio images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-images')
  with check (bucket_id = 'portfolio-images');

drop policy if exists "authenticated users can delete portfolio images" on storage.objects;
create policy "authenticated users can delete portfolio images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-images');

drop policy if exists "website assets are publicly readable" on storage.objects;
create policy "website assets are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'website-assets');

drop policy if exists "authenticated users can upload website assets" on storage.objects;
create policy "authenticated users can upload website assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'website-assets');

drop policy if exists "authenticated users can update website assets" on storage.objects;
create policy "authenticated users can update website assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'website-assets')
  with check (bucket_id = 'website-assets');

drop policy if exists "authenticated users can delete website assets" on storage.objects;
create policy "authenticated users can delete website assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'website-assets');

-- ---------------------------------------------------------------------------
-- 4. media_assets
-- ---------------------------------------------------------------------------
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null check (bucket_id in ('portfolio-images', 'website-assets')),
  folder text not null default 'general',
  file_name text not null,
  file_path text not null unique,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint not null,
  width int,
  height int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_media_assets_bucket on media_assets(bucket_id);
create index if not exists idx_media_assets_folder on media_assets(folder);
create index if not exists idx_media_assets_created on media_assets(created_at desc);

alter table media_assets enable row level security;

-- Admin-only: the Media Library browsing UI is never shown to anonymous
-- visitors, and the images themselves are already served straight from
-- Storage's public URLs regardless of this table's access.
drop policy if exists "authenticated users can manage media assets" on media_assets;
create policy "authenticated users can manage media assets"
  on media_assets for all
  to authenticated
  using (true)
  with check (true);

drop trigger if exists trg_media_assets_updated_at on media_assets;
create trigger trg_media_assets_updated_at
  before update on media_assets
  for each row execute function set_updated_at();
