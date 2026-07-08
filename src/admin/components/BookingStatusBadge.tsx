import type { BookingStatus } from '../../types/database'
import { BOOKING_STATUS_LABELS } from '../types/booking'
import { cn } from '../../utils/cn'

const STATUS_STYLES: Record<BookingStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  contacted: 'bg-brass-100 text-brass-600',
  completed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest2',
        STATUS_STYLES[status],
      )}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  )
}
