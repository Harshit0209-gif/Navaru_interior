import { ACTIVITY_ACTION_LABELS } from '../types/activityLog'
import type { ActivityAction, ActivityActionFilter } from '../types/activityLog'

const selectClasses =
  'border-b border-ink-900/20 bg-transparent py-2 pr-6 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none transition-colors focus:border-brass-400'

const dateInputClasses =
  'border-b border-ink-900/20 bg-transparent py-2 text-xs font-medium text-ink-700 outline-none transition-colors focus:border-brass-400'

const ACTION_OPTIONS = Object.keys(ACTIVITY_ACTION_LABELS) as ActivityAction[]

type ActivityLogFiltersProps = {
  action: ActivityActionFilter
  onActionChange: (value: ActivityActionFilter) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
}

export function ActivityLogFilters({
  action,
  onActionChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: ActivityLogFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <select
        value={action}
        onChange={(e) => onActionChange(e.target.value as ActivityActionFilter)}
        aria-label="Filter by action"
        className={selectClasses}
      >
        <option value="all">All Actions</option>
        {ACTION_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {ACTIVITY_ACTION_LABELS[option]}
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
