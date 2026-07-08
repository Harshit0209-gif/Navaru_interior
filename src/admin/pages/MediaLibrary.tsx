import { useEffect, useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { MediaSearch } from '../components/MediaSearch'
import { MediaFilters } from '../components/MediaFilters'
import { MediaGrid } from '../components/MediaGrid'
import { MediaPagination } from '../components/MediaPagination'
import { UploadZone } from '../components/UploadZone'
import { ImagePreviewModal } from '../components/ImagePreviewModal'
import { useMediaLibrary } from '../hooks/useMediaLibrary'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useToast } from '../../context/ToastContext'
import { fetchFolders } from '../services/mediaService'
import type { MediaAsset, MediaBucket, MediaBucketFilter, MediaSortOption, MediaUsageFilter } from '../types/media'

const PAGE_SIZE = 24

export default function AdminMediaLibrary() {
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [folder, setFolder] = useState('')
  const [bucket, setBucket] = useState<MediaBucketFilter>('all')
  const [usage, setUsage] = useState<MediaUsageFilter>('all')
  const [sort, setSort] = useState<MediaSortOption>('newest')
  const [page, setPage] = useState(1)
  const [folders, setFolders] = useState<string[]>([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFolder, setUploadFolder] = useState('general')
  const [uploadBucket, setUploadBucket] = useState<MediaBucket>('portfolio-images')
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null)

  const debouncedSearch = useDebouncedValue(search, 350)
  const filters = useMemo(
    () => ({ search: debouncedSearch, folder: folder || undefined, bucket, usage, sort, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, folder, bucket, usage, sort, page],
  )
  const { assets, total, loading, error, reload } = useMediaLibrary(filters)

  useEffect(() => {
    fetchFolders()
      .then(setFolders)
      .catch(() => {})
  }, [])

  function resetToFirstPage() {
    setPage(1)
  }

  function handleUploaded() {
    reload()
    fetchFolders()
      .then(setFolders)
      .catch(() => {})
    showToast('success', 'File uploaded.')
  }

  function handleDeleted() {
    setPreviewAsset(null)
    reload()
  }

  function handleUpdated(updated: MediaAsset) {
    setPreviewAsset(updated)
    reload()
  }

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Upload, organize, and reuse images and files across the site."
        breadcrumbs={[{ label: 'Media Library' }]}
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-ink-900 px-8 py-4 text-xs font-medium uppercase tracking-widest2 text-cream-100 transition-colors hover:bg-brass-400 hover:text-ink-950"
          >
            <Upload className="h-4 w-4" strokeWidth={2} />
            {uploadOpen ? 'Close Upload' : 'Upload Files'}
          </button>
        }
      />

      {uploadOpen && (
        <div className="mb-8 border border-ink-900/10 bg-cream-50 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="relative">
              <select
                value={uploadBucket}
                onChange={(e) => setUploadBucket(e.target.value as MediaBucket)}
                className="border-b border-ink-900/20 bg-transparent py-2 pr-6 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none focus:border-brass-400"
                aria-label="Upload destination bucket"
              >
                <option value="portfolio-images">Portfolio Images</option>
                <option value="website-assets">Website Assets</option>
              </select>
            </div>
            <input
              list="media-folders"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              placeholder="Folder (e.g. general)"
              aria-label="Upload folder"
              className="border-b border-ink-900/20 bg-transparent py-2 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none placeholder:normal-case placeholder:font-light focus:border-brass-400"
            />
            <datalist id="media-folders">
              {folders.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>
          <UploadZone bucket={uploadBucket} folder={uploadFolder} onUploaded={handleUploaded} />
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <MediaSearch
          value={search}
          onChange={(v) => {
            setSearch(v)
            resetToFirstPage()
          }}
        />
        <MediaFilters
          folders={folders}
          folder={folder}
          onFolderChange={(v) => {
            setFolder(v)
            resetToFirstPage()
          }}
          bucket={bucket}
          onBucketChange={(v) => {
            setBucket(v)
            resetToFirstPage()
          }}
          usage={usage}
          onUsageChange={(v) => {
            setUsage(v)
            resetToFirstPage()
          }}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {error ? (
        <p className="py-16 text-center text-sm font-light text-red-500">{error}</p>
      ) : (
        <>
          <MediaGrid assets={assets} loading={loading} onOpen={setPreviewAsset} />
          {!loading && (
            <div className="mt-6">
              <MediaPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ImagePreviewModal
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </>
  )
}
