import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabase'

type UseBookingRealtimeOptions = {
  onInsert?: () => void
  onChange?: () => void
}

/**
 * Subscribes to live changes on book_design_requests so the admin sees new
 * submissions without polling or a manual refresh. Requires the table to be
 * added to the `supabase_realtime` publication (handled by
 * supabase/migrations/0004_booking_management.sql).
 */
export function useBookingRealtime({ onInsert, onChange }: UseBookingRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    let cancelled = false

    getSupabase().then((supabase) => {
      if (cancelled) return

      const channel = supabase
        .channel('book-design-requests-admin')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'book_design_requests' },
          (payload) => {
            if (payload.eventType === 'INSERT') onInsert?.()
            onChange?.()
          },
        )
        .subscribe()

      channelRef.current = channel
    })

    return () => {
      cancelled = true
      const channel = channelRef.current
      if (channel) {
        getSupabase().then((supabase) => supabase.removeChannel(channel))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
