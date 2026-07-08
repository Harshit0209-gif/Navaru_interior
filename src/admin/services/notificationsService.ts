import { getSupabase } from '../../lib/supabase'

export interface AdminNotification {
  id: string
  type: 'booking' | 'enquiry'
  title: string
  subtitle: string
  createdAt: string
}

// "Unread" here mirrors each module's own existing status semantics: a
// booking is unhandled while status is 'new', an enquiry while 'unread' —
// there's no separate notifications table, this just counts/lists those.
export async function fetchUnreadCount(): Promise<number> {
  const supabase = await getSupabase()
  const [bookings, enquiries] = await Promise.all([
    supabase.from('book_design_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_enquiries').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
  ])
  if (bookings.error) throw bookings.error
  if (enquiries.error) throw enquiries.error

  return (bookings.count ?? 0) + (enquiries.count ?? 0)
}

export async function fetchRecentNotifications(limit = 6): Promise<AdminNotification[]> {
  const supabase = await getSupabase()
  const [bookings, enquiries] = await Promise.all([
    supabase
      .from('book_design_requests')
      .select('id, customer_name, project_name, created_at')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('contact_enquiries')
      .select('id, name, subject, created_at')
      .eq('status', 'unread')
      .order('created_at', { ascending: false })
      .limit(limit),
  ])
  if (bookings.error) throw bookings.error
  if (enquiries.error) throw enquiries.error

  const items: AdminNotification[] = [
    ...(bookings.data ?? []).map((b) => ({
      id: `booking-${b.id}`,
      type: 'booking' as const,
      title: `New booking request from ${b.customer_name}`,
      subtitle: b.project_name,
      createdAt: b.created_at,
    })),
    ...(enquiries.data ?? []).map((e) => ({
      id: `enquiry-${e.id}`,
      type: 'enquiry' as const,
      title: `New enquiry from ${e.name}`,
      subtitle: e.subject || 'General enquiry',
      createdAt: e.created_at,
    })),
  ]

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return items.slice(0, limit)
}
