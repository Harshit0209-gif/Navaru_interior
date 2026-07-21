import type { ReactNode } from 'react'

type SectionProps = {
  title: string
  description?: string
  id?: string
  children: ReactNode
}

export function Section({ title, description, id, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 border border-ink-900/10 bg-cream-50 p-6 sm:p-8">
      <h2 className="text-lg font-normal text-ink-900">{title}</h2>
      {description && <p className="mt-1 text-sm font-light text-ink-700/60">{description}</p>}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">{children}</div>
    </section>
  )
}
