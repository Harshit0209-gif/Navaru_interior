import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { BookingSearch } from '../components/BookingSearch'
import { BookingFilters } from '../components/BookingFilters'
import { BookingTable } from '../components/BookingTable'
import { BookingPagination } from '../components/BookingPagination'
import { BulkActionsBar } from '../components/BulkActionsBar'
import { BookingDetailModal } from '../components/BookingDetailModal'
import { DeleteDialog } from '../components/DeleteDialog'
import { useAdminBookingList } from '../hooks/useAdminBookingList'
import { useBookingRealtime } from '../hooks/useBookingRealtime'
import { getNotifyOnNewBookings } from '../utils/notificationPreferences'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import {
  bulkDeleteBookings,
  bulkUpdateBookingStatus,
  deleteBooking,
  fetchProjectOptions,
} from '../services/bookingService'
import { downloadCsv } from '../../utils/exportCsv'
import { BOOKING_STATUS_LABELS } from '../types/booking'
import type { BookingRequest, BookingSortOption, BookingStatusFilter, ProjectOption } from '../types/booking'
import type { BookingStatus } from '../../types/database'

const PAGE_SIZE = 20

export default function AdminBookings() {
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BookingStatusFilter>('all')
  const [projectId, setProjectId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort] = useState<BookingSortOption>('newest')
  const [page, setPage] = useState(1)

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewingBooking, setViewingBooking] = useState<BookingRequest | null>(null)
  const [pendingDelete, setPendingDelete] = useState<BookingRequest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [isBulkBusy, setIsBulkBusy] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 350)
  const filters = useMemo(
    () => ({ search: debouncedSearch, status, projectId: projectId || undefined, dateFrom, dateTo, sort, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, status, projectId, dateFrom, dateTo, sort, page],
  )
  const { bookings, total, loading, error, reload } = useAdminBookingList(filters)

  useEffect(() => {
    fetchProjectOptions()
      .then(setProjects)
      .catch(() => {})
  }, [])

  useBookingRealtime({
    onInsert: () => {
      if (getNotifyOnNewBookings()) showToast('info', 'A new booking request just came in.')
    },
    onChange: reload,
  })

  function resetToFirstPage() {
    setPage(1)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const allSelected = bookings.length > 0 && bookings.every((b) => prev.has(b.id))
      if (allSelected) return new Set()
      return new Set(bookings.map((b) => b.id))
    })
  }

  async function handleSingleDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteBooking(pendingDelete.id)
      showToast('success', 'Booking request deleted.')
      setPendingDelete(null)
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not delete this request.'))
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleBulkStatus(nextStatus: BookingStatus) {
    setIsBulkBusy(true)
    try {
      await bulkUpdateBookingStatus(Array.from(selectedIds), nextStatus)
      showToast('success', `${selectedIds.size} request(s) updated.`)
      setSelectedIds(new Set())
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not update selected requests.'))
    } finally {
      setIsBulkBusy(false)
    }
  }

  async function handleBulkDelete() {
    setIsBulkBusy(true)
    try {
      await bulkDeleteBookings(Array.from(selectedIds))
      showToast('success', `${selectedIds.size} request(s) deleted.`)
      setSelectedIds(new Set())
      setBulkDeleteOpen(false)
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not delete selected requests.'))
    } finally {
      setIsBulkBusy(false)
    }
  }

  function handleExportCsv() {
    const headers = [
      'Customer Name',
      'Email',
      'Phone',
      'Project',
      'Status',
      'City',
      'State',
      'Country',
      'Property Type',
      'Design Type',
      'Budget',
      'Preferred Date',
      'Message',
      'Admin Notes',
      'Submitted',
    ]
    const rows = bookings.map((b) => [
      b.customer_name,
      b.email,
      b.phone,
      b.project_name,
      BOOKING_STATUS_LABELS[b.status],
      b.city ?? '',
      b.state ?? '',
      b.country ?? '',
      b.property_type ?? '',
      b.design_type ?? '',
      b.budget ?? '',
      b.preferred_date ?? '',
      b.message ?? '',
      b.admin_notes ?? '',
      new Date(b.created_at).toLocaleString(),
    ])
    downloadCsv(`booking-requests-${new Date().toISOString().slice(0, 10)}`, headers, rows)
    showToast('success', 'CSV export ready.')
  }

  function handleUpdated(updated: BookingRequest) {
    setViewingBooking(updated)
    reload()
  }

  function handleDeleted() {
    setViewingBooking(null)
    reload()
  }

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Every design consultation request submitted from the site."
        breadcrumbs={[{ label: 'Bookings' }]}
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={bookings.length === 0}
            className="flex items-center gap-2 bg-ink-900 px-8 py-4 text-xs font-medium uppercase tracking-widest2 text-cream-100 transition-colors hover:bg-brass-400 hover:text-ink-950 disabled:opacity-50"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Export CSV
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <BookingSearch
          value={search}
          onChange={(v) => {
            setSearch(v)
            resetToFirstPage()
          }}
        />
        <BookingFilters
          status={status}
          onStatusChange={(v) => {
            setStatus(v)
            resetToFirstPage()
          }}
          projects={projects}
          projectId={projectId}
          onProjectChange={(v) => {
            setProjectId(v)
            resetToFirstPage()
          }}
          dateFrom={dateFrom}
          onDateFromChange={(v) => {
            setDateFrom(v)
            resetToFirstPage()
          }}
          dateTo={dateTo}
          onDateToChange={(v) => {
            setDateTo(v)
            resetToFirstPage()
          }}
        />
      </div>

      <BulkActionsBar
        count={selectedIds.size}
        onApplyStatus={handleBulkStatus}
        onDelete={() => setBulkDeleteOpen(true)}
        onClearSelection={() => setSelectedIds(new Set())}
        isBusy={isBulkBusy}
      />

      {error ? (
        <p className="py-16 text-center text-sm font-light text-red-500">{error}</p>
      ) : (
        <>
          <BookingTable
            bookings={bookings}
            loading={loading}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onView={setViewingBooking}
            onDelete={setPendingDelete}
          />
          {!loading && (
            <div className="mt-6">
              <BookingPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <BookingDetailModal
        booking={viewingBooking}
        onClose={() => setViewingBooking(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />

      <DeleteDialog
        open={pendingDelete !== null}
        title="Delete this booking request?"
        description={pendingDelete ? `The request from "${pendingDelete.customer_name}" will be permanently deleted. This cannot be undone.` : ''}
        isDeleting={isDeleting}
        onConfirm={handleSingleDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <DeleteDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.size} booking request(s)?`}
        description="These booking requests will be permanently deleted. This cannot be undone."
        isDeleting={isBulkBusy}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </>
  )
}
