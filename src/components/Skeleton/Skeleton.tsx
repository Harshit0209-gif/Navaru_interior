import { cn } from '../../utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-ink-900/8', className)} aria-hidden="true" />
}
