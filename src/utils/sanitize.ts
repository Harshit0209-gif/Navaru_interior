function stripControlCharacters(value: string): string {
  let result = ''
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    const isControlChar = (code >= 0 && code <= 31) || code === 127
    if (!isControlChar) result += value[i]
  }
  return result
}

export function sanitizeText(value: string): string {
  return stripControlCharacters(value.replace(/<[^>]*>/g, '')).trim()
}

export function sanitizeFormValues<T extends object>(values: T): T {
  const result = { ...values }
  ;(Object.keys(result) as Array<keyof T>).forEach((key) => {
    const value = result[key]
    if (typeof value === 'string') {
      result[key] = sanitizeText(value) as T[typeof key]
    }
  })
  return result
}
