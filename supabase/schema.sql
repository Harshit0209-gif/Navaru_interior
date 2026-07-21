-- Navaru Interior Solution — Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- portfolio_projects
-- ---------------------------------------------------------------------------
create table if not exists portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_id uuid references categories(id) on delete set null,
  location text,
  completion_year int,
  short_description text not null,
  detailed_description text,
  cover_image_url text not null,
  client_name text,
  area text,
  services_provided text[] not null default '{}',
  -- real-world project status (distinct from the publish workflow below)
  project_status text not null default 'Completed'
    check (project_status in ('Completed', 'Ongoing', 'Upcoming')),
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}',
  -- admin CMS publish workflow
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portfolio_projects_category on portfolio_projects(category_id);
create index if not exists idx_portfolio_projects_status on portfolio_projects(status);
create index if not exists idx_portfolio_projects_featured on portfolio_projects(is_featured);

-- ---------------------------------------------------------------------------
-- portfolio_images (gallery, many-to-one with portfolio_projects)
-- ---------------------------------------------------------------------------
create table if not exists portfolio_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portfolio_projects(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolio_images_project on portfolio_images(project_id);

-- ---------------------------------------------------------------------------
-- book_design_requests
-- ---------------------------------------------------------------------------
create table if not exists book_design_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references portfolio_projects(id) on delete set null,
  project_name text not null,
  customer_name text not null,
  phone text not null,
  email text not null,
  city text,
  state text,
  country text,
  address text,
  property_type text,
  design_type text,
  budget text,
  preferred_date date,
  message text,
  attachment_url text,
  -- admin-portal workflow status + internal, customer-invisible notes
  status text not null default 'new'
    check (status in ('new', 'pending', 'contacted', 'completed', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_book_design_requests_project on book_design_requests(project_id);
create index if not exists idx_book_design_requests_status on book_design_requests(status);
create index if not exists idx_book_design_requests_created on book_design_requests(created_at desc);

-- ---------------------------------------------------------------------------
-- contact_enquiries
-- ---------------------------------------------------------------------------
create table if not exists contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text not null,
  subject text,
  message text not null,
  attachment_url text,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'replied', 'archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contact_enquiries_status on contact_enquiries(status);
create index if not exists idx_contact_enquiries_created on contact_enquiries(created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at auto-touch trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_portfolio_projects_updated_at on portfolio_projects;
create trigger trg_portfolio_projects_updated_at
  before update on portfolio_projects
  for each row execute function set_updated_at();

drop trigger if exists trg_book_design_requests_updated_at on book_design_requests;
create trigger trg_book_design_requests_updated_at
  before update on book_design_requests
  for each row execute function set_updated_at();

drop trigger if exists trg_contact_enquiries_updated_at on contact_enquiries;
create trigger trg_contact_enquiries_updated_at
  before update on contact_enquiries
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table categories enable row level security;
alter table portfolio_projects enable row level security;
alter table portfolio_images enable row level security;
alter table book_design_requests enable row level security;
alter table contact_enquiries enable row level security;

-- Public (anon) read access to published portfolio content only.
drop policy if exists "categories are publicly readable" on categories;
create policy "categories are publicly readable"
  on categories for select
  to anon, authenticated
  using (true);

drop policy if exists "published projects are publicly readable" on portfolio_projects;
create policy "published projects are publicly readable"
  on portfolio_projects for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "images of published projects are publicly readable" on portfolio_images;
create policy "images of published projects are publicly readable"
  on portfolio_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from portfolio_projects p
      where p.id = portfolio_images.project_id
        and p.status = 'published'
    )
  );

-- Authenticated (admin) users get full CRUD on portfolio content. Combined
-- with the anon-facing policy above via OR, so public visitors are
-- unaffected — only logged-in admins can see/edit drafts and archived rows.
drop policy if exists "authenticated users can view all projects" on portfolio_projects;
create policy "authenticated users can view all projects"
  on portfolio_projects for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can insert projects" on portfolio_projects;
create policy "authenticated users can insert projects"
  on portfolio_projects for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can update projects" on portfolio_projects;
create policy "authenticated users can update projects"
  on portfolio_projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can delete projects" on portfolio_projects;
create policy "authenticated users can delete projects"
  on portfolio_projects for delete
  to authenticated
  using (true);

drop policy if exists "authenticated users can manage all images" on portfolio_images;
create policy "authenticated users can manage all images"
  on portfolio_images for all
  to authenticated
  using (true)
  with check (true);

-- Enquiry tables: anon can INSERT only, never read their own or anyone
-- else's submissions back — keeps customer data private from the public
-- client. Authenticated admins get full CRUD on both book_design_requests
-- and contact_enquiries below.
drop policy if exists "anyone can submit a booking request" on book_design_requests;
create policy "anyone can submit a booking request"
  on book_design_requests for insert
  to anon
  with check (true);

-- The admin panel shares the same Supabase client as the public site, so if
-- an admin is logged in in the same browser, form submissions carry an
-- `authenticated` JWT instead of `anon` — this mirrors the anon policy so
-- the public form still works in that case.
drop policy if exists "authenticated users can submit a booking request" on book_design_requests;
create policy "authenticated users can submit a booking request"
  on book_design_requests for insert
  to authenticated
  with check (true);

drop policy if exists "anyone can submit a contact enquiry" on contact_enquiries;
create policy "anyone can submit a contact enquiry"
  on contact_enquiries for insert
  to anon
  with check (true);

-- Mirrors the authenticated booking-insert policy above: keeps the public
-- Contact form working even when an admin session is active in the same
-- browser.
drop policy if exists "authenticated users can submit a contact enquiry" on contact_enquiries;
create policy "authenticated users can submit a contact enquiry"
  on contact_enquiries for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can view contact enquiries" on contact_enquiries;
create policy "authenticated users can view contact enquiries"
  on contact_enquiries for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can update contact enquiries" on contact_enquiries;
create policy "authenticated users can update contact enquiries"
  on contact_enquiries for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can delete contact enquiries" on contact_enquiries;
create policy "authenticated users can delete contact enquiries"
  on contact_enquiries for delete
  to authenticated
  using (true);

drop policy if exists "authenticated users can view booking requests" on book_design_requests;
create policy "authenticated users can view booking requests"
  on book_design_requests for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can update booking requests" on book_design_requests;
create policy "authenticated users can update booking requests"
  on book_design_requests for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can delete booking requests" on book_design_requests;
create policy "authenticated users can delete booking requests"
  on book_design_requests for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images', 'portfolio-images', true, 15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'website-assets', 'website-assets', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;

-- Widen an existing website-assets bucket (from before video support was
-- added) to accept the Hero background video upload.
update storage.buckets
set
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf', 'video/mp4', 'video/webm'],
  file_size_limit = 52428800
where id = 'website-assets';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('attachments', 'attachments', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- portfolio-images & website-assets: publicly readable (used as <img> src
-- across the site); only authenticated admins can upload/replace/delete.
drop policy if exists "portfolio images are publicly readable" on storage.objects;
create policy "portfolio images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-images');

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

-- attachments: anon can upload (insert) but never list/read/overwrite others'
-- files back out through the public API. Authenticated admins can read them
-- (to generate signed download URLs from the Bookings management screen).
drop policy if exists "anyone can upload an attachment" on storage.objects;
create policy "anyone can upload an attachment"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'attachments');

drop policy if exists "authenticated users can view attachments" on storage.objects;
create policy "authenticated users can view attachments"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'attachments');

-- ---------------------------------------------------------------------------
-- media_assets — Media Library metadata (independent of portfolio_images,
-- which only tracks images actually attached to a project's gallery)
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

-- ---------------------------------------------------------------------------
-- site_settings — single-row store for site-wide configuration (company
-- identity, contact details, social links, footer copy, SEO defaults,
-- analytics, meta tags). Anyone can read it (the public site renders from
-- it); only authenticated admins can update it. No INSERT/DELETE policy —
-- it's a fixed singleton row, seeded once below.
-- ---------------------------------------------------------------------------
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),

  company_name text not null default 'Navaru Interior Solution',
  logo_url text,
  favicon_url text,

  contact_phones text[] not null default '{}',
  whatsapp_number text,
  email text,
  address text,
  google_maps_embed_url text,

  social_instagram text,
  social_facebook text,
  social_linkedin text,
  social_pinterest text,
  social_youtube text,
  social_twitter text,

  footer_tagline text,
  footer_cta_heading text,
  footer_bottom_tagline text,

  seo_default_title text,
  seo_default_description text,
  seo_og_image_url text,
  seo_keywords text[] not null default '{}',

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

insert into site_settings (
  company_name, email, address, contact_phones,
  footer_tagline, footer_cta_heading, footer_bottom_tagline,
  seo_default_title, seo_default_description, meta_robots
)
select
  'Navaru Interior Solution',
  'info@navaru.in',
  '4 - 176C, Amba Road, Kidiyoor, Udupi Taluk & Dist, Karnataka 576103',
  array['+91 99726 76594'],
  'Bespoke interior design studio crafting refined residential and commercial spaces.',
  'Let''s design a space you never want to leave.',
  'Crafted with quiet obsession.',
  'Navaru Interior Solution',
  'Navaru Interior Solution — bespoke interior design and space transformation for discerning homes and businesses.',
  'index, follow'
where not exists (select 1 from site_settings);

-- ---------------------------------------------------------------------------
-- site_content — single-row store for the public marketing site's copy and
-- images (Hero, Home page About/Mission/Vision/Philosophy/Stats/Services/
-- Testimonials, the About page's story/values/process, the Services page's
-- detail list and closing CTA, and the Contact/About/Services page headers).
-- Anyone can read it (the public site renders from it); only authenticated
-- admins can update it. No INSERT/DELETE policy — fixed singleton row,
-- seeded once below.
-- ---------------------------------------------------------------------------
create table if not exists site_content (
  id uuid primary key default gen_random_uuid(),

  hero_kicker text,
  hero_headline text,
  hero_subtext text,
  hero_cta_primary_label text,
  hero_cta_secondary_label text,
  hero_image_url text,
  hero_video_url text,

  about_eyebrow text,
  about_title text,
  about_body text,

  mission_title text,
  mission_body text,
  vision_title text,
  vision_body text,

  philosophy_eyebrow text,
  philosophy_title text,
  philosophy_body text,

  services_summary_eyebrow text,
  services_summary_title text,
  services_summary_body text,

  portfolio_eyebrow text,
  portfolio_title text,
  portfolio_button_label text,

  about_page_eyebrow text,
  about_page_title text,
  about_page_description text,

  about_story_eyebrow text,
  about_story_title text,
  about_story_body text,
  about_story_image_url text,

  values_eyebrow text,
  values_title text,

  process_eyebrow text,
  process_title text,
  process_body text,

  services_page_eyebrow text,
  services_page_title text,
  services_page_description text,

  services_cta_eyebrow text,
  services_cta_heading text,
  services_cta_button_label text,

  contact_page_eyebrow text,
  contact_page_title text,
  contact_page_description text,

  stats jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  testimonials jsonb not null default '[]'::jsonb,
  values jsonb not null default '[]'::jsonb,
  process_steps jsonb not null default '[]'::jsonb,

  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;

drop trigger if exists trg_site_content_updated_at on site_content;
create trigger trg_site_content_updated_at
  before update on site_content
  for each row execute function set_updated_at();

drop policy if exists "site content is publicly readable" on site_content;
create policy "site content is publicly readable"
  on site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated users can update site content" on site_content;
create policy "authenticated users can update site content"
  on site_content for update
  to authenticated
  using (true)
  with check (true);

insert into site_content (
  hero_kicker, hero_headline, hero_subtext, hero_cta_primary_label, hero_cta_secondary_label,
  about_eyebrow, about_title, about_body,
  mission_title, mission_body, vision_title, vision_body,
  philosophy_eyebrow, philosophy_title, philosophy_body,
  services_summary_eyebrow, services_summary_title, services_summary_body,
  portfolio_eyebrow, portfolio_title, portfolio_button_label,
  about_page_eyebrow, about_page_title, about_page_description,
  about_story_eyebrow, about_story_title, about_story_body,
  values_eyebrow, values_title,
  process_eyebrow, process_title, process_body,
  services_page_eyebrow, services_page_title, services_page_description,
  services_cta_eyebrow, services_cta_heading, services_cta_button_label,
  contact_page_eyebrow, contact_page_title, contact_page_description,
  stats, services, testimonials, values, process_steps
)
select
  'Navaru Interior Solution — Est. Craftsmanship',
  'Interiors shaped by light, texture, and quiet luxury.',
  'We design residences and commercial spaces with an obsessive attention to proportion, material, and the way a room should feel — not just look.',
  'Book a Consultation',
  'View Portfolio',

  'About Us',
  'A decade of modular interior craftsmanship.',
  'Navaru Interior Solutions is a trusted modular interior manufacturing company based in Udupi, Karnataka, with over 10 years of experience delivering premium interior solutions for residential, commercial, and institutional spaces. We combine innovative design, precision manufacturing, and expert craftsmanship to create interiors that are elegant, functional, and built to last.

As a complete turnkey interior solutions provider, we manage every stage of your project—from design consultation and space planning to manufacturing, installation, and final finishing. Our expertise includes modular kitchens, wardrobes, bedroom interiors, TV units, office interiors, false ceilings, POP works, gypsum ceilings, wall panelling, partitions, lighting integration, and complete interior fit-outs.

Our state-of-the-art modular manufacturing facility and advanced woodworking technology ensure superior quality, precision, durability, and timely delivery. Every project is crafted with premium materials and strict quality standards to exceed customer expectations.

At Navaru Interior Solutions, we don''t just build interiors—we create beautiful, functional spaces that reflect your lifestyle, maximize comfort, and stand the test of time.',

  'Our Mission',
  'To transform homes and workplaces through innovative, high-quality modular interior solutions that combine functionality, aesthetics, and durability. We are committed to delivering complete turnkey interiors — from design and precision manufacturing to installation and finishing — while maintaining the highest standards of craftsmanship, technology, and customer satisfaction.',
  'Our Vision',
  'To become one of India''s most trusted modular interior manufacturers and turnkey interior solution providers, recognized for innovation, precision manufacturing, superior quality, and exceptional customer experience. We aspire to redefine modern interiors through advanced manufacturing, sustainable practices, and creative design, building spaces that enrich lives and create lasting value for every customer.',

  'Our Philosophy',
  'Design that respects how you actually live.',
  'Navaru Interior Solution creates residential and commercial interiors grounded in proportion, natural materials, and restrained detail. We work closely with a small number of clients each year so every space receives the attention it deserves.',

  'What We Do',
  'A studio built around six disciplines.',
  'Each project draws on the same core capabilities, assembled differently depending on the scale and character of the space.',

  'Selected Work',
  'A portfolio of considered spaces.',
  'View All Projects',

  'About the Studio',
  'Fourteen years of shaping rooms around real life.',
  'Navaru Interior Solution is a small studio taking on a deliberately limited number of projects each year, so every space gets direct attention from first sketch to final styling.',

  'Our Story',
  'Started on the belief that most interiors try too hard.',
  'Navaru began as a small residential practice with one rule: a room should feel resolved, not decorated. Fourteen years on, that same rule still governs every commission, whether it''s a single bedroom or a full commercial fit-out. We keep the studio deliberately small so that rule never has to compete with volume.',

  'What We Believe',
  'Four principles behind every commission.',

  'How We Work',
  'One process, repeated with discipline.',
  'Every project moves through the same four stages, regardless of size, so nothing gets improvised on-site.',

  'What We Do',
  'Six disciplines, one continuous process.',
  'From first walkthrough to the final furniture placement, every discipline below is handled in-house by the same core team.',

  'Ready to Begin',
  'Every project starts with a conversation about the space, not the budget.',
  'Start a Project',

  'Get in Touch',
  'Tell us about the space you''re imagining.',
  'Share a few details below and one of our designers will reach out to schedule an initial consultation.',

  '[
    {"value": 14, "suffix": "+", "label": "Years of Practice"},
    {"value": 220, "suffix": "+", "label": "Projects Delivered"},
    {"value": 98, "suffix": "%", "label": "Client Retention"},
    {"value": 12, "suffix": "", "label": "Design Awards"}
  ]'::jsonb,

  '[
    {
      "icon": "Armchair",
      "title": "Residential Interiors",
      "description": "Full-home design from spatial planning to the final styled detail, for people who want a home that works exactly the way they live.",
      "bullets": ["Spatial planning & layout", "Material & finish palettes", "Furniture & styling", "Site supervision"],
      "image_url": null
    },
    {
      "icon": "Building2",
      "title": "Commercial Spaces",
      "description": "Hospitality, retail, and office interiors designed to hold up under daily use while still carrying a brand through the room.",
      "bullets": ["Brand-led space design", "Front & back-of-house planning", "Vendor & contractor coordination", "Fit-out supervision"],
      "image_url": null
    },
    {
      "icon": "Ruler",
      "title": "Space Planning",
      "description": "Before any finish is chosen, we resolve circulation, sightlines, and proportion so the room works before it looks good.",
      "bullets": ["Circulation & flow studies", "Furniture layout options", "Structural & MEP coordination", "3D massing studies"],
      "image_url": null
    },
    {
      "icon": "Palette",
      "title": "Material & Colour",
      "description": "Palettes and finishes curated from artisans and mills we''ve worked with for years, chosen for how they age, not just how they photograph.",
      "bullets": ["Curated material boards", "Artisan & mill sourcing", "Sample & mock-up review", "Maintenance guidance"],
      "image_url": null
    },
    {
      "icon": "PenTool",
      "title": "Custom Furniture",
      "description": "Bespoke joinery and furniture drawn and detailed to fit the room exactly, produced with a small roster of trusted workshops.",
      "bullets": ["Bespoke joinery design", "Shop drawings & detailing", "Workshop production management", "Delivery & installation"],
      "image_url": null
    },
    {
      "icon": "Lightbulb",
      "title": "Lighting Design",
      "description": "Layered lighting schemes — ambient, task, and accent — planned early enough to shape the electrical layout, not patch it after.",
      "bullets": ["Layered lighting schemes", "Fixture selection & sourcing", "Electrical layout coordination", "Scene & dimming design"],
      "image_url": null
    }
  ]'::jsonb,

  '[
    {
      "quote": "Navaru understood the feeling we wanted before we could put it into words. Every room now feels considered, never staged.",
      "name": "Ritika Malhotra",
      "role": "Homeowner, The Udupi Project"
    },
    {
      "quote": "They treated our restaurant like a piece of architecture, not decoration. Covers went up 30% the quarter after we reopened.",
      "name": "Daniel Osei",
      "role": "Homeowner, Katapady Project"
    },
    {
      "quote": "Meticulous, patient, and completely unwilling to compromise on craft. That is rare, and it shows in the finished space.",
      "name": "Ananya Rao",
      "role": "Homeowner, Malpe Project"
    }
  ]'::jsonb,

  '[
    {"icon": "Ruler", "title": "Proportion First", "description": "Every layout is resolved for circulation and scale before a single finish is chosen."},
    {"icon": "Leaf", "title": "Honest Materials", "description": "Natural wood, stone, and textile that age well and wear their use with character."},
    {"icon": "Sparkles", "title": "Restrained Detail", "description": "We add until it works, then we stop. Quiet rooms are harder to design than loud ones."},
    {"icon": "Award", "title": "Direct Attention", "description": "A deliberately small client list so every project has the founders in the room."}
  ]'::jsonb,

  '[
    {"title": "Discovery", "description": "A walkthrough of the space and an honest conversation about how you actually live or work in it."},
    {"title": "Concept & Space Plan", "description": "Layout, material direction, and a lighting strategy presented as a single coherent concept."},
    {"title": "Detailing & Sourcing", "description": "Furniture, fixtures, and custom joinery specified down to the finish and hardware."},
    {"title": "Execution", "description": "On-site supervision through build-out and installation, styled to the last object on the last shelf."}
  ]'::jsonb
where not exists (select 1 from site_content);

-- ---------------------------------------------------------------------------
-- activity_logs — append-only audit trail of admin actions (project/media/
-- booking/contact CRUD, settings changes, profile changes, login/logout).
-- Authenticated users can insert (only ever as themselves) and read; no
-- update/delete policy, so history can't be altered from the admin panel.
-- ---------------------------------------------------------------------------
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text not null,
  record_type text,
  record_id uuid,
  description text not null,
  metadata jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_created on activity_logs(created_at desc);
create index if not exists idx_activity_logs_action on activity_logs(action);
create index if not exists idx_activity_logs_record on activity_logs(record_type, record_id);
create index if not exists idx_activity_logs_user on activity_logs(user_id);

alter table activity_logs enable row level security;

drop policy if exists "authenticated users can insert their own activity logs" on activity_logs;
create policy "authenticated users can insert their own activity logs"
  on activity_logs for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "authenticated users can view activity logs" on activity_logs;
create policy "authenticated users can view activity logs"
  on activity_logs for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Realtime — lets the Bookings, Contact Enquiries, and Activity Log screens
-- react live to new submissions without polling.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'book_design_requests'
  ) then
    alter publication supabase_realtime add table book_design_requests;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'contact_enquiries'
  ) then
    alter publication supabase_realtime add table contact_enquiries;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'activity_logs'
  ) then
    alter publication supabase_realtime add table activity_logs;
  end if;
end $$;
