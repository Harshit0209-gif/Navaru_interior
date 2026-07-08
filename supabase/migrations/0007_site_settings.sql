-- Website Settings CMS — run this once in the Supabase SQL Editor. Safe to
-- re-run. Requires 0001–0006 to have been run first.
--
-- What this does:
--   1. Creates a `site_settings` table — a single-row store for site-wide
--      configuration (company name, logo, favicon, contact details, social
--      links, footer copy, SEO defaults, Google Analytics, meta tags,
--      WhatsApp number).
--   2. Seeds it with the values that were previously hardcoded across the
--      frontend (Footer, Contact page, index.html), so nothing changes
--      visually until an admin edits something in /admin/settings.
--   3. RLS: anyone can read (the public site needs these values to render),
--      only authenticated admins can update. There is deliberately no
--      INSERT or DELETE policy — this table is a fixed singleton row,
--      seeded once below and only ever updated afterward.

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),

  -- Company identity
  company_name text not null default 'Navaru Interior Solution',
  logo_url text,
  favicon_url text,

  -- Contact
  contact_phones text[] not null default '{}',
  whatsapp_number text,
  email text,
  address text,
  google_maps_embed_url text,

  -- Social links
  social_instagram text,
  social_facebook text,
  social_linkedin text,
  social_pinterest text,
  social_youtube text,
  social_twitter text,

  -- Footer copy
  footer_tagline text,
  footer_cta_heading text,
  footer_bottom_tagline text,

  -- SEO defaults
  seo_default_title text,
  seo_default_description text,
  seo_og_image_url text,
  seo_keywords text[] not null default '{}',

  -- Analytics & meta tags
  ga_measurement_id text,
  meta_theme_color text,
  meta_robots text not null default 'index, follow',
  google_site_verification text,

  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

drop trigger if exists trg_site_settings_updated_at on site_settings;
create trigger trg_site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

drop policy if exists "site settings are publicly readable" on site_settings;
create policy "site settings are publicly readable"
  on site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated users can update site settings" on site_settings;
create policy "authenticated users can update site settings"
  on site_settings for update
  to authenticated
  using (true)
  with check (true);

-- Seed the single settings row from the values that were previously
-- hardcoded in the frontend. Only runs if the table is empty, so it's safe
-- to re-run this migration.
insert into site_settings (
  company_name, email, address, contact_phones,
  footer_tagline, footer_cta_heading, footer_bottom_tagline,
  seo_default_title, seo_default_description, meta_robots
)
select
  'Navaru Interior Solution',
  'navaruinteriorsolutions@gmail.com',
  '4 - 176C, Amba Road, Kidiyoor, Udupi Taluk & Dist, Karnataka 576103',
  array['+91 99726 76594'],
  'Bespoke interior design studio crafting refined residential and commercial spaces.',
  'Let''s design a space you never want to leave.',
  'Crafted with quiet obsession.',
  'Navaru Interior Solution',
  'Navaru Interior Solution — bespoke interior design and space transformation for discerning homes and businesses.',
  'index, follow'
where not exists (select 1 from site_settings);
