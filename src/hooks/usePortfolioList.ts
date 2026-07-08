import { useEffect, useState } from 'react'
import { fetchPortfolioProjects } from '../services/portfolioService'
import { getErrorMessage } from '../utils/errors'
import type { PortfolioFilters, PortfolioProject } from '../types/portfolio'

export function usePortfolioList(filters: PortfolioFilters) {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { search, categorySlug, sort, page, pageSize } = filters

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPortfolioProjects({ search, categorySlug, sort, page, pageSize })
      .then((result) => {
        if (cancelled) return
        setProjects((prev) => (page && page > 1 ? [...prev, ...result.projects] : result.projects))
        setTotal(result.total)
        setHasMore(result.hasMore)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Could not load the portfolio right now. Please try again shortly.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categorySlug, sort, page, pageSize])

  return { projects, total, hasMore, loading, error }
}
