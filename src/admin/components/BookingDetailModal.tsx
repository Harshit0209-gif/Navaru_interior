import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Download, Loader2, Mail, MapPin, Phone, Save, Trash2 } from 'lucide-react'
import { Modal } from '../../components/Modal'
import { DeleteDialog } from './DeleteDialog'
import { BookingStatusBadge } from './BookingStatusBadge'
import { Button } from '../../components/Button'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { deleteBooking, getAttachmentSignedUrl, updateBookingNotes, updateBookingStatus } from '../services/bookingService'
import { BOOKING_STATUS_OPTIONS, BOOKING_STATUS_LABELS } from '../types/booking'
import type { BookingRequest } from '../types/booking'
import type { BookingStatus } from '../../types/database'

type BookingDetailModalProps = {
  booking: BookingRequest | null
  onClose: () => void
  onUpdated: (booking: BookingRequest) => void
  onDeleted: (booking: BookingRequest) => void
}

export function BookingDetailModal({ booking, onClose, onUpdated, onDeleted }: BookingDetailModalProps) {
  const { showToast } = useToast()
  const [displayBooking, setDisplayBooking] = useState<BookingRequest | null>(booking)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (booking) {
      setDisplayBooking(booking)
      setNotes(booking.admin_notes ?? '')
    }
  }, [booking])

  if (!displayBooking) return null

  async function handleStatusChange(status: BookingStatus) {
    setIsSavingStatus(true)
    try {
      await updateBookingStatus(displayBooking!.id, status)
      const updated = { ...displayBooking!, status }
      setDisplayBooking(updated)
      onUpdated(updated)
      showToast('success', 'Status updated.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not update status.'))
    } finally {
      setIsSavingStatus(false)
    }
  }

  async function handleSaveNotes() {
    setIsSavingNotes(true)
    try {
      await updateBookingNotes(displayBooking!.id, notes)
      const updated = { ...displayBooking!, admin_notes: notes || null }
      setDisplayBooking(updated)
      onUpdated(updated)
      showToast('success', 'Notes saved.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not save notes.'))
    } finally {
      setIsSavingNotes(false)
    }
  }

  async function handleDownloadAttachment() {
    if (!displayBooking!.attachment_url) return
    setIsDownloading(true)
    try {
      const signedUrl = await getAttachmentSignedUrl(displayBooking!.attachment_url)
      const response = await fetch(signedUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = displayBooking!.attachment_url.split('/').pop() ?? 'attachment'
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast('error', 'Could not download this attachment.')
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    try {
      await deleteBooking(displayBooking!.id)
      showToast('success', 'Booking request deleted.')
      onDeleted(displayBooking!)
      setConfirmDelete(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not delete this request.'))
    } finally {
      setIsDeleting(false)
    }
  }

  const locationParts = [displayBooking.city, displayBooking.state, displayBooking.country].filter(Boolean)

  return (
    <>
      <Modal open={booking !== null} onClose={onClose} maxWidthClassName="max-w-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest2 text-brass-400">
              Booking Request
            </p>
            <h3 className="mt-2 text-xl font-normal text-ink-900">{displayBooking.customer_name}</h3>
            <p className="text-sm font-light text-ink-700/60">{displayBooking.project_name}</p>
          </div>
          <BookingStatusBadge status={displayBooking.status} />
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Contact</h4>
            <DetailRow icon={Mail} value={displayBooking.email} href={`mailto:${displayBooking.email}`} />
            <DetailRow icon={Phone} value={displayBooking.phone} href={`tel:${displayBooking.phone}`} />
            {locationParts.length > 0 && <DetailRow icon={MapPin} value={locationParts.join(', ')} />}
            {displayBooking.address && <DetailRow icon={MapPin} value={displayBooking.address} />}
            {displayBooking.preferred_date && (
              <DetailRow icon={Calendar} value={`Preferred: ${displayBooking.preferred_date}`} />
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Project Details</h4>
            {displayBooking.property_type && <p className="text-sm font-light text-ink-800">Property: {displayBooking.property_type}</p>}
            {displayBooking.design_type && <p className="text-sm font-light text-ink-800">Design: {displayBooking.design_type}</p>}
            {displayBooking.budget && <p className="text-sm font-light text-ink-800">Budget: {displayBooking.budget}</p>}
            {displayBooking.project_id && (
              <Link
                to={`/admin/portfolio/edit/${displayBooking.project_id}`}
                className="inline-block text-xs font-medium uppercase tracking-widest2 text-brass-400 underline hover:text-brass-500"
              >
                View Project
              </Link>
            )}
          </div>
        </div>

        {displayBooking.message && (
          <div className="mt-6">
            <h4 className="mb-2 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Message</h4>
            <p className="text-sm font-light leading-relaxed text-ink-800">{displayBooking.message}</p>
          </div>
        )}

        {displayBooking.attachment_url && (
          <div className="mt-6">
            <Button variant="outline" onClick={handleDownloadAttachment} disabled={isDownloading}>
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" strokeWidth={1.5} />
                {isDownloading ? 'Preparing…' : 'Download Attachment'}
              </span>
            </Button>
          </div>
        )}

        <div className="mt-8 border-t border-ink-900/10 pt-6">
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
            Status
          </label>
          <div className="flex items-center gap-3">
            <select
              value={displayBooking.status}
              onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
              disabled={isSavingStatus}
              className="border-b border-ink-900/20 bg-ink-900/5 py-2 text-sm font-light text-ink-900 outline-none focus:border-brass-400"
            >
              {BOOKING_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {BOOKING_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
            {isSavingStatus && <Loader2 className="h-4 w-4 animate-spin text-ink-700/40" strokeWidth={2} />}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
            Internal Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes visible only to the admin team…"
            className="w-full border border-ink-900/15 bg-cream-100 p-3 text-sm font-light text-ink-900 outline-none focus:border-brass-400"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={isSavingNotes || notes === (displayBooking.admin_notes ?? '')}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest2 text-brass-400 hover:text-brass-500 disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
              {isSavingNotes ? 'Saving…' : 'Save Notes'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-ink-900/10 pt-6">
          <p className="text-xs font-light text-ink-700/40">
            Submitted {new Date(displayBooking.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest2 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Delete
          </button>
        </div>
      </Modal>

      <DeleteDialog
        open={confirmDelete}
        title="Delete this booking request?"
        description={`The request from "${displayBooking.customer_name}" will be permanently deleted. This cannot be undone.`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}

function DetailRow({ icon: Icon, value, href }: { icon: typeof Mail; value: string; href?: string }) {
  const content = (
    <span className="flex items-start gap-2.5 text-sm font-light text-ink-800">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" strokeWidth={1.5} />
      {value}
    </span>
  )
  if (href) {
    return (
      <a href={href} className="block transition-colors hover:text-brass-400">
        {content}
      </a>
    )
  }
  return content
}
