import { useState } from 'react'
import type { DragEvent } from 'react'
import { GripVertical, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { ImagePickerModal } from './ImagePickerModal'
import { cn } from '../../utils/cn'

type GalleryManagerProps = {
  values: string[]
  onChange: (values: string[]) => void
}

export function GalleryManager({ values, onChange }: GalleryManagerProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleAdd(urls: string[]) {
    const merged = [...values]
    urls.forEach((url) => {
      if (!merged.includes(url)) merged.push(url)
    })
    onChange(merged)
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index))
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const next = [...values]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    onChange(next)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <fieldset>
      <legend className="mb-2 block text-xs font-medium uppercase tracking-widest2 text-ink-700/70">
        Gallery Images
      </legend>

      {values.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {values.map((url, i) => (
            <div
              key={`${url}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={() => {
                setDragIndex(null)
                setDragOverIndex(null)
              }}
              onDrop={() => handleDrop(i)}
              className={cn(
                'group relative aspect-square cursor-grab overflow-hidden rounded border bg-ink-900/5 active:cursor-grabbing',
                dragIndex === i ? 'opacity-40' : 'border-ink-900/10',
                dragOverIndex === i && dragIndex !== i ? 'border-brass-400' : '',
              )}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove gallery image ${i + 1}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
              <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/50 text-white">
                <GripVertical className="h-3 w-3" strokeWidth={2} />
              </span>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
        Add Gallery Images
      </Button>
      {values.length > 1 && <p className="mt-2 text-[11px] font-light text-ink-700/40">Drag images to reorder</p>}

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple
        title="Add Gallery Images"
        onSelect={handleAdd}
      />
    </fieldset>
  )
}
