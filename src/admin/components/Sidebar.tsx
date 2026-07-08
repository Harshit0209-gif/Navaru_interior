import { NavLink } from 'react-router-dom'
import {
  CalendarCheck,
  History,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  User,
  FolderKanban,
} from 'lucide-react'
import { Wordmark } from '../../components/Wordmark'
import { useAuth } from '../hooks/useAuth'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { cn } from '../../utils/cn'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', to: '/admin/portfolio', icon: FolderKanban },
  { label: 'Bookings', to: '/admin/bookings', icon: CalendarCheck },
  { label: 'Contact', to: '/admin/contact', icon: Mail },
  { label: 'Media Library', to: '/admin/media', icon: Images },
  { label: 'Activity Log', to: '/admin/activity', icon: History },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

type SidebarProps = {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { logout } = useAuth()
  const { logo_url: logoUrl, company_name: companyName } = useSiteSettings()

  return (
    <div className="flex h-full flex-col bg-ink-950 text-cream-100">
      <div className="flex items-center gap-3 px-6 py-7">
        <img src={logoUrl || '/logo-mark.png'} alt={companyName} className="h-9 w-auto" />
        <Wordmark light size="sm" />
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-light transition-colors duration-200',
                isActive
                  ? 'bg-cream-100/10 text-brass-300'
                  : 'text-cream-200/70 hover:bg-cream-100/5 hover:text-cream-100',
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-cream-100/10 px-3 py-4">
        <NavLink
          to="/admin/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-light transition-colors duration-200',
              isActive
                ? 'bg-cream-100/10 text-brass-300'
                : 'text-cream-200/70 hover:bg-cream-100/5 hover:text-cream-100',
            )
          }
        >
          <User className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
          Profile
        </NavLink>
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            void logout()
          }}
          className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm font-light text-cream-200/70 transition-colors duration-200 hover:bg-cream-100/5 hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </div>
  )
}
