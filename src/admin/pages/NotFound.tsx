import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

export default function AdminNotFound() {
  return (
    <>
      <PageHeader title="Page Not Found" breadcrumbs={[{ label: 'Not Found' }]} />
      <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-ink-900/15 bg-cream-50 py-24 text-center">
        <FileQuestion className="h-8 w-8 text-ink-700/40" strokeWidth={1.25} />
        <p className="text-sm font-light text-ink-700">This admin page doesn't exist.</p>
        <Link
          to="/admin/dashboard"
          className="text-xs font-medium uppercase tracking-widest2 text-brass-400 underline hover:text-brass-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </>
  )
}
