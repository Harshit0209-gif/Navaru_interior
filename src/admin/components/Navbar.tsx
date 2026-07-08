import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CalendarCheck, Mail, Menu, Moon, Search, Settings, Sun, User as UserIcon, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAdminTheme } from '../hooks/useAdminTheme'
import { useAdminNotifications } from '../hooks/useAdminNotifications'
import { timeAgo } from '../../utils/timeAgo'
import { cn } from '../../utils/cn'

type NavbarProps = {
  onOpenDrawer: () => void
}

export function Navbar({ onOpenDrawer }: NavbarProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useAdminTheme()
  const { count, notifications } = useAdminNotifications()
  const navigate = useNavigate()
  const isDark = theme === 'dark'
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark')
  }

  const initials = (user?.email ?? 'A').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-ink-900/10 bg-cream-50/90 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open navigation menu"
        className="text-ink-800 transition-colors hover:text-brass-400 lg:hidden"
      >
        <Menu className="h-6 w-6" strokeWidth={1.5} />
      </button>

      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40" strokeWidth={1.5} />
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className="w-full rounded-full border border-ink-900/10 bg-cream-100 py-2 pl-9 pr-4 text-sm font-light text-ink-900 outline-none transition-colors focus:border-brass-300"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-pressed={isDark}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-brass-400"
        >
          {isDark ? <Moon className="h-4 w-4" strokeWidth={1.5} /> : <Sun className="h-4 w-4" strokeWidth={1.5} />}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => !prev)
              setProfileOpen(false)
            }}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-brass-400"
          >
            <Bell className="h-4 w-4" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brass-400 px-1 text-[10px] font-medium text-ink-950">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-3 w-80 border border-ink-900/10 bg-cream-50 shadow-xl"
                role="menu"
              >
                <p className="border-b border-ink-900/10 px-4 py-3 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
                  Notifications
                </p>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs font-light text-ink-700/70">
                    You're all caught up.
                  </p>
                ) : (
                  <ul>
                    {notifications.map((n) => (
                      <li key={n.id} className="border-b border-ink-900/5 last:border-0">
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationsOpen(false)
                            navigate(n.type === 'booking' ? '/admin/bookings' : '/admin/contact')
                          }}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-900/[0.03]"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass-50 text-brass-400">
                            {n.type === 'booking' ? (
                              <CalendarCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                            ) : (
                              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <p className="truncate text-sm font-light text-ink-800">{n.title}</p>
                            <p className="truncate text-xs font-light text-ink-700/50">{n.subtitle}</p>
                            <p className="mt-0.5 text-[11px] font-light text-ink-700/70">{timeAgo(n.createdAt)}</p>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev)
              setNotificationsOpen(false)
            }}
            aria-label="Admin profile menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-ink-900/5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-xs font-medium text-cream-100">
              {initials}
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm font-light text-ink-800 sm:inline">
              {user?.email ?? 'Admin'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-3 w-48 border border-ink-900/10 bg-cream-50 shadow-xl"
                role="menu"
              >
                <Link
                  to="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-light text-ink-800 transition-colors hover:bg-ink-900/5 hover:text-brass-400"
                >
                  <UserIcon className="h-4 w-4" strokeWidth={1.5} />
                  Profile
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-light text-ink-800 transition-colors hover:bg-ink-900/5 hover:text-brass-400"
                >
                  <Settings className="h-4 w-4" strokeWidth={1.5} />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className={cn(
                    'flex w-full items-center gap-2.5 border-t border-ink-900/10 px-4 py-3 text-left text-sm font-light text-ink-800 transition-colors hover:bg-ink-900/5 hover:text-red-500',
                  )}
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
