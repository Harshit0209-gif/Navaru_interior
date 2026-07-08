import { useCallback, useEffect, useState } from 'react'
import { fetchBookings } from '../services/bookingService'
import type { BookingFilters, BookingRequest } from '../types/booking'

export function useAdminBookingList(filters: BookingFilters) {
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const { search, status, projectId, dateFrom, dateTo, sort, page, pageSize } = filters

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchBookings({ search, status, projectId, dateFrom, dateTo, sort, page, pageSize })
      .then((result) => {
        if (cancelled) return
        setBookings(result.bookings)
        setTotal(result.total)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load booking requests right now. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, projectId, dateFrom, dateTo, sort, page, pageSize, reloadToken])

  return { bookings, total, loading, error, reload }
}
