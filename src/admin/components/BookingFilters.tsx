import { BOOKING_STATUS_OPTIONS, BOOKING_STATUS_LABELS } from '../types/booking'
import type { BookingStatusFilter, ProjectOption } from '../types/booking'

const selectClasses =
  'border-b border-ink-900/20 bg-transparent py-2 pr-6 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none transition-colors focus:border-brass-400'

const dateInputClasses =
  'border-b border-ink-900/20 bg-transparent py-2 text-xs font-medium text-ink-700 outline-none transition-colors focus:border-brass-400'

type BookingFiltersProps = {
  status: BookingStatusFilter
  onStatusChange: (value: BookingStatusFilter) => void
  projects: ProjectOption[]
  projectId: string
  onProjectChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
}

export function BookingFilters({
  status,
  onStatusChange,
  projects,
  projectId,
  onProjectChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: BookingFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as BookingStatusFilter)}
        aria-label="Filter by status"
        className={selectClasses}
      >
        <option value="all">All Statuses</option>
        {BOOKING_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {BOOKING_STATUS_LABELS[option]}
          </option>
        ))}
      </select>

      <select
        value={projectId}
        onChange={(e) => onProjectChange(e.target.value)}
        aria-label="Filter by project"
        className={selectClasses}
      >
        <option value="">All Projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
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
