export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Accepts international formats loosely: optional +, 7-15 digits, spaces/hyphens allowed.
export function isValidPhone(value: string): boolean {
  const digitsOnly = value.replace(/[\s\-().]/g, '')
  return /^\+?\d{7,15}$/.test(digitsOnly)
}

export function isValidFutureDate(value: string): boolean {
  if (!value) return true // optional field
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}
