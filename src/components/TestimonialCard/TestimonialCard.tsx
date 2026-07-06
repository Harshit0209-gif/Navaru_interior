import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

type TestimonialCardProps = {
  quote: string
  name: string
  role: string
}

export function TestimonialCard({ quote, name, role }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl text-center"
    >
      <Quote className="mx-auto mb-8 h-8 w-8 text-brass-300" strokeWidth={1.25} />
      <p className="text-balance text-2xl font-light leading-relaxed tracking-tight text-cream-100 sm:text-3xl">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-widest2 text-brass-300">{name}</p>
        <p className="mt-1 text-xs font-light text-cream-200/60">{role}</p>
      </div>
    </motion.div>
  )
}
