import { useEffect, useState } from 'react'
import { Download, Loader2, Mail, Phone, Save, Trash2 } from 'lucide-react'
import { Modal } from '../../components/Modal'
import { DeleteDialog } from './DeleteDialog'
import { ContactStatusBadge } from './ContactStatusBadge'
import { Button } from '../../components/Button'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import {
  deleteEnquiry,
  getAttachmentSignedUrl,
  updateEnquiryNotes,
  updateEnquiryStatus,
} from '../services/contactService'
import { CONTACT_STATUS_OPTIONS, CONTACT_STATUS_LABELS } from '../types/contact'
import type { ContactEnquiry } from '../types/contact'
import type { EnquiryStatus } from '../../types/database'

type ContactDetailModalProps = {
  enquiry: ContactEnquiry | null
  onClose: () => void
  onUpdated: (enquiry: ContactEnquiry) => void
  onDeleted: (enquiry: ContactEnquiry) => void
}

export function ContactDetailModal({ enquiry, onClose, onUpdated, onDeleted }: ContactDetailModalProps) {
  const { showToast } = useToast()
  const [displayEnquiry, setDisplayEnquiry] = useState<ContactEnquiry | null>(enquiry)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (enquiry) {
      setDisplayEnquiry(enquiry)
      setNotes(enquiry.admin_notes ?? '')

      if (enquiry.status === 'unread') {
        updateEnquiryStatus(enquiry.id, 'read')
          .then(() => {
            const updated = { ...enquiry, status: 'read' as EnquiryStatus }
            setDisplayEnquiry(updated)
            onUpdated(updated)
          })
          .catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiry])

  if (!displayEnquiry) return null

  async function handleStatusChange(status: EnquiryStatus) {
    setIsSavingStatus(true)
    try {
      await updateEnquiryStatus(displayEnquiry!.id, status)
      const updated = { ...displayEnquiry!, status }
      setDisplayEnquiry(updated)
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
      await updateEnquiryNotes(displayEnquiry!.id, notes)
      const updated = { ...displayEnquiry!, admin_notes: notes || null }
      setDisplayEnquiry(updated)
      onUpdated(updated)
      showToast('success', 'Notes saved.')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not save notes.'))
    } finally {
      setIsSavingNotes(false)
    }
  }

  async function handleDownloadAttachment() {
    if (!displayEnquiry!.attachment_url) return
    setIsDownloading(true)
    try {
      const signedUrl = await getAttachmentSignedUrl(displayEnquiry!.attachment_url)
      const response = await fetch(signedUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = displayEnquiry!.attachment_url.split('/').pop() ?? 'attachment'
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
      await deleteEnquiry(displayEnquiry!.id)
      showToast('success', 'Enquiry deleted.')
      onDeleted(displayEnquiry!)
      setConfirmDelete(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Could not delete this enquiry.'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Modal open={enquiry !== null} onClose={onClose} maxWidthClassName="max-w-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest2 text-brass-400">
              Contact Enquiry
            </p>
            <h3 className="mt-2 text-xl font-normal text-ink-900">{displayEnquiry.name}</h3>
            {displayEnquiry.subject && (
              <p className="text-sm font-light text-ink-700/60">{displayEnquiry.subject}</p>
            )}
          </div>
          <ContactStatusBadge status={displayEnquiry.status} />
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Contact</h4>
          <DetailRow icon={Mail} value={displayEnquiry.email} href={`mailto:${displayEnquiry.email}`} />
          {displayEnquiry.phone && (
            <DetailRow icon={Phone} value={displayEnquiry.phone} href={`tel:${displayEnquiry.phone}`} />
          )}
        </div>

        <div className="mt-6">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">Message</h4>
          <p className="text-sm font-light leading-relaxed text-ink-800">{displayEnquiry.message}</p>
        </div>

        {displayEnquiry.attachment_url && (
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
              value={displayEnquiry.status}
              onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
              disabled={isSavingStatus}
              className="border-b border-ink-900/20 bg-transparent py-2 text-sm font-light text-ink-900 outline-none focus:border-brass-400"
            >
              {CONTACT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {CONTACT_STATUS_LABELS[option]}
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
              disabled={isSavingNotes || notes === (displayEnquiry.admin_notes ?? '')}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest2 text-brass-400 hover:text-brass-500 disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
              {isSavingNotes ? 'Saving…' : 'Save Notes'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-ink-900/10 pt-6">
          <p className="text-xs font-light text-ink-700/40">
            Submitted {new Date(displayEnquiry.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
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
        title="Delete this enquiry?"
        description={`The enquiry from "${displayEnquiry.name}" will be permanently deleted. This cannot be undone.`}
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
