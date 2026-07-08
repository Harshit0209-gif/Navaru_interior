import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { X } from 'lucide-react'

type TagInputProps = {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function TagInput({ label, values, onChange, placeholder, disabled }: TagInputProps) {
  const inputId = useId()
  const [draft, setDraft] = useState('')

  function commitDraft() {
    const trimmed = draft.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitDraft()
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-xs font-medium uppercase tracking-widest2 text-ink-700/70">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-900/20 py-2 focus-within:border-brass-400">
        {values.map((value, i) => (
          <span
            key={`${value}-${i}`}
            className="flex items-center gap-1.5 bg-ink-900/5 px-2.5 py-1 text-xs font-light text-ink-800"
          >
            {value}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${value}`}
                className="text-ink-700/50 hover:text-red-500"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            )}
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          disabled={disabled}
          placeholder={values.length === 0 ? placeholder : ''}
          className="min-w-[8rem] flex-1 bg-transparent text-sm font-light text-ink-900 outline-none placeholder:text-ink-700/40"
        />
      </div>
      <p className="mt-1.5 text-[11px] font-light text-ink-700/70">Press Enter or comma to add</p>
    </div>
  )
}
