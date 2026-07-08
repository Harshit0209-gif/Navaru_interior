import { Star } from 'lucide-react'
import type { PortfolioProject } from '../../types/portfolio'
import type { PublishStatus } from '../../types/database'
import { StatusBadge } from './StatusBadge'
import { ProjectActionsMenu } from './ProjectActionsMenu'
import { getResizedImageUrl } from '../../utils/imageTransform'

type ProjectCardProps = {
  project: PortfolioProject
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onStatusChange: (status: PublishStatus) => void
  onToggleFeatured: () => void
}

export function ProjectCard({
  project,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onToggleFeatured,
}: ProjectCardProps) {
  return (
    <div className="group relative overflow-hidden border border-ink-900/10 bg-cream-50">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-900/5">
        <img
          src={getResizedImageUrl(project.cover_image_url, { width: 500, height: 375, quality: 70 })}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {project.is_featured && (
          <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950/70 text-brass-300">
            <Star className="h-3.5 w-3.5" strokeWidth={1.5} fill="currentColor" />
          </span>
        )}
        <div className="absolute right-2 top-2">
          <ProjectActionsMenu
            project={project}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onPublish={() => onStatusChange('published')}
            onUnpublish={() => onStatusChange('draft')}
            onArchive={() => onStatusChange('archived')}
            onRestore={() => onStatusChange('draft')}
            onToggleFeatured={onToggleFeatured}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-widest2 text-brass-400">
            {project.category?.name ?? 'Uncategorized'}
          </p>
          <StatusBadge status={project.status} />
        </div>
        <button type="button" onClick={onEdit} className="text-left">
          <h3 className="truncate text-base font-normal text-ink-900 hover:text-brass-400">{project.title}</h3>
        </button>
        <p className="mt-1 truncate text-xs font-light text-ink-700/50">/{project.slug}</p>
      </div>
    </div>
  )
}
