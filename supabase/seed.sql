-- Optional sample data — run after schema.sql so the Portfolio page has
-- real content to show immediately. Safe to skip or delete once you add
-- your own projects via the Supabase Table Editor.

insert into categories (name, slug, display_order) values
  ('Residential', 'residential', 1),
  ('Commercial', 'commercial', 2),
  ('Hospitality', 'hospitality', 3),
  ('Retail', 'retail', 4)
on conflict (slug) do nothing;

insert into portfolio_projects (
  slug, title, category_id, location, completion_year, short_description,
  detailed_description, cover_image_url, client_name, area, services_provided,
  project_status, status, is_featured, display_order
) values
(
  'the-ardent-residence',
  'The Ardent Residence',
  (select id from categories where slug = 'residential'),
  'Bandra West, Mumbai',
  2024,
  'A full-home reimagining built around natural light and quiet luxury.',
  'The brief was simple: a home that felt resolved, not decorated. We reworked the layout for better circulation, replaced the material palette with natural wood and stone, and layered lighting to shape mood room by room.',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&h=1000&q=80',
  'Private Client',
  '2,400 sq ft',
  array['Space Planning', 'Material & Colour', 'Custom Furniture', 'Lighting Design'],
  'Completed', 'published', true, 1
),
(
  'marlowe-rooftop-lounge',
  'Marlowe Rooftop Lounge',
  (select id from categories where slug = 'hospitality'),
  'Lower Parel, Mumbai',
  2023,
  'A rooftop hospitality space designed to hold up under nightly cover counts.',
  'Marlowe needed a room that photographed well but also survived Friday-night volume. We built the material palette around durability first — brushed brass, dark timber, and leather that ages instead of wearing out.',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&h=1000&q=80',
  'Marlowe Hospitality Group',
  '3,200 sq ft',
  array['Commercial Space Design', 'Lighting Design', 'Custom Furniture'],
  'Completed', 'published', true, 2
),
(
  'casa-ferro',
  'Casa Ferro',
  (select id from categories where slug = 'residential'),
  'Bandra West, Mumbai',
  2022,
  'A gallery-inspired living space built around a growing art collection.',
  'The clients came to us with an art collection outgrowing their walls. We designed the living spaces as a backdrop for it — neutral tones, gallery lighting, and furniture chosen to stay quiet next to the work.',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&h=1000&q=80',
  null,
  '1,800 sq ft',
  array['Space Planning', 'Material & Colour'],
  'Completed', 'published', false, 3
),
(
  'thornbury-offices',
  'Thornbury Offices',
  (select id from categories where slug = 'commercial'),
  'Andheri East, Mumbai',
  2023,
  'A workplace fit-out designed around focus, not open-plan noise.',
  'Thornbury wanted an office that supported deep work as much as collaboration. We zoned the floor plate into focus rooms, a central commons, and a material story that carries their brand through the whole space.',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&h=1000&q=80',
  'Thornbury Consulting',
  '6,500 sq ft',
  array['Commercial Space Design', 'Space Planning', 'Lighting Design'],
  'Completed', 'published', true, 4
),
(
  'the-linden-suite',
  'The Linden Suite',
  (select id from categories where slug = 'residential'),
  'Worli, Mumbai',
  2024,
  'A compact apartment renovation focused on storage and light.',
  'A one-bedroom apartment that felt smaller than its footprint. We rebuilt the joinery to hide storage in every dead corner and pulled the material palette lighter to let the one good window carry the whole room.',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&h=1000&q=80',
  null,
  '850 sq ft',
  array['Custom Furniture', 'Space Planning'],
  'Completed', 'published', false, 5
),
(
  'almyra-boutique',
  'Almyra Boutique',
  (select id from categories where slug = 'retail'),
  'Colaba, Mumbai',
  2022,
  'A retail fit-out designed to let the product, not the shelving, lead.',
  'Almyra needed fixtures that could be reconfigured every season without a fresh renovation each time. We designed a modular shelving system on a single hardware standard, so the merchandising team can rebuild the floor themselves.',
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&h=1000&q=80',
  'Almyra Retail Pvt. Ltd.',
  '1,100 sq ft',
  array['Commercial Space Design', 'Custom Furniture'],
  'Completed', 'published', false, 6
)
on conflict (slug) do nothing;

-- Gallery images for The Ardent Residence
insert into portfolio_images (project_id, image_url, alt_text, display_order)
select id, image_url, alt_text, display_order from (
  values
    ((select id from portfolio_projects where slug = 'the-ardent-residence'),
     'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&h=1200&q=80',
     'Living room with layered natural light', 1),
    ((select id from portfolio_projects where slug = 'the-ardent-residence'),
     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=1200&q=80',
     'Exterior view at dusk', 2),
    ((select id from portfolio_projects where slug = 'the-ardent-residence'),
     'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=1200&h=1200&q=80',
     'Kitchen detail', 3)
) as t(id, image_url, alt_text, display_order);
