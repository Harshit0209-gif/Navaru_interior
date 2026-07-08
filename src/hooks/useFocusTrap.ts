import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

type UseFocusTrapOptions = {
  // Which element receives focus when the trap activates. 'first' (the
  // default) focuses the first focusable descendant — right for dialogs
  // whose first child is something benign like a text field. Use
  // 'container' when the first focusable descendant is something you don't
  // want to auto-activate the semantics of (e.g. a mobile nav drawer whose
  // first focusable element happens to be its own Close button) — the
  // container itself needs tabIndex={-1} for this to work.
  initialFocus?: 'first' | 'container'
}

/**
 * Traps Tab focus within the returned ref's subtree while `active`, moves
 * focus into it on activation, and restores focus to whatever was focused
 * beforehand once deactivated. Used by modals/drawers so keyboard users
 * can't Tab out into the page behind an open overlay.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean, options: UseFocusTrapOptions = {}) {
  const containerRef = useRef<T>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const { initialFocus = 'first' } = options

  useEffect(() => {
    if (!active) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      Array.from(containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])

    if (initialFocus === 'container') {
      containerRef.current?.focus()
    } else {
      const first = getFocusable()[0]
      first?.focus()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return

      const firstEl = items[0]
      const lastEl = items[items.length - 1]

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, initialFocus])

  return containerRef
}
