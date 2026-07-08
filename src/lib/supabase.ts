import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

export const STORAGE_BUCKETS = {
  portfolioImages: 'portfolio-images',
  attachments: 'attachments',
} as const

const REMEMBER_ME_KEY = 'navaru-admin-remember-me'

/**
 * Called by authService before sign-in to record whether the session should
 * survive a full browser restart (localStorage) or only the current tab
 * (sessionStorage). The flag itself always lives in localStorage so it can
 * be read back before any session exists.
 */
export function setRememberMePreference(remember: boolean): void {
  try {
    window.localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false')
  } catch {
    // Storage may be unavailable (e.g. private browsing) — sign-in still
    // works, the session just won't persist across reloads in that case.
  }
}

function shouldRemember(): boolean {
  try {
    return window.localStorage.getItem(REMEMBER_ME_KEY) !== 'false'
  } catch {
    return true
  }
}

// Supabase's storage option accepts any object shaped like the Web Storage
// API. Routing it through this adapter lets a single client support both
// "remember me" (localStorage) and "this tab only" (sessionStorage).
const rememberMeAwareStorage = {
  getItem: (key: string) => (shouldRemember() ? window.localStorage : window.sessionStorage).getItem(key),
  setItem: (key: string, value: string) => {
    ;(shouldRemember() ? window.localStorage : window.sessionStorage).setItem(key, value)
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}

let clientPromise: Promise<SupabaseClient<Database>> | null = null

/**
 * Lazily loads @supabase/supabase-js on first use instead of bundling it
 * into the main chunk. Every service function calls this instead of
 * importing a top-level client, so the SDK only downloads once a page
 * actually needs to talk to Supabase.
 */
export function getSupabase(): Promise<SupabaseClient<Database>> {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error(
          'Missing Supabase environment variables. Copy .env.example to .env.local and fill in your project URL and anon key.',
        )
      }

      return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: rememberMeAwareStorage,
        },
      })
    })
  }
  return clientPromise
}
