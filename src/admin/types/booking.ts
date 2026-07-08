import type { Database, BookingStatus } from '../../types/database'

export type { BookingStatus }

export type BookingRequest = Database['public']['Tables']['book_design_requests']['Row']

export type BookingStatusFilter = 'all' | BookingStatus
export type BookingSortOption = 'newest' | 'oldest'

export interface BookingFilters {
  search?: string
  status?: BookingStatusFilter
  projectId?: string
  dateFrom?: string
  dateTo?: string
  sort?: BookingSortOption
  page?: number
  pageSize?: number
}

export interface BookingListResult {
  bookings: BookingRequest[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ProjectOption {
  id: string
  title: string
}

export const BOOKING_STATUS_OPTIONS: BookingStatus[] = ['new', 'pending', 'contacted', 'completed', 'rejected']

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  new: 'New',
  pending: 'Pending',
  contacted: 'Contacted',
  completed: 'Completed',
  rejected: 'Rejected',
}
