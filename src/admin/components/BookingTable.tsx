import { Paperclip, Trash2 } from 'lucide-react'
import type { BookingRequest } from '../types/booking'
import { BookingStatusBadge } from './BookingStatusBadge'
import { Skeleton } from '../../components/Skeleton'

type BookingTableProps = {
  bookings: BookingRequest[]
  loading: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onView: (booking: BookingRequest) => void
  onDelete: (booking: BookingRequest) => void
}

export function BookingTable({
  bookings,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onDelete,
}: BookingTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/15 bg-cream-50 py-16 text-center">
        <p className="text-sm font-light text-ink-700">No booking requests match your filters.</p>
      </div>
    )
  }

  const allSelected = bookings.length > 0 && bookings.every((b) => selectedIds.has(b.id))

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
                aria-label="Select all bookings on this page"
                className="h-4 w-4 accent-brass-400"
              />
            </th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/5">
          {bookings.map((booking) => (
            <tr key={booking.id} className="transition-colors hover:bg-ink-900/[0.02]">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(booking.id)}
                  onChange={() => onToggleSelect(booking.id)}
                  aria-label={`Select booking from ${booking.customer_name}`}
                  className="h-4 w-4 accent-brass-400"
                />
              </td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => onView(booking)} className="text-left">
                  <p className="flex items-center gap-1.5 font-normal text-ink-900 hover:text-brass-400">
                    {booking.customer_name}
                    {booking.attachment_url && (
                      <Paperclip className="h-3 w-3 text-ink-700/40" strokeWidth={1.5} />
                    )}
                  </p>
                  <p className="text-xs font-light text-ink-700/50">{booking.email}</p>
                </button>
              </td>
              <td className="px-4 py-3 text-ink-700">{booking.project_name}</td>
              <td className="px-4 py-3">
                <BookingStatusBadge status={booking.status} />
              </td>
              <td className="px-4 py-3 text-ink-700/60">
                {new Date(booking.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onView(booking)}
                    className="text-xs font-medium uppercase tracking-widest2 text-brass-400 hover:text-brass-500"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(booking)}
                    aria-label={`Delete booking from ${booking.customer_name}`}
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
