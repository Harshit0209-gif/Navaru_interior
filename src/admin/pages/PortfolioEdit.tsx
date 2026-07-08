import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { PortfolioForm } from '../components/PortfolioForm'
import { Skeleton } from '../../components/Skeleton'
import { Button } from '../../components/Button'
import { fetchAdminProjectById } from '../services/portfolioService'
import { projectToFormValues } from '../types/portfolio'
import type { PortfolioFormValues } from '../types/portfolio'

export default function AdminPortfolioEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [initialValues, setInitialValues] = useState<PortfolioFormValues | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setError(null)

    fetchAdminProjectById(id)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setNotFound(true)
          return
        }
        setInitialValues(projectToFormValues(result.project, result.images))
        setTitle(result.project.title)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this project right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <>
        <PageHeader
          title="Edit Project"
          breadcrumbs={[{ label: 'Portfolio', to: '/admin/portfolio' }, { label: 'Edit' }]}
        />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    )
  }

  if (notFound || error || !id || !initialValues) {
    return (
      <>
        <PageHeader
          title="Edit Project"
          breadcrumbs={[{ label: 'Portfolio', to: '/admin/portfolio' }, { label: 'Edit' }]}
        />
        <div className="border border-dashed border-ink-900/15 bg-cream-50 py-16 text-center">
          <p className="text-sm font-light text-ink-700">{error ?? 'This project could not be found.'}</p>
          <Button variant="outline" className="mt-6" onClick={() => navigate('/admin/portfolio')}>
            Back to Portfolio
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={`Edit: ${title}`}
        breadcrumbs={[{ label: 'Portfolio', to: '/admin/portfolio' }, { label: title }]}
      />
      <PortfolioForm
        mode="edit"
        projectId={id}
        initialValues={initialValues}
        onSuccess={() => navigate('/admin/portfolio')}
        onCancel={() => navigate('/admin/portfolio')}
      />
    </>
  )
}
