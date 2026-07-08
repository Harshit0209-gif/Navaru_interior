import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabase'

type UseContactRealtimeOptions = {
  onInsert?: () => void
  onChange?: () => void
}

/**
 * Subscribes to live changes on contact_enquiries so the admin sees new
 * submissions without polling or a manual refresh. Requires the table to be
 * added to the `supabase_realtime` publication (handled by
 * supabase/migrations/0006_contact_management.sql).
 */
export function useContactRealtime({ onInsert, onChange }: UseContactRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    let cancelled = false

    getSupabase().then((supabase) => {
      if (cancelled) return

      const channel = supabase
        .channel('contact-enquiries-admin')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'contact_enquiries' },
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
