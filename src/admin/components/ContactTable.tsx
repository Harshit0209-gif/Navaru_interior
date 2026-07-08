import { Archive, Paperclip, Trash2 } from 'lucide-react'
import type { ContactEnquiry } from '../types/contact'
import { ContactStatusBadge } from './ContactStatusBadge'
import { Skeleton } from '../../components/Skeleton'

type ContactTableProps = {
  enquiries: ContactEnquiry[]
  loading: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onView: (enquiry: ContactEnquiry) => void
  onArchive: (enquiry: ContactEnquiry) => void
  onDelete: (enquiry: ContactEnquiry) => void
}

export function ContactTable({
  enquiries,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onArchive,
  onDelete,
}: ContactTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (enquiries.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/15 bg-cream-50 py-16 text-center">
        <p className="text-sm font-light text-ink-700">No contact enquiries match your filters.</p>
      </div>
    )
  }

  const allSelected = enquiries.length > 0 && enquiries.every((e) => selectedIds.has(e.id))

  return (
    <div className="overflow-x-auto border border-ink-900/10 bg-cream-50">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/10 text-[11px] font-medium uppercase tracking-widest2 text-ink-700/50">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Select all enquiries on this page"
                className="h-4 w-4 accent-brass-400"
              />
            </th>
            <th className="px-4 py-3 font-medium">From</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/5">
          {enquiries.map((enquiry) => (
            <tr
              key={enquiry.id}
              className={
                enquiry.status === 'unread'
                  ? 'bg-blue-50/40 transition-colors hover:bg-blue-50/70'
                  : 'transition-colors hover:bg-ink-900/[0.02]'
              }
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(enquiry.id)}
                  onChange={() => onToggleSelect(enquiry.id)}
                  aria-label={`Select enquiry from ${enquiry.name}`}
                  className="h-4 w-4 accent-brass-400"
                />
              </td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => onView(enquiry)} className="text-left">
                  <p className="flex items-center gap-1.5 font-normal text-ink-900 hover:text-brass-400">
                    {enquiry.name}
                    {enquiry.attachment_url && (
                      <Paperclip className="h-3 w-3 text-ink-700/40" strokeWidth={1.5} />
                    )}
                  </p>
                  <p className="text-xs font-light text-ink-700/50">{enquiry.email}</p>
                </button>
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-ink-700">{enquiry.subject || '—'}</td>
              <td className="px-4 py-3">
                <ContactStatusBadge status={enquiry.status} />
              </td>
              <td className="px-4 py-3 text-ink-700/60">
                {new Date(enquiry.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onView(enquiry)}
                    className="text-xs font-medium uppercase tracking-widest2 text-brass-400 hover:text-brass-500"
                  >
                    View
                  </button>
                  {enquiry.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => onArchive(enquiry)}
                      aria-label={`Archive enquiry from ${enquiry.name}`}
                      className="text-ink-700/40 hover:text-brass-400"
                    >
                      <Archive className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(enquiry)}
                    aria-label={`Delete enquiry from ${enquiry.name}`}
                    className="text-ink-700/40 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
