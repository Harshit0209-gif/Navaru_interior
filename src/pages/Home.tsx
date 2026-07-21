import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Hero } from '../components/Hero'
import { SectionTitle } from '../components/SectionTitle'
import { ServiceCard } from '../components/ServiceCard'
import { ProjectCard } from '../components/ProjectCard'
import { TestimonialCard } from '../components/TestimonialCard'
import { Counter } from '../components/Counter'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { usePageMeta } from '../hooks/usePageMeta'
import { useSiteContent } from '../context/SiteContentContext'
import { getIcon } from '../utils/icons'
import { renderBoldText } from '../utils/richText'
import { fetchFeaturedProjects } from '../services/portfolioService'
import type { PortfolioProject } from '../types/portfolio'

export default function Home() {
  usePageMeta(
    'Luxury Interior Design Studio',
    'Navaru Interior Solution designs bespoke residential and commercial interiors grounded in proportion, natural materials, and quiet luxury.',
  )
  const content = useSiteContent()
  const [active, setActive] = useState(0)
  const [featuredProjects, setFeaturedProjects] = useState<PortfolioProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  const testimonials = content.testimonials
  const aboutParagraphs = (content.about_body ?? '').split('\n\n').filter(Boolean)

  useEffect(() => {
    if (testimonials.length === 0) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(id)
  }, [testimonials.length])

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
        <SectionTitle
          eyebrow={content.about_eyebrow ?? undefined}
          title={content.about_title ?? ''}
          className="mb-12 max-w-3xl"
        />

        <div className="max-w-3xl space-y-6">
          {aboutParagraphs.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-base font-light leading-relaxed text-ink-700"
            >
              {renderBoldText(paragraph)}
            </motion.p>
          ))}
        </div>

        <div className="mt-16 grid gap-px overflow-hidden sm:grid-cols-2">
          {[
            { title: content.mission_title, description: content.mission_body },
            { title: content.vision_title, description: content.vision_body },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden border border-ink-900/10 bg-cream-50 p-8 transition-colors duration-500 ease-luxury hover:border-brass-300/60"
            >
              <h3 className="text-xl font-normal tracking-tight text-ink-900">{item.title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink-700">{item.description}</p>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brass-400 transition-transform duration-500 ease-luxury group-hover:scale-x-100" />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-28 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <SectionTitle
            eyebrow={content.philosophy_eyebrow ?? undefined}
            title={content.philosophy_title ?? ''}
            description={content.philosophy_body ?? undefined}
          />

          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            {content.stats.map((stat) => (
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
            eyebrow={content.services_summary_eyebrow ?? undefined}
            title={content.services_summary_title ?? ''}
            description={content.services_summary_body ?? undefined}
            align="center"
            className="mx-auto mb-16"
          />

          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {content.services.map((service, i) => (
              <ServiceCard
                key={service.title}
                index={i}
                icon={getIcon(service.icon)}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="mx-auto max-w-content px-6 py-28 lg:px-12">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
          <SectionTitle
            eyebrow={content.portfolio_eyebrow ?? undefined}
            title={content.portfolio_title ?? ''}
            className="mb-0"
          />
          <Button variant="outline" withArrow href="/portfolio">
            {content.portfolio_button_label}
          </Button>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {projectsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="mb-4 h-72 w-full break-inside-avoid" />
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
                  className="mb-4 break-inside-avoid"
                />
              ))}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="relative overflow-hidden bg-ink-950 py-32">
          <div className="mx-auto max-w-content px-6 lg:px-12">
            <AnimatePresence mode="wait">
              <TestimonialCard key={active} {...testimonials[active]} />
            </AnimatePresence>

            <div className="mt-12 flex justify-center gap-3">
              {testimonials.map((t, i) => (
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
      )}
    </>
  )
}
