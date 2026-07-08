import { useCallback, useEffect, useState } from 'react'
import { fetchEnquiries } from '../services/contactService'
import type { ContactEnquiry, ContactFilters } from '../types/contact'

export function useAdminContactList(filters: ContactFilters) {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const { search, status, dateFrom, dateTo, sort, page, pageSize } = filters

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchEnquiries({ search, status, dateFrom, dateTo, sort, page, pageSize })
      .then((result) => {
        if (cancelled) return
        setEnquiries(result.enquiries)
        setTotal(result.total)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load contact enquiries right now. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, dateFrom, dateTo, sort, page, pageSize, reloadToken])

  return { enquiries, total, loading, error, reload }
}
