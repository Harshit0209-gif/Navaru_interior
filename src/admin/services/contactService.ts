import { getSupabase } from '../../lib/supabase'
import { sanitizeText } from '../../utils/sanitize'
import { logActivity } from './activityLogService'
import type { EnquiryStatus } from '../../types/database'
import type { ContactEnquiry, ContactFilters, ContactListResult } from '../types/contact'

const DEFAULT_PAGE_SIZE = 20
const SIGNED_URL_EXPIRY_SECONDS = 60 * 5

export async function fetchEnquiries(filters: ContactFilters = {}): Promise<ContactListResult> {
  const supabase = await getSupabase()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE

  let query = supabase.from('contact_enquiries').select('*', { count: 'exact' })

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', `${filters.dateFrom}T00:00:00`)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', `${filters.dateTo}T23:59:59`)
  }
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`name.ilike.${term},email.ilike.${term},subject.ilike.${term},message.ilike.${term}`)
  }

  query = query.order('created_at', { ascending: filters.sort === 'oldest' })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const total = count ?? 0
  const enquiries = data ?? []

  return {
    enquiries,
    total,
    page,
    pageSize,
    hasMore: from + enquiries.length < total,
  }
}

export async function fetchEnquiryById(id: string): Promise<ContactEnquiry | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('contact_enquiries').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('contact_enquiries')
    .update({ status })
    .eq('id', id)
    .select('name')
    .single()
  if (error) throw error

  await logActivity({
    action: 'contact.status_changed',
    description: `Changed contact status for "${data.name}" to "${status}"`,
    recordType: 'contact_enquiry',
    recordId: id,
    metadata: { status },
  })
}

export async function updateEnquiryNotes(id: string, notes: string): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('contact_enquiries')
    .update({ admin_notes: sanitizeText(notes) || null })
    .eq('id', id)
    .select('name')
    .single()
  if (error) throw error

  await logActivity({
    action: 'contact.notes_updated',
    description: `Updated notes on enquiry from "${data.name}"`,
    recordType: 'contact_enquiry',
    recordId: id,
  })
}

export async function deleteEnquiry(id: string): Promise<void> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('contact_enquiries').delete().eq('id', id).select('name').single()
  if (error) throw error

  await logActivity({
    action: 'contact.deleted',
    description: `Deleted contact enquiry from "${data.name}"`,
    recordType: 'contact_enquiry',
    recordId: id,
  })
}

export async function bulkDeleteEnquiries(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const supabase = await getSupabase()
  const { error } = await supabase.from('contact_enquiries').delete().in('id', ids)
  if (error) throw error

  await logActivity({
    action: 'contact.bulk_deleted',
    description: `Deleted ${ids.length} contact enquiry(ies)`,
    recordType: 'contact_enquiry',
    metadata: { ids, count: ids.length },
  })
}

export async function bulkUpdateEnquiryStatus(ids: string[], status: EnquiryStatus): Promise<void> {
  if (ids.length === 0) return
  const supabase = await getSupabase()
  const { error } = await supabase.from('contact_enquiries').update({ status }).in('id', ids)
  if (error) throw error

  await logActivity({
    action: 'contact.bulk_status_changed',
    description: `Changed status to "${status}" for ${ids.length} contact enquiry(ies)`,
    recordType: 'contact_enquiry',
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

export async function fetchEnquiryCount(): Promise<number> {
  const supabase = await getSupabase()
  const { count, error } = await supabase
    .from('contact_enquiries')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function fetchRecentEnquiries(limit = 3): Promise<ContactEnquiry[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('contact_enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
