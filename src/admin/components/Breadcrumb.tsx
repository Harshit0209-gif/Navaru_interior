import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-widest2 text-ink-700/50">
        <li className="flex items-center gap-1.5">
          <Link to="/admin/dashboard" aria-label="Dashboard" className="transition-colors hover:text-brass-400">
            <Home className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              {item.to && !isLast ? (
                <Link to={item.to} className="transition-colors hover:text-brass-400">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-ink-800' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
