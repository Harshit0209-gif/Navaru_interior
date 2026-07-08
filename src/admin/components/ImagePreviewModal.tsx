import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Check,
  Download,
  FileText,
  Link2,
  Loader2,
  Pencil,
  Ruler,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Modal } from '../../components/Modal'
import { DeleteDialog } from './DeleteDialog'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { deleteMediaAsset, getMediaUsage, renameMediaAsset, replaceMediaAsset } from '../services/mediaService'
import { formatFileSize } from '../../utils/imageDimensions'
import type { MediaAsset, MediaUsageProject } from '../types/media'

type ImagePreviewModalProps = {
  asset: MediaAsset | null
  onClose: () => void
  onDeleted: (asset: MediaAsset) => void
  onUpdated: (asset: MediaAsset) => void
}

export function ImagePreviewModal({ asset, onClose, onDeleted, onUpdated }: ImagePreviewModalProps) {
  const { showToast } = useToast()
  const [displayAsset, setDisplayAsset] = useState<MediaAsset | null>(asset)
  const [usage, setUsage] = useState<MediaUsageProject[] | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(false)

  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [isSavingRename, setIsSavingRename] = useState(false)

  const [isReplacing, setIsReplacing] = useState(false)
  const [replaceProgress, setReplaceProgress] = useState(0)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (asset) {
      setDisplayAsset(asset)
      setRenameValue(asset.file_name)
      setIsRenaming(false)
      setLoadingUsage(true)
      getMediaUsage(asset.public_url)
        .then(setUsage)
        .catch(() => setUsage([]))
        .finally(() => setLoadingUsage(false))
    }
  }, [asset])

  if (!displayAsset) return null
  const isPdf = displayAsset.mime_type === 'application/pdf'

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(displayAsset!.public_url)
    showToast('success', 'Public URL copied to clipboard.')
  }

  async function handleDownload() {
    try {
      const response = await fetch(displayAsset!.public_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = displayAsset!.file_name
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast('error', 'Could not download this file.')
    }
  }

  async function handleSaveRename() {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === displayAsset!.file_name) {
      setIsRenaming(false)
      return
    }
    setIsSavingRename(true)
    try {
      const updated = await renameMediaAsset(displayAsset!.id, trimmed)
      setDisplayAsset(updated)
      onUpdated(updated)
      showToast('success', 'File renamed.')
      setIsRenaming(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not rename this file.'))
    } finally {
      setIsSavingRename(false)
    }
  }

  async function handleReplaceFile(file: File) {
    setIsReplacing(true)
    setReplaceProgress(0)
    try {
      const updated = await replaceMediaAsset(displayAsset!, file, setReplaceProgress)
      setDisplayAsset(updated)
      onUpdated(updated)
      showToast('success', 'File replaced. Every project using it now shows the new version.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not replace this file.'))
    } finally {
      setIsReplacing(false)
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    try {
      await deleteMediaAsset(displayAsset!)
      showToast('success', 'File deleted.')
      onDeleted(displayAsset!)
      setConfirmDelete(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not delete this file.'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Modal open={asset !== null} onClose={onClose} maxWidthClassName="max-w-3xl">
        <div className="grid gap-8 sm:grid-cols-[1.3fr_1fr]">
          <div className="flex items-center justify-center overflow-hidden bg-ink-900/5">
            {isPdf ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <FileText className="h-12 w-12 text-ink-700/40" strokeWidth={1.25} />
                <a
                  href={displayAsset.public_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium uppercase tracking-widest2 text-brass-400 underline"
                >
                  Open PDF
                </a>
              </div>
            ) : (
              <img src={displayAsset.public_url} alt={displayAsset.file_name} className="max-h-[420px] w-full object-contain" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-4">
              {isRenaming ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                    className="w-full border-b border-brass-400 bg-transparent py-1 text-sm font-light text-ink-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveRename}
                    disabled={isSavingRename}
                    aria-label="Save name"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    {isSavingRename ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRenaming(false)}
                    aria-label="Cancel rename"
                    className="text-ink-700/50 hover:text-ink-800"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRenaming(true)}
                  className="group flex items-center gap-2 text-left"
                >
                  <h3 className="truncate text-lg font-normal text-ink-900">{displayAsset.file_name}</h3>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-ink-700/30 group-hover:text-brass-400" strokeWidth={1.5} />
                </button>
              )}
            </div>

            <dl className="space-y-3 text-sm font-light text-ink-800">
              {displayAsset.width && displayAsset.height && (
                <div className="flex items-center gap-2.5">
                  <Ruler className="h-4 w-4 text-brass-400" strokeWidth={1.5} />
                  <span>
                    {displayAsset.width} × {displayAsset.height}px
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-brass-400" strokeWidth={1.5} />
                <span>{formatFileSize(displayAsset.size_bytes)}</span>
                <span className="text-ink-700/40">·</span>
                <span className="text-ink-700/60">{displayAsset.mime_type}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-brass-400" strokeWidth={1.5} />
                <span>{new Date(displayAsset.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </div>
            </dl>

            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Used In</p>
              {loadingUsage ? (
                <p className="text-xs font-light text-ink-700/50">Checking…</p>
              ) : usage && usage.length > 0 ? (
                <ul className="space-y-1.5">
                  {usage.map((u, i) => (
                    <li key={`${u.id}-${u.as}-${i}`}>
                      <Link
                        to={`/admin/portfolio/edit/${u.id}`}
                        className="text-xs font-light text-brass-400 underline hover:text-brass-500"
                      >
                        {u.title}
                      </Link>{' '}
                      <span className="text-xs text-ink-700/50">({u.as === 'cover' ? 'Cover' : 'Gallery'})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-light text-ink-700/50">Not used in any project.</p>
              )}
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <IconButton icon={Link2} label="Copy URL" onClick={handleCopyUrl} />
              <IconButton icon={Download} label="Download" onClick={handleDownload} />
              <IconButton
                icon={Upload}
                label={isReplacing ? `${replaceProgress}%` : 'Replace'}
                onClick={() => replaceInputRef.current?.click()}
                disabled={isReplacing}
              />
              <IconButton icon={Trash2} label="Delete" destructive onClick={() => setConfirmDelete(true)} />
            </div>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleReplaceFile(file)
                e.target.value = ''
              }}
            />
          </div>
        </div>
      </Modal>

      <DeleteDialog
        open={confirmDelete}
        title="Delete this file?"
        description={`"${displayAsset.file_name}" will be permanently deleted from storage. This cannot be undone.`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  destructive,
}: {
  icon: typeof Link2
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 border px-3 py-2 text-xs font-medium uppercase tracking-widest2 transition-colors disabled:opacity-50 ${
        destructive
          ? 'border-red-200 text-red-500 hover:border-red-400 hover:bg-red-50'
          : 'border-ink-900/15 text-ink-700 hover:border-brass-300 hover:text-brass-400'
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      {label}
    </button>
  )
}
