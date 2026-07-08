import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ProjectCard } from '../components/ProjectCard'
import { Skeleton } from '../components/Skeleton'
import { Button } from '../components/Button'
import { usePageMeta } from '../hooks/usePageMeta'
import { useCategories } from '../hooks/useCategories'
import { usePortfolioList } from '../hooks/usePortfolioList'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { SortOption } from '../types/portfolio'
import { cn } from '../utils/cn'

const PAGE_SIZE = 9

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title_asc', label: 'Title: A–Z' },
  { value: 'title_desc', label: 'Title: Z–A' },
]

export default function Portfolio() {
  usePageMeta(
    'Portfolio',
    'A growing archive of residential, hospitality, retail, and commercial interiors designed by Navaru Interior Solution.',
  )

  const [search, setSearch] = useState('')
  const [categorySlug, setCategorySlug] = useState<string>('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 350)
  const { categories } = useCategories()

  const filters = useMemo(
    () => ({ search: debouncedSearch, categorySlug: categorySlug || undefined, sort, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, categorySlug, sort, page],
  )

  const { projects, total, hasMore, loading, error } = usePortfolioList(filters)

  function updateFilter(update: () => void) {
    update()
    setPage(1)
  }

  return (
    <>
      <PageHeader
        eyebrow="Selected Work"
        title="Every project, one continuous body of work."
        description="A growing archive of residential, hospitality, retail, and commercial interiors."
      />

      <section className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/50" strokeWidth={1.5} />
            <input
              type="search"
              value={search}
              onChange={(e) => updateFilter(() => setSearch(e.target.value))}
              placeholder="Search projects…"
              aria-label="Search portfolio projects"
              className="w-full border-b border-ink-900/20 bg-transparent py-2 pl-7 text-sm font-light text-ink-900 outline-none transition-colors focus:border-brass-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter(() => setCategorySlug(''))}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium uppercase tracking-widest2 transition-colors',
                  categorySlug === '' ? 'bg-ink-900 text-cream-100' : 'text-ink-700 hover:text-brass-400',
                )}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => updateFilter(() => setCategorySlug(category.slug))}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium uppercase tracking-widest2 transition-colors',
                    categorySlug === category.slug
                      ? 'bg-ink-900 text-cream-100'
                      : 'text-ink-700 hover:text-brass-400',
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => updateFilter(() => setSort(e.target.value as SortOption))}
              aria-label="Sort projects"
              className="border-b border-ink-900/20 bg-transparent py-1.5 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none transition-colors focus:border-brass-400"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="py-16 text-center text-sm font-light text-red-500">{error}</p>}

        {!error && loading && page === 1 && (
          <div className="grid auto-rows-[320px] gap-4 sm:grid-cols-3" aria-busy="true" aria-label="Loading projects">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-full w-full" />
            ))}
          </div>
        )}

        {!error && !(loading && page === 1) && projects.length === 0 && (
          <p className="py-16 text-center text-sm font-light text-ink-700">
            No projects match your search just yet. Try a different keyword or category.
          </p>
        )}

        {!error && projects.length > 0 && (
          <>
            <div className="grid auto-rows-[320px] gap-4 sm:grid-cols-3">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  index={i}
                  id={project.id}
                  slug={project.slug}
                  title={project.title}
                  category={project.category?.name ?? ''}
                  image={project.cover_image_url}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={loading}>
                  {loading ? 'Loading…' : `Load More (${projects.length} of ${total})`}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
