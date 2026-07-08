import { useEffect, useState } from 'react'
import { fetchProjectBySlug, fetchRelatedProjects } from '../services/portfolioService'
import type { PortfolioProject, PortfolioProjectWithGallery } from '../types/portfolio'

export function usePortfolioProject(slug: string | undefined) {
  const [project, setProject] = useState<PortfolioProjectWithGallery | null>(null)
  const [related, setRelated] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setError(null)

    fetchProjectBySlug(slug)
      .then(async (result) => {
        if (cancelled) return
        if (!result) {
          setNotFound(true)
          return
        }
        setProject(result)
        const relatedProjects = await fetchRelatedProjects(result.id, result.category_id)
        if (!cancelled) setRelated(relatedProjects)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this project right now. Please try again shortly.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return { project, related, loading, notFound, error }
}
