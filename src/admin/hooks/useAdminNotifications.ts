import { useCallback, useEffect, useState } from 'react'
import { fetchRecentNotifications, fetchUnreadCount } from '../services/notificationsService'
import type { AdminNotification } from '../services/notificationsService'
import { useBookingRealtime } from './useBookingRealtime'
import { useContactRealtime } from './useContactRealtime'

/**
 * Powers the admin topbar's notification bell. Lives above the Bookings and
 * Contact pages (mounted once in the Navbar, which is always on-screen
 * across every admin route), so the badge stays accurate regardless of
 * which page the admin is currently viewing.
 */
export function useAdminNotifications() {
  const [count, setCount] = useState(0)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])

  const reload = useCallback(() => {
    Promise.all([fetchUnreadCount(), fetchRecentNotifications(6)])
      .then(([nextCount, items]) => {
        setCount(nextCount)
        setNotifications(items)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  useBookingRealtime({ onChange: reload })
  useContactRealtime({ onChange: reload })

  return { count, notifications, reload }
}
