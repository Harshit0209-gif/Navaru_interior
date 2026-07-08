import { Search, X } from 'lucide-react'

type ContactSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ContactSearch({ value, onChange }: ContactSearchProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/50"
        strokeWidth={1.5}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search name, email, subject…"
        aria-label="Search contact enquiries"
        className="w-full border-b border-ink-900/20 bg-transparent py-2 pl-7 pr-7 text-sm font-light text-ink-900 outline-none transition-colors focus:border-brass-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-800"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
