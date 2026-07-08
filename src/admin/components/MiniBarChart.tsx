type MiniBarChartProps = {
  title: string
  data: { label: string; value: number }[]
}

export function MiniBarChart({ title, data }: MiniBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="border border-ink-900/10 bg-cream-50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-normal text-ink-900">{title}</h3>
        <span className="text-xs font-light text-ink-700/40">Last {data.length} months</span>
      </div>

      <div className="mt-6 flex items-end gap-2">
        {data.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t-sm bg-brass-300 transition-all duration-500 hover:bg-brass-400"
                style={{ height: `${(point.value / max) * 100}%`, minHeight: point.value > 0 ? '4px' : '1px' }}
                title={`${point.label}: ${point.value}`}
              />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest2 text-ink-700/40">
              {point.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-ink-900/10 pt-3 text-xs font-light text-ink-700/50">
        {total} total in this period
      </p>
    </div>
  )
}
