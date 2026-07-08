import { useCallback, useEffect, useState } from 'react'
import { fetchAdminProjects } from '../services/portfolioService'
import type { PortfolioProject } from '../../types/portfolio'
import type { AdminPortfolioFilters } from '../types/portfolio'

export function useAdminPortfolioList(filters: AdminPortfolioFilters) {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const { search, categoryId, featured, status, sort, page, pageSize } = filters

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchAdminProjects({ search, categoryId, featured, status, sort, page, pageSize })
      .then((result) => {
        if (cancelled) return
        setProjects(result.projects)
        setTotal(result.total)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load projects right now. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, featured, status, sort, page, pageSize, reloadToken])

  return { projects, total, loading, error, reload }
}
