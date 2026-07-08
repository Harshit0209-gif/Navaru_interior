import type { PublishStatus } from '../../types/database'
import { cn } from '../../utils/cn'

const STATUS_STYLES: Record<PublishStatus, string> = {
  draft: 'bg-ink-900/8 text-ink-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-amber-100 text-amber-700',
}

const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export function StatusBadge({ status }: { status: PublishStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest2',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
