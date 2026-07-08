import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ContactSearch } from '../components/ContactSearch'
import { ContactFilters } from '../components/ContactFilters'
import { ContactTable } from '../components/ContactTable'
import { ContactPagination } from '../components/ContactPagination'
import { ContactBulkActionsBar } from '../components/ContactBulkActionsBar'
import { ContactDetailModal } from '../components/ContactDetailModal'
import { DeleteDialog } from '../components/DeleteDialog'
import { useAdminContactList } from '../hooks/useAdminContactList'
import { useContactRealtime } from '../hooks/useContactRealtime'
import { getNotifyOnNewEnquiries } from '../utils/notificationPreferences'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import {
  bulkDeleteEnquiries,
  bulkUpdateEnquiryStatus,
  deleteEnquiry,
  updateEnquiryStatus,
} from '../services/contactService'
import { downloadCsv } from '../../utils/exportCsv'
import { CONTACT_STATUS_LABELS } from '../types/contact'
import type { ContactEnquiry, ContactSortOption, ContactStatusFilter } from '../types/contact'
import type { EnquiryStatus } from '../../types/database'

const PAGE_SIZE = 20

export default function AdminContact() {
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ContactStatusFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort] = useState<ContactSortOption>('newest')
  const [page, setPage] = useState(1)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewingEnquiry, setViewingEnquiry] = useState<ContactEnquiry | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ContactEnquiry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [isBulkBusy, setIsBulkBusy] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 350)
  const filters = useMemo(
    () => ({ search: debouncedSearch, status, dateFrom, dateTo, sort, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, status, dateFrom, dateTo, sort, page],
  )
  const { enquiries, total, loading, error, reload } = useAdminContactList(filters)

  useContactRealtime({
    onInsert: () => {
      if (getNotifyOnNewEnquiries()) showToast('info', 'A new contact enquiry just came in.')
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
      const allSelected = enquiries.length > 0 && enquiries.every((e) => prev.has(e.id))
      if (allSelected) return new Set()
      return new Set(enquiries.map((e) => e.id))
    })
  }

  async function handleArchive(enquiry: ContactEnquiry) {
    try {
      await updateEnquiryStatus(enquiry.id, 'archived')
      showToast('success', 'Enquiry archived.')
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not archive this enquiry.'))
    }
  }

  async function handleSingleDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteEnquiry(pendingDelete.id)
      showToast('success', 'Enquiry deleted.')
      setPendingDelete(null)
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not delete this enquiry.'))
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleBulkStatus(nextStatus: EnquiryStatus) {
    setIsBulkBusy(true)
    try {
      await bulkUpdateEnquiryStatus(Array.from(selectedIds), nextStatus)
      showToast('success', `${selectedIds.size} enquiry(ies) updated.`)
      setSelectedIds(new Set())
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not update selected enquiries.'))
    } finally {
      setIsBulkBusy(false)
    }
  }

  async function handleBulkDelete() {
    setIsBulkBusy(true)
    try {
      await bulkDeleteEnquiries(Array.from(selectedIds))
      showToast('success', `${selectedIds.size} enquiry(ies) deleted.`)
      setSelectedIds(new Set())
      setBulkDeleteOpen(false)
      reload()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not delete selected enquiries.'))
    } finally {
      setIsBulkBusy(false)
    }
  }

  function handleExportCsv() {
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Status', 'Message', 'Admin Notes', 'Submitted']
    const rows = enquiries.map((e) => [
      e.name,
      e.email,
      e.phone ?? '',
      e.subject ?? '',
      CONTACT_STATUS_LABELS[e.status],
      e.message,
      e.admin_notes ?? '',
      new Date(e.created_at).toLocaleString(),
    ])
    downloadCsv(`contact-enquiries-${new Date().toISOString().slice(0, 10)}`, headers, rows)
    showToast('success', 'CSV export ready.')
  }

  function handleUpdated(updated: ContactEnquiry) {
    setViewingEnquiry(updated)
    reload()
  }

  function handleDeleted() {
    setViewingEnquiry(null)
    reload()
  }

  return (
    <>
      <PageHeader
        title="Contact Enquiries"
        description="Every message submitted through the public Contact page."
        breadcrumbs={[{ label: 'Contact' }]}
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={enquiries.length === 0}
            className="flex items-center gap-2 bg-ink-900 px-8 py-4 text-xs font-medium uppercase tracking-widest2 text-cream-100 transition-colors hover:bg-brass-400 hover:text-ink-950 disabled:opacity-50"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Export CSV
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ContactSearch
          value={search}
          onChange={(v) => {
            setSearch(v)
            resetToFirstPage()
          }}
        />
        <ContactFilters
          status={status}
          onStatusChange={(v) => {
            setStatus(v)
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

      <ContactBulkActionsBar
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
          <ContactTable
            enquiries={enquiries}
            loading={loading}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onView={setViewingEnquiry}
            onArchive={handleArchive}
            onDelete={setPendingDelete}
          />
          {!loading && (
            <div className="mt-6">
              <ContactPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ContactDetailModal
        enquiry={viewingEnquiry}
        onClose={() => setViewingEnquiry(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />

      <DeleteDialog
        open={pendingDelete !== null}
        title="Delete this enquiry?"
        description={pendingDelete ? `The enquiry from "${pendingDelete.name}" will be permanently deleted. This cannot be undone.` : ''}
        isDeleting={isDeleting}
        onConfirm={handleSingleDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <DeleteDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.size} enquiry(ies)?`}
        description="These contact enquiries will be permanently deleted. This cannot be undone."
        isDeleting={isBulkBusy}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </>
  )
}
