import type { MediaBucketFilter, MediaSortOption, MediaUsageFilter } from '../types/media'

const BUCKET_OPTIONS: { value: MediaBucketFilter; label: string }[] = [
  { value: 'all', label: 'All Buckets' },
  { value: 'portfolio-images', label: 'Portfolio Images' },
  { value: 'website-assets', label: 'Website Assets' },
]

const USAGE_OPTIONS: { value: MediaUsageFilter; label: string }[] = [
  { value: 'all', label: 'All Files' },
  { value: 'unused', label: 'Unused Only' },
]

const SORT_OPTIONS: { value: MediaSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'name_desc', label: 'Name: Z–A' },
  { value: 'largest', label: 'Largest File' },
]

const selectClasses =
  'border-b border-ink-900/20 bg-transparent py-2 pr-6 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none transition-colors focus:border-brass-400'

type MediaFiltersProps = {
  folders: string[]
  folder: string
  onFolderChange: (value: string) => void
  bucket: MediaBucketFilter
  onBucketChange: (value: MediaBucketFilter) => void
  usage: MediaUsageFilter
  onUsageChange: (value: MediaUsageFilter) => void
  sort: MediaSortOption
  onSortChange: (value: MediaSortOption) => void
}

export function MediaFilters({
  folders,
  folder,
  onFolderChange,
  bucket,
  onBucketChange,
  usage,
  onUsageChange,
  sort,
  onSortChange,
}: MediaFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <select
        value={folder}
        onChange={(e) => onFolderChange(e.target.value)}
        aria-label="Filter by folder"
        className={selectClasses}
      >
        <option value="">All Folders</option>
        {folders.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        value={bucket}
        onChange={(e) => onBucketChange(e.target.value as MediaBucketFilter)}
        aria-label="Filter by bucket"
        className={selectClasses}
      >
        {BUCKET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={usage}
        onChange={(e) => onUsageChange(e.target.value as MediaUsageFilter)}
        aria-label="Filter by usage"
        className={selectClasses}
      >
        {USAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as MediaSortOption)}
        aria-label="Sort media"
        className={selectClasses}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
