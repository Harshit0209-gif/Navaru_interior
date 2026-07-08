import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Breadcrumb } from './Breadcrumb'
import type { BreadcrumbItem } from './Breadcrumb'

type PageHeaderProps = {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {breadcrumbs && (
          <div className="mb-3">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        <h1 className="text-2xl font-light tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-ink-700">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </motion.div>
  )
}
