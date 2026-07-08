import { useCallback, useEffect, useState } from 'react'
import { fetchActivityLogs } from '../services/activityLogService'
import type { ActivityLog, ActivityLogFilters } from '../types/activityLog'

export function useActivityLogs(filters: ActivityLogFilters) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const { search, action, dateFrom, dateTo, sort, page, pageSize } = filters

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchActivityLogs({ search, action, dateFrom, dateTo, sort, page, pageSize })
      .then((result) => {
        if (cancelled) return
        setLogs(result.logs)
        setTotal(result.total)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the activity log right now. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, action, dateFrom, dateTo, sort, page, pageSize, reloadToken])

  return { logs, total, loading, error, reload }
}
