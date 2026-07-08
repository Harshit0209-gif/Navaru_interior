import type { Database } from '../../types/database'

export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']

export type ActivityAction =
  | 'login'
  | 'logout'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'project.duplicated'
  | 'project.status_changed'
  | 'project.featured_toggled'
  | 'image.uploaded'
  | 'image.deleted'
  | 'image.renamed'
  | 'image.replaced'
  | 'booking.status_changed'
  | 'booking.notes_updated'
  | 'booking.deleted'
  | 'booking.bulk_status_changed'
  | 'booking.bulk_deleted'
  | 'contact.status_changed'
  | 'contact.notes_updated'
  | 'contact.deleted'
  | 'contact.bulk_status_changed'
  | 'contact.bulk_deleted'
  | 'settings.updated'
  | 'profile.updated'
  | 'profile.email_changed'
  | 'profile.password_changed'

export type ActivityRecordType =
  | 'portfolio_project'
  | 'media_asset'
  | 'booking'
  | 'contact_enquiry'
  | 'site_settings'
  | 'auth'
  | 'profile'

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  login: 'Logged In',
  logout: 'Logged Out',
  'project.created': 'Project Created',
  'project.updated': 'Project Updated',
  'project.deleted': 'Project Deleted',
  'project.duplicated': 'Project Duplicated',
  'project.status_changed': 'Project Status Changed',
  'project.featured_toggled': 'Project Featured Toggled',
  'image.uploaded': 'Image Uploaded',
  'image.deleted': 'Image Deleted',
  'image.renamed': 'Image Renamed',
  'image.replaced': 'Image Replaced',
  'booking.status_changed': 'Booking Status Changed',
  'booking.notes_updated': 'Booking Notes Updated',
  'booking.deleted': 'Booking Deleted',
  'booking.bulk_status_changed': 'Bookings Bulk Status Changed',
  'booking.bulk_deleted': 'Bookings Bulk Deleted',
  'contact.status_changed': 'Contact Status Changed',
  'contact.notes_updated': 'Contact Notes Updated',
  'contact.deleted': 'Contact Deleted',
  'contact.bulk_status_changed': 'Contacts Bulk Status Changed',
  'contact.bulk_deleted': 'Contacts Bulk Deleted',
  'settings.updated': 'Settings Updated',
  'profile.updated': 'Profile Updated',
  'profile.email_changed': 'Email Changed',
  'profile.password_changed': 'Password Changed',
}

export type ActivityActionFilter = 'all' | ActivityAction
export type ActivitySortOption = 'newest' | 'oldest'

export interface ActivityLogFilters {
  search?: string
  action?: ActivityActionFilter
  dateFrom?: string
  dateTo?: string
  sort?: ActivitySortOption
  page?: number
  pageSize?: number
}

export interface ActivityLogListResult {
  logs: ActivityLog[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
