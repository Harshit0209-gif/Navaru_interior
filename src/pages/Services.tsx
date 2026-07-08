import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { SectionTitle } from '../components/SectionTitle'
import { Button } from '../components/Button'
import { cn } from '../utils/cn'
import { usePageMeta } from '../hooks/usePageMeta'
import { unsplashSrcSet, unsplashUrl } from '../utils/unsplash'

const SERVICES = [
  {
    title: 'Residential Interiors',
    description:
      'Full-home design from spatial planning to the final styled detail, for people who want a home that works exactly the way they live.',
    items: ['Spatial planning & layout', 'Material & finish palettes', 'Furniture & styling', 'Site supervision'],
    image: '1554995207-c18c203602cb',
  },
  {
    title: 'Commercial Spaces',
    description:
      'Hospitality, retail, and office interiors designed to hold up under daily use while still carrying a brand through the room.',
    items: ['Brand-led space design', 'Front & back-of-house planning', 'Vendor & contractor coordination', 'Fit-out supervision'],
    image: '1497366216548-37526070297c',
  },
  {
    title: 'Space Planning',
    description:
      'Before any finish is chosen, we resolve circulation, sightlines, and proportion so the room works before it looks good.',
    items: ['Circulation & flow studies', 'Furniture layout options', 'Structural & MEP coordination', '3D massing studies'],
    image: '1519710164239-da123dc03ef4',
  },
  {
    title: 'Material & Colour',
    description:
      'Palettes and finishes curated from artisans and mills we\'ve worked with for years, chosen for how they age, not just how they photograph.',
    items: ['Curated material boards', 'Artisan & mill sourcing', 'Sample & mock-up review', 'Maintenance guidance'],
    image: '1524634126442-357e0eac3c14',
  },
  {
    title: 'Custom Furniture',
    description:
      'Bespoke joinery and furniture drawn and detailed to fit the room exactly, produced with a small roster of trusted workshops.',
    items: ['Bespoke joinery design', 'Shop drawings & detailing', 'Workshop production management', 'Delivery & installation'],
    image: '1489171078254-c3365d6e359f',
  },
  {
    title: 'Lighting Design',
    description:
      'Layered lighting schemes — ambient, task, and accent — planned early enough to shape the electrical layout, not patch it after.',
    items: ['Layered lighting schemes', 'Fixture selection & sourcing', 'Electrical layout coordination', 'Scene & dimming design'],
    image: '1524758631624-e2822e304c36',
  },
]

export default function Services() {
  usePageMeta(
    'Services',
    'Residential interiors, commercial spaces, space planning, material curation, custom furniture, and lighting design from Navaru Interior Solution.',
  )
  return (
    <>
      <PageHeader
        eyebrow="What We Do"
        title="Six disciplines, one continuous process."
        description="From first walkthrough to the final furniture placement, every discipline below is handled in-house by the same core team."
      />

      <section className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <div className="space-y-24 sm:space-y-32">
          {SERVICES.map((service, i) => (
            <div
              key={service.title}
              className={cn(
                'grid items-center gap-12 lg:grid-cols-2 lg:gap-20',
                i % 2 === 1 && 'lg:[&>*:first-child]:order-2',
              )}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="aspect-[4/3] overflow-hidden"
              >
                <img
                  src={unsplashUrl(service.image, 1200, 900)}
                  srcSet={unsplashSrcSet(service.image, 1200, 900)}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={service.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </motion.div>

              <div>
                <span className="mb-4 block text-xs font-medium text-brass-400">
                  {String(i + 1).padStart(2, '0')} &mdash; Service
                </span>
                <SectionTitle title={service.title} description={service.description} />
                <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm font-light text-ink-700">
                      <Check className="h-4 w-4 shrink-0 text-brass-400" strokeWidth={1.75} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-950 py-28 text-center">
        <div className="mx-auto max-w-2xl px-6 lg:px-12">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest2 text-brass-300">
            Ready to Begin
          </p>
          <h2 className="text-3xl font-light leading-tight tracking-tightest text-cream-100 sm:text-4xl">
            Every project starts with a conversation about the space, not the budget.
          </h2>
          <div className="mt-10 flex justify-center">
            <Button variant="primary" withArrow href="/contact">
              Start a Project
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
