/**
 * Extracts a human-readable message from a caught error. Supabase's
 * PostgrestError/StorageError objects are plain objects with a `message`
 * field — not `instanceof Error` — so a bare `err instanceof Error` check
 * silently discards them and shows a useless generic fallback instead of
 * the real, actionable error (e.g. an RLS violation or constraint failure).
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}
