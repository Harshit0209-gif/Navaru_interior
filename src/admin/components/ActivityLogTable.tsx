import { Link } from 'react-router-dom'
import type { ActivityLog, ActivityAction } from '../types/activityLog'
import { ActivityActionBadge } from './ActivityActionBadge'
import { Skeleton } from '../../components/Skeleton'

type ActivityLogTableProps = {
  logs: ActivityLog[]
  loading: boolean
}

function recordLink(log: ActivityLog): string | null {
  switch (log.record_type) {
    case 'portfolio_project':
      return log.record_id ? `/admin/portfolio/edit/${log.record_id}` : '/admin/portfolio'
    case 'media_asset':
      return '/admin/media'
    case 'booking':
      return '/admin/bookings'
    case 'contact_enquiry':
      return '/admin/contact'
    case 'site_settings':
      return '/admin/settings'
    case 'site_content':
      return '/admin/content'
    case 'profile':
    case 'auth':
      return '/admin/profile'
    default:
      return null
  }
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  portfolio_project: 'Project',
  media_asset: 'Media',
  booking: 'Booking',
  contact_enquiry: 'Contact',
  site_settings: 'Settings',
  site_content: 'Website Content',
  profile: 'Profile',
  auth: 'Auth',
}

export function ActivityLogTable({ logs, loading }: ActivityLogTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/15 bg-cream-50 py-16 text-center">
        <p className="text-sm font-light text-ink-700">No activity matches your filters.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-ink-900/10 bg-cream-50">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-900/10 text-[11px] font-medium uppercase tracking-widest2 text-ink-700/50">
            <th className="px-4 py-3 font-medium">Timestamp</th>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Record</th>
            <th className="px-4 py-3 font-medium">IP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/5">
          {logs.map((log) => {
            const link = recordLink(log)
            return (
              <tr key={log.id} className="transition-colors hover:bg-ink-900/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 text-ink-700/60">
                  {new Date(log.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </td>
                <td className="px-4 py-3 text-ink-800">{log.user_email ?? '—'}</td>
                <td className="px-4 py-3">
                  <ActivityActionBadge action={log.action as ActivityAction} />
                </td>
                <td className="px-4 py-3 text-ink-700">{log.description}</td>
                <td className="px-4 py-3">
                  {log.record_type ? (
                    link ? (
                      <Link to={link} className="text-xs font-medium uppercase tracking-widest2 text-brass-400 hover:text-brass-500">
                        {RECORD_TYPE_LABELS[log.record_type] ?? log.record_type}
                      </Link>
                    ) : (
                      <span className="text-xs text-ink-700/50">{RECORD_TYPE_LABELS[log.record_type] ?? log.record_type}</span>
                    )
                  ) : (
                    <span className="text-ink-700/50">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-700/60">{log.ip_address ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
