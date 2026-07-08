import { motion } from 'framer-motion'

type TimelineStep = {
  title: string
  description: string
}

type TimelineProps = {
  steps: TimelineStep[]
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-ink-900/10 sm:left-[19px]" />

      <div className="space-y-12">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex gap-6 pl-0 sm:gap-8"
          >
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brass-300 bg-cream-100 text-xs font-medium text-brass-400 sm:h-10 sm:w-10">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="pt-1">
              <h3 className="text-xl font-normal tracking-tight text-ink-900">{step.title}</h3>
              <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-ink-700">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
