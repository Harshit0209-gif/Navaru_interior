import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useScrolled } from '../../hooks/useScrolled'
import { useBookingModal } from '../../context/BookingModalContext'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { Wordmark } from '../Wordmark'
import { cn } from '../../utils/cn'

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar() {
  const scrolled = useScrolled(40)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const light = pathname === '/' && !scrolled
  const { open: openBooking } = useBookingModal()
  const { logo_url: logoUrl, company_name: companyName } = useSiteSettings()
  const drawerRef = useFocusTrap<HTMLDivElement>(open, { initialFocus: 'container' })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxury',
          scrolled
            ? 'bg-cream-100/90 py-4 shadow-[0_1px_0_0_rgba(20,19,15,0.08)] backdrop-blur-md'
            : 'bg-transparent py-7',
        )}
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-6 lg:px-12">
          <NavLink to="/" className="flex items-center gap-3">
            <img src={logoUrl || '/logo-mark.png'} alt={companyName} className="h-11 w-auto" />
            <Wordmark light={light} size="md" />
          </NavLink>

          <nav className="hidden items-center gap-10 md:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'relative text-xs font-medium uppercase tracking-widest2 transition-colors duration-300 hover:text-brass-400',
                    light ? 'text-cream-100/90' : 'text-ink-800',
                    isActive && 'text-brass-400',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => openBooking()}
            className={cn(
              'hidden text-xs font-medium uppercase tracking-widest2 underline decoration-brass-300 decoration-2 underline-offset-4 transition-colors hover:text-brass-400 md:inline-block',
              light ? 'text-cream-100' : 'text-ink-900',
            )}
          >
            Book a Consultation
          </button>

          <button
            onClick={() => setOpen(true)}
            className={cn('md:hidden transition-colors duration-500', light ? 'text-cream-100' : 'text-ink-900')}
            aria-label="Open menu"
          >
            <Menu strokeWidth={1.5} className="h-7 w-7" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink-950 px-8 py-8 text-cream-100 outline-none md:hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logoUrl || '/logo-mark.png'} alt={companyName} className="h-10 w-auto" />
                <Wordmark light size="md" />
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X strokeWidth={1.5} className="h-7 w-7" />
              </button>
            </div>

            <nav className="mt-16 flex flex-1 flex-col justify-center gap-2">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-4xl font-light tracking-tightest"
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + LINKS.length * 0.06, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                setOpen(false)
                openBooking()
              }}
              className="mb-4 border-b border-brass-300 pb-2 text-left text-sm font-medium uppercase tracking-widest2 text-brass-300"
            >
              Book a Consultation
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
