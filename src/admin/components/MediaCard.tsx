import { useState } from 'react'
import { Check, FileText, Link2 } from 'lucide-react'
import type { MediaAsset } from '../types/media'
import { formatFileSize } from '../../utils/imageDimensions'
import { getResizedImageUrl } from '../../utils/imageTransform'
import { cn } from '../../utils/cn'

type MediaCardProps = {
  asset: MediaAsset
  onOpen: () => void
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}

export function MediaCard({ asset, onOpen, selectable, selected, onToggleSelect }: MediaCardProps) {
  const [copied, setCopied] = useState(false)
  const isPdf = asset.mime_type === 'application/pdf'

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    await navigator.clipboard.writeText(asset.public_url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  function handleCardClick() {
    if (selectable && onToggleSelect) {
      onToggleSelect()
    } else {
      onOpen()
    }
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden border bg-cream-50 transition-colors',
        selected ? 'border-brass-400 ring-1 ring-brass-400' : 'border-ink-900/10 hover:border-brass-300',
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-pressed={selectable ? selected : undefined}
      aria-label={selectable ? `${selected ? 'Deselect' : 'Select'} ${asset.file_name}` : `Open ${asset.file_name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-ink-900/5">
        {isPdf ? (
          <div className="flex h-full w-full items-center justify-center">
            <FileText className="h-8 w-8 text-ink-700/40" strokeWidth={1.25} />
          </div>
        ) : (
          <img
            src={getResizedImageUrl(asset.public_url, { width: 400, height: 400, quality: 70 })}
            alt={asset.file_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {selectable && (
          <span
            className={cn(
              'absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
              selected ? 'border-brass-400 bg-brass-400 text-ink-950' : 'border-white bg-ink-950/40 text-transparent',
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        )}

        {!selectable && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy public URL"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />}
          </button>
        )}

        {onOpen && selectable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
            className="absolute inset-x-0 bottom-0 bg-ink-950/60 py-1 text-center text-[10px] font-medium uppercase tracking-widest2 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            View Details
          </button>
        )}
      </div>

      <div className="p-2.5">
        <p className="truncate text-xs font-light text-ink-800">{asset.file_name}</p>
        <p className="mt-0.5 text-[11px] font-light text-ink-700/50">{formatFileSize(asset.size_bytes)}</p>
      </div>
    </div>
  )
}
