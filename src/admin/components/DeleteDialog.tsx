import { AlertTriangle } from 'lucide-react'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'

type DeleteDialogProps = {
  open: boolean
  title: string
  description: string
  isDeleting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteDialog({ open, title, description, isDeleting, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} maxWidthClassName="max-w-md">
      <div className="flex flex-col items-start gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <h3 className="text-xl font-normal text-ink-900">{title}</h3>
        <p className="text-sm font-light leading-relaxed text-ink-700">{description}</p>

        <div className="mt-2 flex w-full gap-3">
          <Button variant="outline" className="flex-1 justify-center" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-500 px-8 py-4 text-xs font-medium uppercase tracking-widest2 text-white transition-colors duration-300 hover:bg-red-600 disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
