import type { ActivityAction } from '../types/activityLog'
import { ACTIVITY_ACTION_LABELS } from '../types/activityLog'
import { cn } from '../../utils/cn'

function styleFor(action: ActivityAction): string {
  if (action === 'login') return 'bg-emerald-100 text-emerald-700'
  if (action === 'logout') return 'bg-ink-900/10 text-ink-700'
  if (action.endsWith('.created') || action.endsWith('.uploaded') || action.endsWith('.duplicated')) {
    return 'bg-emerald-100 text-emerald-700'
  }
  if (action.endsWith('.deleted') || action.endsWith('.bulk_deleted')) {
    return 'bg-red-100 text-red-600'
  }
  if (action.includes('status_changed') || action.endsWith('.featured_toggled')) {
    return 'bg-brass-100 text-brass-600'
  }
  return 'bg-blue-100 text-blue-700'
}

export function ActivityActionBadge({ action }: { action: ActivityAction }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest2',
        styleFor(action),
      )}
    >
      {ACTIVITY_ACTION_LABELS[action] ?? action}
    </span>
  )
}
