import { useId, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { motion } from 'framer-motion'
import { File as FileIcon, Upload, X } from 'lucide-react'
import { validateAttachment } from '../../utils/fileValidation'
import { cn } from '../../utils/cn'

type FileUploadProps = {
  file: File | null
  onChange: (file: File | null) => void
  progress?: number
  disabled?: boolean
  label?: string
}

export function FileUpload({ file, onChange, progress = 0, disabled, label = 'Upload a file' }: FileUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function acceptFile(candidate: File) {
    const validationError = validateAttachment(candidate)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onChange(candidate)
    if (candidate.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(candidate))
    } else {
      setPreviewUrl(null)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) acceptFile(dropped)
  }

  function handleRemove() {
    onChange(null)
    setPreviewUrl(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const isUploading = progress > 0 && progress < 100

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-xs font-medium uppercase tracking-widest2 text-ink-700/70">
        {label}
      </label>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-6 py-8 text-center transition-colors duration-300',
            isDragging ? 'border-brass-400 bg-brass-50/40' : 'border-ink-900/15 hover:border-brass-300',
            disabled && 'pointer-events-none opacity-50',
          )}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
        >
          <Upload className="h-6 w-6 text-ink-700/50" strokeWidth={1.25} />
          <p className="text-sm font-light text-ink-700">
            Drag &amp; drop, or <span className="text-brass-400 underline">browse</span>
          </p>
          <p className="text-xs font-light text-ink-700/50">JPG, PNG, WEBP, or PDF — up to 10MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 border border-ink-900/10 p-4">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
          ) : (
            <FileIcon className="h-8 w-8 shrink-0 text-brass-400" strokeWidth={1.25} />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-light text-ink-800">{file.name}</p>
            <p className="text-xs font-light text-ink-700/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            {isUploading && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink-900/10">
                <motion.div
                  className="h-full rounded-full bg-brass-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove file"
              className="shrink-0 text-ink-700/50 transition-colors hover:text-red-500"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const selected = e.target.files?.[0]
          if (selected) acceptFile(selected)
        }}
      />

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
