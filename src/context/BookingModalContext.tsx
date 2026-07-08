import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

export interface BookingProject {
  id: string
  name: string
}

type BookingModalContextValue = {
  isOpen: boolean
  project: BookingProject | null
  open: (project?: BookingProject) => void
  close: () => void
}

const BookingModalContext = createContext<BookingModalContextValue | null>(null)

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [project, setProject] = useState<BookingProject | null>(null)

  const open = useCallback((nextProject?: BookingProject) => {
    setProject(nextProject ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ isOpen, project, open, close }), [isOpen, project, open, close])

  return <BookingModalContext.Provider value={value}>{children}</BookingModalContext.Provider>
}

export function useBookingModal() {
  const ctx = useContext(BookingModalContext)
  if (!ctx) throw new Error('useBookingModal must be used within a BookingModalProvider')
  return ctx
}
