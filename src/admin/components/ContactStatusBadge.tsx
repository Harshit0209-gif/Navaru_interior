import type { EnquiryStatus } from '../../types/database'
import { CONTACT_STATUS_LABELS } from '../types/contact'
import { cn } from '../../utils/cn'

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  unread: 'bg-blue-100 text-blue-700',
  read: 'bg-ink-900/10 text-ink-700',
  replied: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-amber-100 text-amber-700',
}

export function ContactStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest2',
        STATUS_STYLES[status],
      )}
    >
      {CONTACT_STATUS_LABELS[status]}
    </span>
  )
}
