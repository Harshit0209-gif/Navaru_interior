import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Archive,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  RotateCcw,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react'
import type { PortfolioProject } from '../../types/portfolio'

type ProjectActionsMenuProps = {
  project: PortfolioProject
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onPublish: () => void
  onUnpublish: () => void
  onArchive: () => void
  onRestore: () => void
  onToggleFeatured: () => void
}

export function ProjectActionsMenu({
  project,
  onEdit,
  onDuplicate,
  onDelete,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  onToggleFeatured,
}: ProjectActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function runThenClose(action: () => void) {
    setOpen(false)
    action()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Actions for ${project.title}`}
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-brass-400"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-1 w-52 border border-ink-900/10 bg-cream-50 py-1 shadow-xl"
            role="menu"
          >
            <MenuItem icon={Pencil} label="Edit" onClick={() => runThenClose(onEdit)} />
            <MenuItem icon={Copy} label="Duplicate" onClick={() => runThenClose(onDuplicate)} />
            <MenuItem
              icon={project.is_featured ? StarOff : Star}
              label={project.is_featured ? 'Unfeature' : 'Feature'}
              onClick={() => runThenClose(onToggleFeatured)}
            />

            <div className="my-1 border-t border-ink-900/10" />

            {project.status === 'draft' && (
              <MenuItem icon={Eye} label="Publish" onClick={() => runThenClose(onPublish)} />
            )}
            {project.status === 'published' && (
              <>
                <MenuItem icon={EyeOff} label="Move to Draft" onClick={() => runThenClose(onUnpublish)} />
                <MenuItem icon={Archive} label="Archive" onClick={() => runThenClose(onArchive)} />
              </>
            )}
            {project.status === 'archived' && (
              <MenuItem icon={RotateCcw} label="Restore" onClick={() => runThenClose(onRestore)} />
            )}

            <div className="my-1 border-t border-ink-900/10" />

            <MenuItem
              icon={Trash2}
              label="Delete"
              destructive
              onClick={() => runThenClose(onDelete)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-light transition-colors ${
        destructive ? 'text-red-500 hover:bg-red-50' : 'text-ink-800 hover:bg-ink-900/5 hover:text-brass-400'
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      {label}
    </button>
  )
}
