function escapeCsvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value)

  // CSV/formula-injection guard: user-submitted fields (booking/enquiry
  // name, message, etc.) end up here, and Excel/Sheets will execute a cell
  // starting with =, +, -, or @ as a formula when the export is opened.
  // Prefixing with a leading apostrophe forces it to be read as literal
  // text instead.
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`
  }

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function downloadCsv(fileName: string, headers: string[], rows: unknown[][]): void {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(','))
  // Leading BOM so Excel opens UTF-8 CSVs (e.g. accented names) correctly.
  const csvContent = '﻿' + lines.join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
