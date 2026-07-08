import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabase'

type UseActivityLogRealtimeOptions = {
  onChange?: () => void
}

/**
 * Subscribes to live inserts on activity_logs so the log viewer picks up
 * new entries (e.g. from another admin's session) without a manual
 * refresh. Requires realtime to be enabled on the table — see
 * supabase/migrations/0008_activity_logs.sql.
 */
export function useActivityLogRealtime({ onChange }: UseActivityLogRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    let cancelled = false

    getSupabase().then((supabase) => {
      if (cancelled) return

      const channel = supabase
        .channel('activity-logs-admin')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => {
          onChange?.()
        })
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
