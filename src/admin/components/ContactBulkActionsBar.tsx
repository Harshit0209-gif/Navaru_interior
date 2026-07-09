import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { CONTACT_STATUS_OPTIONS, CONTACT_STATUS_LABELS } from '../types/contact'
import type { EnquiryStatus } from '../../types/database'

type ContactBulkActionsBarProps = {
  count: number
  onApplyStatus: (status: EnquiryStatus) => void
  onDelete: () => void
  onClearSelection: () => void
  isBusy?: boolean
}

export function ContactBulkActionsBar({
  count,
  onApplyStatus,
  onDelete,
  onClearSelection,
  isBusy,
}: ContactBulkActionsBarProps) {
  const [status, setStatus] = useState<EnquiryStatus>('read')

  if (count === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-4 flex flex-wrap items-center gap-4 border border-brass-300 bg-brass-50/40 px-4 py-3"
    >
      <p className="text-xs font-medium uppercase tracking-widest2 text-ink-800">
        {count} selected
      </p>

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
          disabled={isBusy}
          aria-label="Bulk status to apply"
          className="border-b border-ink-900/20 bg-ink-900/5 py-1.5 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none focus:border-brass-400"
        >
          {CONTACT_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {CONTACT_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onApplyStatus(status)}
          disabled={isBusy}
          className="bg-ink-900 px-4 py-1.5 text-xs font-medium uppercase tracking-widest2 text-cream-100 transition-colors hover:bg-brass-400 hover:text-ink-950 disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={isBusy}
        className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest2 text-red-500 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        Delete Selected
      </button>

      <button
        type="button"
        onClick={onClearSelection}
        disabled={isBusy}
        className="ml-auto text-xs font-light text-ink-700/60 underline hover:text-ink-800"
      >
        Clear selection
      </button>
    </motion.div>
  )
}
