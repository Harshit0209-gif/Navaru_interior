import { motion } from 'framer-motion'
import { PageHeader } from '../components/PageHeader'
import { SectionTitle } from '../components/SectionTitle'
import { Timeline } from '../components/Timeline'
import { Counter } from '../components/Counter'
import { usePageMeta } from '../hooks/usePageMeta'
import { useSiteContent } from '../context/SiteContentContext'
import { getIcon } from '../utils/icons'
import { unsplashSrcSet, unsplashUrl } from '../utils/unsplash'
import { getResizedImageUrl } from '../utils/imageTransform'

const STORY_PHOTO_ID = '1615874959474-d609969a20ed'

export default function About() {
  usePageMeta(
    'About the Studio',
    "Fourteen years of shaping rooms around real life. Learn about Navaru Interior Solution's philosophy, values, and design process.",
  )
  const content = useSiteContent()

  return (
    <>
      <PageHeader
        eyebrow={content.about_page_eyebrow ?? ''}
        title={content.about_page_title ?? ''}
        description={content.about_page_description ?? undefined}
      />

      <section className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <SectionTitle
            eyebrow={content.about_story_eyebrow ?? undefined}
            title={content.about_story_title ?? ''}
            description={content.about_story_body ?? undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {content.about_story_image_url ? (
              <img
                src={getResizedImageUrl(content.about_story_image_url, { width: 1000, height: 1200 })}
                alt={content.about_story_title ?? ''}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <img
                src={unsplashUrl(STORY_PHOTO_ID, 1000, 1200)}
                srcSet={unsplashSrcSet(STORY_PHOTO_ID, 1000, 1200)}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt="A Navaru-designed living room with layered natural light"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
          </motion.div>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-8 border-y border-ink-900/10 py-10 sm:grid-cols-4">
          {content.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-light tracking-tightest text-ink-900 sm:text-4xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-widest2 text-ink-700/60 sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-200/60 py-28">
        <div className="mx-auto max-w-content px-6 lg:px-12">
          <SectionTitle
            eyebrow={content.values_eyebrow ?? undefined}
            title={content.values_title ?? ''}
            align="center"
            className="mx-auto mb-16"
          />

          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {content.values.map((value, i) => {
              const Icon = getIcon(value.icon)
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-cream-50 p-8"
                >
                  <Icon className="mb-6 h-7 w-7 text-brass-400" strokeWidth={1.25} />
                  <h3 className="text-lg font-normal tracking-tight text-ink-900">{value.title}</h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-ink-700">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-28 lg:px-12">
        <SectionTitle
          eyebrow={content.process_eyebrow ?? undefined}
          title={content.process_title ?? ''}
          description={content.process_body ?? undefined}
          className="mb-16"
        />

        <Timeline steps={content.process_steps} />
      </section>
    </>
  )
}
