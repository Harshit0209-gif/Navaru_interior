import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Button } from '../../components/Button'
import { ImagePickerModal } from './ImagePickerModal'

type BrandingImagePickerProps = {
  label: string
  value: string | null
  onChange: (url: string) => void
  previewClassName?: string
  folder?: string
}

export function BrandingImagePicker({
  label,
  value,
  onChange,
  previewClassName,
  folder = 'branding',
}: BrandingImagePickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-widest2 text-ink-700/70">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div
          className={
            previewClassName ??
            'flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-900/5'
          }
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageOff className="h-5 w-5 text-ink-700/30" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
            {value ? `Change ${label}` : `Choose ${label}`}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs font-medium uppercase tracking-widest2 text-ink-700/50 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple={false}
        title={`Select ${label}`}
        uploadBucket="website-assets"
        uploadFolder={folder}
        onSelect={(urls) => urls[0] && onChange(urls[0])}
      />
    </div>
  )
}
