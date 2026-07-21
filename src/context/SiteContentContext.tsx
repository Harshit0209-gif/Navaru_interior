import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getSupabase } from '../lib/supabase'
import type { Database } from '../types/database'

export type SiteContent = Database['public']['Tables']['site_content']['Row']

// Mirrors the values that were previously hardcoded across Hero.tsx,
// Home.tsx, About.tsx, Services.tsx, and Contact.tsx (and the seed row in
// supabase/migrations/0009_site_content.sql) — used until the real row
// loads, and as a safety net if the fetch ever fails, so nothing on the
// public site breaks or flashes empty content.
const DEFAULT_CONTENT: SiteContent = {
  id: '',
  hero_kicker: 'Navaru Interior Solution — Est. Craftsmanship',
  hero_headline: 'Interiors shaped by light, texture, and quiet luxury.',
  hero_subtext:
    'We design residences and commercial spaces with an obsessive attention to proportion, material, and the way a room should feel — not just look.',
  hero_cta_primary_label: 'Book a Consultation',
  hero_cta_secondary_label: 'View Portfolio',
  hero_image_url: null,
  hero_video_url: null,

  about_eyebrow: 'About Us',
  about_title: 'A decade of modular interior craftsmanship.',
  about_body: [
    'Navaru Interior Solutions is a trusted modular interior manufacturing company based in Udupi, Karnataka, with over 10 years of experience delivering premium interior solutions for residential, commercial, and institutional spaces. We combine innovative design, precision manufacturing, and expert craftsmanship to create interiors that are elegant, functional, and built to last.',
    'As a complete turnkey interior solutions provider, we manage every stage of your project—from design consultation and space planning to manufacturing, installation, and final finishing. Our expertise includes modular kitchens, wardrobes, bedroom interiors, TV units, office interiors, false ceilings, POP works, gypsum ceilings, wall panelling, partitions, lighting integration, and complete interior fit-outs.',
    'Our state-of-the-art modular manufacturing facility and advanced woodworking technology ensure superior quality, precision, durability, and timely delivery. Every project is crafted with premium materials and strict quality standards to exceed customer expectations.',
    "At Navaru Interior Solutions, we don't just build interiors—we create beautiful, functional spaces that reflect your lifestyle, maximize comfort, and stand the test of time.",
  ].join('\n\n'),

  mission_title: 'Our Mission',
  mission_body:
    'To transform homes and workplaces through innovative, high-quality modular interior solutions that combine functionality, aesthetics, and durability. We are committed to delivering complete turnkey interiors — from design and precision manufacturing to installation and finishing — while maintaining the highest standards of craftsmanship, technology, and customer satisfaction.',
  vision_title: 'Our Vision',
  vision_body:
    "To become one of India's most trusted modular interior manufacturers and turnkey interior solution providers, recognized for innovation, precision manufacturing, superior quality, and exceptional customer experience. We aspire to redefine modern interiors through advanced manufacturing, sustainable practices, and creative design, building spaces that enrich lives and create lasting value for every customer.",

  philosophy_eyebrow: 'Our Philosophy',
  philosophy_title: 'Design that respects how you actually live.',
  philosophy_body:
    'Navaru Interior Solution creates residential and commercial interiors grounded in proportion, natural materials, and restrained detail. We work closely with a small number of clients each year so every space receives the attention it deserves.',

  services_summary_eyebrow: 'What We Do',
  services_summary_title: 'A studio built around six disciplines.',
  services_summary_body:
    'Each project draws on the same core capabilities, assembled differently depending on the scale and character of the space.',

  portfolio_eyebrow: 'Selected Work',
  portfolio_title: 'A portfolio of considered spaces.',
  portfolio_button_label: 'View All Projects',

  about_page_eyebrow: 'About the Studio',
  about_page_title: 'Fourteen years of shaping rooms around real life.',
  about_page_description:
    'Navaru Interior Solution is a small studio taking on a deliberately limited number of projects each year, so every space gets direct attention from first sketch to final styling.',

  about_story_eyebrow: 'Our Story',
  about_story_title: 'Started on the belief that most interiors try too hard.',
  about_story_body:
    "Navaru began as a small residential practice with one rule: a room should feel resolved, not decorated. Fourteen years on, that same rule still governs every commission, whether it's a single bedroom or a full commercial fit-out. We keep the studio deliberately small so that rule never has to compete with volume.",
  about_story_image_url: null,

  values_eyebrow: 'What We Believe',
  values_title: 'Four principles behind every commission.',

  process_eyebrow: 'How We Work',
  process_title: 'One process, repeated with discipline.',
  process_body:
    'Every project moves through the same four stages, regardless of size, so nothing gets improvised on-site.',

  services_page_eyebrow: 'What We Do',
  services_page_title: 'Six disciplines, one continuous process.',
  services_page_description:
    'From first walkthrough to the final furniture placement, every discipline below is handled in-house by the same core team.',

  services_cta_eyebrow: 'Ready to Begin',
  services_cta_heading: 'Every project starts with a conversation about the space, not the budget.',
  services_cta_button_label: 'Start a Project',

  contact_page_eyebrow: 'Get in Touch',
  contact_page_title: "Tell us about the space you're imagining.",
  contact_page_description:
    'Share a few details below and one of our designers will reach out to schedule an initial consultation.',

  stats: [
    { value: 14, suffix: '+', label: 'Years of Practice' },
    { value: 220, suffix: '+', label: 'Projects Delivered' },
    { value: 98, suffix: '%', label: 'Client Retention' },
    { value: 12, suffix: '', label: 'Design Awards' },
  ],

  services: [
    {
      icon: 'Armchair',
      title: 'Residential Interiors',
      description:
        'Full-home design from spatial planning to the final styled detail, for people who want a home that works exactly the way they live.',
      bullets: ['Spatial planning & layout', 'Material & finish palettes', 'Furniture & styling', 'Site supervision'],
      image_url: null,
    },
    {
      icon: 'Building2',
      title: 'Commercial Spaces',
      description:
        'Hospitality, retail, and office interiors designed to hold up under daily use while still carrying a brand through the room.',
      bullets: [
        'Brand-led space design',
        'Front & back-of-house planning',
        'Vendor & contractor coordination',
        'Fit-out supervision',
      ],
      image_url: null,
    },
    {
      icon: 'Ruler',
      title: 'Space Planning',
      description:
        'Before any finish is chosen, we resolve circulation, sightlines, and proportion so the room works before it looks good.',
      bullets: [
        'Circulation & flow studies',
        'Furniture layout options',
        'Structural & MEP coordination',
        '3D massing studies',
      ],
      image_url: null,
    },
    {
      icon: 'Palette',
      title: 'Material & Colour',
      description:
        "Palettes and finishes curated from artisans and mills we've worked with for years, chosen for how they age, not just how they photograph.",
      bullets: ['Curated material boards', 'Artisan & mill sourcing', 'Sample & mock-up review', 'Maintenance guidance'],
      image_url: null,
    },
    {
      icon: 'PenTool',
      title: 'Custom Furniture',
      description:
        'Bespoke joinery and furniture drawn and detailed to fit the room exactly, produced with a small roster of trusted workshops.',
      bullets: [
        'Bespoke joinery design',
        'Shop drawings & detailing',
        'Workshop production management',
        'Delivery & installation',
      ],
      image_url: null,
    },
    {
      icon: 'Lightbulb',
      title: 'Lighting Design',
      description:
        'Layered lighting schemes — ambient, task, and accent — planned early enough to shape the electrical layout, not patch it after.',
      bullets: [
        'Layered lighting schemes',
        'Fixture selection & sourcing',
        'Electrical layout coordination',
        'Scene & dimming design',
      ],
      image_url: null,
    },
  ],

  testimonials: [
    {
      quote:
        'Navaru understood the feeling we wanted before we could put it into words. Every room now feels considered, never staged.',
      name: 'Ritika Malhotra',
      role: 'Homeowner, The Udupi Project',
    },
    {
      quote:
        'They treated our restaurant like a piece of architecture, not decoration. Covers went up 30% the quarter after we reopened.',
      name: 'Daniel Osei',
      role: 'Homeowner, Katapady Project',
    },
    {
      quote: 'Meticulous, patient, and completely unwilling to compromise on craft. That is rare, and it shows in the finished space.',
      name: 'Ananya Rao',
      role: 'Homeowner, Malpe Project',
    },
  ],

  values: [
    {
      icon: 'Ruler',
      title: 'Proportion First',
      description: 'Every layout is resolved for circulation and scale before a single finish is chosen.',
    },
    {
      icon: 'Leaf',
      title: 'Honest Materials',
      description: 'Natural wood, stone, and textile that age well and wear their use with character.',
    },
    {
      icon: 'Sparkles',
      title: 'Restrained Detail',
      description: 'We add until it works, then we stop. Quiet rooms are harder to design than loud ones.',
    },
    {
      icon: 'Award',
      title: 'Direct Attention',
      description: 'A deliberately small client list so every project has the founders in the room.',
    },
  ],

  process_steps: [
    {
      title: 'Discovery',
      description: 'A walkthrough of the space and an honest conversation about how you actually live or work in it.',
    },
    {
      title: 'Concept & Space Plan',
      description: 'Layout, material direction, and a lighting strategy presented as a single coherent concept.',
    },
    {
      title: 'Detailing & Sourcing',
      description: 'Furniture, fixtures, and custom joinery specified down to the finish and hardware.',
    },
    {
      title: 'Execution',
      description: 'On-site supervision through build-out and installation, styled to the last object on the last shelf.',
    },
  ],

  updated_at: '',
}

const SiteContentContext = createContext<SiteContent>(DEFAULT_CONTENT)

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT)

  useEffect(() => {
    let cancelled = false
    getSupabase()
      .then((supabase) => supabase.from('site_content').select('*').limit(1).maybeSingle())
      .then(({ data }) => {
        if (!cancelled && data) setContent(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>
}

export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext)
}
