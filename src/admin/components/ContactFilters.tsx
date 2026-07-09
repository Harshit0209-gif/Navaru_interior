import { CONTACT_STATUS_OPTIONS, CONTACT_STATUS_LABELS } from '../types/contact'
import type { ContactStatusFilter } from '../types/contact'

const selectClasses =
  'border-b border-ink-900/20 bg-ink-900/5 py-2 pr-6 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none transition-colors focus:border-brass-400'

const dateInputClasses =
  'border-b border-ink-900/20 bg-ink-900/5 py-2 text-xs font-medium text-ink-700 outline-none transition-colors focus:border-brass-400'

type ContactFiltersProps = {
  status: ContactStatusFilter
  onStatusChange: (value: ContactStatusFilter) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
}

export function ContactFilters({
  status,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: ContactFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ContactStatusFilter)}
        aria-label="Filter by status"
        className={selectClasses}
      >
        <option value="all">All Statuses</option>
        {CONTACT_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {CONTACT_STATUS_LABELS[option]}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          aria-label="From date"
          className={dateInputClasses}
        />
        <span className="text-xs text-ink-700/40">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="To date"
          className={dateInputClasses}
        />
      </div>
    </div>
  )
}
