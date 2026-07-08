import type { MediaAsset } from '../types/media'
import { MediaCard } from './MediaCard'
import { Skeleton } from '../../components/Skeleton'

type MediaGridProps = {
  assets: MediaAsset[]
  loading: boolean
  onOpen: (asset: MediaAsset) => void
  selectable?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (asset: MediaAsset) => void
}

export function MediaGrid({ assets, loading, onOpen, selectable, selectedIds, onToggleSelect }: MediaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/15 bg-cream-50 py-16 text-center">
        <p className="text-sm font-light text-ink-700">No files match your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {assets.map((asset) => (
        <MediaCard
          key={asset.id}
          asset={asset}
          onOpen={() => onOpen(asset)}
          selectable={selectable}
          selected={selectedIds?.has(asset.id)}
          onToggleSelect={() => onToggleSelect?.(asset)}
        />
      ))}
    </div>
  )
}
