import { useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import { GripVertical, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { cn } from '../../utils/cn'

type RepeaterFieldProps<T> = {
  label: string
  description?: string
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode
  createItem: () => T
  itemLabel?: (item: T, index: number) => string
  addLabel?: string
}

// Generic add/remove/drag-reorder editor for an array of structured objects
// (stats, services, testimonials, values, process steps) — same interaction
// model as GalleryManager, generalized beyond just image URLs.
export function RepeaterField<T>({
  label,
  description,
  items,
  onChange,
  renderItem,
  createItem,
  itemLabel,
  addLabel = 'Add Item',
}: RepeaterFieldProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function updateAt(index: number, patch: Partial<T>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index))
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
    const next = [...items]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    onChange(next)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-1 block text-xs font-medium uppercase tracking-widest2 text-ink-700/70">{label}</legend>
      {description && <p className="mb-3 text-[11px] font-light text-ink-700/40">{description}</p>}

      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={() => {
              setDragIndex(null)
              setDragOverIndex(null)
            }}
            onDrop={() => handleDrop(i)}
            className={cn(
              'relative border bg-cream-50 p-4 sm:p-5',
              dragIndex === i ? 'opacity-40' : 'border-ink-900/10',
              dragOverIndex === i && dragIndex !== i && 'border-brass-400',
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="flex cursor-grab items-center gap-2 text-xs font-medium uppercase tracking-widest2 text-ink-700/50 active:cursor-grabbing">
                <GripVertical className="h-3.5 w-3.5" strokeWidth={1.75} />
                {itemLabel ? itemLabel(item, i) : `Item ${i + 1}`}
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove item ${i + 1}`}
                className="text-ink-700/50 transition-colors hover:text-red-500"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">{renderItem(item, (patch) => updateAt(i, patch))}</div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" className="mt-4" onClick={() => onChange([...items, createItem()])}>
        {addLabel}
      </Button>
      {items.length > 1 && <p className="mt-2 text-[11px] font-light text-ink-700/40">Drag items to reorder</p>}
    </fieldset>
  )
}
