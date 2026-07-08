import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ProjectSearch } from '../components/ProjectSearch'
import { ProjectFilters } from '../components/ProjectFilters'
import { ProjectPagination } from '../components/ProjectPagination'
import { PortfolioTable } from '../components/PortfolioTable'
import { ProjectCard } from '../components/ProjectCard'
import { DeleteDialog } from '../components/DeleteDialog'
import { Button } from '../../components/Button'
import { useCategories } from '../../hooks/useCategories'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useAdminPortfolioList } from '../hooks/useAdminPortfolioList'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import {
  deleteProject,
  duplicateProject,
  updateProjectFeatured,
  updateProjectStatus,
} from '../services/portfolioService'
import type { AdminSortOption, FeaturedFilter, PublishFilter } from '../types/portfolio'
import type { PortfolioProject } from '../../types/portfolio'
import type { PublishStatus } from '../../types/database'
import { cn } from '../../utils/cn'

const PAGE_SIZE = 10

export default function AdminPortfolio() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { categories } = useCategories()

  const [view, setView] = useState<'table' | 'grid'>('table')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<PublishFilter>('all')
  const [featured, setFeatured] = useState<FeaturedFilter>('all')
  const [sort, setSort] = useState<AdminSortOption>('newest')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<PortfolioProject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 350)

  const filters = useMemo(
    () => ({ search: debouncedSearch, categoryId, status, featured, sort, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, categoryId, status, featured, sort, page],
  )

  const { projects, total, loading, error, reload } = useAdminPortfolioList(filters)

  function resetToFirstPage() {
    setPage(1)
  }

  function handleEdit(project: PortfolioProject) {
    navigate(`/admin/portfolio/edit/${project.id}`)
  }

  async function handleDuplicate(project: PortfolioProject) {
    try {
      const copy = await duplicateProject(project.id)
      showToast('success', 'Project duplicated.')
      navigate(`/admin/portfolio/edit/${copy.id}`)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not duplicate this project.'))
    }
  }

  async function handleStatusChange(project: PortfolioProject, next: PublishStatus) {
    try {
      await updateProjectStatus(project.id, next)
      showToast('success', `Project marked as ${next}.`)
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not update status.'))
    }
  }

  async function handleToggleFeatured(project: PortfolioProject) {
    try {
      await updateProjectFeatured(project.id, !project.is_featured)
      showToast('success', project.is_featured ? 'Removed from featured.' : 'Marked as featured.')
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not update this project.'))
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteProject(pendingDelete.id)
      showToast('success', 'Project deleted.')
      setPendingDelete(null)
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not delete this project.'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Create, edit, and publish your portfolio projects."
        breadcrumbs={[{ label: 'Portfolio' }]}
        actions={
          <Button variant="primary" withArrow onClick={() => navigate('/admin/portfolio/new')}>
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Project
            </span>
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ProjectSearch
          value={search}
          onChange={(v) => {
            setSearch(v)
            resetToFirstPage()
          }}
        />

        <div className="flex flex-wrap items-center gap-4">
          <ProjectFilters
            categories={categories}
            categoryId={categoryId}
            onCategoryChange={(v) => {
              setCategoryId(v)
              resetToFirstPage()
            }}
            status={status}
            onStatusChange={(v) => {
              setStatus(v)
              resetToFirstPage()
            }}
            featured={featured}
            onFeaturedChange={(v) => {
              setFeatured(v)
              resetToFirstPage()
            }}
            sort={sort}
            onSortChange={setSort}
          />

          <div className="flex items-center gap-1 border border-ink-900/10 p-1">
            <button
              type="button"
              onClick={() => setView('table')}
              aria-label="Table view"
              aria-pressed={view === 'table'}
              className={cn('p-1.5', view === 'table' ? 'bg-ink-900 text-cream-100' : 'text-ink-700')}
            >
              <List className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className={cn('p-1.5', view === 'grid' ? 'bg-ink-900 text-cream-100' : 'text-ink-700')}
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {error && <p className="py-16 text-center text-sm font-light text-red-500">{error}</p>}

      {!error && view === 'table' && (
        <PortfolioTable
          projects={projects}
          loading={loading}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={setPendingDelete}
          onStatusChange={handleStatusChange}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {!error && view === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => handleEdit(project)}
              onDuplicate={() => handleDuplicate(project)}
              onDelete={() => setPendingDelete(project)}
              onStatusChange={(next) => handleStatusChange(project, next)}
              onToggleFeatured={() => handleToggleFeatured(project)}
            />
          ))}
        </div>
      )}

      {!error && !loading && (
        <div className="mt-6">
          <ProjectPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </div>
      )}

      <DeleteDialog
        open={pendingDelete !== null}
        title="Delete this project?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" and its gallery images will be permanently deleted. This cannot be undone.`
            : ''
        }
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
