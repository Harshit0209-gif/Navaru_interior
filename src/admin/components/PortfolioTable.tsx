import { Star } from 'lucide-react'
import type { PortfolioProject } from '../../types/portfolio'
import type { PublishStatus } from '../../types/database'
import { StatusBadge } from './StatusBadge'
import { ProjectActionsMenu } from './ProjectActionsMenu'
import { Skeleton } from '../../components/Skeleton'
import { getResizedImageUrl } from '../../utils/imageTransform'

type PortfolioTableProps = {
  projects: PortfolioProject[]
  loading: boolean
  onEdit: (project: PortfolioProject) => void
  onDuplicate: (project: PortfolioProject) => void
  onDelete: (project: PortfolioProject) => void
  onStatusChange: (project: PortfolioProject, status: PublishStatus) => void
  onToggleFeatured: (project: PortfolioProject) => void
}

export function PortfolioTable({
  projects,
  loading,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onToggleFeatured,
}: PortfolioTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/15 bg-cream-50 py-16 text-center">
        <p className="text-sm font-light text-ink-700">No projects match your filters.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-ink-900/10 bg-cream-50">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/10 text-[11px] font-medium uppercase tracking-widest2 text-ink-700/50">
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Featured</th>
            <th className="px-4 py-3 font-medium">Year</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/5">
          {projects.map((project) => (
            <tr key={project.id} className="transition-colors hover:bg-ink-900/[0.02]">
              <td className="px-4 py-3">
                <button type="button" onClick={() => onEdit(project)} className="flex items-center gap-3 text-left">
                  <img
                    src={getResizedImageUrl(project.cover_image_url, { width: 96, height: 96, quality: 70 })}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-normal text-ink-900 hover:text-brass-400">{project.title}</p>
                    <p className="truncate text-xs font-light text-ink-700/50">/{project.slug}</p>
                  </div>
                </button>
              </td>
              <td className="px-4 py-3 text-ink-700">{project.category?.name ?? '—'}</td>
              <td className="px-4 py-3">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3">
                {project.is_featured ? (
                  <Star className="h-4 w-4 text-brass-400" strokeWidth={1.5} fill="currentColor" />
                ) : (
                  <span className="text-ink-700/70">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-ink-700">{project.completion_year ?? '—'}</td>
              <td className="px-4 py-3 text-ink-700/60">
                {new Date(project.updated_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ProjectActionsMenu
                    project={project}
                    onEdit={() => onEdit(project)}
                    onDuplicate={() => onDuplicate(project)}
                    onDelete={() => onDelete(project)}
                    onPublish={() => onStatusChange(project, 'published')}
                    onUnpublish={() => onStatusChange(project, 'draft')}
                    onArchive={() => onStatusChange(project, 'archived')}
                    onRestore={() => onStatusChange(project, 'draft')}
                    onToggleFeatured={() => onToggleFeatured(project)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
