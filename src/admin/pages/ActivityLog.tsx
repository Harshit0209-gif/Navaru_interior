import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ActivityLogSearch } from '../components/ActivityLogSearch'
import { ActivityLogFilters } from '../components/ActivityLogFilters'
import { ActivityLogTable } from '../components/ActivityLogTable'
import { ActivityLogPagination } from '../components/ActivityLogPagination'
import { useActivityLogs } from '../hooks/useActivityLogs'
import { useActivityLogRealtime } from '../hooks/useActivityLogRealtime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useToast } from '../../context/ToastContext'
import { downloadCsv } from '../../utils/exportCsv'
import { ACTIVITY_ACTION_LABELS } from '../types/activityLog'
import type { ActivityAction, ActivityActionFilter, ActivitySortOption } from '../types/activityLog'

const PAGE_SIZE = 25

export default function AdminActivityLog() {
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [action, setAction] = useState<ActivityActionFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort] = useState<ActivitySortOption>('newest')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 350)
  const filters = useMemo(
    () => ({ search: debouncedSearch, action, dateFrom, dateTo, sort, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, action, dateFrom, dateTo, sort, page],
  )
  const { logs, total, loading, error, reload } = useActivityLogs(filters)

  useActivityLogRealtime({ onChange: reload })

  function resetToFirstPage() {
    setPage(1)
  }

  function handleExportCsv() {
    const headers = ['Timestamp', 'User', 'Action', 'Description', 'Record Type', 'Record ID', 'IP Address']
    const rows = logs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.user_email ?? '',
      ACTIVITY_ACTION_LABELS[log.action as ActivityAction] ?? log.action,
      log.description,
      log.record_type ?? '',
      log.record_id ?? '',
      log.ip_address ?? '',
    ])
    downloadCsv(`activity-log-${new Date().toISOString().slice(0, 10)}`, headers, rows)
    showToast('success', 'CSV export ready.')
  }

  return (
    <>
      <PageHeader
        title="Activity Log"
        description="Every tracked admin action across the CMS — project, media, booking, contact, and account changes."
        breadcrumbs={[{ label: 'Activity Log' }]}
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="flex items-center gap-2 bg-ink-900 px-8 py-4 text-xs font-medium uppercase tracking-widest2 text-cream-100 transition-colors hover:bg-brass-400 hover:text-ink-950 disabled:opacity-50"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Export CSV
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ActivityLogSearch
          value={search}
          onChange={(v) => {
            setSearch(v)
            resetToFirstPage()
          }}
        />
        <ActivityLogFilters
          action={action}
          onActionChange={(v) => {
            setAction(v)
            resetToFirstPage()
          }}
          dateFrom={dateFrom}
          onDateFromChange={(v) => {
            setDateFrom(v)
            resetToFirstPage()
          }}
          dateTo={dateTo}
          onDateToChange={(v) => {
            setDateTo(v)
            resetToFirstPage()
          }}
        />
      </div>

      {error ? (
        <p className="py-16 text-center text-sm font-light text-red-500">{error}</p>
      ) : (
        <>
          <ActivityLogTable logs={logs} loading={loading} />
          {!loading && (
            <div className="mt-6">
              <ActivityLogPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </>
  )
}
