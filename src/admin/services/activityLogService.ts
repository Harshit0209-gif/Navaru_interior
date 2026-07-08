import { getSupabase } from '../../lib/supabase'
import type {
  ActivityAction,
  ActivityLog,
  ActivityLogFilters,
  ActivityLogListResult,
  ActivityRecordType,
} from '../types/activityLog'

const DEFAULT_PAGE_SIZE = 25

// Best-effort client IP lookup via a free, no-key, CORS-enabled service.
// Fetched once per session and cached — not on every logged action, so a
// slow/unreachable third party never adds latency to admin workflows.
// IP is explicitly a nice-to-have (per the feature spec), so a failed
// lookup just means the column stays null, never a broken action.
let cachedIp: string | null | undefined

async function getClientIp(): Promise<string | null> {
  if (cachedIp !== undefined) return cachedIp

  let resolved: string | null
  try {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 2500)
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal })
    window.clearTimeout(timeout)
    const data = await res.json()
    resolved = typeof data.ip === 'string' ? data.ip : null
  } catch {
    resolved = null
  }

  cachedIp = resolved
  return resolved
}

export interface LogActivityParams {
  action: ActivityAction
  description: string
  recordType?: ActivityRecordType
  recordId?: string
  metadata?: Record<string, unknown>
}

/**
 * Records an admin action to the audit trail. Never throws — logging is
 * secondary to whatever action triggered it, so a failure here (network
 * blip, RLS issue) is swallowed (and surfaced only to the console) rather
 * than breaking the primary action the admin was actually trying to do.
 */
export async function logActivity({
  action,
  description,
  recordType,
  recordId,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    const supabase = await getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const ip = await getClientIp()

    const { error } = await supabase.from('activity_logs').insert({
      user_id: user.id,
      user_email: user.email ?? null,
      action,
      record_type: recordType ?? null,
      record_id: recordId ?? null,
      description,
      metadata: metadata ?? null,
      ip_address: ip,
    })

    if (error) console.error('Failed to record activity log:', error.message)
  } catch (err) {
    console.error('Failed to record activity log:', err)
  }
}

export async function fetchActivityLogs(filters: ActivityLogFilters = {}): Promise<ActivityLogListResult> {
  const supabase = await getSupabase()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE

  let query = supabase.from('activity_logs').select('*', { count: 'exact' })

  if (filters.action && filters.action !== 'all') {
    query = query.eq('action', filters.action)
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', `${filters.dateFrom}T00:00:00`)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', `${filters.dateTo}T23:59:59`)
  }
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`description.ilike.${term},user_email.ilike.${term}`)
  }

  query = query.order('created_at', { ascending: filters.sort === 'oldest' })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const total = count ?? 0
  const logs = data ?? []

  return {
    logs,
    total,
    page,
    pageSize,
    hasMore: from + logs.length < total,
  }
}

export async function fetchRecentActivityLogs(limit = 5): Promise<ActivityLog[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
