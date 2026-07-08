import type { Database, EnquiryStatus } from '../../types/database'

export type { EnquiryStatus }

export type ContactEnquiry = Database['public']['Tables']['contact_enquiries']['Row']

export type ContactStatusFilter = 'all' | EnquiryStatus
export type ContactSortOption = 'newest' | 'oldest'

export interface ContactFilters {
  search?: string
  status?: ContactStatusFilter
  dateFrom?: string
  dateTo?: string
  sort?: ContactSortOption
  page?: number
  pageSize?: number
}

export interface ContactListResult {
  enquiries: ContactEnquiry[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export const CONTACT_STATUS_OPTIONS: EnquiryStatus[] = ['unread', 'read', 'replied', 'archived']

export const CONTACT_STATUS_LABELS: Record<EnquiryStatus, string> = {
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
}
