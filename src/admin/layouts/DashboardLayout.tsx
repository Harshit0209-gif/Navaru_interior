import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { Navbar } from '../components/Navbar'
import { useAdminTheme } from '../hooks/useAdminTheme'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { cn } from '../../utils/cn'

const SIDEBAR_WIDTH = 'w-64'

export function DashboardLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { theme } = useAdminTheme()
  const drawerRef = useFocusTrap<HTMLDivElement>(isDrawerOpen)

  useEffect(() => {
    if (!isDrawerOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  return (
    <div className="min-h-screen bg-cream-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:uppercase focus:tracking-widest2 focus:text-cream-100"
      >
        Skip to content
      </a>
      {/* Desktop sidebar — fixed, always visible at lg+ */}
      <aside className={`fixed inset-y-0 left-0 z-40 hidden ${SIDEBAR_WIDTH} lg:block`}>
        <Sidebar />
      </aside>

      {/* Mobile / tablet drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              ref={drawerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed inset-y-0 left-0 z-50 ${SIDEBAR_WIDTH} lg:hidden`}
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="absolute right-4 top-7 text-cream-100/70 transition-colors hover:text-cream-100"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <Sidebar onNavigate={() => setIsDrawerOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={cn('lg:pl-64', theme === 'dark' && 'admin-dark')}>
        <div className="min-h-screen bg-cream-100">
          <Navbar onOpenDrawer={() => setIsDrawerOpen(true)} />
          <main id="main-content" className="px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
