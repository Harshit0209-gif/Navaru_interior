import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X, XCircle, Info } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../utils/cn'

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const ACCENTS = {
  success: 'border-l-emerald-500 text-emerald-600',
  error: 'border-l-red-500 text-red-600',
  info: 'border-l-brass-400 text-brass-500',
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[110] flex w-[calc(100%-3rem)] max-w-sm flex-col gap-3"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 border-l-4 bg-cream-50 p-4 shadow-lg',
                ACCENTS[toast.type],
              )}
              role="status"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
              <p className="flex-1 text-sm font-light leading-relaxed text-ink-800">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-ink-400 transition-colors hover:text-ink-800"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
