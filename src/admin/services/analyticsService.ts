import { getSupabase } from '../../lib/supabase'
import type {
  BookingStats,
  EnquiryStats,
  MonthlyTrendPoint,
  ProjectStats,
  RecentProjectActivity,
  RecentUpload,
  StorageStats,
} from '../types/analytics'

export async function fetchProjectStats(): Promise<ProjectStats> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('portfolio_projects').select('status, is_featured')
  if (error) throw error

  const rows = data ?? []
  return {
    total: rows.length,
    featured: rows.filter((r) => r.is_featured).length,
    published: rows.filter((r) => r.status === 'published').length,
    draft: rows.filter((r) => r.status === 'draft').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  }
}

export async function fetchBookingStats(): Promise<BookingStats> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('book_design_requests').select('status')
  if (error) throw error

  const rows = data ?? []
  const count = (status: string) => rows.filter((r) => r.status === status).length
  return {
    total: rows.length,
    new: count('new'),
    pending: count('pending'),
    contacted: count('contacted'),
    completed: count('completed'),
    rejected: count('rejected'),
  }
}

export async function fetchEnquiryStats(): Promise<EnquiryStats> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('contact_enquiries').select('status')
  if (error) throw error

  const rows = data ?? []
  const count = (status: string) => rows.filter((r) => r.status === status).length
  return {
    total: rows.length,
    unread: count('unread'),
    read: count('read'),
    replied: count('replied'),
    archived: count('archived'),
  }
}

export async function fetchStorageStats(): Promise<StorageStats> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('media_assets').select('size_bytes')
  if (error) throw error

  const rows = data ?? []
  return {
    totalBytes: rows.reduce((sum, r) => sum + r.size_bytes, 0),
    fileCount: rows.length,
  }
}

export async function fetchRecentUploads(limit = 5): Promise<RecentUpload[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('media_assets')
    .select('id, file_name, public_url, size_bytes, bucket_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    fileName: row.file_name,
    publicUrl: row.public_url,
    sizeBytes: row.size_bytes,
    bucketId: row.bucket_id,
    createdAt: row.created_at,
  }))
}

type RecentProjectRow = {
  id: string
  title: string
  status: RecentProjectActivity['status']
  updated_at: string
  category: { name: string } | { name: string }[] | null
}

export async function fetchRecentProjects(limit = 5): Promise<RecentProjectActivity[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('id, title, status, updated_at, category:categories(name)')
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  return ((data ?? []) as unknown as RecentProjectRow[]).map((row) => {
    const category = Array.isArray(row.category) ? row.category[0] : row.category
    return {
      id: row.id,
      title: row.title,
      category: category?.name ?? null,
      status: row.status,
      updatedAt: row.updated_at,
    }
  })
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short' })
}

export async function fetchMonthlyTrend(months = 6): Promise<MonthlyTrendPoint[]> {
  const supabase = await getSupabase()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const startIso = start.toISOString()

  const [projectsRes, bookingsRes, enquiriesRes] = await Promise.all([
    supabase.from('portfolio_projects').select('created_at').gte('created_at', startIso),
    supabase.from('book_design_requests').select('created_at').gte('created_at', startIso),
    supabase.from('contact_enquiries').select('created_at').gte('created_at', startIso),
  ])
  if (projectsRes.error) throw projectsRes.error
  if (bookingsRes.error) throw bookingsRes.error
  if (enquiriesRes.error) throw enquiriesRes.error

  const points: MonthlyTrendPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    points.push({ monthKey: monthKey(d), label: monthLabel(d), projects: 0, bookings: 0, enquiries: 0 })
  }

  const bucket = (rows: { created_at: string }[] | null, key: keyof Pick<MonthlyTrendPoint, 'projects' | 'bookings' | 'enquiries'>) => {
    for (const row of rows ?? []) {
      const point = points.find((p) => p.monthKey === monthKey(new Date(row.created_at)))
      if (point) point[key] += 1
    }
  }

  bucket(projectsRes.data, 'projects')
  bucket(bookingsRes.data, 'bookings')
  bucket(enquiriesRes.data, 'enquiries')

  return points
}
