import type { ElementType } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

type AnimatedHeadingProps = {
  as?: ElementType
  className?: string
  delay?: number
  children: string
}

const container = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.08, delayChildren: delay },
  }),
}

const word = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export function AnimatedHeading({
  as: Tag = 'h2',
  className,
  delay = 0,
  children,
}: AnimatedHeadingProps) {
  const words = children.split(' ')

  return (
    <Tag className={cn('overflow-hidden', className)}>
      <motion.span
        className="flex flex-wrap"
        variants={container}
        custom={delay}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
      >
        {words.map((w, i) => (
          <span key={i} className="mr-[0.28em] overflow-hidden pb-[0.1em]">
            <motion.span className="inline-block" variants={word}>
              {w}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
