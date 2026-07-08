import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Counter } from '../../components/Counter'
import { cn } from '../../utils/cn'

type DashboardCardProps = {
  icon: LucideIcon
  label: string
  value: number
  displayValue?: string
  trend?: { value: number; direction: 'up' | 'down' }
  index?: number
}

export function DashboardCard({ icon: Icon, label, value, displayValue, trend, index = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group border border-ink-900/10 bg-cream-50 p-6 transition-colors duration-300 hover:border-brass-300"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brass-50 text-brass-400">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        {trend && trend.value > 0 && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500',
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            {trend.value}%
          </span>
        )}
      </div>

      <p className="mt-5 text-3xl font-light tracking-tight text-ink-900">
        {displayValue ?? <Counter value={value} />}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">{label}</p>
    </motion.div>
  )
}
