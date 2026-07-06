import { motion } from 'framer-motion'
import { AnimatedHeading } from '../AnimatedHeading'
import { cn } from '../../utils/cn'

type SectionTitleProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 text-xs font-medium uppercase tracking-widest2 text-brass-400"
        >
          {eyebrow}
        </motion.p>
      )}
      <AnimatedHeading
        as="h2"
        className="text-4xl font-light leading-[1.1] tracking-tightest text-ink-900 sm:text-5xl"
      >
        {title}
      </AnimatedHeading>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 text-base font-light leading-relaxed text-ink-700"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}
