import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'

type ServiceCardProps = {
  index: number
  icon: LucideIcon
  title: string
  description: string
}

export function ServiceCard({ index, icon: Icon, title, description }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col justify-between overflow-hidden border border-ink-900/10 bg-cream-50 p-8 transition-colors duration-500 ease-luxury hover:border-brass-300/60"
    >
      <div>
        <span className="mb-8 block text-xs font-medium text-ink-700/50">
          {String(index + 1).padStart(2, '0')}
        </span>
        <Icon className="mb-6 h-8 w-8 text-brass-400" strokeWidth={1.25} />
        <h3 className="text-xl font-normal tracking-tight text-ink-900">{title}</h3>
        <p className="mt-3 text-sm font-light leading-relaxed text-ink-700">{description}</p>
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs font-medium uppercase tracking-widest2 text-ink-800 opacity-0 transition-all duration-500 ease-luxury group-hover:opacity-100">
        Learn more
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-luxury group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brass-400 transition-transform duration-500 ease-luxury group-hover:scale-x-100" />
    </motion.div>
  )
}
