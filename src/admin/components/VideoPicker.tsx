import { useState } from 'react'
import { VideoOff } from 'lucide-react'
import { Button } from '../../components/Button'
import { ImagePickerModal } from './ImagePickerModal'

type VideoPickerProps = {
  label: string
  value: string | null
  onChange: (url: string) => void
  folder?: string
}

const VIDEO_ACCEPT = 'video/mp4,video/webm'
const VIDEO_HINT = 'MP4 or WEBM — keep it short and already compressed, up to 50MB'

export function VideoPicker({ label, value, onChange, folder = 'branding' }: VideoPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-widest2 text-ink-700/70">{label}</label>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-900/5">
          {value ? (
            <video src={value} className="h-full w-full object-cover" muted />
          ) : (
            <VideoOff className="h-5 w-5 text-ink-700/30" strokeWidth={1.5} />
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
        uploadAccept={VIDEO_ACCEPT}
        uploadHint={VIDEO_HINT}
        onSelect={(urls) => urls[0] && onChange(urls[0])}
      />
    </div>
  )
}
