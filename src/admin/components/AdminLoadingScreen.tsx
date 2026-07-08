export function AdminLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950">
      <div className="flex flex-col items-center gap-4">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-cream-100/20 border-t-brass-400"
          role="status"
          aria-label="Loading"
        />
        <p className="text-xs font-medium uppercase tracking-widest2 text-cream-200/50">
          Checking session…
        </p>
      </div>
    </div>
  )
}
