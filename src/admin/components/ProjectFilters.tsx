import type { Category } from '../../types/portfolio'
import type { AdminSortOption, FeaturedFilter, PublishFilter } from '../types/portfolio'

const STATUS_OPTIONS: { value: PublishFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const FEATURED_OPTIONS: { value: FeaturedFilter; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'featured', label: 'Featured Only' },
  { value: 'unfeatured', label: 'Not Featured' },
]

const SORT_OPTIONS: { value: AdminSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title_asc', label: 'Title: A–Z' },
  { value: 'title_desc', label: 'Title: Z–A' },
]

const selectClasses =
  'border-b border-ink-900/20 bg-ink-900/5 py-2 pr-6 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none transition-colors focus:border-brass-400'

type ProjectFiltersProps = {
  categories: Category[]
  categoryId: string
  onCategoryChange: (value: string) => void
  status: PublishFilter
  onStatusChange: (value: PublishFilter) => void
  featured: FeaturedFilter
  onFeaturedChange: (value: FeaturedFilter) => void
  sort: AdminSortOption
  onSortChange: (value: AdminSortOption) => void
}

export function ProjectFilters({
  categories,
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
  featured,
  onFeaturedChange,
  sort,
  onSortChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <select
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
        className={selectClasses}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as PublishFilter)}
        aria-label="Filter by publish status"
        className={selectClasses}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={featured}
        onChange={(e) => onFeaturedChange(e.target.value as FeaturedFilter)}
        aria-label="Filter by featured status"
        className={selectClasses}
      >
        {FEATURED_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as AdminSortOption)}
        aria-label="Sort projects"
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
