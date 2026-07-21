-- Website Content CMS — run this once in the Supabase SQL Editor. Safe to
-- re-run. Requires 0001–0008 to have been run first.
--
-- What this does:
--   1. Creates a `site_content` table — a single-row store for the public
--      marketing site's copy and images (Hero, Home page About/Mission/
--      Vision/Philosophy/Stats/Services/Testimonials, the About page's
--      story/values/process, the Services page's detail list and closing
--      CTA, and the Contact/About/Services page headers).
--   2. Seeds it with the values that were previously hardcoded across
--      src/components/Hero/Hero.tsx, src/pages/Home.tsx, src/pages/About.tsx,
--      src/pages/Services.tsx, and src/pages/Contact.tsx, so nothing changes
--      visually until an admin edits something in /admin/content.
--   3. RLS: anyone can read (the public site needs these values to render),
--      only authenticated admins can update. Like `site_settings`, this is a
--      fixed singleton row — seeded once below and only ever updated after.

create table if not exists site_content (
  id uuid primary key default gen_random_uuid(),

  -- Hero (Home page)
  hero_kicker text,
  hero_headline text,
  hero_subtext text,
  hero_cta_primary_label text,
  hero_cta_secondary_label text,
  hero_image_url text,

  -- About Us (Home page)
  about_eyebrow text,
  about_title text,
  about_body text,

  -- Mission & Vision (Home page)
  mission_title text,
  mission_body text,
  vision_title text,
  vision_body text,

  -- Our Philosophy (Home page)
  philosophy_eyebrow text,
  philosophy_title text,
  philosophy_body text,

  -- What We Do summary (Home page) — the full services list lives in the
  -- `services` jsonb column below and is shared with the Services page.
  services_summary_eyebrow text,
  services_summary_title text,
  services_summary_body text,

  -- Selected Work / portfolio teaser (Home page)
  portfolio_eyebrow text,
  portfolio_title text,
  portfolio_button_label text,

  -- About page header
  about_page_eyebrow text,
  about_page_title text,
  about_page_description text,

  -- Our Story (About page)
  about_story_eyebrow text,
  about_story_title text,
  about_story_body text,
  about_story_image_url text,

  -- What We Believe section header (About page) — items live in `values` jsonb
  values_eyebrow text,
  values_title text,

  -- How We Work section header (About page) — steps live in `process_steps` jsonb
  process_eyebrow text,
  process_title text,
  process_body text,

  -- Services page header
  services_page_eyebrow text,
  services_page_title text,
  services_page_description text,

  -- Services page closing CTA
  services_cta_eyebrow text,
  services_cta_heading text,
  services_cta_button_label text,

  -- Contact page header
  contact_page_eyebrow text,
  contact_page_title text,
  contact_page_description text,

  -- Repeatable structured collections
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

-- Seed the single content row from the values that were previously
-- hardcoded in the frontend. Only runs if the table is empty, so it's safe
-- to re-run this migration.
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
  'Navaru Interior Solutions is a trusted modular interior factory based in Udupi, Karnataka, with over 10 years of experience in delivering premium interior solutions for residential, commercial, and institutional projects. Over the years, we have earned a reputation for combining innovative design, precision manufacturing, quality craftsmanship, and reliable project execution to create spaces that are functional, elegant, and built to last.

As a complete turnkey interior solutions provider, we offer everything under one roof — from design consultation and space planning to manufacturing, installation, and final finishing. Our services include modular kitchens, wardrobes, bedroom interiors, TV units, living room furniture, office interiors, storage solutions, false ceilings, POP (Plaster of Paris) works, gypsum ceilings, wall panelling, partitions, decorative finishes, lighting integration, and complete interior fit-outs.

Our greatest strength is our modern modular interior manufacturing facility, equipped with advanced woodworking machinery and precision equipment. This enables us to manufacture high-quality modular interior components with exceptional accuracy, consistent quality, faster production, and timely delivery. Every product is crafted using premium materials, modern technology, and stringent quality standards to ensure durability, functionality, and a flawless finish.

At Navaru Interior Solutions, we believe that every space should reflect the personality and aspirations of its owner. Our experienced designers, engineers, and skilled craftsmen work closely with homeowners, architects, builders, and businesses to create customized interiors that maximize space, enhance comfort, and elevate everyday living.

With more than a decade of industry experience, our commitment to quality, innovation, transparency, and customer satisfaction has made us a preferred partner for interior projects across Karnataka and beyond. Whether it is a dream home, a corporate office, a retail showroom, or a commercial establishment, we deliver complete interior solutions that exceed expectations.

At Navaru Interior Solutions, we don''t just manufacture modular interiors — we create thoughtfully designed spaces that inspire, perform, and stand the test of time.',

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
