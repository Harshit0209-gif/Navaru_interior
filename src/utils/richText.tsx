import type { ReactNode } from 'react'

// Minimal **bold** markdown support for admin-authored copy — splits on
// **marked** spans and wraps them in <strong>, leaving everything else as
// plain text. Deliberately not a full markdown parser: this is the one
// formatting need actual content editors have asked for.
export function renderBoldText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-medium text-ink-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}
