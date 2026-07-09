import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { AnimatedHeading } from '../AnimatedHeading'
import { Button } from '../Button'
import { FloatingElements } from '../FloatingElements'
import { useBookingModal } from '../../context/BookingModalContext'
import { unsplashSrcSet, unsplashUrl } from '../../utils/unsplash'

const HERO_PHOTO_ID = '1618221195710-dd6b41faaea6'

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { open: openBooking } = useBookingModal()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.25])
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.45, 0.8])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[max(100dvh,560px)] items-end overflow-hidden bg-ink-950"
    >
      <motion.div style={{ scale: imageScale, y: imageY }} className="absolute inset-0">
        <img
          src={unsplashUrl(HERO_PHOTO_ID, 1920, 1200)}
          srcSet={unsplashSrcSet(HERO_PHOTO_ID, 1920, 1200)}
          sizes="100vw"
          alt="Bespoke living room designed by Navaru Interior Solution"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </motion.div>
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/20"
      />

      <FloatingElements />

      <div className="relative z-10 mx-auto w-full max-w-content px-6 pb-24 pt-40 lg:px-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-xs font-medium uppercase tracking-widest2 text-brass-300"
        >
          Navaru Interior Solution &mdash; Est. Craftsmanship
        </motion.p>

        <AnimatedHeading
          as="h1"
          delay={0.35}
          className="max-w-4xl text-balance text-5xl font-light leading-[1.05] tracking-tightest text-cream-100 sm:text-6xl lg:text-7xl"
        >
          Interiors shaped by light, texture, and quiet luxury.
        </AnimatedHeading>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-lg text-base font-light leading-relaxed text-cream-200/80"
        >
          We design residences and commercial spaces with an obsessive attention
          to proportion, material, and the way a room should feel &mdash; not just look.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap items-center gap-6"
        >
          <Button variant="primary" withArrow onClick={() => openBooking()}>
            Book a Consultation
          </Button>
          <Button variant="ghost" href="#portfolio">
            View Portfolio
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 right-6 z-10 flex flex-col items-center gap-3 text-cream-200/70 lg:right-12"
      >
        <span className="text-[10px] font-medium uppercase tracking-widest2 [writing-mode:vertical-lr]">
          Scroll
        </span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </section>
  )
}
