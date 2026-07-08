import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { MediaSearch } from './MediaSearch'
import { MediaGrid } from './MediaGrid'
import { MediaPagination } from './MediaPagination'
import { UploadZone } from './UploadZone'
import { useMediaLibrary } from '../hooks/useMediaLibrary'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { MediaAsset, MediaBucket } from '../types/media'

const PAGE_SIZE = 18
const DEFAULT_UPLOAD_BUCKET: MediaBucket = 'portfolio-images'
const DEFAULT_UPLOAD_FOLDER = 'general'

type ImagePickerModalProps = {
  open: boolean
  onClose: () => void
  multiple?: boolean
  title?: string
  uploadBucket?: MediaBucket
  uploadFolder?: string
  onSelect: (urls: string[]) => void
}

export function ImagePickerModal({
  open,
  onClose,
  multiple = false,
  title,
  uploadBucket = DEFAULT_UPLOAD_BUCKET,
  uploadFolder = DEFAULT_UPLOAD_FOLDER,
  onSelect,
}: ImagePickerModalProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map())
  const [showUpload, setShowUpload] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 350)
  const filters = useMemo(
    () => ({ search: debouncedSearch, bucket: 'all' as const, sort: 'newest' as const, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, page],
  )
  const { assets, total, loading, reload } = useMediaLibrary(filters)

  useEffect(() => {
    if (!open) {
      setSelected(new Map())
      setSearch('')
      setPage(1)
      setShowUpload(false)
    }
  }, [open])

  const selectedIds = useMemo(() => new Set(selected.keys()), [selected])

  function toggleSelect(asset: MediaAsset) {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(asset.id)) {
        next.delete(asset.id)
      } else {
        if (!multiple) next.clear()
        next.set(asset.id, asset)
      }
      return next
    })
  }

  function handleUploaded(asset: MediaAsset) {
    reload()
    setSelected((prev) => {
      const next = multiple ? new Map(prev) : new Map<string, MediaAsset>()
      next.set(asset.id, asset)
      return next
    })
  }

  function handleConfirm() {
    onSelect(Array.from(selected.values()).map((asset) => asset.public_url))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} maxWidthClassName="max-w-5xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-normal text-ink-900">
            {title ?? (multiple ? 'Select Gallery Images' : 'Select an Image')}
          </h3>
          <button
            type="button"
            onClick={() => setShowUpload((prev) => !prev)}
            className="text-xs font-medium uppercase tracking-widest2 text-brass-400 hover:text-brass-500"
          >
            {showUpload ? 'Browse Library' : 'Upload New'}
          </button>
        </div>

        {showUpload ? (
          <UploadZone bucket={uploadBucket} folder={uploadFolder} multiple={multiple} onUploaded={handleUploaded} />
        ) : (
          <>
            <MediaSearch
              value={search}
              onChange={(v) => {
                setSearch(v)
                setPage(1)
              }}
            />

            <div className="max-h-[50vh] overflow-y-auto">
              <MediaGrid
                assets={assets}
                loading={loading}
                onOpen={() => {}}
                selectable
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            </div>

            <MediaPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-ink-900/10 pt-6">
          <p className="text-xs font-light text-ink-700/60">
            {selected.size} {selected.size === 1 ? 'image' : 'images'} selected
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={selected.size === 0}>
              Use Selected
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
