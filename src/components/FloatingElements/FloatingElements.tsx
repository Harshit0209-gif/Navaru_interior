import { motion } from 'framer-motion'

export function FloatingElements() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute right-[8%] top-[18%] h-40 w-40 rounded-full border border-brass-300/30"
        animate={{ y: [0, -22, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[6%] top-[55%] h-24 w-24 rounded-full bg-brass-300/10"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute right-[20%] bottom-[12%] h-2 w-2 rounded-full bg-brass-400"
        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.6, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
