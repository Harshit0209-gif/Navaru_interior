import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Armchair, Building2, Lightbulb, PenTool, Ruler, Palette } from 'lucide-react'
import { Hero } from '../components/Hero'
import { SectionTitle } from '../components/SectionTitle'
import { ServiceCard } from '../components/ServiceCard'
import { ProjectCard } from '../components/ProjectCard'
import { TestimonialCard } from '../components/TestimonialCard'
import { Counter } from '../components/Counter'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { usePageMeta } from '../hooks/usePageMeta'
import { fetchFeaturedProjects } from '../services/portfolioService'
import type { PortfolioProject } from '../types/portfolio'

const SERVICES = [
  {
    icon: Armchair,
    title: 'Residential Interiors',
    description: 'Full-home design from spatial planning to the final styled detail.',
  },
  {
    icon: Building2,
    title: 'Commercial Spaces',
    description: 'Hospitality, retail, and office interiors built for brand and flow.',
  },
  {
    icon: Ruler,
    title: 'Space Planning',
    description: 'Layouts that resolve circulation, light, and proportion first.',
  },
  {
    icon: Palette,
    title: 'Material & Colour',
    description: 'Curated palettes and finishes sourced from artisans worldwide.',
  },
  {
    icon: PenTool,
    title: 'Custom Furniture',
    description: 'Bespoke joinery and furniture designed to fit the room exactly.',
  },
  {
    icon: Lightbulb,
    title: 'Lighting Design',
    description: 'Layered lighting schemes that shape mood as much as visibility.',
  },
]

// First and fourth cards span two rows, creating the mosaic layout below —
// preserved regardless of which projects are marked featured in the DB.
function spanForIndex(i: number) {
  return i === 0 || i === 3 ? 'sm:row-span-2' : ''
}

const STATS = [
  { value: 14, suffix: '+', label: 'Years of Practice' },
  { value: 220, suffix: '+', label: 'Projects Delivered' },
  { value: 98, suffix: '%', label: 'Client Retention' },
  { value: 12, suffix: '', label: 'Design Awards' },
]

const TESTIMONIALS = [
  {
    quote:
      'Navaru understood the feeling we wanted before we could put it into words. Every room now feels considered, never staged.',
    name: 'Ritika Malhotra',
    role: 'Homeowner, The Ardent Residence',
  },
  {
    quote:
      'They treated our restaurant like a piece of architecture, not decoration. Covers went up 30% the quarter after we reopened.',
    name: 'Daniel Osei',
    role: 'Founder, Marlowe Rooftop Lounge',
  },
  {
    quote:
      'Meticulous, patient, and completely unwilling to compromise on craft. That is rare, and it shows in the finished space.',
    name: 'Ananya Rao',
    role: 'Director, Thornbury Offices',
  },
]

export default function Home() {
  usePageMeta(
    'Luxury Interior Design Studio',
    'Navaru Interior Solution designs bespoke residential and commercial interiors grounded in proportion, natural materials, and quiet luxury.',
  )
  const [active, setActive] = useState(0)
  const [featuredProjects, setFeaturedProjects] = useState<PortfolioProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length)
    }, 6000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchFeaturedProjects(6)
      .then((projects) => {
        if (!cancelled) setFeaturedProjects(projects)
      })
      .catch(() => {
        // Home page degrades gracefully — the section just shows nothing
        // rather than surfacing an error on the primary landing page.
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-content px-6 py-28 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <SectionTitle
            eyebrow="Our Philosophy"
            title="Design that respects how you actually live."
            description="Navaru Interior Solution creates residential and commercial interiors grounded in proportion, natural materials, and restrained detail. We work closely with a small number of clients each year so every space receives the attention it deserves."
          />

          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-light tracking-tightest text-ink-900 sm:text-5xl">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-200/60 py-28">
        <div className="mx-auto max-w-content px-6 lg:px-12">
          <SectionTitle
            eyebrow="What We Do"
            title="A studio built around six disciplines."
            description="Each project draws on the same core capabilities, assembled differently depending on the scale and character of the space."
            align="center"
            className="mx-auto mb-16"
          />

          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <ServiceCard key={service.title} index={i} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="mx-auto max-w-content px-6 py-28 lg:px-12">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
          <SectionTitle
            eyebrow="Selected Work"
            title="A portfolio of considered spaces."
            className="mb-0"
          />
          <Button variant="outline" withArrow href="/portfolio">
            View All Projects
          </Button>
        </div>

        <div className="grid auto-rows-[280px] gap-4 sm:grid-cols-3">
          {projectsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className={spanForIndex(i)} />
              ))
            : featuredProjects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  index={i}
                  id={project.id}
                  slug={project.slug}
                  title={project.title}
                  category={project.category?.name ?? ''}
                  image={project.cover_image_url}
                  className={spanForIndex(i)}
                />
              ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-950 py-32">
        <div className="mx-auto max-w-content px-6 lg:px-12">
          <AnimatePresence mode="wait">
            <TestimonialCard key={active} {...TESTIMONIALS[active]} />
          </AnimatePresence>

          <div className="mt-12 flex justify-center gap-3">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActive(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className="relative h-1.5 w-8 overflow-hidden rounded-full bg-cream-100/15"
              >
                {active === i && (
                  <motion.span
                    layoutId="testimonial-indicator"
                    className="absolute inset-0 bg-brass-300"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
