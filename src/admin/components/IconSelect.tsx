import { ICON_MAP, ICON_OPTIONS } from '../../utils/icons'

const selectClasses =
  'border-b border-ink-900/20 bg-ink-900/5 py-2 pr-6 text-xs font-medium uppercase tracking-widest2 text-ink-700 outline-none transition-colors focus:border-brass-400'

type IconSelectProps = {
  value: string
  onChange: (value: string) => void
}

export function IconSelect({ value, onChange }: IconSelectProps) {
  const Icon = ICON_MAP[value]

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink-900/10 bg-cream-100 text-brass-400">
        {Icon ? <Icon className="h-4 w-4" strokeWidth={1.5} /> : null}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClasses} aria-label="Icon">
        {ICON_OPTIONS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
