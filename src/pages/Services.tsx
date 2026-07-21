import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { SectionTitle } from '../components/SectionTitle'
import { Button } from '../components/Button'
import { cn } from '../utils/cn'
import { usePageMeta } from '../hooks/usePageMeta'
import { useSiteContent } from '../context/SiteContentContext'
import { unsplashSrcSet, unsplashUrl } from '../utils/unsplash'
import { getResizedImageUrl } from '../utils/imageTransform'

// Fallback Unsplash photo per service, by position, used only until an
// admin uploads a real photo for that service in /admin/content.
const FALLBACK_SERVICE_PHOTOS = [
  '1554995207-c18c203602cb',
  '1497366216548-37526070297c',
  '1519710164239-da123dc03ef4',
  '1524634126442-357e0eac3c14',
  '1489171078254-c3365d6e359f',
  '1524758631624-e2822e304c36',
]

export default function Services() {
  usePageMeta(
    'Services',
    'Residential interiors, commercial spaces, space planning, material curation, custom furniture, and lighting design from Navaru Interior Solution.',
  )
  const content = useSiteContent()

  return (
    <>
      <PageHeader
        eyebrow={content.services_page_eyebrow ?? ''}
        title={content.services_page_title ?? ''}
        description={content.services_page_description ?? undefined}
      />

      <section className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <div className="space-y-24 sm:space-y-32">
          {content.services.map((service, i) => {
            const fallbackPhotoId = FALLBACK_SERVICE_PHOTOS[i % FALLBACK_SERVICE_PHOTOS.length]
            return (
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
                  {service.image_url ? (
                    <img
                      src={getResizedImageUrl(service.image_url, { width: 1200, height: 900 })}
                      alt={service.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={unsplashUrl(fallbackPhotoId, 1200, 900)}
                      srcSet={unsplashSrcSet(fallbackPhotoId, 1200, 900)}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      alt={service.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </motion.div>

                <div>
                  <span className="mb-4 block text-xs font-medium text-brass-400">
                    {String(i + 1).padStart(2, '0')} &mdash; Service
                  </span>
                  <SectionTitle title={service.title} description={service.description} />
                  <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2.5 text-sm font-light text-ink-700">
                        <Check className="h-4 w-4 shrink-0 text-brass-400" strokeWidth={1.75} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-ink-950 py-28 text-center">
        <div className="mx-auto max-w-2xl px-6 lg:px-12">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest2 text-brass-300">
            {content.services_cta_eyebrow}
          </p>
          <h2 className="text-3xl font-light leading-tight tracking-tightest text-cream-100 sm:text-4xl">
            {content.services_cta_heading}
          </h2>
          <div className="mt-10 flex justify-center">
            <Button variant="primary" withArrow href="/contact">
              {content.services_cta_button_label}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
