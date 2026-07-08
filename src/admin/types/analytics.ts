import type { MediaBucket, PublishStatus } from '../../types/database'

export interface ProjectStats {
  total: number
  featured: number
  published: number
  draft: number
  archived: number
}

export interface BookingStats {
  total: number
  new: number
  pending: number
  contacted: number
  completed: number
  rejected: number
}

export interface EnquiryStats {
  total: number
  unread: number
  read: number
  replied: number
  archived: number
}

export interface StorageStats {
  totalBytes: number
  fileCount: number
}

export interface RecentUpload {
  id: string
  fileName: string
  publicUrl: string
  sizeBytes: number
  bucketId: MediaBucket
  createdAt: string
}

export interface RecentProjectActivity {
  id: string
  title: string
  category: string | null
  status: PublishStatus
  updatedAt: string
}

export interface MonthlyTrendPoint {
  monthKey: string
  label: string
  projects: number
  bookings: number
  enquiries: number
}
