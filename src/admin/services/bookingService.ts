import { getSupabase } from '../../lib/supabase'
import { sanitizeText } from '../../utils/sanitize'
import { logActivity } from './activityLogService'
import type { BookingStatus } from '../../types/database'
import type { BookingFilters, BookingListResult, BookingRequest, ProjectOption } from '../types/booking'

const DEFAULT_PAGE_SIZE = 20
const SIGNED_URL_EXPIRY_SECONDS = 60 * 5

export async function fetchBookings(filters: BookingFilters = {}): Promise<BookingListResult> {
  const supabase = await getSupabase()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE

  let query = supabase.from('book_design_requests').select('*', { count: 'exact' })

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId)
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', `${filters.dateFrom}T00:00:00`)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', `${filters.dateTo}T23:59:59`)
  }
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`customer_name.ilike.${term},email.ilike.${term},phone.ilike.${term},project_name.ilike.${term}`)
  }

  query = query.order('created_at', { ascending: filters.sort === 'oldest' })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const total = count ?? 0
  const bookings = data ?? []

  return {
    bookings,
    total,
    page,
    pageSize,
    hasMore: from + bookings.length < total,
  }
}

export async function fetchBookingById(id: string): Promise<BookingRequest | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('book_design_requests').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('book_design_requests')
    .update({ status })
    .eq('id', id)
    .select('customer_name')
    .single()
  if (error) throw error

  await logActivity({
    action: 'booking.status_changed',
    description: `Changed booking status for "${data.customer_name}" to "${status}"`,
    recordType: 'booking',
    recordId: id,
    metadata: { status },
  })
}

export async function updateBookingNotes(id: string, notes: string): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('book_design_requests')
    .update({ admin_notes: sanitizeText(notes) || null })
    .eq('id', id)
    .select('customer_name')
    .single()
  if (error) throw error

  await logActivity({
    action: 'booking.notes_updated',
    description: `Updated notes on booking from "${data.customer_name}"`,
    recordType: 'booking',
    recordId: id,
  })
}

export async function deleteBooking(id: string): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('book_design_requests')
    .delete()
    .eq('id', id)
    .select('customer_name')
    .single()
  if (error) throw error

  await logActivity({
    action: 'booking.deleted',
    description: `Deleted booking request from "${data.customer_name}"`,
    recordType: 'booking',
    recordId: id,
  })
}

export async function bulkDeleteBookings(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const supabase = await getSupabase()
  const { error } = await supabase.from('book_design_requests').delete().in('id', ids)
  if (error) throw error

  await logActivity({
    action: 'booking.bulk_deleted',
    description: `Deleted ${ids.length} booking request(s)`,
    recordType: 'booking',
    metadata: { ids, count: ids.length },
  })
}

export async function bulkUpdateBookingStatus(ids: string[], status: BookingStatus): Promise<void> {
  if (ids.length === 0) return
  const supabase = await getSupabase()
  const { error } = await supabase.from('book_design_requests').update({ status }).in('id', ids)
  if (error) throw error

  await logActivity({
    action: 'booking.bulk_status_changed',
    description: `Changed status to "${status}" for ${ids.length} booking request(s)`,
    recordType: 'booking',
    metadata: { ids, count: ids.length, status },
  })
}

export async function getAttachmentSignedUrl(path: string): Promise<string> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS)
  if (error) throw error
  return data.signedUrl
}

export async function fetchProjectOptions(): Promise<ProjectOption[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('id, title')
    .order('title', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchBookingCount(): Promise<number> {
  const supabase = await getSupabase()
  const { count, error } = await supabase
    .from('book_design_requests')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function fetchRecentBookings(limit = 3): Promise<BookingRequest[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('book_design_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
