import { ChevronLeft, ChevronRight } from 'lucide-react'

type ContactPaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function ContactPagination({ page, pageSize, total, onPageChange }: ContactPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  if (total === 0) return null

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-ink-900/10 pt-4 sm:flex-row">
      <p className="text-xs font-light text-ink-700/60">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center border border-ink-900/15 text-ink-700 transition-colors hover:border-brass-300 hover:text-brass-400 disabled:opacity-30 disabled:hover:border-ink-900/15 disabled:hover:text-ink-700"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="min-w-[5rem] text-center text-xs font-medium uppercase tracking-widest2 text-ink-700">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center border border-ink-900/15 text-ink-700 transition-colors hover:border-brass-300 hover:text-brass-400 disabled:opacity-30 disabled:hover:border-ink-900/15 disabled:hover:text-ink-700"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
