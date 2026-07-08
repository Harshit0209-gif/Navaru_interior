import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Button } from '../../components/Button'
import { ImagePickerModal } from './ImagePickerModal'

type CoverImagePickerProps = {
  value: string
  onChange: (url: string) => void
  error?: string
}

export function CoverImagePicker({ value, onChange, error }: CoverImagePickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-widest2 text-ink-700/70">
        Cover Image
      </label>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-900/5">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="h-5 w-5 text-ink-700/30" strokeWidth={1.5} />
          )}
        </div>
        <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
          {value ? 'Change Cover Image' : 'Choose Cover Image'}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple={false}
        title="Select Cover Image"
        onSelect={(urls) => urls[0] && onChange(urls[0])}
      />
    </div>
  )
}
