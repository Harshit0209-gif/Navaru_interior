import { useEffect, useState } from 'react'
import {
  fetchBookingStats,
  fetchEnquiryStats,
  fetchMonthlyTrend,
  fetchProjectStats,
  fetchRecentProjects,
  fetchRecentUploads,
  fetchStorageStats,
} from '../services/analyticsService'
import { fetchRecentBookings } from '../services/bookingService'
import { fetchRecentEnquiries } from '../services/contactService'
import type {
  BookingStats,
  EnquiryStats,
  MonthlyTrendPoint,
  ProjectStats,
  RecentProjectActivity,
  RecentUpload,
  StorageStats,
} from '../types/analytics'
import type { BookingRequest } from '../types/booking'
import type { ContactEnquiry } from '../types/contact'

const EMPTY_PROJECT_STATS: ProjectStats = { total: 0, featured: 0, published: 0, draft: 0, archived: 0 }
const EMPTY_BOOKING_STATS: BookingStats = { total: 0, new: 0, pending: 0, contacted: 0, completed: 0, rejected: 0 }
const EMPTY_ENQUIRY_STATS: EnquiryStats = { total: 0, unread: 0, read: 0, replied: 0, archived: 0 }
const EMPTY_STORAGE_STATS: StorageStats = { totalBytes: 0, fileCount: 0 }

export function useDashboardAnalytics() {
  const [loading, setLoading] = useState(true)
  const [projectStats, setProjectStats] = useState<ProjectStats>(EMPTY_PROJECT_STATS)
  const [bookingStats, setBookingStats] = useState<BookingStats>(EMPTY_BOOKING_STATS)
  const [enquiryStats, setEnquiryStats] = useState<EnquiryStats>(EMPTY_ENQUIRY_STATS)
  const [storageStats, setStorageStats] = useState<StorageStats>(EMPTY_STORAGE_STATS)
  const [recentProjects, setRecentProjects] = useState<RecentProjectActivity[]>([])
  const [recentBookings, setRecentBookings] = useState<BookingRequest[]>([])
  const [recentEnquiries, setRecentEnquiries] = useState<ContactEnquiry[]>([])
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendPoint[]>([])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetchProjectStats().catch(() => EMPTY_PROJECT_STATS),
      fetchBookingStats().catch(() => EMPTY_BOOKING_STATS),
      fetchEnquiryStats().catch(() => EMPTY_ENQUIRY_STATS),
      fetchStorageStats().catch(() => EMPTY_STORAGE_STATS),
      fetchRecentProjects(5).catch(() => []),
      fetchRecentBookings(5).catch(() => []),
      fetchRecentEnquiries(5).catch(() => []),
      fetchRecentUploads(5).catch(() => []),
      fetchMonthlyTrend(6).catch(() => []),
    ]).then(
      ([
        projects,
        bookings,
        enquiries,
        storage,
        recentProjectsResult,
        recentBookingsResult,
        recentEnquiriesResult,
        recentUploadsResult,
        trend,
      ]) => {
        if (cancelled) return
        setProjectStats(projects)
        setBookingStats(bookings)
        setEnquiryStats(enquiries)
        setStorageStats(storage)
        setRecentProjects(recentProjectsResult)
        setRecentBookings(recentBookingsResult)
        setRecentEnquiries(recentEnquiriesResult)
        setRecentUploads(recentUploadsResult)
        setMonthlyTrend(trend)
        setLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  return {
    loading,
    projectStats,
    bookingStats,
    enquiryStats,
    storageStats,
    recentProjects,
    recentBookings,
    recentEnquiries,
    recentUploads,
    monthlyTrend,
  }
}
