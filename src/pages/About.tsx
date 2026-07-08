import { Award, Leaf, Ruler, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/PageHeader'
import { SectionTitle } from '../components/SectionTitle'
import { Timeline } from '../components/Timeline'
import { Counter } from '../components/Counter'
import { usePageMeta } from '../hooks/usePageMeta'
import { unsplashSrcSet, unsplashUrl } from '../utils/unsplash'

const STORY_PHOTO_ID = '1615874959474-d609969a20ed'

const VALUES = [
  {
    icon: Ruler,
    title: 'Proportion First',
    description: 'Every layout is resolved for circulation and scale before a single finish is chosen.',
  },
  {
    icon: Leaf,
    title: 'Honest Materials',
    description: 'Natural wood, stone, and textile that age well and wear their use with character.',
  },
  {
    icon: Sparkles,
    title: 'Restrained Detail',
    description: 'We add until it works, then we stop. Quiet rooms are harder to design than loud ones.',
  },
  {
    icon: Award,
    title: 'Direct Attention',
    description: 'A deliberately small client list so every project has the founders in the room.',
  },
]

const PROCESS = [
  {
    title: 'Discovery',
    description:
      'A walkthrough of the space and an honest conversation about how you actually live or work in it.',
  },
  {
    title: 'Concept & Space Plan',
    description:
      'Layout, material direction, and a lighting strategy presented as a single coherent concept.',
  },
  {
    title: 'Detailing & Sourcing',
    description:
      'Furniture, fixtures, and custom joinery specified down to the finish and hardware.',
  },
  {
    title: 'Execution',
    description:
      'On-site supervision through build-out and installation, styled to the last object on the last shelf.',
  },
]

const STATS = [
  { value: 14, suffix: '+', label: 'Years of Practice' },
  { value: 220, suffix: '+', label: 'Projects Delivered' },
  { value: 12, suffix: '', label: 'Design Awards' },
]

export default function About() {
  usePageMeta(
    'About the Studio',
    'Fourteen years of shaping rooms around real life. Learn about Navaru Interior Solution\'s philosophy, values, and design process.',
  )
  return (
    <>
      <PageHeader
        eyebrow="About the Studio"
        title="Fourteen years of shaping rooms around real life."
        description="Navaru Interior Solution is a small studio taking on a deliberately limited number of projects each year, so every space gets direct attention from first sketch to final styling."
      />

      <section className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <SectionTitle
            eyebrow="Our Story"
            title="Started on the belief that most interiors try too hard."
            description="Navaru began as a small residential practice with one rule: a room should feel resolved, not decorated. Fourteen years on, that same rule still governs every commission, whether it's a single bedroom or a full commercial fit-out. We keep the studio deliberately small so that rule never has to compete with volume."
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <img
              src={unsplashUrl(STORY_PHOTO_ID, 1000, 1200)}
              srcSet={unsplashSrcSet(STORY_PHOTO_ID, 1000, 1200)}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt="A Navaru-designed living room with layered natural light"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>

        <div className="mt-24 grid grid-cols-3 gap-8 border-y border-ink-900/10 py-10">
          {STATS.map((stat) => (
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
            eyebrow="What We Believe"
            title="Four principles behind every commission."
            align="center"
            className="mx-auto mb-16"
          />

          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="bg-cream-50 p-8"
              >
                <Icon className="mb-6 h-7 w-7 text-brass-400" strokeWidth={1.25} />
                <h3 className="text-lg font-normal tracking-tight text-ink-900">{title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink-700">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-28 lg:px-12">
        <SectionTitle
          eyebrow="How We Work"
          title="One process, repeated with discipline."
          description="Every project moves through the same four stages, regardless of size, so nothing gets improvised on-site."
          className="mb-16"
        />

        <Timeline steps={PROCESS} />
      </section>
    </>
  )
}
