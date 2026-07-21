import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { motion } from 'framer-motion'
import { Check, File as FileIcon, UploadCloud, X } from 'lucide-react'
import { useMediaUpload } from '../hooks/useMediaUpload'
import type { MediaAsset, MediaBucket } from '../types/media'
import { cn } from '../../utils/cn'

type UploadZoneProps = {
  bucket: MediaBucket
  folder: string
  onUploaded?: (asset: MediaAsset) => void
  multiple?: boolean
  accept?: string
  hint?: string
}

const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml,application/pdf'
const DEFAULT_HINT = 'PNG, JPG, WEBP, SVG, or PDF — up to 15MB each'

export function UploadZone({
  bucket,
  folder,
  onUploaded,
  multiple = true,
  accept = DEFAULT_ACCEPT,
  hint = DEFAULT_HINT,
}: UploadZoneProps) {
  const { tasks, addFiles, removeTask, clearCompleted } = useMediaUpload({ onUploaded })
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    addFiles(Array.from(fileList), bucket, folder)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-6 py-10 text-center transition-colors duration-300',
          isDragging ? 'border-brass-400 bg-brass-50/40' : 'border-ink-900/15 hover:border-brass-300',
        )}
      >
        <UploadCloud className="h-7 w-7 text-ink-700/50" strokeWidth={1.25} />
        <p className="text-sm font-light text-ink-700">
          Drag &amp; drop {multiple ? 'files' : 'a file'} here, or <span className="text-brass-400 underline">browse</span>
        </p>
        <p className="text-xs font-light text-ink-700/50">{hint}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {tasks.length > 0 && (
        <div className="mt-4 space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 border border-ink-900/10 bg-cream-50 p-3">
              <FileIcon className="h-5 w-5 shrink-0 text-brass-400" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-light text-ink-800">{task.file.name}</p>
                {task.status === 'error' ? (
                  <p className="text-xs text-red-500">{task.error}</p>
                ) : (
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-ink-900/10">
                    <motion.div
                      className="h-full rounded-full bg-brass-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ ease: 'easeOut' }}
                    />
                  </div>
                )}
              </div>
              <span className="shrink-0">
                {task.status === 'done' ? (
                  <Check className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                ) : task.status === 'error' ? (
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    aria-label="Dismiss"
                    className="text-ink-700/50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                ) : (
                  <span className="text-xs font-light text-ink-700/50">{task.progress}%</span>
                )}
              </span>
            </div>
          ))}

          {tasks.some((t) => t.status === 'done') && (
            <button
              type="button"
              onClick={clearCompleted}
              className="text-xs font-medium uppercase tracking-widest2 text-brass-400 hover:text-brass-500"
            >
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  )
}
